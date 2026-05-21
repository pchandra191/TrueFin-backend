import type { Request, Response } from "express";
// @ts-expect-error
import Ledger from "../models/Ledger.js";
import { generateClientId } from "../utils/generateClientId.js";

// GET /api/borrowers — list with optional filters
export async function getBorrowers(req: Request, res: Response) {
  try {
    const { cityId, search, status, page = "1", limit = "50" } = req.query;

    if (!cityId) {
      return res.status(400).json({ message: "cityId is required" });
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));

    const ledger = await Ledger.findOne({ cityId: Number(cityId) }).lean();
    if (!ledger) return res.status(404).json({ message: "City not found" });

    let borrowers = (ledger as any).borrowers;

    if (search) {
      const regex = new RegExp(String(search), "i");
      borrowers = borrowers.filter((b: any) => regex.test(b.name));
    }

    if (status) {
      borrowers = borrowers.filter((b: any) =>
        b.installments.some((i: any) => i.status === status)
      );
    }

    const total = borrowers.length;
    const paginated = borrowers.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      borrowers: paginated,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error("getBorrowers error:", err);
    res.status(500).json({ message: "Failed to fetch borrowers" });
  }
}

// GET /api/borrowers/:id — single borrower by uniqueId
export async function getBorrowerById(req: Request, res: Response) {
  try {
    const ledger = await Ledger.findOne({ "borrowers.uniqueId": req.params.id }).lean();
    if (!ledger) return res.status(404).json({ message: "Borrower not found" });

    const borrower = (ledger as any).borrowers.find((b: any) => b.uniqueId === req.params.id);
    if (!borrower) return res.status(404).json({ message: "Borrower not found" });

    res.json(borrower);
  } catch (err) {
    console.error("getBorrowerById error:", err);
    res.status(500).json({ message: "Failed to fetch borrower" });
  }
}

// POST /api/borrowers — create new borrower
export async function createBorrower(req: Request, res: Response) {
  try {
    const { cityId, borrowerId, name, phoneNumber, connectorName, IPM, lastLeft, installmentCondition, installmentStartMonth, installments } = req.body;

    if (!cityId || !name) {
      return res.status(400).json({ message: "cityId and name are required" });
    }

    const ledger = await Ledger.findOne({ cityId: Number(cityId) });
    if (!ledger) return res.status(404).json({ message: "City ledger not found" });

    const nextBorrowerId =
      borrowerId ??
      Math.max(0, ...ledger.borrowers.map((b: any) => Number(b.borrowerId) || 0)) + 1;

    const existing = ledger.borrowers.find((b: any) => b.borrowerId === nextBorrowerId);
    if (existing) return res.status(409).json({ message: "Borrower already exists in this city" });

    const { randomUUID } = await import("crypto");
    const shortUUID = randomUUID().split("-")[0];
    const year = installmentStartMonth ? installmentStartMonth.split("-")[0].slice(-2) : "00";
    const uniqueId = `${shortUUID}-${cityId}${nextBorrowerId}${year}`;

    ledger.borrowers.push({
      uniqueId, cityId: Number(cityId), borrowerId: nextBorrowerId, name,
      phoneNumber: phoneNumber || "",
      connectorName: connectorName || "",
      IPM: IPM || [0],
      lastLeft: lastLeft || "0",
      installmentCondition: installmentCondition || "NA",
      installmentStartMonth: installmentStartMonth || "",
      installments: installments || [],
    });

    await ledger.save();
    res.status(201).json({ message: "Borrower created", uniqueId });
  } catch (err) {
    console.error("createBorrower error:", err);
    res.status(500).json({ message: "Failed to create borrower" });
  }
}

// PUT /api/borrowers/:id — update borrower by uniqueId
export async function updateBorrower(req: Request, res: Response) {
  try {
    const ledger = await Ledger.findOne({ "borrowers.uniqueId": req.params.id });
    if (!ledger) return res.status(404).json({ message: "Borrower not found" });

    const borrower = ledger.borrowers.find((b: any) => b.uniqueId === req.params.id);
    if (!borrower) return res.status(404).json({ message: "Borrower not found" });

    const { name, phoneNumber, connectorName, IPM, lastLeft, installmentCondition, installmentStartMonth, installments } = req.body;
    if (name !== undefined) borrower.name = name;
    if (phoneNumber !== undefined) borrower.phoneNumber = phoneNumber;
    if (connectorName !== undefined) borrower.connectorName = connectorName;
    if (IPM !== undefined) borrower.IPM = IPM;
    if (lastLeft !== undefined) borrower.lastLeft = lastLeft;
    if (installmentCondition !== undefined) borrower.installmentCondition = installmentCondition;
    if (installmentStartMonth !== undefined) borrower.installmentStartMonth = installmentStartMonth;
    if (installments !== undefined) borrower.installments = installments;

    await ledger.save();
    res.json(borrower.toObject());
  } catch (err) {
    console.error("updateBorrower error:", err);
    res.status(500).json({ message: "Failed to update borrower" });
  }
}

// DELETE /api/borrowers/:id — delete borrower by uniqueId
export async function deleteBorrower(req: Request, res: Response) {
  try {
    const ledger = await Ledger.findOne({ "borrowers.uniqueId": req.params.id });
    if (!ledger) return res.status(404).json({ message: "Borrower not found" });

    ledger.borrowers = ledger.borrowers.filter((b: any) => b.uniqueId !== req.params.id);
    await ledger.save();
    res.json({ message: "Borrower deleted successfully" });
  } catch (err) {
    console.error("deleteBorrower error:", err);
    res.status(500).json({ message: "Failed to delete borrower" });
  }
}

// POST /api/borrowers/:id/installments — record a payment
export async function recordPayment(req: Request, res: Response) {
  try {
    const { month, amount, status = "paid" } = req.body;

    const ledger = await Ledger.findOne({ "borrowers.uniqueId": req.params.id });
    if (!ledger) return res.status(404).json({ message: "Borrower not found" });

    const borrower = ledger.borrowers.find((b: any) => b.uniqueId === req.params.id);
    if (!borrower) return res.status(404).json({ message: "Borrower not found" });

    const existingIdx = borrower.installments.findIndex((i: any) => i.month === month);
    if (existingIdx >= 0) {
      borrower.installments[existingIdx] = { month, amount, status };
    } else {
      borrower.installments.push({ month, amount, status });
    }

    await ledger.save();
    res.json(borrower.toObject());
  } catch (err) {
    console.error("recordPayment error:", err);
    res.status(500).json({ message: "Failed to record payment" });
  }
}
