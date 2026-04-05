import { useEffect, useMemo, useState } from "react";
import {
  createExpense,
  deleteExpense,
  fetchExpenses,
  getErrorMessage,
} from "../services/api";

const initialForm = {
  title: "",
  category: "Food",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  paymentMode: "UPI",
  notes: "",
};

const toINR = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    category: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadExpenses = async (customFilters) => {
    try {
      setLoading(true);
      const activeFilters = customFilters || filters;
      const response = await fetchExpenses({
        from: activeFilters.from || undefined,
        to: activeFilters.to || undefined,
        category: activeFilters.category || undefined,
        page: 1,
        limit: 100,
      });
      setExpenses(response.data || []);
      setSummary(response.summary || null);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load expenses"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const categoryList = useMemo(() => {
    const base = ["Food", "Utilities", "Maintenance", "Housekeeping", "Staff", "General"];
    const fromData = (summary?.byCategory && Object.keys(summary.byCategory)) || [];
    return Array.from(new Set([...base, ...fromData]));
  }, [summary]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await createExpense({
        ...form,
        amount: Number(form.amount),
      });
      setForm(initialForm);
      await loadExpenses();
    } catch (err) {
      setError(getErrorMessage(err, "Could not save expense"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense record?")) return;
    try {
      await deleteExpense(id);
      await loadExpenses();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete expense"));
    }
  };

  return (
    <section className="page-enter">
      <div className="section-header">
        <h1>Hostel Expenses Tracker</h1>
        <button type="button" className="btn btn-secondary" onClick={loadExpenses}>
          Refresh
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="card">
        <h3>Add Expense</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <input
            placeholder="Expense title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {categoryList.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
          <select
            value={form.paymentMode}
            onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Net Banking">Net Banking</option>
          </select>
          <input
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <button type="submit" className="btn">
            Save Expense
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Spending Summary</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <p>Today</p>
            <h3>{toINR(summary?.dailySpend)}</h3>
          </div>
          <div className="stat-card">
            <p>Last 7 Days</p>
            <h3>{toINR(summary?.weeklySpend)}</h3>
          </div>
          <div className="stat-card">
            <p>This Month</p>
            <h3>{toINR(summary?.monthlySpend)}</h3>
          </div>
          <div className="stat-card">
            <p>Total (Filtered)</p>
            <h3>{toINR(summary?.totalSpend)}</h3>
          </div>
        </div>

        <div className="mt-4">
          <h3>By Category</h3>
          <div className="stats-grid">
            {summary?.byCategory && Object.keys(summary.byCategory).length > 0 ? (
              Object.entries(summary.byCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([category, amount]) => (
                  <div className="stat-card" key={category}>
                    <p>{category}</p>
                    <h3>{toINR(amount)}</h3>
                  </div>
                ))
            ) : (
              <p className="muted">No category summary available yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="filters-row">
          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          />
          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          />
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            {categoryList.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button type="button" className="btn" onClick={loadExpenses}>
            Apply Filters
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              const cleared = { from: "", to: "", category: "" };
              setFilters(cleared);
              loadExpenses(cleared);
            }}
          >
            Clear
          </button>
        </div>

        {loading ? (
          <p>Loading expenses...</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Mode</th>
                  <th>Amount</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan="7">No expenses found.</td>
                  </tr>
                )}
                {expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>{expense.title}</td>
                    <td>{expense.category}</td>
                    <td>{expense.paymentMode || "-"}</td>
                    <td>{toINR(expense.amount)}</td>
                    <td>{expense.notes || "-"}</td>
                    <td className="table-actions">
                      <button
                        type="button"
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(expense._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default ExpensesPage;
