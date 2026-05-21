import { Router } from "express";
import { trackLogin, getTrackData } from "../controllers/trackController.js";

const router = Router();

/**
 * @swagger
 * /api/track/login:
 *   post:
 *     summary: Borrower login via uniqueId
 *     tags: [Track]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uniqueId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Borrower found
 *       404:
 *         description: Borrower not found
 */
router.post("/login", trackLogin);

/**
 * @swagger
 * /api/track/{uniqueId}:
 *   get:
 *     summary: Get borrower installment data by uniqueId
 *     tags: [Track]
 *     parameters:
 *       - in: path
 *         name: uniqueId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Borrower installment data
 *       404:
 *         description: Borrower not found
 */
router.get("/:uniqueId", getTrackData);

export default router;
