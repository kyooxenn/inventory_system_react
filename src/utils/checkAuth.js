import { toast } from "react-hot-toast";

export const TOKEN_KEY = "token";

export const isLoggedIn = () => !!localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const logout = ({ redirect = true, showMsg = false, delayMs = 0 } = {}) => {
  localStorage.removeItem(TOKEN_KEY);

  if (showMsg && typeof window !== "undefined") {
    toast("Session expired", { icon: "⚠️" });
  }

  if (redirect) {
    setTimeout(() => {
      window.location.href = "#/login"; // ✅ full reload, safe everywhere
    }, delayMs);
  }
};
