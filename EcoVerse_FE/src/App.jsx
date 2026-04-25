import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { HelmetProvider } from "react-helmet-async";

import Index from "./roles/guest";

//=====================Authenticate Routes=======================
import OptionPage from "./features/auth/pages/optionPage/optionPage";
import StudentLogin from "./features/auth/pages/student/studentLogin/studentLogin";

import AdminAuth from "./features/auth/pages/admin/adminAuth/adminAuth";

import SchoolAuth from "./features/auth/pages/school/schoolAuth/schoolAuth";
import SchoolRegister from "./features/auth/pages/school/schoolRegister/schoolRegister";
import SchoolPending from "./features/auth/pages/school/schoolPending/schoolPending";
import SchoolRejected from "./features/auth/pages/school/schoolRejected/schoolRejected";

import PartnershipAuth from "./features/auth/pages/partnership/partnershipAuth/partnershipAuth";
import PartnershipRegister from "./features/auth/pages/partnership/partnershipRegister/partnershipRegister";
import PartnershipPending from "./features/auth/pages/partnership/partnershipPending/partnershipPending";
import PartnershipRejected from "./features/auth/pages/partnership/partnershipRejected/partnershipRejected";

//======================Admin Routes==============================
import AdminLayout from "./roles/admin/AdminLayout";
import AdminSchool from "./roles/admin/pages/adminSchool/adminSchool";
import AdminPartnership from "./roles/admin/pages/adminPartnership/adminPartnership";
import AdminGameLevels from "./roles/admin/pages/adminGameLevel/adminGameLevels";
import AdminSubscription from "./roles/admin/pages/adminSubscription/adminSubscription";
import AdminRevenue from "./roles/admin/pages/adminTransaction/adminTransaction";
import AdminContent from "./roles/admin/pages/adminContent/adminContent";

//=======================Student Routes==============================
import { StudentProvider } from "./roles/student/context";
import CampaignSelection from "./roles/student/pages/studentCampaignSelection/campaignSelection";
import StudentProfile from "./roles/student/pages/studentProfile/studentProfile";
import StudentLayout from "./roles/student/StudentLayout";
import StudentRewards from "./roles/student/pages/studentRewards/studentRewards";
import StudentDashboardLayout from "./roles/student/components/studentDashboardLayout";
import CampaignDashboard from "./roles/student/pages/studentCampaignDashboard/campaignDashboard";
import StudentLeaderboard from "./roles/student/pages/studentLeaderboard/studentLeaderboard";
import StudentGame from "./roles/student/pages/studentGameSelection/studentGame";
import StudentQuiz from "./roles/student/pages/studentQuizSelection/studentQuiz";
import StudentQuizPlay from "./roles/student/pages/studentQuizPlay/StudentQuizPlay";
import EcoGamePage from "./roles/student/pages/ecoGamePlay/EcoGamePage";
import EcoGrabberTest from "./roles/student/pages/ecoGamePlay/EcoGrabberTest";

//========================School Routes==============================
import SchoolAdminLayout from "@/roles/school/SchoolAdminLayout";
import {
  SchoolDashboard,
  SchoolClasses,
  SchoolQuizzes,
  SchoolRewards,
  SchoolCampaigns,
  SchoolSubscription,
  SchoolLeaderboardPage,
  SchoolReports,
  SchoolProfile,
} from "@/roles/school";

//========================Partnership Routes==============================
import PartnershipLayout from "@/roles/partnership/PartnershipLayout";
import {
  PartnershipDashboard,
  PartnershipCampaigns,
  PartnershipQuizzes,
  PartnershipLeaderboard,
  PartnershipRewards,
  PartnershipSubscription,
  PartnershipReports,
} from "@/roles/partnership";

import NotFound from "./roles/notFound";
import toast from "react-hot-toast";
import PartnershipProfile from "./roles/partnership/pages/partnershipProfile/partnershipProfile";

//========================Payment Routes==============================
import PaymentResult from "./features/payment/pages/paymentResult/paymentResult";
import StudentRoundDetails from "./roles/student/pages/studentRoundDetail/studentRoundDetails";
import ForgotPassword from "./features/auth/pages/forgot-password/forgotPassword";
import StudentQuizHistory from "./roles/student/pages/studentQuizHistory/studentQuizHistoy";
import AdminAnalytics from "./roles/admin/pages/adminAnalytics/adminAnalytics";
import AdminDashboard from "./roles/admin/pages/adminAnalytics/adminAnalytics";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, role }) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const userRole = sessionStorage.getItem("role");

  if (!accessToken) {
    return <Navigate to="/auth" replace />;
  }

  if (role && userRole !== role) {
    toast.error("Bạn không có quyền truy cập trang này!");
    sessionStorage.clear();

    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <StudentProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/test-grabber" element={<EcoGrabberTest />} />

              {/* Authentication Router*/}
              <Route path="/auth" element={<OptionPage />} />
              <Route path="/auth/student" element={<StudentLogin />} />
              <Route path="/auth/partnership" element={<PartnershipAuth />} />
              <Route
                path="/auth/partnership/register"
                element={<PartnershipRegister />}
              />
              <Route
                path="/auth/partnership/pending"
                element={<PartnershipPending />}
              />
              <Route
                path="/auth/partnership/rejected"
                element={<PartnershipRejected />}
              />

              <Route path="/auth/school" element={<SchoolAuth />} />
              <Route
                path="/auth/school/register"
                element={<SchoolRegister />}
              />
              <Route path="/auth/school/pending" element={<SchoolPending />} />
              <Route
                path="/auth/school/rejected"
                element={<SchoolRejected />}
              />
              <Route path="/auth/admin" element={<AdminAuth />} />
              <Route
                path="/auth/forgot-password"
                element={<ForgotPassword />}
              />

              {/* Student Routes */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute role="STUDENT">
                    <StudentLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<CampaignSelection />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="rewards" element={<StudentRewards />} />
                <Route
                  path="campaign/:campaignId"
                  element={<StudentDashboardLayout />}
                >
                  <Route index element={<CampaignDashboard />} />
                  <Route
                    path="round/:roundId"
                    element={<StudentRoundDetails />}
                  />
                  <Route
                    path="round/:roundId/quiz/:quizId"
                    element={<StudentQuizPlay />}
                  />

                  <Route
                    path="round/:roundId/game/:roundGameConfigId/play"
                    element={<EcoGamePage />}
                  />
                  <Route path="game" element={<StudentGame />} />

                  <Route path="quiz" element={<StudentQuiz />} />
                  <Route
                    path="round/:roundId/quiz/:quizId/history/:attemptId"
                    element={<StudentQuizHistory />}
                  />
                  <Route path="quiz/:quizId" element={<StudentQuizPlay />} />
                  <Route path="leaderboard" element={<StudentLeaderboard />} />
                </Route>
              </Route>

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute role="ADMINISTRATOR">
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="schools" element={<AdminSchool />} />
                <Route path="partnerships" element={<AdminPartnership />} />
                <Route path="game-levels" element={<AdminGameLevels />} />
                <Route path="subscriptions" element={<AdminSubscription />} />
                <Route path="transactions" element={<AdminRevenue />} />
                <Route path="content" element={<AdminContent />} />
              </Route>

              {/* School Routes (Protected) */}
              <Route
                path="/school"
                element={
                  <ProtectedRoute role="PARTNERSHIP_SCHOOL">
                    <SchoolAdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<SchoolDashboard />} />
                {/* <Route path="students" element={<SchoolStudents />} /> */}
                <Route path="classes" element={<SchoolClasses />} />
                <Route path="quizzes" element={<SchoolQuizzes />} />
                <Route path="rewards" element={<SchoolRewards />} />
                <Route path="reports" element={<SchoolReports />} />
                <Route path="campaigns" element={<SchoolCampaigns />} />
                <Route path="subscription" element={<SchoolSubscription />} />
                <Route path="leaderboard" element={<SchoolLeaderboardPage />} />
              </Route>
              <Route
                path="/school/profile"
                element={
                  <ProtectedRoute role="PARTNERSHIP_SCHOOL">
                    <SchoolProfile />
                  </ProtectedRoute>
                }
              />

              {/* Partnership Routes (Protected) */}
              <Route
                path="/partnership"
                element={
                  <ProtectedRoute role="THIRD_PARTY_PARTNERSHIP">
                    <PartnershipLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<PartnershipDashboard />} />
                <Route path="campaigns" element={<PartnershipCampaigns />} />
                <Route path="quizzes" element={<PartnershipQuizzes />} />
                <Route
                  path="leaderboard"
                  element={<PartnershipLeaderboard />}
                />
                <Route path="rewards" element={<PartnershipRewards />} />
                <Route
                  path="subscription"
                  element={<PartnershipSubscription />}
                />
                <Route path="reports" element={<PartnershipReports />} />
              </Route>
              <Route
                path="/partnership/profile"
                element={
                  <ProtectedRoute role="THIRD_PARTY_PARTNERSHIP">
                    <PartnershipProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/payment/result"
                element={
                  <ProtectedRoute>
                    <PaymentResult />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </StudentProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
