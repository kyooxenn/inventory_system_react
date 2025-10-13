import { jwtDecode } from "jwt-decode";
import { logout } from "/src/utils/checkAuth.js";

export const checkTokenExpiry = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return false;

    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      logout({ redirect: true, showMsg: true });
      return true;
    }
    return false;
  } catch {
    logout({ redirect: true, showMsg: true });
    return true;
  }
};
