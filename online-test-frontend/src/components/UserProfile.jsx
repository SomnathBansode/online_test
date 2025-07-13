import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import AuthWrapper from "./AuthWrapper";
import { motion } from "framer-motion";

const UserProfile = ({ user: userProp, onUpdate }) => {
  const { t } = useTranslation();
  const token = useSelector((state) => state.auth.token);

  const [user, setUser] = useState(userProp || null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);

  // Fetch user if not provided
  useEffect(() => {
    if (!userProp) {
      const fetchUser = async () => {
        try {
          setLoading(true);
          const res = await axios.get("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data);
          setForm({ name: res.data.name, email: res.data.email });
        } catch (err) {
          setUser(null);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    } else {
      setUser(userProp);
      setForm({ name: userProp?.name || "", email: userProp?.email || "" });
    }
  }, [userProp, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(
        "/auth/me",
        { name: form.name },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(t("Profile updated successfully!"));
      if (onUpdate) onUpdate(res.data);
      setUser(res.data);
      setForm({ name: res.data.name, email: res.data.email });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || t("Failed to update profile")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || "", email: user.email || "" });
    }
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col items-center justify-center bg-[#fff9ea] dark:bg-gray-900 text-[#a1724e] dark:text-green-300 p-6"
    >
      <AuthWrapper>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 w-full max-w-md border border-[#a1724e] dark:border-gray-700 mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mt-2 bg-gradient-to-r from-[#a1724e] to-[#a1724e] bg-clip-text text-transparent dark:text-green-400">
              {t("Profile")}
            </h1>
          </div>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold">{t("Name")}</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full py-3 px-3 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-base font-medium focus:ring-2 focus:ring-[#a1724e] dark:focus:ring-green-400"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">{t("Email")}</label>
              <input
                type="email"
                name="email"
                value={form.email}
                readOnly
                className="w-full py-3 px-3 rounded border border-[#a1724e] dark:border-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-100 cursor-not-allowed text-base font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded bg-[#a1724e] dark:bg-green-600 hover:bg-[#5e4029] dark:hover:bg-green-700 transition text-white font-semibold text-lg flex justify-center items-center"
            >
              {t("Update Profile")}
            </button>
          </form>
        </div>
      </AuthWrapper>
    </motion.div>
  );
};

export default UserProfile;
