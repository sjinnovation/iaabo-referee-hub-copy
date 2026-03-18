import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import PublicRegistration from "./pages/PublicRegistration";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBoards from "./pages/admin/AdminBoards";
import AdminRegions from "./pages/admin/AdminRegions";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminTraining from "./pages/admin/AdminTraining";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminResources from "./pages/admin/AdminResources";
import AdminCommunications from "./pages/admin/AdminCommunications";
import AdminIntegrations from "./pages/admin/AdminIntegrations";
import AdminRegistrations from "./pages/admin/AdminRegistrations";
import AdminAI from "./pages/admin/AdminAI";
import AdminAIOnboarding from "./pages/admin/AdminAIOnboarding";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminEmailTemplates from "./pages/admin/AdminEmailTemplates";
import AdminWorkflows from "./pages/admin/AdminWorkflows";
import AdminIntegrationDocs from "./pages/admin/AdminIntegrationDocs";
import AdminLearnDash from "./pages/admin/AdminLearnDash";
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import AdminCourseManagement from "./pages/admin/AdminCourseManagement";
import AdminCourseEditor from "./pages/admin/AdminCourseEditor";
import AdminCourseEnrollment from "./pages/admin/AdminCourseEnrollment";
import AdminEmbeddedCourses from "./pages/admin/AdminEmbeddedCourses";
import AdminEmbeddedCourseEnrollment from "./pages/admin/AdminEmbeddedCourseEnrollment";
import AdminEmbeddedCourseStats from "./pages/admin/AdminEmbeddedCourseStats";
import AdminCertificateTemplate from "./pages/admin/AdminCertificateTemplate";
import SecretaryDashboard from "./pages/secretary/SecretaryDashboard";
import SecretaryMembers from "./pages/secretary/SecretaryMembers";
import SecretaryDues from "./pages/secretary/SecretaryDues";
import SecretaryTraining from "./pages/secretary/SecretaryTraining";
import SecretaryAnnouncements from "./pages/secretary/SecretaryAnnouncements";
import SecretaryAI from "./pages/secretary/SecretaryAI";
import MemberDashboard from "./pages/member/MemberDashboard";
import MemberProfile from "./pages/member/MemberProfile";
import MemberTraining from "./pages/member/MemberTraining";
import MemberBenefits from "./pages/member/MemberBenefits";
import MemberResources from "./pages/member/MemberResources";
import MemberNotifications from "./pages/member/MemberNotifications";
import MemberSupport from "./pages/member/MemberSupport";
import Terms from "./pages/Terms";
import MemberMyCourses from "./pages/member/MemberMyCourses";
import MemberCourseCatalog from "./pages/member/MemberCourseCatalog";
import MemberCourseViewer from "./pages/member/MemberCourseViewer";
import MemberCourseBlockView from "./pages/member/MemberCourseBlockView";
import MemberEmbeddedCourseCatalog from "./pages/member/MemberEmbeddedCourseCatalog";
import MemberEmbeddedCourseViewer from "./pages/member/MemberEmbeddedCourseViewer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/register" element={<PublicRegistration />} />
              <Route path="/terms" element={<Terms />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/registrations" element={<ProtectedRoute requiredRole="admin"><AdminRegistrations /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUserManagement /></ProtectedRoute>} />
              <Route path="/admin/boards" element={<ProtectedRoute requiredRole="admin"><AdminBoards /></ProtectedRoute>} />
              <Route path="/admin/regions" element={<ProtectedRoute requiredRole="admin"><AdminRegions /></ProtectedRoute>} />
              <Route path="/admin/members" element={<ProtectedRoute requiredRole="admin"><AdminMembers /></ProtectedRoute>} />
              <Route path="/admin/training" element={<ProtectedRoute requiredRole="admin"><AdminTraining /></ProtectedRoute>} />
              <Route path="/admin/finance" element={<ProtectedRoute requiredRole="admin"><AdminFinance /></ProtectedRoute>} />
              <Route path="/admin/resources" element={<ProtectedRoute requiredRole="admin"><AdminResources /></ProtectedRoute>} />
              <Route path="/admin/communications" element={<ProtectedRoute requiredRole="admin"><AdminCommunications /></ProtectedRoute>} />
              <Route path="/admin/integrations" element={<ProtectedRoute requiredRole="admin"><AdminIntegrations /></ProtectedRoute>} />
              <Route path="/admin/integration-docs" element={<ProtectedRoute requiredRole="admin"><AdminIntegrationDocs /></ProtectedRoute>} />
              <Route path="/admin/email-templates" element={<ProtectedRoute requiredRole="admin"><AdminEmailTemplates /></ProtectedRoute>} />
              <Route path="/admin/workflows" element={<ProtectedRoute requiredRole="admin"><AdminWorkflows /></ProtectedRoute>} />
              <Route path="/admin/courses" element={<ProtectedRoute requiredRole="admin"><AdminCourseManagement /></ProtectedRoute>} />
              <Route path="/admin/courses/new" element={<ProtectedRoute requiredRole="admin"><AdminCourseEditor /></ProtectedRoute>} />
              <Route path="/admin/courses/:id/edit" element={<ProtectedRoute requiredRole="admin"><AdminCourseEditor /></ProtectedRoute>} />
              <Route path="/admin/courses/:id/enrollments" element={<ProtectedRoute requiredRole="admin"><AdminCourseEnrollment /></ProtectedRoute>} />
              <Route path="/admin/embedded-courses" element={<ProtectedRoute requiredRole="admin"><AdminEmbeddedCourses /></ProtectedRoute>} />
              <Route path="/admin/embedded-courses/:id/enrollments" element={<ProtectedRoute requiredRole="admin"><AdminEmbeddedCourseEnrollment /></ProtectedRoute>} />
              <Route path="/admin/embedded-courses/:id/stats" element={<ProtectedRoute requiredRole="admin"><AdminEmbeddedCourseStats /></ProtectedRoute>} />
              <Route path="/admin/certificate-template" element={<ProtectedRoute requiredRole="admin"><AdminCertificateTemplate /></ProtectedRoute>} />
              <Route path="/admin/learndash" element={<ProtectedRoute requiredRole="admin"><AdminLearnDash /></ProtectedRoute>} />
              <Route path="/admin/ai" element={<ProtectedRoute requiredRole="admin"><AdminAI /></ProtectedRoute>} />
              <Route path="/admin/ai/onboarding" element={<ProtectedRoute requiredRole="admin"><AdminAIOnboarding /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />
              
              {/* Secretary Routes */}
              <Route path="/secretary" element={<ProtectedRoute requiredRole="secretary"><SecretaryDashboard /></ProtectedRoute>} />
              <Route path="/secretary/members" element={<ProtectedRoute requiredRole="secretary"><SecretaryMembers /></ProtectedRoute>} />
              <Route path="/secretary/dues" element={<ProtectedRoute requiredRole="secretary"><SecretaryDues /></ProtectedRoute>} />
              <Route path="/secretary/training" element={<ProtectedRoute requiredRole="secretary"><SecretaryTraining /></ProtectedRoute>} />
              <Route path="/secretary/announcements" element={<ProtectedRoute requiredRole="secretary"><SecretaryAnnouncements /></ProtectedRoute>} />
              <Route path="/secretary/ai" element={<ProtectedRoute requiredRole="secretary"><SecretaryAI /></ProtectedRoute>} />
              
              {/* Member Routes */}
              <Route path="/member" element={<ProtectedRoute requiredRole="member"><MemberDashboard /></ProtectedRoute>} />
              <Route path="/member/profile" element={<ProtectedRoute requiredRole="member"><MemberProfile /></ProtectedRoute>} />
              <Route path="/member/training" element={<ProtectedRoute requiredRole="member"><MemberTraining /></ProtectedRoute>} />
              <Route path="/member/benefits" element={<ProtectedRoute requiredRole="member"><MemberBenefits /></ProtectedRoute>} />
              <Route path="/member/resources" element={<ProtectedRoute requiredRole="member"><MemberResources /></ProtectedRoute>} />
              <Route path="/member/notifications" element={<ProtectedRoute requiredRole="member"><MemberNotifications /></ProtectedRoute>} />
              <Route path="/member/my-courses" element={<ProtectedRoute requiredRole="member"><MemberMyCourses /></ProtectedRoute>} />
              <Route path="/member/courses" element={<ProtectedRoute requiredRole="member"><MemberCourseCatalog /></ProtectedRoute>} />
              <Route path="/member/courses/:id" element={<ProtectedRoute requiredRole="member"><MemberCourseViewer /></ProtectedRoute>} />
              <Route path="/member/embedded-courses" element={<ProtectedRoute requiredRole="member"><MemberEmbeddedCourseCatalog /></ProtectedRoute>} />
              <Route path="/member/embedded-courses/:id" element={<ProtectedRoute requiredRole="member"><MemberEmbeddedCourseViewer /></ProtectedRoute>} />
              <Route path="/member/courses/:id/block/:blockId" element={<ProtectedRoute requiredRole="member"><MemberCourseBlockView /></ProtectedRoute>} />
              <Route path="/member/support" element={<ProtectedRoute requiredRole="member"><MemberSupport /></ProtectedRoute>} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
