import { useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme/theme';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import ForcePasswordChange from './components/ForcePasswordChange';

// Super Admin Pages
import SuperAdminDashboard from './pages/super-admin/Dashboard';
import Enquiries from './pages/super-admin/Enquiries';
import Schools from './pages/super-admin/Schools';
import Plans from './pages/super-admin/Plans';

// School Admin Pages
import SchoolAdminDashboard from './pages/school-admin/Dashboard';
import Elections from './pages/school-admin/Elections';
import Voters from './pages/school-admin/Voters';
import Candidates from './pages/school-admin/Candidates';
import Posts from './pages/school-admin/Posts';
import ClassesAndSections from './pages/school-admin/ClassesAndSections';
import Infrastructure from './pages/school-admin/Infrastructure';
import Results from './pages/school-admin/Results';
import Profile from './pages/school-admin/Profile';
import LiveMonitor from './pages/school-admin/LiveMonitor';

// Booth Officer Pages
import BoothOfficerDashboard from './pages/booth-officer/Dashboard';

// Voting Terminal (EVM)
import TerminalSession from './pages/voting-terminal/TerminalSession';
import PublicResults from './pages/public-results/PublicResults';
import LandingPage from './pages/public/LandingPage';
import NominationPortal from './pages/nomination/NominationPortal';
import RegisterPage from './pages/public/RegisterPage';
import AuditLog from './pages/school-admin/AuditLog';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const { mode } = useThemeStore();
  const { isAuthenticated, user } = useAuthStore();
  const theme = useMemo(() => getTheme(mode), [mode]);

  const location = useLocation();
  const isFullscreenRoute = 
    location.pathname === '/terminal' || 
    location.pathname.startsWith('/public-results/') ||
    location.pathname.startsWith('/nominate/');

  if (!isAuthenticated) {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/terminal" element={<TerminalSession />} />
          <Route path="/public-results/:electionId" element={<PublicResults />} />
          <Route path="/nominate/:code" element={<NominationPortal />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </ErrorBoundary>
      </ThemeProvider>
      </LocalizationProvider>
    );
  }

  // Mandatory Password Reset Trap
  if (user?.must_change_password) {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ErrorBoundary>
            <ForcePasswordChange onSuccess={() => {}} />
          </ErrorBoundary>
        </ThemeProvider>
      </LocalizationProvider>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
      {isFullscreenRoute ? (
        <Routes>
          <Route path="/terminal" element={<TerminalSession />} />
          <Route path="/public-results/:electionId" element={<PublicResults />} />
          <Route path="/nominate/:code" element={<NominationPortal />} />
        </Routes>
      ) : (
        <DashboardLayout>
          <Routes>
            {/* Super Admin Routes */}
            {user?.role === 'SUPER_ADMIN' && (
              <>
                <Route path="/" element={<Navigate to="/super-admin" />} />
                <Route path="/super-admin" element={<SuperAdminDashboard />} />
                <Route path="/super-admin/schools" element={<Schools />} />
                <Route path="/super-admin/enquiries" element={<Enquiries />} />
                <Route path="/super-admin/plans" element={<Plans />} />
                <Route path="*" element={<NotFound />} />
              </>
            )}

            {/* School Admin Routes */}
            {user?.role === 'SCHOOL_ADMIN' && (
              <>
                <Route path="/" element={<Navigate to="/school-admin" />} />
                <Route path="/school-admin" element={<SchoolAdminDashboard />} />
                <Route path="/school-admin/elections" element={<Elections />} />
                <Route path="/school-admin/voters" element={<Voters />} />
                <Route path="/school-admin/candidates" element={<Candidates />} />
                <Route path="/school-admin/staff" element={<Navigate to="/school-admin/infrastructure" replace />} />
                <Route path="/school-admin/posts" element={<Posts />} />
                <Route path="/school-admin/classes" element={<ClassesAndSections />} />
                <Route path="/school-admin/infrastructure" element={<Infrastructure />} />
                <Route path="/school-admin/results" element={<Results />} />
                <Route path="/school-admin/live" element={<LiveMonitor />} />
                <Route path="/school-admin/audit" element={<AuditLog />} />
                <Route path="/school-admin/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </>
            )}

            {/* Booth Officer Routes */}
            {user?.role === 'BOOTH_OFFICER' && (
              <>
                <Route path="/" element={<Navigate to="/booth-officer" />} />
                <Route path="/booth-officer" element={<BoothOfficerDashboard />} />
                <Route path="*" element={<NotFound />} />
              </>
            )}
          </Routes>
        </DashboardLayout>
      )}
      </ErrorBoundary>
    </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;
