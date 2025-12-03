
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ApiDiagnosticPage from "./pages/ApiDiagnosticPage";
import BoitierPage from "./pages/BoitierPage";
import CompanyManagementPage from "./pages/CompanyManagementPage";

import FotaWebPage from "./pages/FotaWebPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import PhenixTestPage from "./pages/PhenixTestPage";
import RechargeTestPage from "./pages/RechargeTestPage";
import SimCardsPage from "./pages/SimCardsPage";
import TruphoneTestPage from "./pages/TruphoneTestPage";
import VehiclesDevicesPage from "./pages/VehiclesDevicesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/gestion-entreprises" replace />} />
              
              <Route path="gestion-entreprises" element={<CompanyManagementPage />} />
              <Route path="vehicules-boitiers" element={<VehiclesDevicesPage />} />
              <Route path="sim-cards" element={<SimCardsPage />} />
              <Route path="fota-web" element={<FotaWebPage />} />
              <Route path="boitier" element={<BoitierPage />} />
              <Route path="api-diagnostic" element={<ApiDiagnosticPage />} />
              <Route path="phenix-test" element={<PhenixTestPage />} />
              <Route path="truphone-test" element={<TruphoneTestPage />} />
              <Route path="recharge-test" element={<RechargeTestPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
