import Restock from "../model/Restock.js";
import mongoose from "mongoose";

// 📌 Helper function to get restocks by date range
const getRestocksByDateRange = async (startDate, endDate) => {
    return await Restock.aggregate([
        {
            $match: {
                restockDate: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "restocker",
                foreignField: "_id",
                as: "operatorDetails"
            }
        },
        { $unwind: "$operatorDetails" }, // Extract operator details
        {
            $lookup: {
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: "productDetails"
            }
        },
        { $unwind: "$productDetails" }, // Extract product details
        {
            $project: {
                _id: 1,
                restockId: "$_id",
                operatorName: "$operatorDetails.name",
                productName: "$productDetails.name",
                oldQuantity: 1,
                newQuantity: 1,
                restockDate: 1,
                formattedDate: {
                    $dateToString: {
                        format: "%Y-%m-%d %H:%M:%S",
                        date: "$restockDate"
                    }
                }
            }
        },
        { $sort: { restockDate: -1 } } // Sort from latest to earliest
    ]);
};

// 📌 Generate Daily Restock Report
export const getDailyRestockReport = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const restockData = await getRestocksByDateRange(today, tomorrow);

        res.status(200).json({
            success: true,
            message: "✅ Daily Restock Report",
            data: restockData
        });

    } catch (error) {
        console.error("🔥 Error fetching daily restock report:", error);
        res.status(500).json({ success: false, message: "❌ Internal Server Error" });
    }
};

// 📌 Generate Weekly Restock Report
export const getWeeklyRestockReport = async (req, res) => {
    try {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        const restockData = await getRestocksByDateRange(startOfWeek, endOfWeek);

        res.status(200).json({
            success: true,
            message: "✅ Weekly Restock Report",
            data: restockData
        });

    } catch (error) {
        console.error("🔥 Error fetching weekly restock report:", error);
        res.status(500).json({ success: false, message: "❌ Internal Server Error" });
    }
};

// 📌 Generate Monthly Restock Report
export const getMonthlyRestockReport = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const restockData = await getRestocksByDateRange(startOfMonth, endOfMonth);

        res.status(200).json({
            success: true,
            message: "✅ Monthly Restock Report",
            data: restockData
        });

    } catch (error) {
        console.error("🔥 Error fetching monthly restock report:", error);
        res.status(500).json({ success: false, message: "❌ Internal Server Error" });
    }
};

// 📌 Generate Yearly Restock Report
export const getYearlyRestockReport = async (req, res) => {
    try {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);

        const restockData = await getRestocksByDateRange(startOfYear, endOfYear);

        res.status(200).json({
            success: true,
            message: "✅ Yearly Restock Report",
            data: restockData
        });

    } catch (error) {
        console.error("🔥 Error fetching yearly restock report:", error);
        res.status(500).json({ success: false, message: "❌ Internal Server Error" });
    }
};
