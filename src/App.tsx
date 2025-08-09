import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import Questionnaire from "./pages/Questionnaire";
import QuestionnaireIndex from "./pages/questionnaire/Index";
import SOPQuestionnaire from "./pages/questionnaire/SOP";
import LORQuestionnaire from "./pages/questionnaire/LOR";
import CVQuestionnaire from "./pages/questionnaire/CV";
import Documents from "./pages/Documents";
import Enquiries from "./pages/Enquiries";
import Services from "./pages/Services";
import About from "./pages/About";
import SuccessStories from "./pages/SuccessStories";
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
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/success-stories" element={<SuccessStories />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={
              <ProtectedRoute requireStudent={true}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={<Profile />} />
            <Route path="/employee-dashboard" element={
              <ProtectedRoute requireEmployee={true}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/questionnaire" element={<QuestionnaireIndex />} />
            <Route path="/questionnaire/sop" element={<SOPQuestionnaire />} />
            <Route path="/questionnaire/lor" element={<LORQuestionnaire />} />
            <Route path="/questionnaire/cv" element={<CVQuestionnaire />} />
            <Route path="/documents" element={
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            } />
            <Route path="/enquiries" element={<Enquiries />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
