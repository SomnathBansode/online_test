import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../../utils/axios";
import AuthWrapper from "../../components/AuthWrapper";
import { CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
const VerifyEmail = () => {
  const { t } = useTranslation();
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(`/auth/verify/${token}`);
        setMessage(res.data.message);
        setStatus("success");
        toast.success("Email verified successfully!");
      } catch (err) {
        setMessage(err.response?.data?.message || "Verification failed");
        setStatus("error");
      }
    };
    verify();
  }, [token]);

  return (
    <AuthWrapper>
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
        {status === "loading" && (
          <div className="animate-pulse text-gray-500 dark:text-gray-300">
            {t("Verifying your email...")}
          </div>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
            <div className="text-green-600 dark:text-green-400 text-lg font-semibold mb-2">
              {t("Email verified successfully!")}
            </div>
            <div className="mb-4 text-gray-700 dark:text-gray-200">
              {t("You can now log in to your account.")}
            </div>
            <Link
              to="/auth/login"
              className="text-blue-600 hover:underline font-semibold"
            >
              {t("Go to Login")}
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto mb-4 text-red-500" size={48} />
            <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
              {t("Verification failed")}
            </div>
            <div className="mb-4 text-gray-700 dark:text-gray-200">
              {message}
            </div>
            <Link
              to="/auth/login"
              className="text-blue-600 hover:underline font-semibold"
            >
              {t("Go to Login")}
            </Link>
          </>
        )}
      </div>
    </AuthWrapper>
  );
};

export default VerifyEmail;
