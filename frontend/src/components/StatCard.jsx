import { motion } from "framer-motion";

const StatCard = ({ label, value, index = 0 }) => (
  <motion.div
    className="stat-card"
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.06 * index, duration: 0.35 }}
    whileHover={{ y: -4 }}
  >
    <p>{label}</p>
    <h3>{value}</h3>
  </motion.div>
);

export default StatCard;
