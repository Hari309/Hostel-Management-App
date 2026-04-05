import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/tenants", label: "Tenants" },
  { path: "/rooms", label: "Rooms" },
  { path: "/payments", label: "Payments" },
  { path: "/expenses", label: "Expenses" },
  { path: "/complaints", label: "Complaints" },
];

const Layout = ({ authUser, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="sidebar-head">
          <div>
            <h2>Hostel Admin</h2>
            <p className="sidebar-user">{authUser?.name}</p>
          </div>
          <button
            type="button"
            className="icon-btn sidebar-close icon-symbol"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            ✕
          </button>
        </div>
        <nav className="nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </aside>
      <button
        type="button"
        className={`sidebar-backdrop ${isMobileMenuOpen ? "show" : ""}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-label="Close navigation menu"
      />
      <main className="content-area">
        <header className="mobile-topbar">
          <button
            type="button"
            className="icon-btn icon-symbol"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            ☰
          </button>
          <p className="topbar-title">Hostel Management</p>
          <button
            type="button"
            className="icon-btn ml-auto"
            onClick={handleLogout}
            aria-label="Logout"
          >
            Logout
          </button>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
