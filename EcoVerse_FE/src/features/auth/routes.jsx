import { Route, Routes, Navigate } from "react-router-dom";
import SchoolRegister from "./pages/school/schoolRegister/schoolRegister";

/**
 * AuthRouter - Định tuyến cho Auth Feature
 * Bao gồm: Login, Register, ForgotPassword, ResetPassword
 *
 * TODO: Import auth page components
 */
export function AuthRouter() {
  return (
    <Routes>
      {/* Auth routes */}
      {/* <Route path="/login" element={<LoginPage />} /> */}
      <Route path="register" element={<SchoolRegister />} />
      {/* <Route path="/forgot-password" element={<ForgotPasswordPage />} /> */}
      {/* <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> */}

      {/* Default redirect to login */}
      <Route index element={<Navigate to="login" replace />} />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
}

export default AuthRouter;
