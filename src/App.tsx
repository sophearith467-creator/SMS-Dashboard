import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Missions } from './pages/Missions';
import { MissionDetail } from './pages/MissionDetail';
import { Approvals } from './pages/Approvals';
import { ActivityReports } from './pages/ActivityReports';
import { VehicleRequests } from './pages/VehicleRequests';
import { MileageClaims } from './pages/MileageClaims';
import { Settlement } from './pages/Settlement';
import { Users } from './pages/Users';
import { NotFound } from './pages/NotFound';
import { APPROVER_ROLES } from './lib/roles';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

export interface AppProps {
  /** Colour scheme the console boots into. */
  defaultTheme?: 'light' | 'dark';
}

export function App({ defaultTheme = 'light' }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme={defaultTheme}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="missions" element={<Missions />} />
                  <Route path="missions/:id" element={<MissionDetail />} />
                  <Route path="activity-reports" element={<ActivityReports />} />
                  <Route path="vehicle-requests" element={<VehicleRequests />} />
                  <Route path="mileage-claims" element={<MileageClaims />} />

                  <Route element={<ProtectedRoute roles={APPROVER_ROLES} />}>
                    <Route path="approvals" element={<Approvals />} />
                  </Route>

                  <Route
                    element={
                    <ProtectedRoute roles={['ROLE_FINANCE', 'ROLE_BIZOPS', 'ROLE_EXECUTIVE', 'ROLE_ADMIN']} />
                    }>
                    
                    <Route path="settlement" element={<Settlement />} />
                  </Route>

                  <Route element={<ProtectedRoute roles={['ROLE_ADMIN']} />}>
                    <Route path="users" element={<Users />} />
                  </Route>

                  <Route path="404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Route>
              </Route>
            </Routes>

            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 3200,
                className:
                '!rounded-xl !border !border-line !bg-surface !text-fg !text-[13px] !shadow-pop'
              }} />
            
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>);

}