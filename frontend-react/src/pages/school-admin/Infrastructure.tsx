import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress, IconButton, Tooltip,
  Tabs, Tab, Grid, Chip, FormControl, InputLabel, Select, MenuItem,
  InputAdornment,
  List
} from '@mui/material';
import { Plus, Trash2, RefreshCw, Smartphone, Monitor, UserPlus, Unlink, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';

const Infrastructure = () => {
  const [tab, setTab] = useState(0);
  const [selectedElection, setSelectedElection] = useState('');
  const [openOfficer, setOpenOfficer] = useState(false);
  const [openAssign, setOpenAssign] = useState<any>(null); // For which booth we are assigning
  const [officerForm, setOfficerForm] = useState({ username: '', password: '' });
  const [selectedStaff, setSelectedStaff] = useState('');
  const [machineForm, setMachineForm] = useState({ machine_name: '', machine_code: '', booth_id: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [openMachine, setOpenMachine] = useState(false); // Fix missing state
  const queryClient = useQueryClient();

  const { data: elections } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => (await axiosInstance.get('/elections/get-elections')).data
  });

  const { data: booths } = useQuery({
    queryKey: ['booths', selectedElection],
    enabled: !!selectedElection,
    queryFn: async () => (await axiosInstance.get(`/booths/get-booths?election_id=${selectedElection}`)).data
  });

  const { data: officers, isLoading: officersLoading } = useQuery({
    queryKey: ['booth-officers'],
    queryFn: async () => (await axiosInstance.get('/auth/booth-officers')).data?.data || []
  });

  const { data: assignments, refetch: refetchAssignments } = useQuery({
    queryKey: ['assignments', selectedElection],
    enabled: !!selectedElection,
    queryFn: async () => (await axiosInstance.get(`/elections/${selectedElection}/assignments`)).data || []
  });

  const { data: machines, isLoading: machinesLoading } = useQuery({
    queryKey: ['machines', selectedElection],
    enabled: !!selectedElection,
    queryFn: async () => (await axiosInstance.get(`/machines/get-machines?election_id=${selectedElection}`)).data
  });

  const createOfficerMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.post('/auth/create-booth-officer', data),
    onSuccess: () => {
      setSuccess('Staff member added to pool!');
      setOpenOfficer(false);
      setOfficerForm({ username: '', password: '' });
      queryClient.invalidateQueries({ queryKey: ['booth-officers'] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error creating officer')
  });

  const createMachineMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.post('/machines/create', { ...data, election_id: selectedElection }),
    onSuccess: () => {
      setSuccess('Voting machine registered!');
      setOpenMachine(false);
      setMachineForm({ machine_name: '', machine_code: '', booth_id: '' });
      queryClient.invalidateQueries({ queryKey: ['machines', selectedElection] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error creating machine')
  });

  const assignOfficerMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.post(`/elections/${selectedElection}/assign-officer`, data),
    onSuccess: () => {
      setSuccess('Officer assigned successfully!');
      setOpenAssign(null);
      setSelectedStaff('');
      refetchAssignments();
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error assigning officer')
  });

  const unassignOfficerMutation = useMutation({
    mutationFn: (userId: number) => axiosInstance.delete(`/elections/${selectedElection}/unassign-officer/${userId}`),
    onSuccess: () => {
      setSuccess('Officer unassigned.');
      refetchAssignments();
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error removing assignment')
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Infrastructure Management</Typography>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Paper sx={{ mb: 3, borderRadius: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab label="Staff Pool" />
          <Tab label="Booth Assignments & Infrastructure" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => setOpenOfficer(true)}>
              Create Booth Officer
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Assigned Booth</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {officersLoading ? (
                  <TableRow><TableCell colSpan={4} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                ) : officers?.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>No booth officers yet</TableCell></TableRow>
                ) : officers?.map((o: any) => (
                  <TableRow key={o.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{o.username}</TableCell>
                    <TableCell>
                      <Chip 
                        label="Available in Pool" 
                        size="small" 
                        color="success"
                        variant="outlined"
                        icon={<CheckCircle2 size={14} />} 
                      />
                    </TableCell>
                    <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Reset Password">
                        <IconButton color="warning"><RefreshCw size={18} /></IconButton>
                      </Tooltip>
                      <IconButton color="error"><Trash2 size={18} /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Select Election Context</InputLabel>
              <Select value={selectedElection} label="Select Election Context" onChange={e => setSelectedElection(e.target.value)}>
                {elections?.map((el: any) => <MenuItem key={el.id} value={el.id}>{el.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Paper>

          {selectedElection ? (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Polling Booths</Typography>
                    <IconButton color="primary" size="small"><Plus size={20} /></IconButton>
                  </Box>
                  <List>
                    {booths?.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No booths defined</Typography>
                    ) : booths?.map((b: any) => (
                      <Paper key={b.id} variant="outlined" sx={{ p: 2, mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Monitor size={20} color="#3f51b5" />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Booth #{b.booth_number}</Typography>
                          <Typography variant="caption" color="text.secondary">{b.location}</Typography>
                        </Box>
                        <Box>
                          {assignments?.find((a: any) => a.booth_id === b.id) ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip 
                                size="small" 
                                color="primary" 
                                label={assignments.find((a: any) => a.booth_id === b.id).username} 
                              />
                              <IconButton size="small" color="error" 
                                onClick={() => unassignOfficerMutation.mutate(assignments.find((a: any) => a.booth_id === b.id).user_id)}>
                                <Unlink size={16} />
                              </IconButton>
                            </Box>
                          ) : (
                            <Button 
                              size="small" 
                              startIcon={<UserPlus size={16} />} 
                              onClick={() => setOpenAssign(b)}
                            >
                              Assign Staff
                            </Button>
                          )}
                        </Box>
                      </Paper>
                    ))}
                  </List>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Voting Machines</Typography>
                    <Button variant="contained" size="small" startIcon={<Plus size={18} />} onClick={() => setOpenMachine(true)}>
                      Add Machine
                    </Button>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Machine Name</TableCell>
                          <TableCell>Code</TableCell>
                          <TableCell>Booth</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {machinesLoading ? (
                          <TableRow><TableCell colSpan={4} align="center"><CircularProgress size={20} /></TableCell></TableRow>
                        ) : machines?.length === 0 ? (
                          <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}>No machines registered</TableCell></TableRow>
                        ) : machines?.map((m: any) => (
                          <TableRow key={m.id}>
                            <TableCell sx={{ fontWeight: 600 }}>{m.machine_name}</TableCell>
                            <TableCell><code style={{ color: '#d32f2f' }}>{m.machine_code}</code></TableCell>
                            <TableCell>Booth #{m.booth_number || m.booth_id}</TableCell>
                            <TableCell>
                              <Chip label={m.status} size="small" color={m.status === 'FREE' ? 'success' : 'warning'} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
              <Typography color="text.secondary">Select an election to manage booths and machines</Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Dialogs */}
      <Dialog open={openOfficer} onClose={() => setOpenOfficer(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create Booth Officer</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField label="Username" fullWidth value={officerForm.username} onChange={e => setOfficerForm(p => ({ ...p, username: e.target.value }))} />
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
        <DialogActions sx={{ p: 3 }}><Button onClick={() => setOpenOfficer(false)}>Cancel</Button><Button variant="contained" onClick={() => createOfficerMutation.mutate(officerForm)}>Create</Button></DialogActions>
      </Dialog>

      <Dialog open={openMachine} onClose={() => setOpenMachine(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Register Voting Machine</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
             <FormControl fullWidth>
                <InputLabel>Assign to Booth</InputLabel>
                <Select value={machineForm.booth_id} label="Assign to Booth" onChange={e => setMachineForm(p => ({ ...p, booth_id: e.target.value as string }))}>
                  {booths?.map((b: any) => <MenuItem key={b.id} value={b.id}>Booth #{b.booth_number} - {b.location}</MenuItem>)}
                </Select>
              </FormControl>
            <TextField label="Machine Name" fullWidth value={machineForm.machine_name} onChange={e => setMachineForm(p => ({ ...p, machine_name: e.target.value }))} placeholder="e.g. M-01" />
            <TextField label="Machine Unique Code" fullWidth value={machineForm.machine_code} onChange={e => setMachineForm(p => ({ ...p, machine_code: e.target.value }))} placeholder="e.g. MAC-SPE-001" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}><Button onClick={() => setOpenMachine(false)}>Cancel</Button><Button variant="contained" onClick={() => createMachineMutation.mutate(machineForm)}>Register</Button></DialogActions>
      </Dialog>

      <Dialog open={!!openAssign} onClose={() => setOpenAssign(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Assign Staff to Booth #{openAssign?.booth_number}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Select Staff from Pool</InputLabel>
              <Select value={selectedStaff} label="Select Staff from Pool" onChange={e => setSelectedStaff(e.target.value)}>
                {officers?.map((o: any) => (
                  <MenuItem key={o.id} value={o.id} disabled={assignments?.some((a: any) => a.user_id === o.id)}>
                    {o.username} {assignments?.some((a: any) => a.user_id === o.id) ? '(Assigned)' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenAssign(null)}>Cancel</Button>
          <Button variant="contained" 
            disabled={!selectedStaff || assignOfficerMutation.isPending}
            onClick={() => assignOfficerMutation.mutate({ user_id: selectedStaff, booth_id: openAssign?.id })}>
            Assign Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Infrastructure;
