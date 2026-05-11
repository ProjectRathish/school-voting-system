import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress, IconButton, Tooltip,
  Chip, InputAdornment, Snackbar, alpha
} from '@mui/material';
import { Plus, Trash2, RefreshCw, Eye, EyeOff, CheckCircle2, UserSquare2, Sparkles } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { useElectionStore } from '../../store/electionStore';

const Staff = () => {
  const { selectedElectionName, selectedElectionStatus } = useElectionStore();
  const [openOfficer, setOpenOfficer] = useState(false);
  const [openReset, setOpenReset] = useState<any>(null);
  const [resetSuccess, setResetSuccess] = useState<{username: string, password: string} | null>(null);
  const [openDelete, setOpenDelete] = useState<any>(null);
  const [officerForm, setOfficerForm] = useState({ username: '', password: '' });
  const [resetForm, setResetForm] = useState({ password: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();

  const { data: officers, isLoading: officersLoading } = useQuery({
    queryKey: ['booth-officers'],
    queryFn: async () => (await axiosInstance.get('/auth/booth-officers')).data?.data || []
  });

  const createOfficerMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.post('/auth/create-booth-officer', data),
    onSuccess: (response: any, variables: any) => {
      setSuccess(`Staff member created! Username: ${variables.username} | Password: ${variables.password}`);
      setOpenOfficer(false);
      setOfficerForm({ username: '', password: '' });
      queryClient.invalidateQueries({ queryKey: ['booth-officers'] });
      setTimeout(() => setSuccess(null), 10000); // 10s to copy
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error creating officer')
  });

  const resetOfficerMutation = useMutation({
    mutationFn: (data: { id: number, new_password: string }) => axiosInstance.put(`/auth/booth-officers/${data.id}/reset-password`, { new_password: data.new_password }),
    onSuccess: (_, variables) => {
      setResetSuccess({ username: openReset.username, password: variables.new_password });
      setOpenReset(null);
      setResetForm({ password: '' });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error resetting password')
  });

  const deleteOfficerMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/auth/booth-officers/${id}`),
    onSuccess: () => {
      setSuccess('Staff member removed from pool.');
      setOpenDelete(null);
      queryClient.invalidateQueries({ queryKey: ['booth-officers'] });
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error deleting officer')
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Booth Officer Management</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                Manage the school's global pool of booth officers available for assignment across all elections.
            </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => { setError(null); setOpenOfficer(true); }}>
          Create Booth Officer
        </Button>
      </Box>

      {/* Current Context Banner */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex'
      }}>
        <Box sx={{ 
          p: '1.5px', 
          borderRadius: '16px', 
          background: 'linear-gradient(45deg, #6366f1, #a855f7, #f43f5e)',
          boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.4)',
          position: 'relative'
        }}>
          <Box sx={{ 
            px: 3, 
            py: 2, 
            borderRadius: '15px', 
            background: theme => theme.palette.mode === 'dark' ? '#1e1e28' : '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 2.5
          }}>
            <Box sx={{ 
              width: 45, 
              height: 45, 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
            }}>
              <Sparkles size={22} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ 
                color: 'text.secondary', 
                fontWeight: 800, 
                textTransform: 'uppercase', 
                letterSpacing: 1.5,
                fontSize: '0.65rem',
                display: 'block',
                mb: 0.5
              }}>
                {selectedElectionStatus ? `STAGE: ${selectedElectionStatus}` : 'Active Configuration'}
              </Typography>
              <Typography variant="h6" sx={{ 
                fontWeight: 900, 
                color: 'text.primary', 
                lineHeight: 1.1,
                background: 'linear-gradient(45deg, #6366f1, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.25rem'
              }}>
                {selectedElectionName || 'None Selected'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
          {error}
        </Alert>
      </Snackbar>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.08) }}>
              <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Staff Name / Username</TableCell>
              <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Created At</TableCell>
              <TableCell align="right" sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {officersLoading ? (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 8 }}><CircularProgress size={32} /></TableCell></TableRow>
            ) : officers?.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                <UserSquare2 size={48} color="lightgray" style={{ marginBottom: '16px' }} />
                <Typography color="text.secondary">No booth officers in the pool yet</Typography>
              </TableCell></TableRow>
            ) : officers?.map((o: any) => (
              <TableRow key={o.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{o.username}</TableCell>
                <TableCell>
                  <Chip 
                    label="Available for Assignment" 
                    size="small" 
                    color="success"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                    icon={<CheckCircle2 size={14} />} 
                  />
                </TableCell>
                <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Reset Password">
                    <IconButton color="warning" size="small" onClick={() => { setOpenReset(o); setResetForm({ password: '' }); }}><RefreshCw size={18} /></IconButton>
                  </Tooltip>
                  <Tooltip title="Remove from Pool">
                    <IconButton color="error" size="small" onClick={() => setOpenDelete(o)}><Trash2 size={18} /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Officer Dialog */}
      <Dialog open={openOfficer} onClose={() => setOpenOfficer(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create Booth Officer</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField 
                label="Username" 
                fullWidth 
                autoFocus
                value={officerForm.username} 
                onChange={e => setOfficerForm(p => ({ ...p, username: e.target.value }))} 
            />
            <TextField 
              label="Password" 
              type={showPassword ? 'text' : 'password'} 
              fullWidth 
              value={officerForm.password} 
              onChange={e => setOfficerForm(p => ({ ...p, password: e.target.value }))} 
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenOfficer(false)}>Cancel</Button>
            <Button 
                variant="contained" 
                onClick={() => createOfficerMutation.mutate(officerForm)}
                disabled={!officerForm.username || !officerForm.password || createOfficerMutation.isPending}
            >
                {createOfficerMutation.isPending ? 'Creating...' : 'Create Staff member'}
            </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!openReset} onClose={() => setOpenReset(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'warning.main' }}>Reset Officer Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Generate a new password for <strong>{openReset?.username}</strong>. The previous password will be instantly revoked.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', mt: 1 }}>
            <TextField 
              label="New Password" 
              type={showPassword ? 'text' : 'password'} 
              fullWidth 
              value={resetForm.password} 
              onChange={e => setResetForm({ password: e.target.value })} 
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenReset(null)}>Cancel</Button>
            <Button 
                variant="contained" 
                color="warning"
                onClick={() => resetOfficerMutation.mutate({ id: openReset.id, new_password: resetForm.password })}
                disabled={!resetForm.password || resetOfficerMutation.isPending}
            >
                {resetOfficerMutation.isPending ? 'Resetting...' : 'Assign New Password'}
            </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={!!openDelete} onClose={() => setOpenDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Remove Officer?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to permanently remove <strong>{openDelete?.username}</strong> from the booth officer pool?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenDelete(null)}>Cancel</Button>
            <Button 
                variant="contained" 
                color="error"
                onClick={() => deleteOfficerMutation.mutate(openDelete.id)}
                disabled={deleteOfficerMutation.isPending}
            >
                Remove
            </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Success Dialog */}
      <Dialog open={!!resetSuccess} onClose={() => setResetSuccess(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle2 /> Password Reset Successful
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            The password for <strong>{resetSuccess?.username}</strong> has been actively updated. Please provide them with the following temporary credentials securely.
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'rgba(99, 102, 241, 0.05)', borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>New Password</Typography>
            <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: 2, fontWeight: 800 }}>
                {resetSuccess?.password}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
            <Button variant="contained" onClick={() => setResetSuccess(null)}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Staff;
