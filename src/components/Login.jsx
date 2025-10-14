import { useState } from "react";
import { login, register } from "/src/services/auth.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus } from "lucide-react";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(username, password);
        toast.success("Registration successful! You can now log in.");
        setIsRegister(false);
      } else {
        await login(username, password);
        localStorage.setItem("username", username);
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (err) {
      toast.error(isRegister ? "Username already exists" : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.98 },
  };

  const InlineLoader = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/80 rounded-2xl"
    >
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 1.2,
          ease: "linear",
        }}
        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
      />
    </motion.div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <AnimatePresence>{loading && <InlineLoader />}</AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={isRegister ? "register" : "login"}
            variants={formVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={loading ? "pointer-events-none opacity-50" : ""}
          >
            {/* Icon + Title */}
            <div className="text-center mb-8">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 3 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 shadow-lg shadow-blue-700/40 text-white mb-3"
              >
                {isRegister ? <UserPlus size={28} /> : <LogIn size={28} />}
              </motion.div>
              <h2 className="text-3xl font-bold text-blue-400 mb-1">
                {isRegister ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-gray-400 text-sm">
                {isRegister
                  ? "Join our platform and manage your inventory smarter."
                  : "Sign in to access your dashboard."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400
                           p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400
                           p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition text-white p-3 rounded-lg font-semibold shadow-md shadow-blue-700/30"
              >
                {isRegister ? "Register" : "Login"}
              </motion.button>
            </form>

            {/* Toggle */}
            <div className="text-center mt-6 text-gray-400">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                className="text-blue-400 hover:text-blue-300 font-medium"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? "Login" : "Register"}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-gray-500 text-xs text-center mt-6"
        >
          © 2025 Norbs Inventory | <span className="text-blue-400">Dashboard Theme</span>
        </motion.footer>
      </motion.div>
    </div>
  );
}
