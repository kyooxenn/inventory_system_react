import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "/src/services/auth.js";
import { checkTokenExpiry } from "/src/utils/checkTokenExpiry.js";

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const token = getToken();

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    } else {
      const expired = checkTokenExpiry();
      if (expired) {
        navigate("/login", { replace: true });
      }
    }
  }, [token, navigate]);

  return token ? children : null;
}
