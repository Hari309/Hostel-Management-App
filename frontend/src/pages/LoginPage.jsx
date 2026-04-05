import { motion } from "framer-motion";
import { useState } from "react";
import { getErrorMessage, loginAdmin } from "../services/api";

const RETRY_ATTEMPTS = 6;
const RETRY_DELAY_MS = 3000;
const WAKE_UP_STATUS_CODES = new Set([502, 503, 504]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isWakeUpError = (error) => {
  const status = error?.response?.status;
  if (status && WAKE_UP_STATUS_CODES.has(status)) return true;

  // Preflight/network failures often come through as "no response" from axios.
  if (!error?.response) return true;

  const text = String(error?.response?.data?.message || error?.message || "").toLowerCase();
  return text.includes("hibernate") || text.includes("service unavailable");
};

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("admin@hostel.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    let lastError;

    try {
      for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
        try {
          const response = await loginAdmin({ email, password });
          onLogin(response);
          return;
        } catch (err) {
          lastError = err;

          if (!isWakeUpError(err) || attempt === RETRY_ATTEMPTS) {
            break;
          }

          setError(`Server is waking up... retrying (${attempt}/${RETRY_ATTEMPTS - 1})`);
          await sleep(RETRY_DELAY_MS);
        }
      }

      if (isWakeUpError(lastError)) {
        setError("Server is waking up on Render. Please wait a few seconds and try again.");
      } else {
        setError(getErrorMessage(lastError, "Login failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-accent one animate-blob" />
      <div className="login-accent two animate-blob anim-delay-200" />
      <div className="login-accent three animate-blob anim-delay-500" />

      <div className="login-grid">
        {/* <motion.div
          className="login-showcase"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="login-title">Run Your Hostel Operations Smoothly</h2>
          <p className="login-subtitle">
            Track tenants, rooms, payments, and complaints from one elegant admin panel built for
            day-to-day speed.
          </p>
          <ul className="login-points">
            <li>Instant room occupancy insights and pending payment alerts.</li>
            <li>Centralized tenant records with updates and search support.</li>
            <li>Mobile-friendly dashboard for quick checks on the go.</li>
          </ul>
        </motion.div> */}

        <div className="login-wrapper">
          <motion.form
            className="login-card page-enter"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <h1>Welcome Back, Hari</h1>
            <p className="muted mt-2">Sign in to manage your hostel seamlessly.</p>

            {error && <p className="error-text mt-4">{error}</p>}

            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hostel.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              className="btn mt-5 w-full"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? "Signing in..." : "Login to Dashboard"}
            </motion.button>

            <p className="mt-4 text-center text-xs text-slate-400">
              Demo credentials are prefilled for quick access.
            </p>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
