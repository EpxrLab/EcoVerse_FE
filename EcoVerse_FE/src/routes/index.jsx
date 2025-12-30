import { Route, Routes, Navigate } from "react-router-dom";

// Import Layout components
import StudentLayout from "@/roles/student/StudentLayout";
import SchoolLayout from "@/roles/school/SchoolLayout";
import AdminLayout from "@/roles/admin/AdminLayout";

// Import feature routes
import { AuthRouter } from "@/features/auth/routes";

/**
 * StudentRouter - Định tuyến cho Student Role
 * TODO: Import student feature pages và tạo routes
 */
function StudentRouter() {
  return (
    <StudentLayout>
      <Routes>
        {/* Student feature routes */}
        {/* <Route path="/dashboard" element={<StudentDashboard />} /> */}
        {/* <Route path="/courses" element={<StudentCourses />} /> */}
        {/* <Route path="/profile" element={<StudentProfile />} /> */}
        {/* <Route path="/progress" element={<StudentProgress />} /> */}
        {/* <Route path="/settings" element={<StudentSettings />} /> */}
        <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
      </Routes>
    </StudentLayout>
  );
}

/**
 * SchoolRouter - Định tuyến cho School Role
 * TODO: Import school feature pages và tạo routes
 */
function SchoolRouter() {
  return (
    <SchoolLayout>
      <Routes>
        {/* School feature routes */}
        {/* <Route path="/dashboard" element={<SchoolDashboard />} /> */}
        {/* <Route path="/students" element={<StudentsManagement />} /> */}
        {/* <Route path="/classes" element={<ClassesManagement />} /> */}
        {/* <Route path="/courses" element={<CoursesManagement />} /> */}
        {/* <Route path="/profile" element={<SchoolProfile />} /> */}
        {/* <Route path="/settings" element={<SchoolSettings />} /> */}
        <Route path="*" element={<Navigate to="/school/dashboard" replace />} />
      </Routes>
    </SchoolLayout>
  );
}

/**
 * AdminRouter - Định tuyến cho Admin Role
 * TODO: Import admin feature pages và tạo routes
 */
function AdminRouter() {
  return (
    <AdminLayout>
      <Routes>
        {/* Admin feature routes */}
        {/* <Route path="/dashboard" element={<AdminDashboard />} /> */}
        {/* <Route path="/users" element={<UsersManagement />} /> */}
        {/* <Route path="/system-config" element={<SystemConfig />} /> */}
        {/* <Route path="/analytics" element={<Analytics />} /> */}
        {/* <Route path="/settings" element={<AdminSettings />} /> */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
}

/**
 * AppRouter - Routing chính
 * 
 * Cấu trúc:
 * - /auth/* - Công khai (Auth features)
 * - /student/* - Student routes
 * - /school/* - School routes
 * - /admin/* - Admin routes
 */
export function AppRouter() {
  return (
    <Routes>
      {/* Public/Auth routes */}
      <Route path="/auth/*" element={<AuthRouter />} />

      {/* Role-based routes */}
      <Route path="/student/*" element={<StudentRouter />} />
      <Route path="/school/*" element={<SchoolRouter />} />
      <Route path="/admin/*" element={<AdminRouter />} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/auth/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
