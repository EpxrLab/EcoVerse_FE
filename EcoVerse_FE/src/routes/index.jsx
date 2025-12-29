import { Route, Routes } from "react-router";

function SchoolRouter() {}

function StudentRouter() {}

function AdminRouter() {}

export function AppRouter() {
  return (
    <>
      <Routes>
        <Route path="/student" element={<StudentRouter />} />
        <Route path="/school" element={<SchoolRouter />} />
        <Route path="/admin" element={<AdminRouter />} />
      </Routes>
    </>
  );
}
