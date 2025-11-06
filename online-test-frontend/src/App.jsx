import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import MainLayout from "./layouts/MainLayout";
import Home from "./components/Home";
import Wakeup from "./components/Wakeup";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./components/Dashboard";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import ManageTests from "./components/admin/ManageTests";
import BulkUpload from "./components/admin/BulkUpload";
import TestSettings from "./components/admin/TestSettings";
import Analytics from "./components/admin/Analytics";
import Security from "./components/admin/Security";
import ManageUsers from "./components/admin/ManageUsers";
import AssignTest from "./components/admin/AssignTest";
import AdminResults from "./components/admin/AdminResults";
import AvailableTests from "./components/AvailableTests";
import TestRulesPage from "./components/TestRulesPage";
import TestInterface from "./components/TestInterface";
import TestResult from "./components/TestResult";
import UserProfile from "./components/UserProfile";
import UserResults from "./components/UserResults";
import ResultDetails from "./components/ResultDetails";
import ReattemptTests from "./components/ReattemptTests";
import "./i18n";
import { TestProgressProvider } from "./context/TestProgressContext";

function App() {
  useEffect(() => {
    const checkSession = setInterval(() => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            window.location.href = "/auth/login?session=expired";
          }
        } catch (e) {
          console.error("Token check failed:", e);
        }
      }
    }, 60000);

    return () => clearInterval(checkSession);
  }, []);

  return (
    <TestProgressProvider>
      <Wakeup>
        <Router>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              <Route path="/available-tests" element={<AvailableTests />} />
              <Route path="/test-rules/:testId" element={<TestRulesPage />} />
              <Route path="/test/:testId" element={<TestInterface />} />
              <Route path="/test/:testId/result" element={<TestResult />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/auth/verify/:token" element={<VerifyEmail />} />
              <Route
                path="/auth/forgot-password"
                element={<ForgotPassword />}
              />
              <Route
                path="/auth/reset-password/:token"
                element={<ResetPassword />}
              />
              <Route path="/admin/manage-tests" element={<ManageTests />} />
              <Route path="/admin/bulk-upload" element={<BulkUpload />} />
              <Route path="/admin/test-settings" element={<TestSettings />} />
              <Route path="/admin/analytics" element={<Analytics />} />
              <Route path="/admin/security" element={<Security />} />
              <Route path="/admin/manage-users" element={<ManageUsers />} />
              <Route path="/admin/assign-test" element={<AssignTest />} />
              <Route path="/admin/results" element={<AdminResults />} />
              <Route
                path="/results"
                element={
                  <ProtectedRoute>
                    <UserResults />
                  </ProtectedRoute>
                }
              />
              <Route path="/results/:resultId" element={<ResultDetails />} />
              <Route
                path="/reattempt-tests"
                element={
                  <ProtectedRoute>
                    <ReattemptTests />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </Wakeup>
    </TestProgressProvider>
  );
}

export default App;
