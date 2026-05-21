import { Router } from "express";
import {
  getBorrowers,
  getBorrowerById,
  createBorrower,
  updateBorrower,
  deleteBorrower,
  recordPayment,
} from "../controllers/borrowerController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/borrowers:
 *   get:
 *     summary: Get all borrowers
 *     tags: [Borrowers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of borrowers
 */
router.get("/", getBorrowers);

/**
 * @swagger
 * /api/borrowers/{id}:
 *   get:
 *     summary: Get borrower by ID
 *     tags: [Borrowers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Borrower found
 *       404:
 *         description: Borrower not found
 */
router.get("/:id", getBorrowerById);

/**
 * @swagger
 * /api/borrowers:
 *   post:
 *     summary: Create a new borrower
 *     tags: [Borrowers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               cityId:
 *                 type: number
 *     responses:
 *       201:
 *         description: Borrower created
 */
router.post("/", createBorrower);

/**
 * @swagger
 * /api/borrowers/{id}:
 *   put:
 *     summary: Update a borrower
 *     tags: [Borrowers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Borrower updated
 */
router.put("/:id", updateBorrower);

/**
 * @swagger
 * /api/borrowers/{id}:
 *   delete:
 *     summary: Delete a borrower
 *     tags: [Borrowers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Borrower deleted
 */
router.delete("/:id", deleteBorrower);

/**
 * @swagger
 * /api/borrowers/{id}/installments:
 *   post:
 *     summary: Record a payment for a borrower
 *     tags: [Borrowers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               month:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment recorded
 */
router.post("/:id/installments", recordPayment);

export default router;