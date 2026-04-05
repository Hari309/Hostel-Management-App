const Complaint = require("../models/Complaint");
const Expense = require("../models/Expense");
const Payment = require("../models/Payment");
const Room = require("../models/Room");
const Tenant = require("../models/Tenant");

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalRooms,
      occupiedRooms,
      totalTenants,
      pendingPayments,
      openComplaints,
      collectedAgg,
      expensesAgg,
    ] = await Promise.all([
      Room.countDocuments(),
      Room.countDocuments({ $expr: { $gte: ["$currentOccupancy", "$capacity"] } }),
      Tenant.countDocuments(),
      Payment.countDocuments({ status: "Pending" }),
      Complaint.countDocuments({ status: "Open" }),
      Payment.aggregate([
        { $match: { status: "Paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
    ]);

    return res.status(200).json({
      totalRooms,
      occupiedRooms,
      availableRooms: totalRooms - occupiedRooms,
      totalTenants,
      pendingPayments,
      openComplaints,
      overallCollected: collectedAgg?.[0]?.total || 0,
      overallExpenses: expensesAgg?.[0]?.total || 0,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getDashboardStats };
