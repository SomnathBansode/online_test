import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  BookOpen,
  Award,
  GraduationCap,
  Users,
  PlayCircle,
  CheckCircle,
} from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 * index, duration: 0.6, ease: "easeOut" }}
    className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl border border-[#a1724e]/30 dark:border-gray-700/50 hover:border-[#a1724e]/50 dark:hover:border-[#4ade80]/50 transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-[#a1724e]/10 dark:hover:shadow-[#4ade80]/50 overflow-hidden"
    whileHover={{ scale: 1.02 }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-[#a1724e]/10 to-[#4338ca]/5 dark:from-[#4ade80]/10 dark:to-[#4ade80]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

    <div className="relative z-10 flex flex-col h-full">
      <div className="flex items-center justify-center w-14 h-14 bg-[#a1724e] dark:bg-[#4ade80] rounded-xl mb-4 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-bold text-[#a1724e] dark:text-[#4ade80] mb-3 group-hover:text-[#4338ca] dark:group-hover:text-[#4ade80] transition-colors duration-300">
        {title}
      </h3>
      <p className="text-[#482307] dark:text-gray-400 flex-1 text-base leading-relaxed">
        {description}
      </p>
    </div>
  </motion.div>
);

const Home = () => {
  const { t } = useTranslation();
  const { token } = useSelector((state) => state.auth);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#fff9ea] dark:bg-gray-900 text-[#482307] dark:text-slate-200 transition-colors duration-300"
    >
      <section className="relative overflow-hidden pt-20 pb-24">
        <div className="absolute inset-0 opacity-10 dark:opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(ellipse at 20% 50%, rgba(161, 114, 78, 0.1) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 20%, rgba(74, 222, 128, 0.1) 0%, transparent 50%),
                radial-gradient(ellipse at 40% 80%, rgba(67, 56, 202, 0.1) 0%, transparent 50%)
              `,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-block mb-6"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-[#a1724e]/10 dark:bg-[#4ade80]/30 text-[#a1724e] dark:text-[#4ade80] border border-[#a1724e]/20 dark:border-[#4ade80]/50">
                <PlayCircle className="w-4 h-4 mr-2" />
                {t("Ready to level up?")}
              </span>
            </motion.div>

            <motion.h1
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 text-[#a1724e] dark:text-[#4ade80]"
            >
              {t("Online Test Platform")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-3xl mx-auto text-xl sm:text-2xl text-[#482307] dark:text-gray-400 mb-10 leading-relaxed"
            >
              {t(
                "Take tests, view results, and improve your skills with confidence."
              )}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {token ? (
                <Link
                  to="/dashboard"
                  className="group relative w-full sm:w-auto px-8 py-4 bg-[#a1724e] dark:bg-[#4ade80] text-white font-semibold rounded-xl shadow-lg shadow-[#a1724e]/25 dark:shadow-[#4ade80]/25 hover:bg-[#8b5a3a] dark:hover:bg-[#32d17d] transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                >
                  <span>{t("Go to Dashboard")}</span>
                  <CheckCircle className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="group relative w-full sm:w-auto px-8 py-4 bg-[#a1724e] dark:bg-[#4ade80] text-white font-semibold rounded-xl shadow-lg shadow-[#a1724e]/25 dark:shadow-[#4ade80]/25 hover:bg-[#8b5a3a] dark:hover:bg-[#32d17d] transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span>{t("Login")}</span>
                  </Link>
                  <Link
                    to="/auth/register"
                    className="group w-full sm:w-auto px-8 py-4 border-2 border-[#a1724e]/30 dark:border-gray-600 text-[#482307] dark:text-slate-200 font-semibold rounded-xl hover:border-[#a1724e] dark:hover:border-[#4ade80] hover:text-[#a1724e] dark:hover:text-[#4ade80] hover:bg-[#a1724e]/5 dark:hover:bg-[#4ade80]/5 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span>{t("Register")}</span>
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-20 bg-[#fff9ea]/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#a1724e]/5 dark:to-[#4ade80]/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-[#a1724e] dark:text-[#4ade80] mb-4">
              {t("Why Choose Us?")}
            </h2>
            <p className="text-lg text-[#482307] dark:text-gray-400 max-w-2xl mx-auto">
              {t(
                "Discover features that make learning engaging and effective."
              )}
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
          >
            <FeatureCard
              icon={BookOpen}
              title={t("Interactive Tests")}
              description={t(
                "Engaging and interactive tests designed to challenge and improve your skills"
              )}
              index={0}
            />
            <FeatureCard
              icon={Award}
              title={t("Instant Results")}
              description={t(
                "Get detailed feedback and scores immediately after completing your tests"
              )}
              index={1}
            />
            <FeatureCard
              icon={GraduationCap}
              title={t("Track Progress")}
              description={t(
                "Monitor your learning journey with comprehensive progress tracking"
              )}
              index={2}
            />
            <FeatureCard
              icon={Users}
              title={t("Group Learning")}
              description={t(
                "Join groups and compete with peers to enhance your learning experience"
              )}
              index={3}
            />
          </motion.div>

          <motion.div
            className="text-center mt-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <p className="text-xl font-semibold text-[#482307] dark:text-gray-400">
              {t("Start your learning journey today")}
            </p>
            <div className="mt-4 h-1 w-24 bg-[#a1724e] dark:bg-[#4ade80] rounded-full mx-auto" />
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;
