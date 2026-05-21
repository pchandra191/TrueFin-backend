
import type { Request, Response } from "express";
// @ts-expect-error
import Ledger from "../models/Ledger.js";

const PAID_STATUSES = new Set(["paid", "completed", "sd", "partially-defaulter"]);

function isPaidStatus(status: string) {
  return PAID_STATUSES.has(status);
}

function normalizeMonth(month: string) {
  return month.trim().slice(0, 3).toLowerCase();
}

// GET /api/analytics/dashboard
export async function getDashboardStats(_req: Request, res: Response) {
  try {
    const ledgers = await Ledger.find().lean();

    let totalBorrowers = 0;
    let defaultersCount = 0;
    let totalCollection = 0;
    let outstandingAmount = 0;
    let monthlyCollection = 0;
    let paidInstallments = 0;
    let defaulterInstallments = 0;
    let pendingInstallments = 0;
    let totalInstallments = 0;
    const currentMonth = new Date().toLocaleString("en-US", { month: "short" }).toLowerCase();

    for (const ledger of ledgers as any[]) {
      for (const b of ledger.borrowers) {
        totalBorrowers++;
        const hasDefault = b.installments.some((i: any) => i.status === "defaulter");
        if (hasDefault) defaultersCount++;
        for (const inst of b.installments) {
          const amount = Number(inst.amount) || 0;
          totalInstallments++;
          if (isPaidStatus(inst.status) && amount > 0) {
            totalCollection += amount;
            paidInstallments++;
            if (normalizeMonth(inst.month) === currentMonth) {
              monthlyCollection += amount;
            }
          } else if (inst.status === "defaulter") {
            defaulterInstallments++;
          } else {
            pendingInstallments++;
          }
        }
        const ipm = b.IPM?.[b.IPM.length - 1] ?? 0;
        const paid = b.installments.reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
        outstandingAmount += Math.max(0, ipm * 12 - paid);
      }
    }

    res.json({
      totalBorrowers,
      defaultersCount,
      totalCollection,
      outstandingAmount,
      monthlyCollection,
      paidInstallments,
      defaulterInstallments,
      pendingInstallments,
      totalInstallments,
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
}

// GET /api/analytics/defaulters
export async function getDefaulters(req: Request, res: Response) {
  try {
    const { cityId } = req.query;
    const filter: any = {};
    if (cityId) filter.cityId = Number(cityId);

    const ledgers = await Ledger.find(filter).lean();
    const result: any[] = [];

    for (const ledger of ledgers as any[]) {
      for (const b of ledger.borrowers) {
        const defaulterInstallments = b.installments.filter((i: any) => i.status === "defaulter");
        if (defaulterInstallments.length > 0) {
          result.push({
            uniqueId: b.uniqueId,
            name: b.name,
            cityId: b.cityId,
            borrowerId: b.borrowerId,
            connectorName: b.connectorName,
            lastLeft: b.lastLeft,
            defaulterCount: defaulterInstallments.length,
            totalPaid: b.installments.reduce((s: number, i: any) => s + i.amount, 0),
          });
        }
      }
    }

    res.json({ defaulters: result, total: result.length });
  } catch (err) {
    console.error("getDefaulters error:", err);
    res.status(500).json({ message: "Failed to fetch defaulters" });
  }
}

// GET /api/analytics/collections
export async function getCollections(req: Request, res: Response) {
  try {
    const { cityId, months = "6" } = req.query;
    const filter: any = {};
    if (cityId) filter.cityId = Number(cityId);

    const ledgers = await Ledger.find(filter).lean();
    const monthMap: Record<string, { amount: number; count: number }> = {};

    for (const ledger of ledgers as any[]) {
      for (const b of ledger.borrowers) {
        for (const inst of b.installments) {
          if (isPaidStatus(inst.status) && inst.amount > 0) {
            const month = inst.month || "Unknown";
            monthMap[month] ??= { amount: 0, count: 0 };
            monthMap[month]!.amount += inst.amount;
            monthMap[month]!.count++;
          }
        }
      }
    }

    const monthOrder = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];
    const limit = Math.max(1, Number(months) || 6);
    const collections = Object.entries(monthMap)
      .map(([month, data]) => ({
        month,
        amount: data.amount,
        count: data.count,
      }))
      .sort(
        (a, b) =>
          monthOrder.indexOf(normalizeMonth(a.month)) -
          monthOrder.indexOf(normalizeMonth(b.month))
      )
      .slice(-limit);

    const grandTotal = collections.reduce((s, c) => s + c.amount, 0);
    res.json({ collections, grandTotal });
  } catch (err) {
    console.error("getCollections error:", err);
    res.status(500).json({ message: "Failed to fetch collections" });
  }
}
