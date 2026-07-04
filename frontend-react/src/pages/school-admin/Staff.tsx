import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress, IconButton, Tooltip,
  Chip, InputAdornment, Snackbar, alpha
} from '@mui/material';
import { 
  Plus, Trash2, RefreshCw, Eye, EyeOff, CheckCircle2, 
  UserSquare2, Sparkles, Edit, ShieldCheck, ShieldAlert, 
  Lock, Shield, Info, Smartphone 
} from 'lucide-react';
import { 
  FormControlLabel, 
  Radio, 
  RadioGroup,
  Divider
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { useElectionStore } from '../../store/electionStore';

const Staff = () => {
  const { selectedElectionName, selectedElectionStatus } = useElectionStore();
  const [openOfficer, setOpenOfficer] = useState(false);
  const [openReset, setOpenReset] = useState<any>(null);
  const [resetSuccess, setResetSuccess] = useState<{username: string, password: string} | null>(null);
  const [openDelete, setOpenDelete] = useState<any>(null);
  const [editingOfficer, setEditingOfficer] = useState<any>(null);
  const [officerForm, setOfficerForm] = useState({ username: '', password: '' });
  const [resetForm, setResetForm] = useState({ password: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [openAccess, setOpenAccess] = useState<any>(null);
  const [selectedElection, setSelectedElection] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: officers, isLoading: officersLoading } = useQuery({
    queryKey: ['booth-officers'],
    queryFn: async () => (await axiosInstance.get('/auth/booth-officers')).data?.data || []
  });

  const { data: allElections } = useQuery({
    queryKey: ['all-elections-for-staff'],
    queryFn: async () => (await axiosInstance.get('/elections/get-elections')).data || []
  });

  const upsertOfficerMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingOfficer) {
        return axiosInstance.put(`/auth/booth-officers/${editingOfficer.id}`, { username: data.username });
      }
      return axiosInstance.post('/auth/create-booth-officer', data);
    },
    onSuccess: (response: any, variables: any) => {
      if (editingOfficer) {
        setSuccess('Officer updated successfully!');
      } else {
        setSuccess(`Staff member created! Username: ${variables.username} | Password: ${variables.password}`);
      }
      setOpenOfficer(false);
      setEditingOfficer(null);
      setOfficerForm({ username: '', password: '' });
      queryClient.invalidateQueries({ queryKey: ['booth-officers'] });
      setTimeout(() => setSuccess(null), 10000);
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error saving officer')
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

  const updateAccessMutation = useMutation({
    mutationFn: (data: { id: number, election_ids: number[] }) =>
      axiosInstance.put(`/auth/booth-officers/${data.id}/election-access`, { election_ids: data.election_ids }),
    onSuccess: () => {
      setSuccess('Election access updated successfully!');
      setOpenAccess(null);
      queryClient.invalidateQueries({ queryKey: ['booth-officers'] });
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error updating access')
  });

  const handleOpenAccess = (officer: any) => {
    setOpenAccess(officer);
    const ids = officer.assigned_election_ids
      ? officer.assigned_election_ids.split(',').map(Number).filter(Boolean)
      : [];
    setSelectedElection(ids.length > 0 ? ids[0] : null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-1px', color: 'text.primary' }}>Booth Officers</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                Manage the school's global pool of booth officers available for assignment across all elections.
            </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => { setError(null); setOpenOfficer(true); }}>
          Create Booth Officer
        </Button>
      </Box>

      {/* No Election Context here */}

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
              <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Assigned Booth</TableCell>
              <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Assigned Election</TableCell>
              <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Created At</TableCell>
              <TableCell align="right" sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {officersLoading ? (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 8 }}><CircularProgress size={32} /></TableCell></TableRow>
            ) : officers?.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                <UserSquare2 size={48} color="lightgray" style={{ marginBottom: '16px' }} />
                <Typography color="text.secondary">No booth officers in the pool yet</Typography>
              </TableCell></TableRow>
            ) : officers?.map((o: any) => (
              <TableRow key={o.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{o.username}</TableCell>
                <TableCell>
                  {o.booth_id ? (
                    <Chip 
                      label={`Booth #${o.booth_number || o.booth_id}`} 
                      size="small" 
                      color="primary" 
                      variant="filled"
                      sx={{ fontWeight: 700 }}
                    />
                  ) : (
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      Not Assigned
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {o.assigned_election_ids ? (() => {
                    const elecId = Number(o.assigned_election_ids.split(',')[0]);
                    const elec = allElections?.find((e: any) => e.id === elecId);
                    return (
                      <Chip
                        label={elec?.name || `Election #${elecId}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 700, maxWidth: 180 }}
                        icon={<Lock size={14} />}
                      />
                    );
                  })() : (
                    <Chip
                      label="Not Assigned"
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 700, color: 'text.secondary', borderColor: 'divider' }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={o.booth_id ? `Assigned to Booth #${o.booth_number || o.booth_id}` : "Available"} 
                    size="small" 
                    color={o.booth_id ? "info" : "success"}
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                    icon={<CheckCircle2 size={14} />} 
                  />
                </TableCell>
                <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                    <Tooltip title="Manage Election Access">
                        <IconButton 
                            size="small" 
                            color="info" 
                            onClick={() => {
                                handleOpenAccess(o);
                                setError(null);
                            }}
                        >
                            <Shield size={18} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Officer">
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => {
                          setEditingOfficer(o);
                          setOfficerForm({ username: o.username, password: '' });
                          setError(null);
                          setOpenOfficer(true);
                        }}
                      >
                        <Edit size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset Password">
                      <IconButton size="small" color="warning" onClick={() => { setOpenReset(o); setResetForm({ password: '' }); }}><RefreshCw size={18} /></IconButton>
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

      {/* Create/Edit Officer Dialog */}
      <Dialog open={openOfficer} onClose={() => { setOpenOfficer(false); setEditingOfficer(null); }} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editingOfficer ? 'Edit Booth Officer' : 'Create New Booth Officer'}</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField 
              label="Staff Name / Username" 
              fullWidth 
              value={officerForm.username}
              onChange={e => setOfficerForm({ ...officerForm, username: e.target.value })}
              placeholder="e.g. John Doe / staff_01"
              variant="outlined"
              autoComplete="new-username"
            />
            {!editingOfficer && (
              <TextField 
                label="Initial Password" 
                fullWidth 
                type={showPassword ? 'text' : 'password'}
                value={officerForm.password}
                onChange={e => setOfficerForm({ ...officerForm, password: e.target.value })}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => { setOpenOfficer(false); setEditingOfficer(null); }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => upsertOfficerMutation.mutate(officerForm)}
            disabled={upsertOfficerMutation.isPending}
          >
            {editingOfficer ? 'Update Officer' : 'Create Officer'}
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
              autoComplete="new-password"
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
       {/* Election Access Dialog — one election required */}
      <Dialog open={!!openAccess} onClose={() => setOpenAccess(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Assign Election</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
             <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select the election <strong>{openAccess?.username}</strong> is authorized to manage. Only one election can be assigned at a time.
             </Typography>

             {!openAccess?.booth_id && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 1 }}>
                   Officer must be assigned to a booth in Infrastructure first.
                </Alert>
             )}

             <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', display: 'block', mb: 1 }}>
                Select Election
             </Typography>
             <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', borderRadius: 2 }}>
                <RadioGroup
                  value={selectedElection ?? 'none'}
                  onChange={(e) => setSelectedElection(e.target.value === 'none' ? null : Number(e.target.value))}
                  sx={{ p: 1 }}
                >
                   {/* Unassign option */}
                   <FormControlLabel
                     value="none"
                     control={<Radio size="small" />}
                     label={
                        <Box>
                           <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>Not Assigned</Typography>
                           <Typography variant="caption" color="text.disabled">Remove election assignment from this officer</Typography>
                        </Box>
                     }
                     sx={{ py: 0.5, px: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }, borderBottom: '1px solid', borderColor: 'divider' }}
                   />
                   {allElections?.filter((e: any) => e.status !== 'CLOSED').map((e: any) => (
                      <FormControlLabel
                        key={e.id}
                        value={e.id}
                        control={<Radio size="small" />}
                        label={
                           <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{e.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{e.status}</Typography>
                           </Box>
                        }
                        sx={{ py: 0.5, px: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }, borderBottom: '1px solid', borderColor: 'divider' }}
                      />
                   ))}
                   {allElections?.filter((e: any) => e.status !== 'CLOSED').length === 0 && (
                      <Typography variant="body2" sx={{ p: 2, textAlign: 'center', opacity: 0.5 }}>No active elections found</Typography>
                   )}
                </RadioGroup>
             </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenAccess(null)}>Cancel</Button>
          <Button 
            variant="contained"
            color={selectedElection === null ? 'inherit' : 'primary'}
            onClick={() => updateAccessMutation.mutate({ 
              id: openAccess.id, 
              election_ids: selectedElection !== null ? [selectedElection] : []
            })}
            disabled={updateAccessMutation.isPending || !openAccess?.booth_id}
          >
            {selectedElection === null ? 'Save (Unassigned)' : 'Assign Election'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Staff;
