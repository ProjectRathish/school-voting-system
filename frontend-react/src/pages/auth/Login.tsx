import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Container, 
  InputAdornment, 
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Stack,
  useTheme
} from '@mui/material';
import { User, Lock, School, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';
import { useAuthStore } from '../../store/authStore';

const Login = () => {
  const [tab, setTab] = useState(0);
  const [schoolCode, setSchoolCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((state) => state.login);

  React.useEffect(() => {
    const code = searchParams.get('school');
    if (code) {
      setSchoolCode(code.toUpperCase());
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = tab === 0 ? '/auth/login' : '/auth/booth-login';
      const response = await axiosInstance.post(endpoint, {
        school_code: schoolCode,
        username,
        password
      });

      const { token, role, user_id, school_id, booth_id, school_name, school_logo, must_change_password } = response.data;
      
      login({
        id: user_id || 0,
        username,
        role,
        school_id,
        booth_id,
        school_code: schoolCode,
        school_name,
        school_logo,
        must_change_password
      }, token);

      if (role === 'SUPER_ADMIN') navigate('/super-admin');
      else if (role === 'SCHOOL_ADMIN') navigate('/school-admin');
      else if (role === 'BOOTH_OFFICER') navigate('/booth-officer');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: theme.palette.mode === 'light' 
          ? `radial-gradient(circle at 0% 0%, ${theme.palette.primary.light}15 0%, transparent 50%), 
             radial-gradient(circle at 100% 100%, ${theme.palette.secondary.light}15 0%, transparent 50%),
             ${theme.palette.background.default}`
          : `radial-gradient(circle at 0% 0%, ${theme.palette.primary.dark}30 0%, transparent 40%), 
             radial-gradient(circle at 100% 100%, ${theme.palette.secondary.dark}30 0%, transparent 40%),
             ${theme.palette.background.default}`
      }}
    >
      <Container maxWidth="xs">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Stack spacing={1} alignItems="center" sx={{ mb: 4 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 900, 
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center'
              }}
            >
              E-Vote School
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Secure Digital Voting Platform
            </Typography>
          </Stack>

          <Card variant="outlined">
            <CardContent sx={{ p: 4 }}>
              <Tabs 
                value={tab} 
                onChange={(_, v) => setTab(v)} 
                variant="fullWidth" 
                sx={{ 
                  mb: 4,
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0'
                  }
                }}
              >
                <Tab icon={<School size={18} />} iconPosition="start" label="Admin" />
                <Tab icon={<User size={18} />} iconPosition="start" label="Officer" />
              </Tabs>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleLogin}>
                <Stack spacing={3}>
                  <TextField
                    label="School Code"
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                    required
                    fullWidth
                    placeholder="e.g. SPE001"
                    variant="outlined"
                    helperText={schoolCode === 'SYSTEM' ? "Platform Administration Mode Enabled" : ""}
                    FormHelperTextProps={{
                      sx: { 
                        color: 'primary.main',
                        fontWeight: 700
                      }
                    }}
                  />
                  
                  {(tab === 1 || schoolCode === 'SYSTEM') && (
                    <TextField
                      label="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <User size={20} color={theme.palette.text.secondary} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}

                  <TextField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={20} color={theme.palette.text.secondary} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={loading}
                    sx={{ 
                      py: 1.8, 
                      fontSize: '1rem',
                      mt: 1,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>
          
          <Typography variant="body2" align="center" sx={{ mt: 3, color: 'text.secondary' }}>
            © {new Date().getFullYear()} E-Vote School Platform. All rights reserved.
          </Typography>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;
