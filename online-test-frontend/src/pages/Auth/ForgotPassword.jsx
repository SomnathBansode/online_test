import React, { useState } from "react";
import axios from "../../utils/axios";
import { Link } from "react-router-dom";
import AuthWrapper from "../../components/AuthWrapper";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/auth/request-reset", { email });
      toast.success(t("Password reset email sent!"));
      toast(
        t(
          "If you don't see the email in your inbox, please check your spam folder"
        ),
        { icon: "📧" }
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || t("Failed to send reset email")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper>
      <div className="bg-[#fff9ea] dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-md border border-[#a1724e] dark:border-gray-700 mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center text-[#a1724e] dark:text-green-400">
          {t("Forgot Password")}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder={t("Enter your email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full py-3 px-3 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 outline-none text-[#482307] placeholder:text-[#a1724e] dark:placeholder:text-gray-400 text-base font-medium focus:ring-2 focus:ring-[#a1724e] dark:focus:ring-green-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded bg-[#a1724e] dark:bg-green-600 hover:bg-[#5e4029] dark:hover:bg-green-700 transition text-white font-semibold text-lg flex justify-center items-center"
          >
            {loading ? <Loader size={24} color="#fff" /> : t("Send Reset Link")}
          </button>
        </form>
        <p className="text-center text-base mt-4 text-[#a1724e] dark:text-gray-300">
          <Link
            to="/auth/login"
            className="hover:underline font-semibold text-[#a1724e] dark:text-green-400"
          >
            {t("Back to Login")}
          </Link>
        </p>
      </div>
    </AuthWrapper>
  );
};

export default ForgotPassword;
