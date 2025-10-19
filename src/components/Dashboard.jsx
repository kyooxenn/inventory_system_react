import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllProducts } from "/src/services/api.js";
import { logout } from "/src/services/auth.js";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { LogOut } from "lucide-react";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateTime, setDateTime] = useState(() => new Date());
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");
  const navigate = useNavigate();

  /** ✅ Load products once */
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getAllProducts();
      setProducts(all);
    } catch {
      toast.error("Failed to load inventory data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /** ✅ Update date/time every second */
  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  /** ✅ Derived values with useMemo to prevent re-calculation on every render */
  const { totalValue, totalQuantity, totalItems } = useMemo(() => {
    let value = 0;
    let qty = 0;
    for (const p of products) {
      value += p.unitPrice * p.quantity;
      qty += p.quantity;
    }
    return {
      totalValue: value,
      totalQuantity: qty,
      totalItems: products.length,
    };
  }, [products]);

  /** ✅ Logout handler */
  const handleLogout = useCallback(() => {
    logout();
    localStorage.removeItem("username");
    toast.success("You have been logged out.");
    navigate("/login");
  }, [navigate]);

  return (
    <>
      {/* ✅ Top Bar */}
      <div className="w-full bg-gray-900 py-6 px-4 shadow-md flex items-center justify-between">
        {/* Welcome Message */}
        {username && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white text-sm sm:text-base font-medium"
          >
            👋 Welcome, <span className="text-blue-400 font-semibold">{username}</span>
          </motion.div>
        )}

        {/* Logout */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center gap-1 text-white hover:text-blue-400 cursor-pointer
                     text-sm sm:text-base font-medium transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </motion.div>
      </div>

      {/* ✅ Dashboard Main */}
      <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between pb-24">
        <div className="px-4 pt-12 text-center">
          <h1 className="text-4xl font-extrabold mb-2 drop-shadow-lg text-blue-400">
            🧭 Dashboard Overview
          </h1>
          <p className="text-gray-400 text-sm font-medium mb-1">
            Monitor and manage your inventory in real time.
          </p>

          {/* Live Date/Time */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-gray-300 text-sm font-mono tracking-wide mt-1"
          >
            {dateTime.toLocaleString("en-PH", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </motion.p>
        </div>

        {/* ✅ Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 mt-10">
          {/* Inventory Value */}
          <DashboardCard
            title="Total Inventory Value"
            value={`₱${totalValue.toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            img="https://cdn-icons-png.flaticon.com/512/4151/4151061.png"
            textColor="text-blue-400"
          />

          {/* Quantity */}
          <DashboardCard
            title="Total Inventory Quantity"
            value={`${totalQuantity} Units`}
            subtext={`${totalItems} Items`}
            img="https://cdn-icons-png.flaticon.com/512/9964/9964372.png"
            textColor="text-green-400"
          />
        </div>

        {/* ✅ Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 mt-8">
          {[
            { path: "/add-product", color: "bg-green-600 hover:bg-green-700", text: "➕ Add Product" },
            { path: "/inventory", color: "bg-blue-600 hover:bg-blue-700", text: "📦 View Inventory" },
            { path: "/adjust/increase", color: "bg-yellow-500 hover:bg-yellow-600", text: "⬆️ Increase Quantity" },
            { path: "/adjust/decrease", color: "bg-red-600 hover:bg-red-700", text: "⬇️ Decrease Quantity" },
          ].map(({ path, color, text }) => (
            <Link key={path} to={path}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className={`${color} text-white rounded-lg py-2 px-2 font-medium shadow-md w-full h-14
                            flex items-center justify-center text-center text-[0.75rem] leading-snug`}
              >
                {text}
              </motion.button>
            </Link>
          ))}
        </div>

        {/* ✅ Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="fixed bottom-0 left-0 w-full bg-gray-900 text-gray-400 text-sm py-3 text-center shadow-inner"
        >
          © {new Date().getFullYear()} Norbert Jon Bobila | {" "}
          <span className="text-blue-400">All rights reserved.</span>
        </motion.footer>
      </div>
    </>
  );
}

/** ✅ Reusable Dashboard Card component */
const DashboardCard = ({ title, value, subtext, img, textColor }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    transition={{ type: "spring", stiffness: 200 }}
    className="bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-700 flex justify-between items-center"
  >
    <div>
      <h3 className="text-gray-400 text-sm uppercase font-semibold">{title}</h3>
      <p className={`text-3xl font-bold mt-2 ${textColor}`}>{value}</p>
      {subtext && <p className="text-gray-400 text-sm">{subtext}</p>}
    </div>
    <img src={img} alt={title} className="w-16 h-16 opacity-80" />
  </motion.div>
);
