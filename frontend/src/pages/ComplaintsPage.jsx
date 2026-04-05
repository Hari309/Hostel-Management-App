import { useEffect, useState } from "react";
import {
  createComplaint,
  fetchComplaints,
  fetchTenants,
  getErrorMessage,
  updateComplaint,
} from "../services/api";

const initialForm = {
  tenantId: "",
  tenantName: "",
  description: "",
};

const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const response = await fetchComplaints({ status: statusFilter || undefined });
      setComplaints(response);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load complaints"));
    } finally {
      setLoading(false);
    }
  };

  const loadTenants = async () => {
    try {
      const response = await fetchTenants({ page: 1, limit: 500 });
      setTenants(response.data);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load tenants"));
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [statusFilter]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await createComplaint(form);
      setForm(initialForm);
      await loadComplaints();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to submit complaint"));
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateComplaint(id, { status });
      await loadComplaints();
    } catch (err) {
      setError(getErrorMessage(err, "Could not update complaint status"));
    }
  };

  return (
    <section className="page-enter">
      <div className="section-header">
        <h1>Complaint Management</h1>
      </div>
      {error && <p className="error-text">{error}</p>}

      <div className="card">
        <h3>Raise Complaint</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <select
            value={form.tenantId}
            onChange={(e) => setForm({ ...form, tenantId: e.target.value, tenantName: "" })}
          >
            <option value="">Select Tenant (optional)</option>
            {tenants.map((tenant) => (
              <option key={tenant._id} value={tenant._id}>
                {tenant.name} (Room {tenant.roomNumber})
              </option>
            ))}
          </select>
          <input
            placeholder="Tenant Name (if not listed)"
            value={form.tenantName}
            onChange={(e) => setForm({ ...form, tenantName: e.target.value, tenantId: "" })}
            disabled={Boolean(form.tenantId)}
          />
          <input
            placeholder="Complaint Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <button type="submit" className="btn">
            Submit Complaint
          </button>
        </form>
      </div>

      <div className="card">
        <div className="filters-row">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Complaints</option>
            <option value="Open">Open</option>
            <option value="Resolved">Resolved</option>
          </select>
          <button type="button" className="btn btn-secondary" onClick={loadComplaints}>
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading complaints...</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Raised At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 && (
                  <tr>
                    <td colSpan="5">No complaints found.</td>
                  </tr>
                )}
                {complaints.map((complaint) => (
                  <tr key={complaint._id}>
                    <td>{complaint.tenantName}</td>
                    <td>{complaint.description}</td>
                    <td>
                      <span className={complaint.status === "Resolved" ? "tag tag-green" : "tag tag-red"}>
                        {complaint.status}
                      </span>
                    </td>
                    <td>{new Date(complaint.raisedAt).toLocaleDateString()}</td>
                    <td className="table-actions">
                      {complaint.status !== "Resolved" ? (
                        <button
                          type="button"
                          className="btn btn-small"
                          onClick={() => handleStatusUpdate(complaint._id, "Resolved")}
                        >
                          Mark Resolved
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-small btn-secondary"
                          onClick={() => handleStatusUpdate(complaint._id, "Open")}
                        >
                          Reopen
                        </button>
                      )}
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

export default ComplaintsPage;
