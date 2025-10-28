import { useState } from "react";
import { verifyOtp } from "/src/services/auth.js";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, MailWarning } from "lucide-react"; // 👈 added icon

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get tempToken passed from login page
  const tempToken = location.state?.tempToken;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  if (!tempToken) {
    toast.error("Session expired. Please login again.");
    navigate("/login");
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyOtp(tempToken, otp.trim());
      localStorage.setItem("token", res.token);
      toast.success("OTP verified successfully!");
      navigate("/"); // go to dashboard/home
    } catch (err) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
  const buttonClass =
    "w-full bg-blue-600 hover:bg-blue-700 transition text-white p-3 rounded-lg font-semibold shadow-md shadow-blue-700/30";

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <AnimatePresence>{loading && <InlineLoader />}</AnimatePresence>

        <div className={loading ? "pointer-events-none opacity-50" : ""}>
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 3 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 shadow-lg shadow-blue-700/40 text-white mb-3"
            >
              <KeyRound size={28} />
            </motion.div>

            <h2 className="text-3xl font-bold text-blue-400 mb-1">
              Verify OTP
            </h2>
            <p className="text-gray-400 text-sm">
              Please enter the 6-digit OTP sent to your email.
            </p>

            {/* 👇 Added reminder message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-3 flex items-center justify-center gap-2 text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-2"
            >
              <MailWarning size={14} />
              <span>
                Didn’t receive it? Check your <strong>Spam</strong> or{" "}
                <strong>Junk</strong> folder.
              </span>
            </motion.div>
            {/* 👆 End of added message */}
          </div>

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className={inputClass}
              required
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className={buttonClass}
            >
              Verify OTP
            </motion.button>
          </form>

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
        </div>
      </motion.div>
    </div>
  );
}
