import { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  Button, 
  TextField, 
  InputAdornment,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem
} from '@mui/material';
import { Search, UserCheck, Smartphone, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { useAuthStore } from '../../store/authStore';

const BoothOfficerDashboard = () => {
  const [admissionNo, setAdmissionNo] = useState('');
  const [voter, setVoter] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openMachineSelect, setOpenMachineSelect] = useState(false);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch machines for this booth
  const { data: machines, isLoading: machinesLoading } = useQuery({
    queryKey: ['booth-machines', user?.booth_id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/booths/${user?.booth_id}/machines`);
      return res.data;
    },
    enabled: !!user?.booth_id
  });

  const searchVoterMutation = useMutation({
    mutationFn: async (adm: string) => {
      const res = await axiosInstance.get(`/voters/verify/${adm}?booth_id=${user?.booth_id}`);
      return res.data;
    },
    onSuccess: (data) => {
      setVoter(data.voter);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Voter not found or ineligible');
      setVoter(null);
    }
  });

  const assignMachineMutation = useMutation({
    mutationFn: async (machineId: number) => {
      return await axiosInstance.post(`/voters/assign-machine`, {
        voter_id: voter.id,
        machine_id: machineId
      });
    },
    onSuccess: () => {
      setSuccess(`Voter ${voter.name} assigned to machine successfully!`);
      setVoter(null);
      setAdmissionNo('');
      setOpenMachineSelect(false);
      queryClient.invalidateQueries({ queryKey: ['booth-machines'] });
      setTimeout(() => setSuccess(null), 5000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error assigning machine');
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admissionNo) return;
    searchVoterMutation.mutate(admissionNo);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {user?.school_name || 'Booth Operations'}
        </Typography>
        <Typography color="text.secondary" variant="body1" sx={{ fontWeight: 500 }}>
           {user?.username} • Booth ID: {user?.booth_id}
        </Typography>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Voter Verification
            </Typography>
            <form onSubmit={handleSearch}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField 
                  fullWidth
                  placeholder="Enter Student Admission Number (e.g. ADM1001)"
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value.toUpperCase())}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={20} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button 
                  variant="contained" 
                  size="large" 
                  type="submit"
                  disabled={searchVoterMutation.isPending}
                >
                  {searchVoterMutation.isPending ? <CircularProgress size={24} /> : 'Verify'}
                </Button>
              </Box>
            </form>

            {voter && (
              <Box sx={{ mt: 4, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                    {voter.name?.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{voter.name}</Typography>
                    <Typography color="text.secondary">{voter.admission_no} • {voter.class_name}</Typography>
                  </Box>
                  <Chip 
                    icon={voter.has_voted ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    label={voter.has_voted ? "ALREADY VOTED" : "ELIGIBLE"} 
                    color={voter.has_voted ? "error" : "success"}
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
                <Divider />
                {!voter.has_voted && (
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="contained" 
                      color="success" 
                      size="large"
                      startIcon={<UserCheck size={20} />}
                      onClick={() => setOpenMachineSelect(true)}
                    >
                      Process Voting
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 4, borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Voting Machines
              </Typography>
              <Chip label={`${machines?.length || 0} Connected`} size="small" />
            </Box>

            {machinesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : machines?.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                No voting machines assigned to this booth
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {machines?.map((machine: any) => (
                  <Grid size={12} key={machine.id}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        borderColor: machine.status === 'FREE' ? 'success.light' : machine.status === 'BUSY' ? 'warning.light' : 'divider'
                      }}
                    >
                      <Smartphone size={24} color={machine.status === 'FREE' ? '#4caf50' : '#ff9800'} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{machine.machine_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{machine.machine_code}</Typography>
                      </Box>
                      <Chip 
                        label={machine.status} 
                        size="small" 
                        color={machine.status === 'FREE' ? 'success' : machine.status === 'BUSY' ? 'warning' : 'default'}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Machine Selection Dialog */}
      <Dialog open={openMachineSelect} onClose={() => setOpenMachineSelect(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Select Voting Machine</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Assign <b>{voter?.name}</b> to an available machine to start the secret ballot.
          </Typography>
          <List>
            {machines?.filter((m: any) => m.status === 'FREE').length === 0 ? (
              <Alert severity="warning">All machines are currently busy</Alert>
            ) : machines?.filter((m: any) => m.status === 'FREE').map((m: any) => (
              <ListItem key={m.id} disablePadding sx={{ mb: 1 }}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  onClick={() => assignMachineMutation.mutate(m.id)}
                  disabled={assignMachineMutation.isPending}
                  startIcon={<Smartphone size={18} />}
                  sx={{ justifyContent: 'space-between', px: 3, py: 1.5, borderRadius: 2 }}
                >
                  {m.machine_name}
                  <ArrowRight size={18} />
                </Button>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenMachineSelect(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BoothOfficerDashboard;
