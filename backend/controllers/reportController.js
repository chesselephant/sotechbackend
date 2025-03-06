import IssueProduct from "../model/issueProduct.js";
import mongoose from "mongoose";


const getIssuedByDateRange = async (startDate, endDate) => {
    return await IssueProduct.aggregate([
        {
            $match: {
                dateIssued: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "operatorId",
                foreignField: "_id",
                as: "operatorDetails"
            }
        },
        { $unwind: "$operatorDetails" }, // Extract operator details
        { $unwind: "$issuedProducts" }, // Extract each issued product
        {
            $group: {
                _id: "$issueId",
                issueId: { $first: "$issueId" },
                operatorName: { $first: "$operatorDetails.name" },
                dateIssued: { $first: "$dateIssued" },
                productsIssued: {
                    $push: {
                        productName: "$issuedProducts.productName",
                        unitPrice: "$issuedProducts.unitPrice",
                        quantity: "$issuedProducts.quantity",
                        totalPrice: { $multiply: ["$issuedProducts.unitPrice", "$issuedProducts.quantity"] }
                    }
                },
                totalCost: { $sum: { $multiply: ["$issuedProducts.unitPrice", "$issuedProducts.quantity"] } }
            }
        }
    ]);
};

// 📌 Generate Daily Issue Report
export const getDailyIssueReport = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const issueData = await getIssuedByDateRange(today, tomorrow);

        res.status(200).json({
            success: true,
            message: "✅ Daily Issue Report",
            data: issueData
        });

    } catch (error) {
        console.error("🔥 Error fetching daily issue report:", error);
        res.status(500).json({ success: false, message: "❌ Internal Server Error" });
    }
};

// 📌 Generate Weekly Issue Report
export const getWeeklyIssueReport = async (req, res) => {
    try {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        const issueData = await getIssuedByDateRange(startOfWeek, endOfWeek);

        res.status(200).json({
            success: true,
            message: "✅ Weekly Issue Report",
            data: issueData
        });

    } catch (error) {
        console.error("🔥 Error fetching weekly issue report:", error);
        res.status(500).json({ success: false, message: "❌ Internal Server Error" });
    }
};

// 📌 Generate Monthly Issue Report
export const getMonthlyIssueReport = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const issueData = await getIssuedByDateRange(startOfMonth, endOfMonth);

        res.status(200).json({
            success: true,
            message: "✅ Monthly Issue Report",
            data: issueData
        });

    } catch (error) {
        console.error("🔥 Error fetching monthly issue report:", error);
        res.status(500).json({ success: false, message: "❌ Internal Server Error" });
    }
};

// 📌 Generate Yearly Issue Report
export const getYearlyIssueReport = async (req, res) => {
    try {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);

        const issueData = await getIssuedByDateRange(startOfYear, endOfYear);

        res.status(200).json({
            success: true,
            message: "✅ Yearly Issue Report",
            data: issueData
        });

    } catch (error) {
        console.error("🔥 Error fetching yearly issue report:", error);
        res.status(500).json({ success: false, message: "❌ Internal Server Error" });
    }
};

export const getDailySalesValue = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of the day
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1); // End of the day

        // Fetch issued products for today
        const issueData = await getIssuedByDateRange(today, tomorrow);

        // ✅ Calculate total daily sales value
        const totalSalesValue = issueData.reduce((sum, issue) => sum + issue.totalCost, 0);

        res.status(200).json(totalSalesValue); // ✅ Return only the value

    } catch (error) {
        console.error("🔥 Error fetching daily sales value:", error);
        res.status(500).json(0); // ✅ Return 0 in case of error
    }
};