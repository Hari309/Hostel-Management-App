import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import { fetchDashboardStats, getErrorMessage } from "../services/api";

const toINR = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetchDashboardStats();
      setStats(response);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Could not load dashboard stats."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return <p className="page-enter">Loading dashboard...</p>;
  }

  return (
    <section className="page-enter">
      <div className="section-header">
        <h1> Hari Dashboard</h1>
        <button type="button" className="btn" onClick={loadStats}>
          Refresh
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {stats && (
        <div className="stats-grid">
          <StatCard label="Total Rooms" value={stats.totalRooms} />
          <StatCard label="Occupied Rooms" value={stats.occupiedRooms} index={1} />
          <StatCard label="Available Rooms" value={stats.availableRooms} index={2} />
          <StatCard label="Total Tenants" value={stats.totalTenants} index={3} />
          <StatCard label="Pending Payments" value={stats.pendingPayments} index={4} />
          <StatCard label="Open Complaints" value={stats.openComplaints} index={5} />
          <StatCard label="Overall Collected" value={toINR(stats.overallCollected)} index={6} />
          <StatCard label="Overall Expenses" value={toINR(stats.overallExpenses)} index={7} />
        </div>
      )}
    </section>
  );
};

export default DashboardPage;
