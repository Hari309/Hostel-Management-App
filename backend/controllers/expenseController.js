const Expense = require("../models/Expense");

const toDateSafe = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const endOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const sumAmount = (items) =>
  items.reduce((total, item) => total + (Number(item.amount) || 0), 0);

const getExpenses = async (req, res, next) => {
  try {
    const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 20;
    const skip = (page - 1) * limit;

    const fromDate = toDateSafe(req.query.from);
    const toDate = toDateSafe(req.query.to);
    const category = req.query.category?.trim();

    const query = {};
    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) query.date.$gte = startOfDay(fromDate);
      if (toDate) query.date.$lte = endOfDay(toDate);
    }
    if (category) {
      query.category = new RegExp(`^${category}$`, "i");
    }

    const [expenses, total, allExpenses] = await Promise.all([
      Expense.find(query).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit),
      Expense.countDocuments(query),
      Expense.find(query).select("amount category date"),
    ]);

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
    const monthStart = startOfMonth(now);

    const dailySpend = sumAmount(allExpenses.filter((item) => item.date >= todayStart && item.date <= todayEnd));
    const weeklySpend = sumAmount(allExpenses.filter((item) => item.date >= weekStart && item.date <= todayEnd));
    const monthlySpend = sumAmount(allExpenses.filter((item) => item.date >= monthStart && item.date <= todayEnd));
    const totalSpend = sumAmount(allExpenses);

    const byCategory = allExpenses.reduce((acc, item) => {
      const key = item.category || "General";
      acc[key] = (acc[key] || 0) + (Number(item.amount) || 0);
      return acc;
    }, {});

    return res.status(200).json({
      data: expenses,
      summary: {
        dailySpend,
        weeklySpend,
        monthlySpend,
        totalSpend,
        byCategory,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const createExpense = async (req, res, next) => {
  try {
    const { title, category, amount, date, notes, paymentMode } = req.body;
    if (!title || typeof amount === "undefined") {
      return res.status(400).json({ message: "Title and amount are required." });
    }

    const expense = await Expense.create({
      title,
      category: category || "General",
      amount: Number(amount),
      date: date || Date.now(),
      notes: notes || "",
      paymentMode: paymentMode || "Cash",
    });

    return res.status(201).json({
      message: "Expense added successfully.",
      data: expense,
    });
  } catch (error) {
    return next(error);
  }
};

const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    const { title, category, amount, date, notes, paymentMode } = req.body;
    expense.title = title ?? expense.title;
    expense.category = category ?? expense.category;
    expense.amount = typeof amount !== "undefined" ? Number(amount) : expense.amount;
    expense.date = date ?? expense.date;
    expense.notes = notes ?? expense.notes;
    expense.paymentMode = paymentMode ?? expense.paymentMode;

    await expense.save();

    return res.status(200).json({
      message: "Expense updated successfully.",
      data: expense,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    await expense.deleteOne();
    return res.status(200).json({ message: "Expense deleted successfully." });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
