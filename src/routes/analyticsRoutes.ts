import { Router } from "express";
import { getDashboardStats, getDefaulters, getCollections } from "../controllers/analyticsController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 */
router.get("/dashboard", getDashboardStats);

/**
 * @swagger
 * /api/analytics/defaulters:
 *   get:
 *     summary: Get list of defaulters
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of defaulters
 */
router.get("/defaulters", getDefaulters);

/**
 * @swagger
 * /api/analytics/collections:
 *   get:
 *     summary: Get collections data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Collections data
 */
router.get("/collections", getCollections);

export default router;