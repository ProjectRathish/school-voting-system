import { useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme/theme';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import ForcePasswordChange from './components/ForcePasswordChange';

// Super Admin Pages
import SuperAdminDashboard from './pages/super-admin/Dashboard';
import Enquiries from './pages/super-admin/Enquiries';
import Schools from './pages/super-admin/Schools';

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

// Booth Officer Pages
import BoothOfficerDashboard from './pages/booth-officer/Dashboard';

function App() {
  const { mode } = useThemeStore();
  const { isAuthenticated, user } = useAuthStore();
  const theme = useMemo(() => getTheme(mode), [mode]);

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </ThemeProvider>
    );
  }

  // Mandatory Password Reset Trap
  if (user?.must_change_password) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ForcePasswordChange onSuccess={() => {}} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DashboardLayout>
        <Routes>
          {/* Super Admin Routes */}
          {user?.role === 'SUPER_ADMIN' && (
            <>
              <Route path="/" element={<Navigate to="/super-admin" />} />
              <Route path="/super-admin" element={<SuperAdminDashboard />} />
              <Route path="/super-admin/schools" element={<Schools />} />
              <Route path="/super-admin/enquiries" element={<Enquiries />} />
              <Route path="*" element={<Navigate to="/super-admin" />} />
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
              <Route path="/school-admin/posts" element={<Posts />} />
              <Route path="/school-admin/classes" element={<ClassesAndSections />} />
              <Route path="/school-admin/infrastructure" element={<Infrastructure />} />
              <Route path="/school-admin/results" element={<Results />} />
              <Route path="/school-admin/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/school-admin" />} />
            </>
          )}

          {/* Booth Officer Routes */}
          {user?.role === 'BOOTH_OFFICER' && (
            <>
              <Route path="/" element={<Navigate to="/booth-officer" />} />
              <Route path="/booth-officer" element={<BoothOfficerDashboard />} />
              <Route path="*" element={<Navigate to="/booth-officer" />} />
            </>
          )}
        </Routes>
      </DashboardLayout>
    </ThemeProvider>
  );
}

export default App;
