import { useState, useMemo } from "react";
import { register } from "/src/services/auth.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, LogIn } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.username.trim(), form.password.trim());
      toast.success("Registration successful! You can now log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err?.message || "Username already exists.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Animations (memoized)
  const formVariants = useMemo(
    () => ({
      initial: { opacity: 0, y: 20, scale: 0.98 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -20, scale: 0.98 },
    }),
    []
  );

  // ✅ Loader animation
  const InlineLoader = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/80 rounded-2xl"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
        className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
      />
    </motion.div>
  );

  // ✅ Shared styles
  const inputClass =
    "w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
  const buttonClass =
    "w-full bg-blue-600 hover:bg-blue-700 transition text-white p-3 rounded-lg font-semibold shadow-md shadow-blue-700/30";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <AnimatePresence>{loading && <InlineLoader />}</AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key="register-form"
            variants={formVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4 }}
            className={loading ? "pointer-events-none opacity-50" : ""}
          >
            {/* ✅ Header */}
            <div className="text-center mb-8">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 3 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 shadow-lg shadow-blue-700/40 text-white mb-3"
              >
                <UserPlus size={28} />
              </motion.div>

              <h2 className="text-3xl font-bold text-blue-400 mb-1">
                Create Account
              </h2>
              <p className="text-gray-400 text-sm">
                Join our platform and manage your inventory smarter.
              </p>
            </div>

            {/* ✅ Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="username"
                placeholder="Username"
                className={inputClass}
                value={form.username}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className={inputClass}
                value={form.password}
                onChange={handleChange}
                required
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className={buttonClass}
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </motion.button>
            </form>

            {/* ✅ Toggle to Login */}
            <div className="text-center mt-6 text-gray-400">
              Already have an account?{" "}
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                className="text-blue-400 hover:text-blue-300 font-medium"
                onClick={() => navigate("/login")}
              >
                Login
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ✅ Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-gray-500 text-xs text-center mt-6"
        >
          © {new Date().getFullYear()} Norbert Jon Bobila |{" "}
          <span className="text-blue-400">All rights reserved.</span>
        </motion.footer>
      </motion.div>
    </div>
  );
}
