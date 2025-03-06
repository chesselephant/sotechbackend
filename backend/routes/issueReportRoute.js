import express from "express";
import {
    getDailyIssueReport,
    getWeeklyIssueReport,
    getMonthlyIssueReport,
    getYearlyIssueReport,
    getDailySalesValue
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/report/daily", getDailyIssueReport);
router.get("/report/weekly", getWeeklyIssueReport);
router.get("/report/monthly", getMonthlyIssueReport);
router.get("/report/yearly", getYearlyIssueReport);

router.get("/daily-sales", getDailySalesValue);
export default router;
