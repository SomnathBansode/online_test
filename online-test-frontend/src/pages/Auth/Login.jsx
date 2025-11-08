import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";
import AuthWrapper from "../../components/AuthWrapper";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  // Show session expired message if redirected due to single-device login or session expiration
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSessionExpired(params.get("session") === "expired");

    if (token) {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      const response = await axios.post("/auth/login", form, {
        withCredentials: true,
      });

      // Verify response structure
      if (!response.data?.token || !response.data?.refreshToken) {
        throw new Error("Invalid server response");
      }

      // Store tokens and user data
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      dispatch(
        loginSuccess({
          accessToken: response.data.token,
          refreshToken: response.data.refreshToken,
          user: response.data.user,
        })
      );

      // Only navigate after successful login
      navigate("/dashboard");
    } catch (err) {
      // Handle invalid credentials without clearing the form
      if (err.response?.status === 401) {
        toast.error("Invalid email or password", {
          duration: 3000,
          position: "top-center",
        });
      } else {
        const errorMessage =
          err.response?.data?.message || err.message || "Login failed";
        toast.error(errorMessage, {
          duration: 3000,
          position: "top-center",
        });
      }
    } finally {
      setLoading(false);
    }
  };
  const inputBaseClasses = `
    w-full py-3 px-3 rounded
    border border-[#a1724e] dark:border-gray-600
    dark:bg-gray-700 dark:text-gray-100
    outline-none
    text-[#482307] dark:text-gray-100
    placeholder:text-[#a1724e] dark:placeholder:text-gray-400
    text-base font-medium
    focus:ring-2 focus:ring-[#a1724e] dark:focus:ring-green-400
  `;

  return (
    <AuthWrapper>
      <div className="bg-[#fff9ea] dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-md border border-[#a1724e] dark:border-gray-700 mx-auto">
        <div className="text-center mb-6">
          <LogIn
            className="mx-auto text-[#a1724e] dark:text-green-400"
            size={48}
          />
          <h1 className="text-3xl font-bold mt-2 bg-gradient-to-r from-[#a1724e] to-[#a1724e] bg-clip-text text-transparent dark:text-green-400">
            {t("Sign In")}
          </h1>
          {sessionExpired && (
            <div className="mt-3 text-red-600 dark:text-red-400 text-base font-semibold">
              {t(
                "You have been logged out because your account was used on another device or your session expired."
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1724e] dark:text-green-400"
              size={20}
            />
            <input
              type="email"
              name="email"
              placeholder={t("Email")}
              value={form.email}
              onChange={handleChange}
              className={`pl-10 ${inputBaseClasses}`}
              required
            />
          </div>

          {/* Password field */}
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1724e] dark:text-green-400"
              size={20}
            />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder={t("Password")}
              value={form.password}
              onChange={handleChange}
              className={`pl-10 pr-10 ${inputBaseClasses}`}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1724e] dark:text-green-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded bg-[#a1724e] dark:bg-green-600 hover:bg-[#5e4029] dark:hover:bg-green-700 transition text-white font-semibold text-lg flex justify-center items-center"
          >
            {loading ? <Loader size={24} color="#fff" inline /> : t("Sign In")}
          </button>
        </form>

        <p className="text-center text-base mt-4 text-[#a1724e] dark:text-gray-300">
          <Link
            to="/auth/forgot-password"
            className="hover:underline font-semibold text-[#a1724e] dark:text-green-400 mr-2"
          >
            {t("Forgot password?")}
          </Link>
          {t("Don't have an account?")}{" "}
          <Link
            to="/auth/register"
            className="hover:underline font-semibold text-[#a1724e] dark:text-green-400"
          >
            {t("Register")}
          </Link>
        </p>
      </div>
    </AuthWrapper>
  );
};

export default Login;
