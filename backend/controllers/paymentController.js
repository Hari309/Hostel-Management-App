const Payment = require("../models/Payment");
const Tenant = require("../models/Tenant");

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

const getPayments = async (req, res, next) => {
  try {
    const { status, month, tenantId, unpaidOnly } = req.query;

    const query = {};
    if (status) query.status = status;
    if (month) query.month = month;
    if (tenantId) query.tenant = tenantId;
    if (unpaidOnly === "true") query.status = "Pending";

    const payments = await Payment.find(query)
      .populate("tenant", "name roomNumber")
      .sort({ month: -1, createdAt: -1 });

    const summaryMonth = month || getCurrentMonth();
    const monthPayments = await Payment.find({ month: summaryMonth });

    const summary = monthPayments.reduce(
      (acc, payment) => {
        acc.totalRecords += 1;
        acc.totalAmount += payment.amount;
        if (payment.status === "Paid") {
          acc.paidCount += 1;
          acc.paidAmount += payment.amount;
        } else {
          acc.pendingCount += 1;
          acc.pendingAmount += payment.amount;
        }
        return acc;
      },
      {
        month: summaryMonth,
        totalRecords: 0,
        totalAmount: 0,
        paidCount: 0,
        pendingCount: 0,
        paidAmount: 0,
        pendingAmount: 0,
      }
    );

    return res.status(200).json({ data: payments, summary });
  } catch (error) {
    return next(error);
  }
};

const createPayment = async (req, res, next) => {
  try {
    const { tenant, month, amount, status = "Pending", paymentDate } = req.body;

    if (!tenant || !month || typeof amount === "undefined") {
      return res.status(400).json({ message: "Tenant, month and amount are required." });
    }

    const tenantExists = await Tenant.findById(tenant);
    if (!tenantExists) {
      return res.status(404).json({ message: "Tenant not found." });
    }

    const payment = await Payment.findOneAndUpdate(
      { tenant, month },
      {
        tenant,
        month,
        amount,
        status,
        paymentDate: status === "Paid" ? paymentDate || Date.now() : null,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate("tenant", "name roomNumber");

    return res.status(201).json({
      message: "Payment saved successfully.",
      data: payment,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getPayments,
  createPayment,
};
