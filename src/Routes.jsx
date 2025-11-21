import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "./pages/financial-modeling-hub/NotFound";
import FinancialModelingHub from './pages/financial-modeling-hub';
import ScenarioComparison from './pages/scenario-comparison';
import CostOptimizationLab from './pages/cost-optimization-lab';
import KPIMonitoringCenter from './pages/kpi-monitoring-center';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import Profile from './components/auth/Profile';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <ScrollToTop />
      <RouterRoutes>
        {/* Auth Routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* App Routes */}
        <Route path="/" element={<FinancialModelingHub />} />
        <Route path="/financial-modeling-hub" element={<FinancialModelingHub />} />
        <Route path="/scenario-comparison" element={<ScenarioComparison />} />
        <Route path="/cost-optimization-lab" element={<CostOptimizationLab />} />
        <Route path="/kpi-monitoring-center" element={<KPIMonitoringCenter />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;