import { useEffect, useState } from "react";
import {
  createPayment,
  fetchPayments,
  fetchTenants,
  getErrorMessage,
} from "../services/api";

const initialPaymentForm = {
  tenant: "",
  month: new Date().toISOString().slice(0, 7),
  amount: "",
  status: "Pending",
  paymentDate: "",
};

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [form, setForm] = useState(initialPaymentForm);
  const [filters, setFilters] = useState({
    month: new Date().toISOString().slice(0, 7),
    status: "",
    unpaidOnly: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadTenants = async () => {
    try {
      const response = await fetchTenants({ page: 1, limit: 500 });
      setTenants(response.data);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load tenants"));
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await fetchPayments({
        month: filters.month || undefined,
        status: filters.status || undefined,
        unpaidOnly: filters.unpaidOnly ? "true" : undefined,
      });
      setPayments(response.data);
      setSummary(response.summary);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Could not load payments"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    loadPayments();
  }, [filters.month, filters.status, filters.unpaidOnly]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await createPayment({
        tenant: form.tenant,
        month: form.month,
        amount: Number(form.amount),
        status: form.status,
        paymentDate: form.status === "Paid" ? form.paymentDate || undefined : undefined,
      });
      setForm(initialPaymentForm);
      await loadPayments();
    } catch (err) {
      setError(getErrorMessage(err, "Could not save payment"));
    }
  };

  return (
    <section className="page-enter">
      <div className="section-header">
        <h1>Fee Management</h1>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="card">
        <h3>Add / Update Payment</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <select
            value={form.tenant}
            onChange={(e) => setForm({ ...form, tenant: e.target.value })}
            required
          >
            <option value="">Select Tenant</option>
            {tenants.map((tenant) => (
              <option key={tenant._id} value={tenant._id}>
                {tenant.name} (Room {tenant.roomNumber})
              </option>
            ))}
          </select>
          <input
            type="month"
            value={form.month}
            onChange={(e) => setForm({ ...form, month: e.target.value })}
            required
          />
          <input
            type="number"
            min="0"
            placeholder="Monthly Rent"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
          </select>
          <input
            type="date"
            value={form.paymentDate}
            onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
            disabled={form.status !== "Paid"}
          />
          <button type="submit" className="btn">
            Save Payment
          </button>
        </form>
      </div>

      <div className="card">
        <div className="filters-row">
          <input
            type="month"
            value={filters.month}
            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
          <label className="checkbox-inline">
            <input
              type="checkbox"
              checked={filters.unpaidOnly}
              onChange={(e) => setFilters({ ...filters, unpaidOnly: e.target.checked })}
            />
            Show unpaid only
          </label>
          <button type="button" className="btn btn-secondary" onClick={loadPayments}>
            Refresh
          </button>
        </div>

        {summary && (
          <div className="stats-grid">
            <div className="stat-card">
              <p>Summary Month</p>
              <h3>{summary.month}</h3>
            </div>
            <div className="stat-card">
              <p>Paid Amount</p>
              <h3>{summary.paidAmount}</h3>
            </div>
            <div className="stat-card">
              <p>Pending Amount</p>
              <h3>{summary.pendingAmount}</h3>
            </div>
            <div className="stat-card">
              <p>Records</p>
              <h3>{summary.totalRecords}</h3>
            </div>
          </div>
        )}

        {loading ? (
          <p>Loading payments...</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Room</th>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 && (
                  <tr>
                    <td colSpan="6">No payment records found.</td>
                  </tr>
                )}
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{payment.tenant?.name || "Unknown"}</td>
                    <td>{payment.tenant?.roomNumber || "-"}</td>
                    <td>{payment.month}</td>
                    <td>{payment.amount}</td>
                    <td>
                      <span className={payment.status === "Paid" ? "tag tag-green" : "tag tag-red"}>
                        {payment.status}
                      </span>
                    </td>
                    <td>
                      {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "Not paid"}
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

export default PaymentsPage;
