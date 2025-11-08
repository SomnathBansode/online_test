import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/axios";
import AuthWrapper from "../../components/AuthWrapper";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const ResetPassword = () => {
  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/auth/reset-password", { token, password });
      toast.success("Password reset successfully!");
      navigate("/auth/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper>
      <div className="bg-[#fff9ea] dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-md border border-[#a1724e] dark:border-gray-700 mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center text-[#a1724e] dark:text-green-400">
          {t("Reset Password")}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            name="password"
            placeholder={t("Enter new password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full py-3 px-3 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 outline-none text-[#482307] placeholder:text-[#a1724e] dark:placeholder:text-gray-400 text-base font-medium focus:ring-2 focus:ring-[#a1724e] dark:focus:ring-green-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded bg-[#a1724e] dark:bg-green-600 hover:bg-[#5e4029] dark:hover:bg-green-700 transition text-white font-semibold text-lg flex justify-center items-center"
          >
            {loading ? <Loader size={24} color="#fff" inline /> : t("Sign In")}
          </button>
        </form>
        <p className="text-center text-base mt-4 text-[#a1724e] dark:text-gray-300">
          <a
            href="/auth/login"
            className="hover:underline font-semibold text-[#a1724e] dark:text-green-400"
          >
            {t("Back to Login")}
          </a>
        </p>
      </div>
    </AuthWrapper>
  );
};

export default ResetPassword;
