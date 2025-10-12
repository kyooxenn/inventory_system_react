import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllProducts } from "../api";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
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

  const totalValue = products.reduce(
    (sum, p) => sum + p.unitPrice * p.quantity,
    0
  );
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalItems = products.length;

  return (
    <>
      <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between pb-24">
        {/* Header */}
        <div className="px-4 pt-10 text-center">
          <h1 className="text-4xl font-extrabold mb-2 drop-shadow-lg text-blue-400">
            🧭 Dashboard Overview
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            Monitor and manage your inventory in real time.
          </p>
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
        <div className="flex flex-col items-center px-4 mt-10 space-y-4 md:grid md:grid-cols-4 md:gap-6 md:space-y-0">
          <Link to="/add-product">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 hover:bg-green-700 transition text-white rounded-2xl py-5 font-semibold shadow-lg w-full max-w-xs mx-auto"
            >
              ➕ Add Product
            </motion.button>
          </Link>

          <Link to="/inventory">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 hover:bg-blue-700 transition text-white rounded-2xl py-5 font-semibold shadow-lg w-full max-w-xs mx-auto"
            >
              📦 View Inventory
            </motion.button>
          </Link>

          <Link to="/adjust/increase">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-yellow-500 hover:bg-yellow-600 transition text-white rounded-2xl py-5 font-semibold shadow-lg w-full max-w-xs mx-auto"
            >
              ⬆️ Increase Quantity
            </motion.button>
          </Link>

          <Link to="/adjust/decrease">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-red-600 hover:bg-red-700 transition text-white rounded-2xl py-5 font-semibold shadow-lg w-full max-w-xs mx-auto"
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
