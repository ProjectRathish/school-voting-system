import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress, IconButton, Tooltip,
  Grid, Chip, FormControl, InputLabel, Select, MenuItem,
  InputAdornment, Snackbar, alpha
} from '@mui/material';
import { Plus, Trash2, Monitor, UserPlus, Unlink, Sparkles, Edit, Landmark } from 'lucide-react';
import { useElectionStore } from '../../store/electionStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import evmIcon from '../../assets/evm_icon.png';

const Infrastructure = () => {
  const { selectedElectionId, selectedElectionName, selectedElectionStatus } = useElectionStore();
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
  const [boothForm, setBoothForm] = useState({ booth_number: '', location: '', capacity: '100' });
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
      setBoothForm({ booth_number: '', location: '', capacity: '100' });
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
      setBoothForm({ booth_number: '', location: '', capacity: '100' });
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-1px', color: 'text.primary' }}>Infrastructure Management</Typography>
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Manage your school's global polling booths and voting machines. These assets can be used across multiple elections.
        </Typography>
      </Box>

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
                                Booth #{b.booth_number}
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
                                    setBoothForm({ booth_number: String(b.booth_number), location: b.location, capacity: String(b.capacity || 100) });
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
              </Paper>
            </Grid>
          </Grid>
      </Box>

      {/* Dialogs */}
      <Dialog open={openBooth || !!editingBooth} onClose={() => { setOpenBooth(false); setEditingBooth(null); setDialogError(null); setBoothForm({ booth_number: '', location: '', capacity: '100' }); }} maxWidth="xs" fullWidth>
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
            <Button onClick={() => { setOpenBooth(false); setEditingBooth(null); setBoothForm({ booth_number: '', location: '', capacity: '100' }); }}>Cancel</Button>
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
    </Box>
  );
};

export default Infrastructure;
