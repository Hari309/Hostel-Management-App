import { useEffect, useMemo, useState } from "react";
import { createRoom, fetchRooms, fetchTenants, getErrorMessage, updateRoom } from "../services/api";

const initialRoomForm = {
  roomNumber: "",
  capacity: "",
  currentOccupancy: 0,
};

const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [form, setForm] = useState(initialRoomForm);
  const [error, setError] = useState("");
  const [assignments, setAssignments] = useState({});
  const [editRoomId, setEditRoomId] = useState("");
  const [editPayload, setEditPayload] = useState({ roomNumber: "", capacity: "", currentOccupancy: "" });

  const tenantOptions = useMemo(
    () => tenants.filter((tenant) => tenant?.room?._id || tenant.room),
    [tenants]
  );

  const loadRooms = async () => {
    try {
      const response = await fetchRooms();
      setRooms(response);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load rooms"));
    }
  };

  const loadTenants = async () => {
    try {
      const response = await fetchTenants({ page: 1, limit: 500 });
      setTenants(response.data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load tenants"));
    }
  };

  useEffect(() => {
    loadRooms();
    loadTenants();
  }, []);

  const handleCreateRoom = async (event) => {
    event.preventDefault();
    try {
      await createRoom({
        roomNumber: form.roomNumber,
        capacity: Number(form.capacity),
        currentOccupancy: Number(form.currentOccupancy || 0),
      });
      setForm(initialRoomForm);
      await loadRooms();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create room"));
    }
  };

  const startEdit = (room) => {
    setEditRoomId(room._id);
    setEditPayload({
      roomNumber: room.roomNumber,
      capacity: room.capacity,
      currentOccupancy: room.currentOccupancy,
    });
  };

  const saveEdit = async (roomId) => {
    try {
      await updateRoom(roomId, {
        roomNumber: editPayload.roomNumber,
        capacity: Number(editPayload.capacity),
        currentOccupancy: Number(editPayload.currentOccupancy),
      });
      setEditRoomId("");
      await loadRooms();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update room"));
    }
  };

  const assignTenant = async (roomId) => {
    const tenantId = assignments[roomId];
    if (!tenantId) return;

    try {
      await updateRoom(roomId, { tenantId });
      setAssignments((prev) => ({ ...prev, [roomId]: "" }));
      await Promise.all([loadRooms(), loadTenants()]);
    } catch (err) {
      setError(getErrorMessage(err, "Tenant assignment failed"));
    }
  };

  return (
    <section className="page-enter">
      <div className="section-header">
        <h1>Room Management</h1>
        <button type="button" className="btn btn-secondary" onClick={loadRooms}>
          Reload
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="card">
        <h3>Add Room</h3>
        <form className="form-grid room-form" onSubmit={handleCreateRoom}>
          <input
            placeholder="Room Number"
            value={form.roomNumber}
            onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
            required
          />
          <input
            type="number"
            min="1"
            placeholder="Capacity"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            required
          />
          <input
            type="number"
            min="0"
            placeholder="Current Occupancy"
            value={form.currentOccupancy}
            onChange={(e) => setForm({ ...form, currentOccupancy: e.target.value })}
          />
          <button type="submit" className="btn">
            Add Room
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Rooms</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Room Number</th>
                <th>Capacity</th>
                <th>Occupancy</th>
                <th>Status</th>
                <th>Assign Tenant</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 && (
                <tr>
                  <td colSpan="6">No rooms found.</td>
                </tr>
              )}

              {rooms.map((room) => (
                <tr key={room._id}>
                  <td>
                    {editRoomId === room._id ? (
                      <input
                        value={editPayload.roomNumber}
                        onChange={(e) => setEditPayload({ ...editPayload, roomNumber: e.target.value })}
                      />
                    ) : (
                      room.roomNumber
                    )}
                  </td>
                  <td>
                    {editRoomId === room._id ? (
                      <input
                        type="number"
                        min="1"
                        value={editPayload.capacity}
                        onChange={(e) => setEditPayload({ ...editPayload, capacity: e.target.value })}
                      />
                    ) : (
                      room.capacity
                    )}
                  </td>
                  <td>
                    {editRoomId === room._id ? (
                      <input
                        type="number"
                        min="0"
                        value={editPayload.currentOccupancy}
                        onChange={(e) => setEditPayload({ ...editPayload, currentOccupancy: e.target.value })}
                      />
                    ) : (
                      `${room.currentOccupancy}/${room.capacity}`
                    )}
                  </td>
                  <td>
                    <span className={room.status === "Available" ? "tag tag-green" : "tag tag-red"}>
                      {room.status}
                    </span>
                  </td>
                  <td>
                    <div className="inline-controls">
                      <select
                        value={assignments[room._id] || ""}
                        onChange={(e) => setAssignments((prev) => ({ ...prev, [room._id]: e.target.value }))}
                      >
                        <option value="">Select Tenant</option>
                        {tenantOptions.map((tenant) => (
                          <option key={tenant._id} value={tenant._id}>
                            {tenant.name} (Room {tenant.roomNumber})
                          </option>
                        ))}
                      </select>
                      <button type="button" className="btn btn-small" onClick={() => assignTenant(room._id)}>
                        Assign
                      </button>
                    </div>
                  </td>
                  <td className="table-actions">
                    {editRoomId === room._id ? (
                      <>
                        <button type="button" className="btn btn-small" onClick={() => saveEdit(room._id)}>
                          Save
                        </button>
                        <button
                          type="button"
                          className="btn btn-small btn-secondary"
                          onClick={() => setEditRoomId("")}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button type="button" className="btn btn-small" onClick={() => startEdit(room)}>
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default RoomsPage;
