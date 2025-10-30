import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  generateOtp,
  verifyOtp,
  checkTelegramLink,
  generateTelegramLinkCode,
  checkTelegramLinkStatus,
} from "/src/services/auth.js";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyRound,
  MailWarning,
  MessageSquareWarning,
  Link,
} from "lucide-react";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const tempToken = location.state?.tempToken;
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendDisabled, setSendDisabled] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const otpInputRef = useRef(null);
  const [remainingSeconds, setRemainingSeconds] = useState(120);
  const [totalSeconds] = useState(120);

  // Telegram states
  const [method, setMethod] = useState("email");
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [linkingCode, setLinkingCode] = useState("");
  const [linkingLoading, setLinkingLoading] = useState(false);

  // For UI messages about the linking process (pending/success/already_linked)
  const [linkStatusMessage, setLinkStatusMessage] = useState("");
  const [linkStatusType, setLinkStatusType] = useState("info"); // 'info' | 'success' | 'error'

  // Refs for intervals/timeouts so we can clear them on unmount
  const pollingRef = useRef(null);
  const stopTimeoutRef = useRef(null);

  useEffect(() => {
    if (!tempToken) {
      toast.error("Session expired. Please login again.");
      navigate("/login");
    }
  }, [tempToken, navigate]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            setSendDisabled(false);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  // When user selects "telegram" method, check if this account already has a linked Telegram chat id
  useEffect(() => {
    let mounted = true;
    const checkIfUserHasLinkedTelegram = async () => {
      if (method === "telegram" && tempToken) {
        try {
          // This calls your existing service which should check for current user's linked chat id
          const isLinked = await checkTelegramLink(tempToken);
          if (!mounted) return;
          setTelegramLinked(Boolean(isLinked));
          if (isLinked) {
            setLinkStatusMessage("✅ Your Telegram account is linked!");
            setLinkStatusType("success");
          } else {
            setLinkStatusMessage("");
            setLinkStatusType("info");
          }
        } catch (err) {
          console.error("Error checking existing telegram link:", err);
          if (!mounted) return;
          setTelegramLinked(false);
          setLinkStatusMessage("");
        }
      }
    };

    checkIfUserHasLinkedTelegram();
    return () => {
      mounted = false;
    };
  }, [method, tempToken]);

  // Helper: poll your backend's /api/telegram/link-status/{code}
  const pollLinkStatus = (code) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);

    setRemainingSeconds(120);

    const countdownTimer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const stopAll = (message = "", type = "info", resetCode = false) => {
      clearInterval(countdownTimer);
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
      pollingRef.current = null;
      stopTimeoutRef.current = null;
      setLinkStatusMessage(message);
      setLinkStatusType(type);
      setLinkingLoading(false);
      if (resetCode) setLinkingCode("");
      setRemainingSeconds(0);
    };

    const checkOnce = async () => {
      try {
        const res = await checkTelegramLinkStatus(code);
        const status = res.status;

        if (status === "pending") return false;

        if (status === "success") {
          stopAll("✅ Your Telegram account has been successfully linked!", "success", true);
          setTelegramLinked(true);
          return true;
        }

        if (status === "already_linked") {
          stopAll(
            "⚠️ This Telegram account is already linked to another user. Please use a different Telegram account or unlink the old one first.",
            "error",
            true
          );
          return true;
        }

        return false;
      } catch (err) {
        console.error("Error polling link status:", err);
        stopAll("❌ Error contacting server. Please try again later.", "error", true);
        return true;
      }
    };

    (async () => {
      const done = await checkOnce();
      if (done) return;

      pollingRef.current = setInterval(checkOnce, 3000);

      stopTimeoutRef.current = setTimeout(() => {
        stopAll("⌛ Link attempt timed out after 2 minutes. Please try again.", "error", true);
      }, 120000);
    })();
  };



  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }
    };
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyOtp(tempToken, otp.trim());
      localStorage.setItem("token", res.token);
      toast.success("OTP verified successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!tempToken) return toast.error("Missing session.");
    if (method === "email" && !email) return toast.error("Missing email.");
    if (method === "telegram" && !telegramLinked)
      return toast.error("Please link your Telegram account first.");

    setLoading(true);
    setSendDisabled(true);
    setCooldown(120);

    try {
      const payload = method === "email" ? email : null;
      const message = await generateOtp(tempToken, payload, method);
      toast.success(message);
      setOtpSent(true);
      setTimeout(() => otpInputRef.current?.focus(), 300);
    } catch (err) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectTelegram = async () => {
    if (linkingLoading) return;
    setLinkingLoading(true);
    setLinkStatusMessage("⏳ Generating linking code and opening Telegram...");
    setLinkStatusType("info");

    try {
      const data = await generateTelegramLinkCode(tempToken);
      const { code, botUsername } = data;
      setLinkingCode(code);
      // open telegram
      window.open(`https://t.me/${botUsername}?start=${code}`, "_blank");

      // start polling the new endpoint for this code
      pollLinkStatus(code);

      // ensure loading state is cleared on result via pollLinkStatus or on timeout
    } catch (err) {
      console.error("Failed to generate linking code:", err);
      toast.error(err.message || "Failed to generate linking code.");
      setLinkingLoading(false);
      setLinkStatusMessage("❌ Failed to generate linking code. Please try again.");
      setLinkStatusType("error");
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

            <h2 className="text-3xl font-bold text-blue-400 mb-1">Verify OTP</h2>

            {!otpSent && (
              <p className="text-gray-400 text-sm mb-4">
                To continue, please verify your account first by generating and
                entering the OTP sent to your chosen method.
              </p>
            )}

            {otpSent && (
              <p className="text-gray-400 text-sm mb-3">
                Please enter the 6-digit OTP sent to your{" "}
                {method === "email" ? "registered email address" : "Telegram chat"}
                .
              </p>
            )}

            {/* Method Selection */}
            {!otpSent && (
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">
                  Choose OTP delivery method:
                </p>
                <div className="flex justify-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="method"
                      value="email"
                      checked={method === "email"}
                      onChange={(e) => setMethod(e.target.value)}
                      className="text-blue-500"
                    />
                    <span className="text-white">Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="method"
                      value="telegram"
                      checked={method === "telegram"}
                      onChange={(e) => setMethod(e.target.value)}
                      className="text-blue-500"
                    />
                    <span className="text-white">Telegram</span>
                  </label>
                </div>
              </div>
            )}

            {/* Telegram Linking Section */}
            {!otpSent && method === "telegram" && (
              <>
                {telegramLinked ? (
                  <p className="text-green-400 text-sm mb-3">
                    ✅ Your Telegram account is linked!
                  </p>
                ) : (
                  <>
                    <p className="text-gray-400 text-sm mb-2">
                      Link your Telegram to receive OTPs securely.
                    </p>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleConnectTelegram}
                      disabled={linkingLoading}
                      className={`w-full transition text-white p-3 rounded-lg font-semibold shadow-md mb-3 flex flex-col items-center justify-center gap-2 ${
                        linkingLoading
                          ? "bg-gray-600 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 shadow-green-700/30"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Link size={16} />
                        <span>
                          {linkingLoading ? "Connecting to Telegram…" : "Link Telegram Account"}
                        </span>
                      </div>

                      {/* Show status + countdown while linking */}
                      {linkingLoading && (
                        <div className="mt-3 w-full text-center">
                          <p className="text-sm text-gray-300">
                            {linkStatusMessage || "Waiting for confirmation from Telegram…"}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {remainingSeconds > 0
                              ? `${remainingSeconds} seconds remaining`
                              : "The linking process timed out."}
                          </p>

                          <div className="w-full bg-gray-700 rounded-full h-2 mt-2 overflow-hidden">
                            <div
                              className="h-2 bg-blue-500 transition-all duration-1000 ease-linear"
                              style={{
                                width: `${((totalSeconds - remainingSeconds) / totalSeconds) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </motion.button>

                    {linkingCode && (
                      <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 mb-3 text-left">
                        <p className="text-sm text-gray-300 mb-1">
                          🧩 <strong>Manual Link Option:</strong>
                        </p>
                        <p className="text-xs text-gray-400 mb-2">
                          If Telegram didn’t open automatically, copy and send the following command to the bot:
                        </p>

                        <div className="bg-gray-900 border border-gray-700 rounded-md p-2 text-center font-mono text-blue-400 select-all break-all">
                          /start {linkingCode}
                        </div>

                        <p className="text-[11px] text-gray-500 mt-2 text-center">
                          (Tap the code above to copy — then paste it into the Telegram chat with the bot.)
                        </p>
                      </div>
                    )}

                    {/* Link status message shown as user polls/after result */}
                    {linkStatusMessage && (
                      <div
                        className={`mt-2 text-sm p-2 rounded ${
                          linkStatusType === "success"
                            ? "bg-green-900/20 text-green-300 border border-green-700/40"
                            : linkStatusType === "error"
                            ? "bg-red-900/20 text-red-300 border border-red-700/40"
                            : "bg-gray-900/20 text-gray-300 border border-gray-700/40"
                        }`}
                      >
                        {linkStatusMessage}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Send OTP Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleSendOtp}
              disabled={sendDisabled || (method === "telegram" && !telegramLinked)}
              className={`w-full ${
                sendDisabled || (method === "telegram" && !telegramLinked)
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } transition text-white p-3 rounded-lg font-semibold shadow-md shadow-green-700/30`}
            >
              {otpSent ? (sendDisabled ? `Resend OTP (${cooldown}s)` : "Resend OTP") : `Send OTP to ${method === "email" ? "Email" : "Telegram"}`}
            </motion.button>

            {/* Info Message */}
            {otpSent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-3 flex items-center justify-center gap-2 text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-2"
              >
                {method === "email" ? (
                  <>
                    <MailWarning size={14} />
                    <span>
                      Didn’t receive it? Check your <strong>Spam</strong> or{" "}
                      <strong>Junk</strong> folder.
                    </span>
                  </>
                ) : (
                  <>
                    <MessageSquareWarning size={14} />
                    <span>
                      Didn’t receive it? Check your Telegram notifications or
                      ensure your account is linked.
                    </span>
                  </>
                )}
              </motion.div>
            )}
          </div>

          {/* OTP Form */}
          {otpSent && (
            <form onSubmit={handleVerify} className="space-y-4">
              <input
                ref={otpInputRef}
                type="text"
                name="otp"
                placeholder="Enter OTP"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={inputClass}
                required
              />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" className={buttonClass}>
                Verify OTP
              </motion.button>
            </form>
          )}

          {/* Footer */}
          <motion.footer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-gray-500 text-xs text-center mt-6">
            © {new Date().getFullYear()} Norbert Jon Bobila | <span className="text-blue-400">All rights reserved.</span>
          </motion.footer>
        </div>
      </motion.div>
    </div>
  );
}
