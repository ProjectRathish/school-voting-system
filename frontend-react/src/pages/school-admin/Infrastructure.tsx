import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress, IconButton, Tooltip,
  Grid, Chip, FormControl, InputLabel, Select, MenuItem,
  InputAdornment, Snackbar, alpha, Tabs, Tab, Radio, RadioGroup, FormControlLabel
} from '@mui/material';
import { Plus, Trash2, Monitor, UserPlus, Unlink, Sparkles, Edit, Landmark, RefreshCw, Eye, EyeOff, CheckCircle2, UserSquare2, Lock, Shield } from 'lucide-react';
import { useElectionStore } from '../../store/electionStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import evmIcon from '../../assets/evm_icon.png';

const Infrastructure = () => {
  const { selectedElectionId, selectedElectionName, selectedElectionStatus } = useElectionStore();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedBoothForOfficer, setSelectedBoothForOfficer] = useState<any>(null);
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [machineForm, setMachineForm] = useState({ machine_name: '', booth_id: '' });
  const [error, setError] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [openMachine, setOpenMachine] = useState(false);
  const [editingMachine, setEditingMachine] = useState<any>(null);
  const [openDeleteMachine, setOpenDeleteMachine] = useState<any>(null);
  const [openBooth, setOpenBooth] = useState(false);
  const [openDeleteAllMachines, setOpenDeleteAllMachines] = useState(false);
  const [editingBooth, setEditingBooth] = useState<any>(null);
  const [openDelete, setOpenDelete] = useState<any>(null);
  const [boothForm, setBoothForm] = useState({ booth_number: '', booth_name: '', location: '', capacity: '' });

  // Officer specific states
  const [openOfficer, setOpenOfficer] = useState(false);
  const [openReset, setOpenReset] = useState<any>(null);
  const [resetSuccess, setResetSuccess] = useState<{username: string, password: string} | null>(null);
  const [openDeleteOfficer, setOpenDeleteOfficer] = useState<any>(null);
  const [editingOfficer, setEditingOfficer] = useState<any>(null);
  const [officerForm, setOfficerForm] = useState({ username: '', password: '' });
  const [resetForm, setResetForm] = useState({ password: '' });
  const [showOfficerPassword, setShowOfficerPassword] = useState(false);
  const [openAccess, setOpenAccess] = useState<any>(null);
  const [selectedElection, setSelectedElection] = useState<number | null>(null);

  const queryClient = useQueryClient();
  // Sync with global store
  // No longer sync with global election store for infrastructure management
  useEffect(() => {
    // Keep this empty to remove the sync dependency
  }, []);

  const { data: elections } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => (await axiosInstance.get('/elections/get-elections')).data
  });

  const { data: stats } = useQuery({
    queryKey: ['school-admin-stats'],
    queryFn: async () => (await axiosInstance.get('/elections/get-stats')).data
  });

  const boothLimit = stats?.plan?.custom_max_booths ?? stats?.plan?.max_booths;
  const machineLimit = stats?.plan?.custom_max_machines ?? stats?.plan?.max_machines;

  const selectedElectionObj = elections?.find((e: any) => String(e.id) === String(selectedElectionId));
  const isConfiguring = selectedElectionObj && (selectedElectionObj.status === 'CONFIGURING' || selectedElectionObj.status === 'DRAFT');
  const isClosed = selectedElectionStatus === 'CLOSED' || selectedElectionObj?.status === 'CLOSED';
  const isEditDeleteLocked = selectedElectionId && !isConfiguring;

  const { data: booths } = useQuery({
    queryKey: ['booths'],
    queryFn: async () => (await axiosInstance.get('/polling-booths')).data?.data || []
  });

  const { data: officers, isLoading: officersLoading, refetch: refetchOfficers } = useQuery({
    queryKey: ['booth-officers'],
    queryFn: async () => (await axiosInstance.get('/auth/booth-officers')).data?.data || []
  });

  // Use officers data for assignments display
  const assignments = officers;

  const { data: machines, isLoading: machinesLoading } = useQuery({
    queryKey: ['machines'],
    queryFn: async () => (await axiosInstance.get('/machines/get-machines')).data,
    refetchInterval: 5000 // Automatically refresh every 5 seconds to sync hardware binding status
  });

  const createMachineMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.post('/machines/register', data),
    onSuccess: () => {
      setSuccess('Voting machine registered!');
      setOpenMachine(false);
      setDialogError(null);
      setMachineForm({ machine_name: '', booth_id: '' });
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => setDialogError(err.response?.data?.message || 'Error creating machine')
  });

  const updateMachineMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.put(`/machines/${editingMachine.id}`, data),
    onSuccess: () => {
      setSuccess('Voting machine updated!');
      setEditingMachine(null);
      setDialogError(null);
      setMachineForm({ machine_name: '', booth_id: '' });
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => setDialogError(err.response?.data?.message || 'Error updating machine')
  });
  const deleteMachineMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/machines/${id}`),
    onSuccess: () => {
      setSuccess('Voting machine deleted.');
      setOpenDeleteMachine(null);
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => setDialogError(err.response?.data?.message || 'Error deleting machine')
  });

  const bulkDeleteMachinesMutation = useMutation({
    mutationFn: () => axiosInstance.delete('/machines/bulk-delete'),
    onSuccess: () => {
      setSuccess('All voting machines deleted.');
      setOpenDeleteAllMachines(false);
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => setDialogError(err.response?.data?.message || 'Error deleting all machines')
  });

  const resetBindingMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.post(`/machines/${id}/reset-binding`),
    onSuccess: () => {
      setSuccess('Hardware binding reset! You can now use the code on a new device.');
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      setTimeout(() => setSuccess(null), 4000);
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error resetting hardware binding')
  });

  const createBoothMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.post('/polling-booths/create', data),
    onSuccess: () => {
      setSuccess('Polling booth created!');
      setOpenBooth(false);
      setDialogError(null);
      setBoothForm({ booth_number: '', booth_name: '', location: '', capacity: '' });
      queryClient.invalidateQueries({ queryKey: ['booths'] });
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => setDialogError(err.response?.data?.message || 'Error creating booth')
  });

  const updateBoothMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.put(`/polling-booths/${editingBooth.id}`, data),
    onSuccess: () => {
      setSuccess('Polling booth updated!');
      setEditingBooth(null);
      setDialogError(null);
      setBoothForm({ booth_number: '', booth_name: '', location: '', capacity: '' });
      queryClient.invalidateQueries({ queryKey: ['booths'] });
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => setDialogError(err.response?.data?.message || 'Error updating booth')
  });

  const deleteBoothMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/polling-booths/${id}`),
    onSuccess: () => {
      setSuccess('Polling booth deleted.');
      setOpenDelete(null);
      queryClient.invalidateQueries({ queryKey: ['booths'] });
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => setDialogError(err.response?.data?.message || 'Error deleting booth')
  });

  const assignOfficerMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.put(`/auth/booth-officers/${data.user_id}/assign-booth`, { booth_id: data.booth_id }),
    onSuccess: () => {
      setSuccess('Officer assigned successfully!');
      setSelectedBoothForOfficer(null);
      setDialogError(null);
      setSelectedOfficer('');
      refetchOfficers();
    },
    onError: (err: any) => setDialogError(err.response?.data?.message || 'Error assigning officer')
  });

  const unassignOfficerMutation = useMutation({
    mutationFn: (userId: number) => axiosInstance.put(`/auth/booth-officers/${userId}/assign-booth`, { booth_id: null }),
    onSuccess: () => {
      setSuccess('Officer unassigned.');
      refetchOfficers();
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error removing assignment')
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
      setOpenDeleteOfficer(null);
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
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-1px', color: 'text.primary' }}>Infrastructure Management</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
            {activeTab === 0 
              ? "Manage your school's global polling booths and voting machines. These assets can be used across multiple elections."
              : "Manage the school's global pool of booth officers available for assignment across all elections."
            }
          </Typography>
        </Box>
        {activeTab === 1 && (
          <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => { setError(null); setOpenOfficer(true); }}>
            Create Booth Officer
          </Button>
        )}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          <Tab label="Booths & EVM Machines" icon={<Landmark size={18} />} iconPosition="start" sx={{ fontWeight: 700 }} />
          <Tab label="Booth Officers Pool" icon={<UserSquare2 size={18} />} iconPosition="start" sx={{ fontWeight: 700 }} />
        </Tabs>
      </Box>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%', borderRadius: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
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

      {activeTab === 0 ? (
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>Polling Booths</Typography>
                    {boothLimit != null && (
                      <Typography variant="caption" sx={{ color: (booths?.length ?? 0) >= boothLimit ? 'error.main' : 'text.secondary', fontWeight: 700 }}>
                        {booths?.length ?? 0} / {boothLimit} used
                      </Typography>
                    )}
                  </Box>
                  <Button 
                    variant="contained" 
                    size="small" 
                    startIcon={<Plus size={18} />} 
                    onClick={() => setOpenBooth(true)}
                    disabled={boothLimit != null && (booths?.length ?? 0) >= boothLimit}
                    sx={{ borderRadius: 2 }}
                  >
                    Add Booth
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {booths?.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: 'center', opacity: 0.5 }}>
                      <Box component="img" src={evmIcon} sx={{ width: 64, height: 64, mb: 2, filter: 'grayscale(1)' }} />
                      <Typography variant="body2">No booths defined yet</Typography>
                    </Box>
                  ) : booths?.map((b: any) => {
                    const assignedStaff = assignments?.find((a: any) => a.booth_id === b.id);
                    return (
                      <Paper 
                        key={b.id} 
                        variant="outlined" 
                        sx={{ 
                          p: 2.5, 
                          borderRadius: 1, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: 2,
                          transition: 'all 0.2s',
                          borderColor: assignedStaff ? 'primary.light' : 'divider',
                          backgroundColor: assignedStaff ? 'rgba(99, 102, 241, 0.02)' : 'background.paper',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.08)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ 
                              width: 42,
                              height: 42,
                              borderRadius: 1.5, 
                              bgcolor: 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: '0 2px 8px rgba(99,102,241,0.3)'
                            }}>
                              <Landmark size={22} color="white" />
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                Booth #{b.booth_number}{b.booth_name ? ` · ${b.booth_name}` : ''}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                {b.location}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Tooltip title="Edit Booth">
                                <IconButton size="small" onClick={() => {
                                    setEditingBooth(b);
                                    setBoothForm({ booth_number: String(b.booth_number), booth_name: b.booth_name || '', location: b.location, capacity: b.capacity !== null && b.capacity !== undefined ? String(b.capacity) : '' });
                                }}><Edit size={16} /></IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Booth">
                                <IconButton size="small" color="error" onClick={() => setOpenDelete(b)}><Trash2 size={16} /></IconButton>
                            </Tooltip>
                            {assignedStaff && (
                                <Chip 
                                    size="small" 
                                    label="Officer Assigned" 
                                    color="primary" 
                                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }} 
                                />
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ 
                          pt: 1.5, 
                          borderTop: '1px dashed', 
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          {assignedStaff ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden', flexGrow: 1 }}>
                              <UserPlus size={14} color="gray" />
                              <Typography variant="caption" noWrap sx={{ fontWeight: 700, color: 'text.primary' }}>
                                {assignedStaff.username}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontStyle: 'italic' }}>
                              Unassigned
                            </Typography>
                          )}

                          <Box>
                            {assignedStaff ? (
                                <Tooltip title="Unassign Staff">
                                    <IconButton 
                                        size="small" 
                                        color="error"
                                        onClick={() => unassignOfficerMutation.mutate(assignedStaff.id)}
                                        sx={{ ml: 1 }}
                                    >
                                        <Unlink size={16} />
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                <Button 
                                    size="small" 
                                    startIcon={<UserPlus size={14} />} 
                                    onClick={() => setSelectedBoothForOfficer(b)}
                                    sx={{ textTransform: 'none', fontWeight: 700 }}
                                >
                                    Assign Booth Officer
                                </Button>
                            )}
                          </Box>
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Voting Machines</Typography>
                    {machineLimit != null && (
                      <Typography variant="caption" sx={{ color: (machines?.length ?? 0) >= machineLimit ? 'error.main' : 'text.secondary', fontWeight: 700 }}>
                        {machines?.length ?? 0} / {machineLimit} used
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {machines?.length > 0 && (
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small" 
                        startIcon={<Trash2 size={18} />} 
                        onClick={() => setOpenDeleteAllMachines(true)}
                      >
                        Delete All
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Plus size={18} />}
                      onClick={() => setOpenMachine(true)}
                      disabled={machineLimit != null && (machines?.length ?? 0) >= machineLimit}
                    >
                      Add Machine
                    </Button>
                  </Box>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.08) }}>
                        <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Machine Name</TableCell>
                        <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Code</TableCell>
                        <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Booth</TableCell>
                        <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Status</TableCell>
                        <TableCell align="right" sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {machinesLoading ? (
                        <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={20} /></TableCell></TableRow>
                      ) : machines?.length === 0 ? (
                        <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}>No machines registered</TableCell></TableRow>
                      ) : machines?.map((m: any) => (
                        <TableRow key={m.id}>
                          <TableCell sx={{ fontWeight: 600 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 1,
                                bgcolor: '#ffffff',
                                border: '1.5px solid',
                                borderColor: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                overflow: 'hidden',
                                p: 0.25
                              }}>
                                <Box
                                  component="img"
                                  src={evmIcon}
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                  }}
                                />
                              </Box>
                              {m.machine_name}
                            </Box>
                          </TableCell>
                          <TableCell><code style={{ color: '#d32f2f' }}>{m.machine_code}</code></TableCell>
                          <TableCell>Booth #{m.booth_number || m.booth_id}</TableCell>
                          <TableCell>
                            <Chip label={m.status} size="small" color={m.status === 'FREE' ? 'success' : 'warning'} />
                          </TableCell>
                          <TableCell align="right">
                            {m.device_fingerprint && (
                              <Tooltip title="Reset Hardware Binding (Clear Device Lock)">
                                <IconButton 
                                  size="small" 
                                  color="warning" 
                                  onClick={() => resetBindingMutation.mutate(m.id)}
                                  disabled={resetBindingMutation.isPending}
                                >
                                  <Unlink size={16} />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Edit Machine">
                              <IconButton size="small" onClick={() => { setEditingMachine(m); setMachineForm({ machine_name: m.machine_name, booth_id: m.booth_id }); }}>
                                <Edit size={16} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Machine">
                              <IconButton size="small" color="error" onClick={() => setOpenDeleteMachine(m)}>
                                <Trash2 size={16} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box sx={{ mt: 3.5 }}>
                  <Alert 
                    severity="info" 
                    icon={<Monitor size={22} />}
                    sx={{ 
                      borderRadius: 2, 
                      bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.02)',
                      border: '1px solid rgba(99, 102, 241, 0.15)'
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                      ⚙️ Quick Guide: Setting up a Voting Terminal (EVM)
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ color: 'text.secondary', pl: 0.5 }}>
                      <ol style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.6 }}>
                        <li style={{ marginBottom: '6px' }}>
                          On the terminal device (tablet, PC, etc.), open a browser and go to the terminal setup URL: 
                          <code style={{ marginLeft: '4px', padding: '2px 6px', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '4px', fontWeight: 600 }}>
                            {window.location.origin}/terminal
                          </code>
                        </li>
                        <li style={{ marginBottom: '6px' }}>
                          Enter the unique <strong>Machine Code</strong> (e.g. <code>VM-B1-xxxx</code>) generated in the table above for this machine.
                        </li>
                        <li>
                          The device will lock and bind to that machine configuration. To migrate/setup a different device, click the <strong>Reset Hardware Binding (Unlink Icon)</strong> in the actions column above to unlock the code, then register it on the new device.
                        </li>
                      </ol>
                    </Typography>
                  </Alert>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Box>
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
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8 }}><CircularProgress size={32} /></TableCell></TableRow>
                ) : officers?.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 10 }}>
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
                        const elec = elections?.find((e: any) => e.id === elecId);
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
                          <IconButton color="error" size="small" onClick={() => setOpenDeleteOfficer(o)}><Trash2 size={18} /></IconButton>
                        </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Dialogs */}
      <Dialog open={openBooth || !!editingBooth} onClose={() => { setOpenBooth(false); setEditingBooth(null); setDialogError(null); setBoothForm({ booth_number: '', booth_name: '', location: '', capacity: '' }); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingBooth ? 'Edit Polling Booth' : 'Create Polling Booth'}</DialogTitle>
        <DialogContent>
          {dialogError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{dialogError}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField 
                label="Booth Number" 
                fullWidth 
                placeholder="e.g. 1"
                value={boothForm.booth_number} 
                onChange={e => setBoothForm(p => ({ ...p, booth_number: e.target.value }))} 
            />
            <TextField 
                label="Booth Name (Optional)" 
                fullWidth 
                placeholder="e.g. Computer Lab, Main Hall"
                value={boothForm.booth_name} 
                onChange={e => setBoothForm(p => ({ ...p, booth_name: e.target.value }))} 
            />
            <TextField 
                label="Location / Room" 
                fullWidth 
                placeholder="e.g. Library"
                value={boothForm.location} 
                onChange={e => setBoothForm(p => ({ ...p, location: e.target.value }))} 
            />
            <TextField 
                label="Capacity (Optional)" 
                type="number"
                fullWidth 
                value={boothForm.capacity} 
                onChange={e => setBoothForm(p => ({ ...p, capacity: e.target.value }))} 
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => { setOpenBooth(false); setEditingBooth(null); setBoothForm({ booth_number: '', booth_name: '', location: '', capacity: '' }); }}>Cancel</Button>
            <Button variant="contained" onClick={() => {
                const isDuplicate = booths?.some((b: any) => String(b.booth_number) === String(boothForm.booth_number) && (!editingBooth || b.id !== editingBooth.id));
                if (isDuplicate) {
                   setDialogError(`Booth #${boothForm.booth_number} already exists!`);
                   return;
                }
                editingBooth ? updateBoothMutation.mutate(boothForm) : createBoothMutation.mutate(boothForm);
            }}>
                {editingBooth ? 'Save Changes' : 'Create Booth'}
            </Button>
        </DialogActions>
      </Dialog>

      {/* Machine Create/Edit Dialog */}
      <Dialog open={openMachine || !!editingMachine} onClose={() => { setOpenMachine(false); setEditingMachine(null); setDialogError(null); setMachineForm({ machine_name: '', booth_id: '' }); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingMachine ? 'Edit Voting Machine' : 'Register Voting Machine'}</DialogTitle>
        <DialogContent>
          {dialogError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{dialogError}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
             <FormControl fullWidth>
                <InputLabel>Assign to Booth</InputLabel>
                <Select value={machineForm.booth_id} label="Assign to Booth" onChange={e => setMachineForm(p => ({ ...p, booth_id: e.target.value as string }))}>
                  {booths?.map((b: any) => <MenuItem key={b.id} value={b.id}>Booth #{b.booth_number} - {b.location}</MenuItem>)}
                </Select>
              </FormControl>
            <TextField label="Machine Name" fullWidth value={machineForm.machine_name} onChange={e => setMachineForm(p => ({ ...p, machine_name: e.target.value }))} placeholder="e.g. Primary Tab 1" />
            {!editingMachine && (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Machine Code will be securely auto-generated using the assigned Booth Number as a prefix (e.g. VM-B2-xxxx).
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => { setOpenMachine(false); setEditingMachine(null); setMachineForm({ machine_name: '', booth_id: '' }); }}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            editingMachine ? updateMachineMutation.mutate(machineForm) : createMachineMutation.mutate(machineForm)
          }}>
            {editingMachine ? 'Save Changes' : 'Register'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Machine Confirmation */}
      <Dialog open={!!openDeleteMachine} onClose={() => { setOpenDeleteMachine(null); setDialogError(null); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Delete Voting Machine?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to delete <strong>{openDeleteMachine?.machine_name} ({openDeleteMachine?.machine_code})</strong>?
          </Typography>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            This will permanently remove the machine from the configuration. This action cannot be undone.
          </Alert>
          {dialogError && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{dialogError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDeleteMachine(null)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            disabled={deleteMachineMutation.isPending}
            onClick={() => deleteMachineMutation.mutate(openDeleteMachine.id)}
          >
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>

       <Dialog open={!!selectedBoothForOfficer} onClose={() => { setSelectedBoothForOfficer(null); setDialogError(null); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Assign Booth Officer to Booth #{selectedBoothForOfficer?.booth_number}</DialogTitle>
        <DialogContent>
          {dialogError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{dialogError}</Alert>}
          <Box sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Select Officer from Pool</InputLabel>
              <Select value={selectedOfficer} label="Select Officer from Pool" onChange={e => setSelectedOfficer(e.target.value)}>
                {officers?.map((o: any) => (
                  <MenuItem key={o.id} value={o.id} disabled={!!o.booth_id}>
                    {o.username} {o.booth_id ? `(Assigned to Booth #${booths?.find((b: any) => b.id === o.booth_id)?.booth_number || o.booth_id})` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setSelectedBoothForOfficer(null)}>Cancel</Button>
          <Button variant="contained" 
            disabled={!selectedOfficer || assignOfficerMutation.isPending}
            onClick={() => assignOfficerMutation.mutate({ user_id: selectedOfficer, booth_id: selectedBoothForOfficer?.id })}>
            Assign Booth Officer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!openDelete} onClose={() => { setOpenDelete(null); setDialogError(null); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Delete Polling Booth?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to delete <strong>Booth #{openDelete?.booth_number}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            This will also remove all voting machines and officer assignments associated with this booth. This action cannot be undone.
          </Alert>
          {dialogError && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{dialogError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDelete(null)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            disabled={deleteBoothMutation.isPending}
            onClick={() => deleteBoothMutation.mutate(openDelete.id)}
          >
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete All Machines Confirmation */}
      <Dialog open={openDeleteAllMachines} onClose={() => setOpenDeleteAllMachines(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Delete ALL Voting Machines?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to delete <strong>EVERY</strong> voting machine in your school? 
            This will disconnect all active terminals.
          </Typography>
          <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
            This action is permanent and cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDeleteAllMachines(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            disabled={bulkDeleteMachinesMutation.isPending}
            onClick={() => bulkDeleteMachinesMutation.mutate()}
          >
            Yes, Delete All
          </Button>
        </DialogActions>
      </Dialog>

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
                type={showOfficerPassword ? 'text' : 'password'}
                value={officerForm.password}
                onChange={e => setOfficerForm({ ...officerForm, password: e.target.value })}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowOfficerPassword(!showOfficerPassword)} edge="end">
                        {showOfficerPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
              type={showOfficerPassword ? 'text' : 'password'} 
              fullWidth 
              value={resetForm.password} 
              onChange={e => setResetForm({ password: e.target.value })} 
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowOfficerPassword(!showOfficerPassword)} edge="end">
                      {showOfficerPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
      <Dialog open={!!openDeleteOfficer} onClose={() => setOpenDeleteOfficer(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Remove Officer?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to permanently remove <strong>{openDeleteOfficer?.username}</strong> from the booth officer pool?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenDeleteOfficer(null)}>Cancel</Button>
            <Button 
                variant="contained" 
                color="error" 
                onClick={() => deleteOfficerMutation.mutate(openDeleteOfficer.id)}
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
                   {elections?.filter((e: any) => e.status !== 'CLOSED').map((e: any) => (
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
                   {elections?.filter((e: any) => e.status !== 'CLOSED').length === 0 && (
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

export default Infrastructure;
