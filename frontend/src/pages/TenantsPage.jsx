import { useEffect, useState } from "react";
import {
  createTenant,
  deleteTenant,
  fetchRooms,
  fetchTenants,
  getErrorMessage,
  updateTenant,
} from "../services/api";

const initialForm = {
  name: "",
  phone: "",
  idProof: "",
  roomId: "",
  joiningDate: "",
};

const TenantsPage = () => {
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingTenantId, setEditingTenantId] = useState("");
  const [search, setSearch] = useState("");
  const [unpaidMonth, setUnpaidMonth] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTenants = async (targetPage = page, options = {}) => {
    try {
      setLoading(true);
      const effectiveSearch = options.search ?? search;
      const effectiveUnpaidMonth = options.unpaidMonth ?? unpaidMonth;
      const response = await fetchTenants({
        page: targetPage,
        limit: 8,
        search: effectiveSearch,
        unpaidMonth: effectiveUnpaidMonth || undefined,
      });
      setTenants(response.data);
      setPagination(response.pagination);
      setPage(targetPage);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load tenants"));
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    try {
      const response = await fetchRooms();
      setRooms(response);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load rooms"));
    }
  };

  useEffect(() => {
    loadRooms();
    loadTenants(1);
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingTenantId("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        joiningDate: form.joiningDate || undefined,
      };

      if (editingTenantId) {
        await updateTenant(editingTenantId, payload);
      } else {
        await createTenant(payload);
      }

      resetForm();
      await Promise.all([loadRooms(), loadTenants(1)]);
    } catch (err) {
      setError(getErrorMessage(err, "Could not save tenant"));
    }
  };

  const handleEdit = (tenant) => {
    setEditingTenantId(tenant._id);
    setForm({
      name: tenant.name,
      phone: tenant.phone,
      idProof: tenant.idProof,
      roomId: tenant.room?._id || "",
      joiningDate: tenant.joiningDate?.slice(0, 10) || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this tenant?")) return;
    try {
      await deleteTenant(id);
      await Promise.all([loadRooms(), loadTenants(1)]);
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete tenant"));
    }
  };

  return (
    <section className="page-enter">
      <div className="section-header">
        <h1>Tenant Management</h1>
        <button type="button" className="btn btn-secondary" onClick={() => loadTenants(1)}>
          Reload
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="card">
        <h3>{editingTenantId ? "Update Tenant" : "Add Tenant"}</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <input
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
          <input
            placeholder="Aadhaar / ID Proof"
            value={form.idProof}
            onChange={(e) => setForm({ ...form, idProof: e.target.value })}
            required
          />
          <select
            value={form.roomId}
            onChange={(e) => setForm({ ...form, roomId: e.target.value })}
            required
          >
            <option value="">Select Room</option>
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>
                Room {room.roomNumber} ({room.currentOccupancy}/{room.capacity})
              </option>
            ))}
          </select>
          <input
            type="date"
            value={form.joiningDate}
            onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
          />
          <div className="button-row">
            <button type="submit" className="btn">
              {editingTenantId ? "Update Tenant" : "Add Tenant"}
            </button>
            {editingTenantId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="filters-row">
          <input
            placeholder="Search by name / room / phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input type="month" value={unpaidMonth} onChange={(e) => setUnpaidMonth(e.target.value)} />
          <button type="button" className="btn" onClick={() => loadTenants(1)}>
            Apply Filters
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setSearch("");
              setUnpaidMonth("");
              loadTenants(1, { search: "", unpaidMonth: "" });
            }}
          >
            Clear
          </button>
        </div>

        {loading ? (
          <p>Loading tenants...</p>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>ID Proof</th>
                    <th>Room</th>
                    <th>Joining Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.length === 0 && (
                    <tr>
                      <td colSpan="6">No tenants found.</td>
                    </tr>
                  )}
                  {tenants.map((tenant) => (
                    <tr key={tenant._id}>
                      <td>{tenant.name}</td>
                      <td>{tenant.phone}</td>
                      <td>{tenant.idProof}</td>
                      <td>{tenant.roomNumber}</td>
                      <td>{new Date(tenant.joiningDate).toLocaleDateString()}</td>
                      <td className="table-actions">
                        <button type="button" className="btn btn-small" onClick={() => handleEdit(tenant)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-small btn-danger"
                          onClick={() => handleDelete(tenant._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button
                type="button"
                className="btn btn-small btn-secondary"
                onClick={() => loadTenants(page - 1)}
                disabled={page <= 1}
              >
                Prev
              </button>
              <span>
                Page {page} of {pagination.totalPages || 1} ({pagination.total || 0} records)
              </span>
              <button
                type="button"
                className="btn btn-small btn-secondary"
                onClick={() => loadTenants(page + 1)}
                disabled={page >= (pagination.totalPages || 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default TenantsPage;
