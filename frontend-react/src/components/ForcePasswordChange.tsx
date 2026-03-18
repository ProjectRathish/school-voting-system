import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress,
  Stack,
  useTheme,
  alpha,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Lock, Save, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import { useAuthStore } from '../store/authStore';

const ForcePasswordChange = ({ onSuccess }: { onSuccess: () => void }) => {
  const theme = useTheme();
  const { logout, setPasswordChanged } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: any) => axiosInstance.put('/auth/change-password', data),
    onSuccess: () => {
      setPasswordChanged();
      onSuccess();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    mutation.mutate({
      current_password: currentPassword,
      new_password: newPassword
    });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: 'background.default',
      p: 3
    }}>
      <Paper sx={{ p: 4, borderRadius: 4, maxWidth: 400, width: '100%', boxShadow: theme.shadows[10] }}>
        <Stack spacing={3} alignItems="center" sx={{ mb: 4 }}>
          <Box sx={{ 
            p: 2, 
            borderRadius: '50%', 
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            color: 'warning.main'
          }}>
            <Lock size={32} />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Reset Password</Typography>
            <Typography color="text.secondary">First-time login security requirement</Typography>
          </Box>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Current Password"
              type={showCurrent ? 'text' : 'password'}
              fullWidth
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              InputProps={{
                startAdornment: <KeyRound size={18} style={{ marginRight: 12, opacity: 0.5 }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCurrent(!showCurrent)} edge="end">
                      {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              label="New Password"
              type={showNew ? 'text' : 'password'}
              fullWidth
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              InputProps={{
                startAdornment: <Lock size={18} style={{ marginRight: 12, opacity: 0.5 }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNew(!showNew)} edge="end">
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              label="Confirm New Password"
              type={showConfirm ? 'text' : 'password'}
              fullWidth
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                startAdornment: <Lock size={18} style={{ marginRight: 12, opacity: 0.5 }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end">
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              size="large"
              disabled={mutation.isPending}
              sx={{ py: 1.5, borderRadius: 3, mt: 1 }}
              startIcon={mutation.isPending ? <CircularProgress size={20} color="inherit" /> : <Save size={20} />}
            >
              Update & Continue
            </Button>

            <Button 
              variant="text" 
              fullWidth 
              onClick={() => logout()}
              sx={{ color: 'text.secondary' }}
            >
              Logout and stay secure
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default ForcePasswordChange;
