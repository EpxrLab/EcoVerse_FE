import { Route, Routes, Navigate } from "react-router-dom";

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
      {/* <Route path="/register" element={<RegisterPage />} /> */}
      {/* <Route path="/forgot-password" element={<ForgotPasswordPage />} /> */}
      {/* <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> */}

      {/* Default redirect to login */}
      <Route path="/" element={<Navigate to="/auth/login" replace />} />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
}

export default AuthRouter;
