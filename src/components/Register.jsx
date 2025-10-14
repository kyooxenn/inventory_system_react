import { useState, useMemo } from "react";
import { register } from "/src/services/auth.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Memoized input handler to avoid unnecessary re-renders
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Optimized form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.username.trim(), form.password.trim());
      toast.success("Registration successful! You can now log in.");
      navigate("/login");
    } catch {
      toast.error("Username already exists.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Common styles (memoized for performance)
  const inputClass = useMemo(
    () =>
      "w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition",
    []
  );
  const buttonClass = useMemo(
    () =>
      `w-full text-white p-2 rounded-lg font-semibold transition ${
        loading
          ? "bg-green-400 cursor-not-allowed"
          : "bg-green-500 hover:bg-green-600"
      }`,
    [loading]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-green-600">
          Create Account
        </h2>

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
          className={`${inputClass} mt-3`}
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit" className={`${buttonClass} mt-5`} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <button
            type="button"
            className="text-green-600 hover:underline font-medium"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
}
