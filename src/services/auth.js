import axios from "axios";

//const API_BASE_URL = "http://localhost:8080/api/auth"; // adjust if needed

// ✅ Ensure your deployed frontend is accessible online when rendering the application.
const API_BASE_URL = "https://inventory-system-springboot-sea.onrender.com/api/auth";

// ✅ LOGIN (Step 1: request OTP)
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, { username, password });

    // Case 1: If OTP verification step is required
    if (response.data.tempToken) {
      return {
        tempToken: response.data.tempToken,
        email: response.data.email,
        requiresOtp: true,
      };
    }

    // Case 2: If JWT token is directly returned (no OTP flow)
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      return { token: response.data.token, requiresOtp: false };
    }

    throw new Error("Unexpected response from server");
  } catch (error) {
    const message =
      error.response?.data?.error ||
      (error.response?.status === 401
        ? "Invalid username or password"
        : "Login failed");
    throw new Error(message);
  }
};

// ✅ GENERATE OTP (Updated to support method)
export const generateOtp = async (tempToken, payload, method) => {
  try {
    if (method === "telegram") {
      // For Telegram, call the Telegram endpoint (no payload needed if linked)
      const response = await axios.post(`${API_BASE_URL.replace('/auth', '/telegram')}/send-otp`, {}, {
        headers: { Authorization: `Bearer ${tempToken}` } // Adjust if using session
      });
      return response.data || "OTP sent to your Telegram!";
    } else {
      // For email
      const response = await axios.post(`${API_BASE_URL}/send-otp`, {
        tempToken,
        email: payload,
      });
      return response.data.message || "OTP sent to your email!";
    }
  } catch (error) {
    const message =
      error.response?.data?.error ||
      (error.response?.status === 401
        ? "Session expired or invalid"
        : "Failed to send OTP");
    throw new Error(message);
  }
};


// ✅ REGISTER
export const register = async (username, password, email, mobile) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, { username, password, email, mobile });

    if (response.status === 201 || response.status === 200) {
      return response.data.message || "Registration successful!";
    } else {
      throw new Error(response.data.error || "Registration failed");
    }
  } catch (error) {
    const message =
      error.response?.data?.error ||
      (error.response?.status === 409
        ? "Username already exists"
        : "Registration failed");
    throw new Error(message);
  }
};


// ✅ VERIFY OTP (Step 2: verify and get JWT)
export const verifyOtp = async (tempToken, otp) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/verify-otp`, {
      tempToken,
      otp,
    });

    if (response.status === 200 && response.data.token) {
      localStorage.setItem("token", response.data.token);
      return response.data; // { token: "..." }
    } else {
      throw new Error(response.data.error || "OTP verification failed");
    }
  } catch (error) {
    const message =
      error.response?.data?.error ||
      (error.response?.status === 401
        ? "Invalid or expired OTP"
        : "OTP verification failed");
    throw new Error(message);
  }
};

// ✅ CHECK TELEGRAM LINK STATUS
export const checkTelegramLink = async (tempToken) => {
  try {
    const response = await axios.get(`${API_BASE_URL.replace('/auth', '/telegram')}/check-link`, {
      headers: { Authorization: `Bearer ${tempToken}` }
    });
    return response.data; // boolean
  } catch (error) {
    throw new Error("Failed to check Telegram link status");
  }
};

// ✅ GENERATE TELEGRAM LINK CODE
export const generateTelegramLinkCode = async (tempToken) => {
  try {
    const response = await axios.get(`${API_BASE_URL.replace('/auth', '/telegram')}/generate-link-code`, {
      headers: { Authorization: `Bearer ${tempToken}` }
    });
    return response.data; // { code: "...", botUsername: "..." }
  } catch (error) {
    const message =
      error.response?.data?.error ||
      (error.response?.status === 401
        ? "Session expired or invalid"
        : "Failed to generate linking code");
    throw new Error(message);
  }
};

// ✅ LOGOUT
export const logout = () => {
  localStorage.removeItem("token");
};

// ✅ GET STORED TOKEN
export const getToken = () => localStorage.getItem("token");
