import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
// @ts-expect-error — Admin.js is a runtime JS module, declaration in Admin.d.ts
import Admin from "../models/Admin.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "sonivanshu012@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "hail@Trufi1";

interface LoginBody {
  email: string;
  password: string;
}

export async function login(req: Request<{}, {}, LoginBody>, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check against env credentials (initial admin bootstrap)
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ userId: "admin", email }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({ token, user: { id: "admin", email } });
    }

    // Check against stored admin in DB
    const admin = await Admin.findOne({ email });
    if (admin) {
      const valid = await bcrypt.compare(password, admin.passwordHash);
      if (valid) {
        const token = jwt.sign(
          { userId: admin._id.toString(), email: admin.email },
          JWT_SECRET,
          { expiresIn: "7d" }
        );
        return res.json({ token, user: { id: admin._id.toString(), email: admin.email } });
      }
    }

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export function me(req: Request, res: Response) {
  return res.json({ user: { id: (req as any).userId, email: (req as any).userEmail } });
}
