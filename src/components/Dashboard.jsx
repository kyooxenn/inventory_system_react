import { useEffect, useState, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getAllProducts } from "/src/services/api.js";
import { logout } from "/src/services/auth.js";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Package,
  Plus,
  TrendingUp,
  TrendingDown,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [dateTime, setDateTime] = useState(() => new Date());
  const [username] = useState(
    () => localStorage.getItem("username") || ""
  );

  const [totalItems, setTotalItems] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);

  // START OPEN
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = useNavigate();

  const loadTotals = useCallback(async () => {
    setLoading(true);

    try {
      let allProducts = [];
      let page = 0;
      let totalPages = 1;

      while (page < totalPages) {
        const data = await getAllProducts(page, 1000);

        allProducts = [...allProducts, ...(data?.content || [])];

        totalPages = data?.totalPages || 1;
        page++;
      }

      let value = 0;
      let qty = 0;

      for (const p of allProducts) {
        value += (p.unitPrice || 0) * (p.quantity || 0);
        qty += p.quantity || 0;
      }

      setTotalItems(allProducts.length);
      setTotalValue(value);
      setTotalQuantity(qty);
    } catch {
      toast.error("Failed to load inventory data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTotals();
  }, [loadTotals]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    localStorage.removeItem("username");

    toast.success("You have been logged out.");

    navigate("/login");
  }, [navigate]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const navItems = [
    {
      path: "/add-product",
      name: "Add Product",
      icon: Plus,
    },
    {
      path: "/inventory",
      name: "View Inventory",
      icon: Package,
    },
    {
      path: "/adjust/increase",
      name: "Increase Quantity",
      icon: TrendingUp,
    },
    {
      path: "/adjust/decrease",
      name: "Decrease Quantity",
      icon: TrendingDown,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Burger Button */}
      <button
        onClick={toggleSidebar}
        className={`
          fixed top-4 z-50 p-3 rounded-lg
          bg-gray-800 text-white shadow-lg
          hover:bg-gray-700 transition-all duration-300
          ${sidebarOpen ? "left-72" : "left-4"}
        `}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40
          h-full w-64
          bg-gray-900 border-r border-gray-800
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="p-5 border-b border-gray-800">
            <p className="text-xs text-gray-400 mt-1">
            N-Vent Dashboard
            </p>

          {username && (
            <div className="mt-4 text-sm text-gray-300">
              Hi,{" "} welcome{" "}
              <span className="text-blue-400 font-semibold">
                {username} 👋
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors duration-200"
          >
            <LogOut size={20} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`
          flex-1 flex flex-col overflow-y-auto
          transition-all duration-300
          ${sidebarOpen ? "lg:ml-64" : "ml-0"}
        `}
      >
        <main className="flex-1 p-4 md:p-6 pt-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-5xl font-extrabold text-blue-400">
              🧭 N-Vent Dashboard
            </h1>

            <p className="text-gray-400 text-sm mt-2">
              Monitor and manage your inventory in real time.
            </p>

            <p className="text-gray-300 text-xs font-mono mt-3">
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
            </p>
          </motion.div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardCard
              title="Total Inventory Value"
              value={`₱${totalValue.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              img="https://cdn-icons-png.flaticon.com/512/4151/4151061.png"
              textColor="text-blue-400"
            />

            <DashboardCard
              title="Total Inventory Quantity"
              value={`${totalQuantity} Units`}
              subtext={`${totalItems} Items`}
              img="https://cdn-icons-png.flaticon.com/512/9964/9964372.png"
              textColor="text-green-400"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              {
                path: "/add-product",
                color: "bg-green-600 hover:bg-green-700",
                text: "➕ Add Product",
              },
              {
                path: "/inventory",
                color: "bg-blue-600 hover:bg-blue-700",
                text: "📦 View Inventory",
              },
              {
                path: "/adjust/increase",
                color: "bg-yellow-500 hover:bg-yellow-600",
                text: "⬆️ Increase Quantity",
              },
              {
                path: "/adjust/decrease",
                color: "bg-red-600 hover:bg-red-700",
                text: "⬇️ Decrease Quantity",
              },
            ].map(({ path, color, text }) => (
              <Link key={path} to={path}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className={`
                    ${color}
                    text-white rounded-xl
                    py-3 px-3
                    font-medium shadow-md
                    w-full h-16
                    flex items-center justify-center
                    text-center text-sm
                    transition
                  `}
                >
                  {text}
                </motion.button>
              </Link>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 text-sm py-3 text-center border-t border-gray-800">
          © {new Date().getFullYear()} Norbert Jon Bobila |{" "}
          <span className="text-blue-400">
            All rights reserved.
          </span>
        </footer>
      </div>
    </div>
  );
}

const DashboardCard = ({
  title,
  value,
  subtext,
  img,
  textColor,
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 200 }}
    className="bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-700 flex justify-between items-center"
  >
    <div>
      <h3 className="text-gray-400 text-sm uppercase font-semibold">
        {title}
      </h3>

      <p className={`text-3xl font-bold mt-2 ${textColor}`}>
        {value}
      </p>

      {subtext && (
        <p className="text-gray-400 text-sm">
          {subtext}
        </p>
      )}
    </div>

    <img
      src={img}
      alt={title}
      className="w-16 h-16 opacity-80"
    />
  </motion.div>
);