import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import { Link, useNavigate } from "react-router-dom";
import AuthWrapper from "../../components/AuthWrapper";
import { UserPlus, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { useTranslation } from "react-i18next";

const Register = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(logout());
  }, [dispatch]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Allowed email domains list
  const allowedDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "icloud.com",
    "live.com",
    "aol.com",
    "protonmail.com",
    "zoho.com",
    "yandex.com",
    "mail.com",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailDomain = form.email.split("@")[1]?.toLowerCase();

    if (!emailDomain || !allowedDomains.includes(emailDomain)) {
      toast.error(
        "Please use a valid email from original providers (e.g. gmail.com, yahoo.com, etc.)"
      );
      return;
    }

    try {
      setLoading(true);
      await axios.post("/auth/register", form);
      toast.success("Registration successful! Please verify your email.");
      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
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
          <UserPlus
            className="mx-auto text-[#a1724e] dark:text-green-400"
            size={48}
          />
          <h1 className="text-3xl font-bold mt-2 bg-gradient-to-r from-[#a1724e] to-[#a1724e] bg-clip-text text-transparent dark:text-green-400">
            {t("Register")}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field */}
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1724e] dark:text-green-400"
              size={20}
            />
            <input
              type="text"
              name="name"
              placeholder={t("Name")}
              value={form.name}
              onChange={handleChange}
              className={`pl-10 ${inputBaseClasses}`}
              required
            />
          </div>

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
          {t("Already have an account?")}{" "}
          <Link
            to="/auth/login"
            className="hover:underline font-semibold text-[#a1724e] dark:text-green-400"
          >
            {t("Login")}
          </Link>
        </p>
      </div>
    </AuthWrapper>
  );
};

export default Register;
