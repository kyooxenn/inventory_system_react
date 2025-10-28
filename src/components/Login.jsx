import { useState, useMemo } from "react";
import { login } from "/src/services/auth.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Handle input changes
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ✅ Handle login submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(form.username.trim(), form.password.trim());
      localStorage.setItem("username", form.username);

      if (res.tempToken) {
        navigate("/verify-otp", { state: { tempToken: res.tempToken, email: res.email } });
      } else {
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (err) {
      toast.error(err?.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Animation variants
  const formVariants = useMemo(
    () => ({
      initial: { opacity: 0, y: 20, scale: 0.98 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -20, scale: 0.98 },
    }),
    []
  );

  // ✅ Loader
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

  // ✅ Styles
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
        className="relative bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <AnimatePresence>{loading && <InlineLoader />}</AnimatePresence>

        <motion.div
          key="login-form"
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
              <LogIn size={28} />
            </motion.div>

            <h2 className="text-3xl font-bold text-blue-400 mb-1">
              Welcome Back
            </h2>
            <p className="text-gray-400 text-sm">
              Sign in to access your dashboard.
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
              {loading ? "Logging in..." : "Login"}
            </motion.button>
          </form>

          {/* ✅ Toggle to Register */}
          <div className="text-center mt-6 text-gray-400">
            Don’t have an account?{" "}
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              className="text-blue-400 hover:text-blue-300 font-medium"
              onClick={() => navigate("/register")}
            >
              Register
            </motion.button>
          </div>
        </motion.div>

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
