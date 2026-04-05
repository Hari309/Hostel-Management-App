import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import ComplaintsPage from "./pages/ComplaintsPage";
import DashboardPage from "./pages/DashboardPage";
import ExpensesPage from "./pages/ExpensesPage";
import LoginPage from "./pages/LoginPage";
import PaymentsPage from "./pages/PaymentsPage";
import RoomsPage from "./pages/RoomsPage";
import TenantsPage from "./pages/TenantsPage";
import { clearStoredAuth, getStoredAuth, setStoredAuth } from "./services/auth";
import { useState } from "react";

function App() {
  const [auth, setAuth] = useState(() => getStoredAuth());

  const handleLogin = (loginResponse) => {
    const authPayload = {
      token: loginResponse.token,
      user: loginResponse.user,
    };
    setStoredAuth(authPayload);
    setAuth(authPayload);
  };

  const handleLogout = () => {
    clearStoredAuth();
    setAuth(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            auth?.token ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />
          }
        />

        <Route
          element={
            <ProtectedRoute token={auth?.token}>
              <Layout authUser={auth?.user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tenants" element={<TenantsPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/complaints" element={<ComplaintsPage />} />
        </Route>

        <Route path="*" element={<Navigate to={auth?.token ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
