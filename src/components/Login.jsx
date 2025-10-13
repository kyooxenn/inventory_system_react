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
      className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/80 rounded-3xl"
    >
      <motion.svg
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 1.2,
          ease: "linear",
        }}
        viewBox="0 0 100 100"
        className="w-16 h-16 text-red-600"
        fill="currentColor"
      >
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="5" fill="none" />
        <circle cx="50" cy="20" r="5" />
        <circle cx="75" cy="65" r="5" />
        <circle cx="25" cy="65" r="5" />
      </motion.svg>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-black px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-gray-800/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-700"
      >
        <AnimatePresence>{loading && <InlineLoader />}</AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={isRegister ? "register" : "login"}
            variants={formVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={loading ? "pointer-events-none opacity-50" : ""}
          >
            <div className="text-center mb-8">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white mb-3"
              >
                {isRegister ? <UserPlus size={28} /> : <LogIn size={28} />}
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-1">
                {isRegister ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-gray-400 text-sm">
                {isRegister
                  ? "Join our community and manage your inventory smarter."
                  : "Sign in to continue managing your inventory."}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full bg-gray-900/70 border border-gray-700 text-white placeholder-gray-400
                             p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  className="w-full bg-gray-900/70 border border-gray-700 text-white placeholder-gray-400
                             p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 transition text-white p-3 rounded-xl font-semibold shadow-lg"
                >
                  {isRegister ? "Register" : "Login"}
                </motion.button>
              </div>
            </form>

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
      </motion.div>
    </div>
  );
}
