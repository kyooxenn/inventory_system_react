import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllProducts } from "/src/services/api.js";
import { logout } from "/src/services/auth.js";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { LogOut } from "lucide-react";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const all = await getAllProducts();
      setProducts(all);
    } catch {
      toast.error("Failed to load inventory data.");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    toast.success("You have been logged out.");
    navigate("/login");
  };

  const totalValue = products.reduce(
    (sum, p) => sum + p.unitPrice * p.quantity,
    0
  );
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalItems = products.length;

  return (
    <>
    <div className="relative w-full">
      <div className="absolute top-2 right-2 z-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center gap-0.5 sm:gap-1 bg-gray-800 hover:bg-gray-700
                     text-white px-2 sm:px-2.5 py-1 sm:py-1.5 rounded sm:rounded-md shadow-md
                     transition-all duration-200 cursor-pointer text-[0.65rem] sm:text-[0.75rem]"
        >
          <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="font-medium">Log Out</span>
        </motion.button>
      </div>
    </div>

      {/* ✅ Main dashboard container (no relative positioning here) */}
      <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between pb-24">

        {/* Header */}
        <div className="px-4 pt-14 text-center">
          <h1 className="text-4xl font-extrabold mb-2 drop-shadow-lg text-blue-400">
            🧭 Dashboard Overview
          </h1>
          <p className="text-gray-400 text-sm font-medium mb-1">
            Monitor and manage your inventory in real time.
          </p>

          {/* ✅ Live Date & Time */}
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 mt-10">
          {/* Total Inventory Value */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-700 flex justify-between items-center"
          >
            <div>
              <h3 className="text-gray-400 text-sm uppercase font-semibold">
                Total Inventory Value
              </h3>
              <p className="text-3xl font-bold mt-2 text-blue-400">
                ₱{totalValue.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <img
              src="https://cdn-icons-png.flaticon.com/512/4151/4151061.png"
              alt="Money"
              className="w-16 h-16 opacity-80"
            />
          </motion.div>

          {/* Total Quantity */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-700 flex justify-between items-center"
          >
            <div>
              <h3 className="text-gray-400 text-sm uppercase font-semibold">
                Total Inventory Quantity
              </h3>
              <p className="text-3xl font-bold mt-2 text-green-400">
                {totalQuantity} Units
              </p>
              <p className="text-gray-400 text-sm">{totalItems} Items</p>
            </div>
            <img
              src="https://cdn-icons-png.flaticon.com/512/9964/9964372.png"
              alt="Inventory"
              className="w-16 h-16 opacity-80"
            />
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 mt-8">
          <Link to="/add-product">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 px-2 font-medium shadow-md w-full h-14 flex items-center justify-center text-center text-[0.75rem] leading-snug"
            >
              ➕ Add Product
            </motion.button>
          </Link>

          <Link to="/inventory">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-2 font-medium shadow-md w-full h-14 flex items-center justify-center text-center text-[0.75rem] leading-snug"
            >
              📦 View Inventory
            </motion.button>
          </Link>

          <Link to="/adjust/increase">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg py-2 px-2 font-medium shadow-md w-full h-14 flex items-center justify-center text-center text-[0.75rem] leading-snug"
            >
              ⬆️ Increase Quantity
            </motion.button>
          </Link>

          <Link to="/adjust/decrease">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 px-2 font-medium shadow-md w-full h-14 flex items-center justify-center text-center text-[0.75rem] leading-snug"
            >
              ⬇️ Decrease Quantity
            </motion.button>
          </Link>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="fixed bottom-0 left-0 w-full bg-gray-900 text-gray-400 text-sm py-3 text-center shadow-inner"
        >
          © 2025 Norbs | Built with{" "}
          <span className="text-blue-400">React</span> +{" "}
          <span className="text-teal-400">Tailwind</span> +{" "}
          <span className="text-pink-400">Motion</span>
        </motion.footer>
      </div>
    </>
  );
}
