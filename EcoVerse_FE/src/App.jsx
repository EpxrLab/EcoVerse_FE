import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
// // import Index from "./pages/Index";
// import StudentApp from "./pages/StudentApp";
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
import Index from "./roles/guest";
import OptionPage from "./features/auth/pages/optionPage/optionPage";
import StudentLogin from "./features/auth/pages/student/studentLogin/studentLogin";
import PartnershipAuth from "./features/auth/pages/partnership/partnershipAuth/partnershipAuth";
import PartnershipRegister from "./features/auth/pages/partnership/partnershipRegister/partnershipRegister";
import AdminLayout from "./roles/admin/AdminLayout";
import AdminDashboard from "./roles/admin/pages/adminDashboard/adminDashboard";
import AdminSchool from "./roles/admin/pages/adminSchool/adminSchool";
import AdminPartnership from "./roles/admin/pages/adminPartnership/adminPartnership";
import AdminGameLevels from "./roles/admin/pages/adminGameLevel/adminGameLevels";
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
            <Route path="/" element={<Index />} />

            {/* Authentication Router*/}
            <Route path="/auth" element={<OptionPage />} />
            {/* <Route path="/student" element={<StudentApp />} /> */}
            <Route path="/auth/student" element={<StudentLogin />} />

            <Route path="/auth/partnership" element={<PartnershipAuth />} />
            <Route
              path="/auth/partnership/register"
              element={<PartnershipRegister />}
            />

            <Route path="/auth/school" element={<SchoolAuth />} />
            <Route path="/auth/school/register" element={<SchoolRegister />} />
            {/* <Route path="/auth/school/pending" element={<SchoolPending />} />
            <Route path="/auth/school/rejected" element={<SchoolRejected />} /> */}

            {/* Admin Routes */}
            {/* <Route path="/auth/admin" element={<AdminAuth />} /> */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="schools" element={<AdminSchool />} />
              <Route path="partnerships" element={<AdminPartnership />} />
              <Route path="game-levels" element={<AdminGameLevels />} />
              {/*
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="marketplace" element={<AdminMarketplace />} /> */}
            </Route>

            {/* School Routes (Protected) */}
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
