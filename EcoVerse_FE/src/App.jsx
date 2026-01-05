import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
// // import Index from "./pages/Index";
// import StudentApp from "./pages/StudentApp";
// import AdminLayout from "./components/admin/AdminLayout";
// import {
//   AdminDashboard,
//   AdminSchools,
//   AdminSubscriptions,
//   AdminTransactions,
//   AdminContent,
//   AdminMarketplace
// } from "@/modules/admin";
import SchoolAdminLayout from "@/roles/school/SchoolAdminLayout";
import SchoolAuth from "./features/auth/pages/school/schoolAuth/schoolAuth";
import SchoolRegister from "./features/auth/pages/school/schoolRegister/schoolRegister";
// import {
//   SchoolDashboard,
//   SchoolStudents,
//   SchoolClasses,
//   SchoolQuizzes,
//   SchoolRewards,
//   SchoolSubscription,
//   SchoolLeaderboardPage
// } from "@/modules/school";
// import ParentLayout from "./components/parent/ParentLayout";
// import {
//   ParentHome,
//   ParentChildren,
//   ParentChildDetail,
//   ParentStats,
//   ParentSettings
// } from "@/modules/parent";
// import SchoolAuth from "./pages/auth/SchoolAuth";
// import SchoolRegister from "./pages/auth/SchoolRegister";
// import SchoolPending from "./pages/auth/SchoolPending";
// import SchoolRejected from "./pages/auth/SchoolRejected";
// import AdminAuth from "./pages/auth/AdminAuth";
// import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* <Route path="/" element={<Index />} />
            <Route path="/student" element={<StudentApp />} /> */}

            {/* Admin Routes */}
            {/* <Route path="/admin/auth" element={<AdminAuth />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="schools" element={<AdminSchools />} />
              <Route path="subscriptions" element={<AdminSubscriptions />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="marketplace" element={<AdminMarketplace />} />
            </Route> */}

            {/* School Auth Routes */}
            <Route path="/school/auth" element={<SchoolAuth />} />
            <Route path="/school/register" element={<SchoolRegister />} />
            {/* <Route path="/school/pending" element={<SchoolPending />} />
            <Route path="/school/rejected" element={<SchoolRejected />} /> */}

            {/* School Admin Routes (Protected) */}
            <Route path="/school" element={<SchoolAdminLayout />}>
              {/* <Route index element={<SchoolDashboard />} />
              <Route path="students" element={<SchoolStudents />} />
              <Route path="classes" element={<SchoolClasses />} />
              <Route path="quizzes" element={<SchoolQuizzes />} />
              <Route path="rewards" element={<SchoolRewards />} />
              <Route path="subscription" element={<SchoolSubscription />} />
              <Route path="leaderboard" element={<SchoolLeaderboardPage />} /> */}
            </Route>

            {/* Parent Routes (Mobile UI) */}
            {/* <Route path="/parent" element={<ParentLayout />}>
              <Route index element={<ParentHome />} />
              <Route path="children" element={<ParentChildren />} />
              <Route path="children/:childId" element={<ParentChildDetail />} />
              <Route path="stats" element={<ParentStats />} />
              <Route path="settings" element={<ParentSettings />} />
            </Route> */}

            {/* <Route path="*" element={<NotFound />} /> */}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
