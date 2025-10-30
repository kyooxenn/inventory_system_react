import { useState, useMemo } from "react";
import { register } from "/src/services/auth.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import countries from "country-list-with-dial-code-and-flag";
import { isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    mobile: "",
    countryCode: "+63",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fullMobile = `${form.countryCode}${form.mobile}`;
      const parsedNumber = parsePhoneNumberFromString(fullMobile);

      // ✅ Validate using libphonenumber-js
      if (!parsedNumber || !isValidPhoneNumber(fullMobile)) {
        toast.error("Please enter a valid mobile number for the selected country.");
        setLoading(false);
        return;
      }

      await register(
        form.username.trim(),
        form.password.trim(),
        form.email.trim(),
        parsedNumber.number
      );

      toast.success("Registration successful! You can now log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err?.message || "Username or email already exists.");
    } finally {
      setLoading(false);
    }
  };

  const formVariants = useMemo(
    () => ({
      initial: { opacity: 0, y: 20, scale: 0.98 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -20, scale: 0.98 },
    }),
    []
  );

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
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 3 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 shadow-lg shadow-blue-700/40 text-white mb-3"
              >
                <UserPlus size={28} />
              </motion.div>

              <h2 className="text-3xl font-bold text-blue-400 mb-1">Create Account</h2>
              <p className="text-gray-400 text-sm">
                Join our platform and manage your inventory smarter.
              </p>
            </div>

            {/* Form */}
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
                type="email"
                name="email"
                placeholder="Email Address"
                className={inputClass}
                value={form.email}
                onChange={handleChange}
                required
              />

              {/* ✅ Mobile input with country code */}
              <div className="flex items-center w-full">
                <div className="flex-shrink-0">
                  <select
                    name="countryCode"
                    value={form.countryCode}
                    onChange={handleChange}
                    className="h-12 w-24 bg-gray-800 border border-gray-700 text-white text-sm px-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {countries.getAll().map((c, index) => (
                      <option key={`${c.code}-${index}`} value={c.dial_code}>
                        {c.flag} {c.dial_code}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="tel"
                  name="mobile"
                  placeholder="Mobile Number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  title="Enter a valid mobile number"
                  className="h-12 w-full bg-gray-800 border border-l-0 border-gray-700 text-white placeholder-gray-400 p-3 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setForm((prev) => ({ ...prev, mobile: value }));
                  }}
                  required
                />
              </div>

              {/* ✅ Password input with toggle */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className={`${inputClass} pr-10`}
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

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

            {/* Toggle to Login */}
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

        {/* Footer */}
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
