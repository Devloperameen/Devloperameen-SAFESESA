import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { RoleProvider, useRole } from "@/contexts/RoleContext";
import MainLayout from "@/components/layout/MainLayout";
import AdminLayout from "@/components/layout/AdminLayout";

import Index from "./pages/Index";
import CourseCatalog from "./pages/CourseCatalog";
import CourseDetails from "./pages/CourseDetails";
import MyLearning from "./pages/MyLearning";
import CoursePlayer from "./pages/CoursePlayer";
import Favorites from "./pages/Favorites";
import InstructorDashboard from "./pages/InstructorDashboard";
import InstructorCourses from "./pages/InstructorCourses";
import InstructorRevenue from "./pages/InstructorRevenue";
import CourseBuilder from "./pages/CourseBuilder";
import AdminOverview from "./pages/AdminOverview";
import UserManagement from "./pages/UserManagement";
import CourseModeration from "./pages/CourseModeration";
import CategoryManagement from "./pages/CategoryManagement";
import Announcements from "./pages/Announcements";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const queryClient = new QueryClient();

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles?: Array<"student" | "instructor" | "admin">;
}) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function RoleBasedRoutes() {
  const { role } = useRole();
  const { isAuthenticated, user } = useAuth();

  if (role === "admin") {
    if (!isAuthenticated || user?.role !== "admin") {
      return <Navigate to="/login" replace />;
    }

    return (
      <AdminLayout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/courses" element={<CourseModeration />} />
            <Route path="/admin/categories" element={<CategoryManagement />} />
            <Route path="/admin/announcements" element={<Announcements />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </AnimatePresence>
      </AdminLayout>
    );
  }

  return (
    <MainLayout>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/course/:id" element={<CourseDetails />} />
          <Route path="/my-learning" element={<ProtectedRoute><MyLearning /></ProtectedRoute>} />
          <Route path="/learn/:id" element={<ProtectedRoute><CoursePlayer /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
          <Route path="/instructor" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorDashboard /></ProtectedRoute>} />
          <Route path="/instructor/courses" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorCourses /></ProtectedRoute>} />
          <Route path="/instructor/revenue" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorRevenue /></ProtectedRoute>} />
          <Route path="/instructor/create" element={<ProtectedRoute allowedRoles={["instructor"]}><CourseBuilder /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </MainLayout>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/*" element={<RoleBasedRoutes />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <RoleProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </RoleProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
