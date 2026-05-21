import type { Request, Response } from "express";
// @ts-expect-error
import Ledger from "../models/Ledger.js";

export async function trackLogin(req: Request, res: Response) {
  try {
    const { uniqueId } = req.body;
    if (!uniqueId) {
      return res.status(400).json({ message: "uniqueId is required" });
    }

    const ledger = await Ledger.findOne({ "borrowers.uniqueId": uniqueId }).lean();
    if (!ledger) {
      return res.status(404).json({ message: "Borrower not found. Please check your ID." });
    }

    const borrower = (ledger as any).borrowers.find((b: any) => b.uniqueId === uniqueId);
    if (!borrower) {
      return res.status(404).json({ message: "Borrower not found." });
    }

    const totalPaid = borrower.installments.reduce((s: number, i: any) => s + i.amount, 0);
    const ipm = borrower.IPM?.[borrower.IPM.length - 1] ?? 0;
    const outstanding = Math.max(0, ipm * 12 - totalPaid);
    const defaulterCount = borrower.installments.filter((i: any) => i.status === "defaulter").length;

    return res.json({
      uniqueId: borrower.uniqueId,
      name: borrower.name,
      cityId: borrower.cityId,
      connectorName: borrower.connectorName,
      IPM: borrower.IPM,
      lastLeft: borrower.lastLeft,
      installmentStartMonth: borrower.installmentStartMonth,
      installmentCondition: borrower.installmentCondition,
      installments: borrower.installments,
      summary: {
        totalPaid,
        outstanding,
        defaulterCount,
        totalInstallments: borrower.installments.length,
      },
    });
  } catch (err) {
    console.error("trackLogin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getTrackData(req: Request, res: Response) {
  try {
    const { uniqueId } = req.params;

    const ledger = await Ledger.findOne({ "borrowers.uniqueId": uniqueId }).lean();
    if (!ledger) {
      return res.status(404).json({ message: "Borrower not found." });
    }

    const borrower = (ledger as any).borrowers.find((b: any) => b.uniqueId === uniqueId);
    if (!borrower) {
      return res.status(404).json({ message: "Borrower not found." });
    }

    const totalPaid = borrower.installments.reduce((s: number, i: any) => s + i.amount, 0);
    const ipm = borrower.IPM?.[borrower.IPM.length - 1] ?? 0;
    const outstanding = Math.max(0, ipm * 12 - totalPaid);
    const defaulterCount = borrower.installments.filter((i: any) => i.status === "defaulter").length;

    return res.json({
      uniqueId: borrower.uniqueId,
      name: borrower.name,
      cityId: borrower.cityId,
      connectorName: borrower.connectorName,
      IPM: borrower.IPM,
      lastLeft: borrower.lastLeft,
      installmentStartMonth: borrower.installmentStartMonth,
      installmentCondition: borrower.installmentCondition,
      installments: borrower.installments,
      summary: {
        totalPaid,
        outstanding,
        defaulterCount,
        totalInstallments: borrower.installments.length,
      },
    });
  } catch (err) {
    console.error("getTrackData error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
