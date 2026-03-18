import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CRMProvider } from "@/context/CRMContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Projects from "./pages/Projects";
import Notifications from "./pages/Notifications";
import Leaderboard from "./pages/Leaderboard";
import UserManagement from "./pages/UserManagement";
import DeveloperManagement from "./pages/DeveloperManagement";
import LeadStatus from "./pages/LeadStatus";
import SettingsPage from "./pages/SettingsPage";
import ProjectRequests from "./pages/ProjectRequests";
import Profile from "./pages/Profile";
import ActivityHistory from "./pages/ActivityHistory";
import AppLayout from "./components/layout/AppLayout";
import NotFound from "./pages/NotFound";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/my-leads" element={<Leads />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/developers" element={<DeveloperManagement />} />
        <Route path="/lead-status" element={<LeadStatus />} />
        <Route path="/project-requests" element={<ProjectRequests />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/history" element={<ActivityHistory />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CRMProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </CRMProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
export default App;
