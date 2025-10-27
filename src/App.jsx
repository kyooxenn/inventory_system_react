import { useEffect } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ProductList from "./components/ProductList";
import AddProduct from "./components/AddProduct";
import UpdateProduct from "./components/UpdateProduct";
import Dashboard from "./components/Dashboard";
import AdjustQuantity from "./components/AdjustQuantity";
import Login from "./components/Login";
import VerifyOtp from "./components/VerifyOtp";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import { checkTokenExpiry } from "/src/utils/checkTokenExpiry.js";
import { getToken } from "/src/services/auth.js"; // ✅ to check if user is logged in

function App() {
  // 🕒 Global token expiry checker
  useEffect(() => {
    const interval = setInterval(() => {
      const token = getToken();
      if (token) {
        checkTokenExpiry(); // only check when user is logged in
      }
    }, 60000); // 5000 every 5s for testing; use 60000 for 1 min in production.
// Will check token every 1 minute if expired force logout

    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <ProductList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-product"
          element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/update-product/:id"
          element={
            <ProtectedRoute>
              <UpdateProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/adjust/:type"
          element={
            <ProtectedRoute>
              <AdjustQuantity />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
