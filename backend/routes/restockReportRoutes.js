import express from "express";
import {
    getDailyRestockReport,
    getWeeklyRestockReport,
    getMonthlyRestockReport,
    getYearlyRestockReport
} from "../controllers/restockController.js";

const router = express.Router();

router.get("/report/daily", getDailyRestockReport);
router.get("/report/weekly", getWeeklyRestockReport);
router.get("/report/monthly", getMonthlyRestockReport);
router.get("/report/yearly", getYearlyRestockReport);

export default router;
