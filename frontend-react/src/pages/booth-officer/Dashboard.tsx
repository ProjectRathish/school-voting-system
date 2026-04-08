import { useState } from 'react';
import { 
  Paper, Typography, Box, Grid, Button, TextField, 
  InputAdornment, Chip, Alert, CircularProgress 
} from '@mui/material';
import { Search, Smartphone, PlayCircle, Lock, Unlock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { useAuthStore } from '../../store/authStore';

const BoothOfficerDashboard = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch machines with polling every 3 seconds to ensure real-time status updates
  const { data: boothData, isLoading: machinesLoading, error: machinesError } = useQuery({
    queryKey: ['booth-machines', user?.booth_id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/machines/booth/${user?.booth_id}`);
      return res.data;
    },
    enabled: !!user?.booth_id,
    refetchInterval: 3000,
    retry: false
  });

  const machines = boothData?.data || [];
  const boothCode = boothData?.booth_name || `Booth ID: ${user?.booth_id}`;
  const boothLocation = boothData?.booth_location || '';

  const assignMachineMutation = useMutation({
    mutationFn: async (data: { admission_no: string, machine_id: number }) => {
      return await axiosInstance.post(`/polling-booths/assign-voter`, {
        admission_no: data.admission_no,
        machine_id: data.machine_id
      });
    },
    onSuccess: (res, variables) => {
      setSuccessMsg(`Voter successfully assigned to Machine! They may now proceed to vote.`);
      setInputs(prev => ({ ...prev, [variables.machine_id]: '' }));
      queryClient.invalidateQueries({ queryKey: ['booth-machines'] });
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Error assigning voter to machine');
      setTimeout(() => setErrorMsg(null), 7000);
    }
  });

  const handleAssign = (machineId: number) => {
    const admissionNo = inputs[machineId];
    if (!admissionNo) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    assignMachineMutation.mutate({ admission_no: admissionNo.toUpperCase(), machine_id: machineId });
  };

  if (!user?.booth_id) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Booth Control Panel
        </Typography>
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3, mt: 4, bgcolor: 'rgba(255, 152, 0, 0.05)', border: '1px dashed orange' }}>
          <Smartphone size={64} color="orange" style={{ marginBottom: 24, opacity: 0.5 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
            No Active Assignment Found
          </Typography>
          <Typography color="text.secondary" variant="body1" sx={{ maxWidth: 500, mx: 'auto', mb: 4, fontWeight: 500 }}>
             You are currently logged in as {user?.username} but you haven't been assigned to an active election booth yet. 
             Please contact the school administrator to finalize your assignment.
          </Typography>
          <Button variant="outlined" color="primary" onClick={() => window.location.reload()}>
             Check for Assignment
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Booth Control Panel
        </Typography>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: 'primary.main', color: 'primary.contrastText', px: 2, py: 0.5, borderRadius: 2, mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
             Booth {boothCode} {boothLocation ? ` • ${boothLocation}` : ''}
          </Typography>
        </Box>
        <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 500 }}>
           Logged in as {user?.username} • {user?.school_name}
        </Typography>
      </Box>

      {successMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{errorMsg}</Alert>}
      {machinesError && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>Failed to load machines: {String(machinesError)}</Alert>}

      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Connected Voting Machines
        </Typography>
        <Chip label={`${machines?.length || 0} Total Terminals`} color="primary" variant="outlined" />
      </Box>

      {machinesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      ) : machines?.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Smartphone size={48} color="lightgray" style={{ marginBottom: 16 }} />
          <Typography color="text.secondary" variant="h6">
            No voting machines are registered to this booth.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {[...(machines || [])].sort((a, b) => {
            if (a.status === 'BUSY' && b.status !== 'BUSY') return -1;
            if (a.status !== 'BUSY' && b.status === 'BUSY') return 1;
            return a.machine_name.localeCompare(b.machine_name);
          }).map((machine: any) => {
            const isFree = machine.status === 'FREE';
            
            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={machine.id}>
                <Paper 
                  sx={{ 
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                    border: '2px solid',
                    borderColor: isFree ? 'success.main' : 'warning.main',
                    transition: 'all 0.3s ease'
                  }}
                  elevation={isFree ? 4 : 1}
                >
                  <Box sx={{ p: 2, bgcolor: isFree ? 'success.lighter' : 'warning.lighter', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Smartphone size={32} color={isFree ? '#4caf50' : '#ff9800'} />
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1.1 }}>{machine.machine_name}</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mt: 0.5, letterSpacing: 0.5 }}>{machine.machine_code}</Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={isFree ? 'FREE' : 'BUSY'} 
                      size="small" 
                      color={isFree ? 'success' : 'warning'}
                      icon={isFree ? <Unlock size={14} /> : <Lock size={14} />}
                      sx={{ fontWeight: 800 }}
                    />
                  </Box>

                  <Box sx={{ p: 3, minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {isFree ? (
                      <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAssign(machine.id); }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                          Scan or Enter Voter Admission Number:
                        </Typography>
                        <TextField 
                          fullWidth
                          size="medium"
                          placeholder="e.g. ADM1001"
                          value={inputs[machine.id] || ''}
                          onChange={(e) => setInputs(prev => ({ ...prev, [machine.id]: e.target.value }))}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Search size={18} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ mb: 2 }}
                        />
                        <Button 
                          fullWidth 
                          variant="contained" 
                          color="success" 
                          size="large"
                          type="submit"
                          disabled={!inputs[machine.id] || assignMachineMutation.isPending}
                          startIcon={<PlayCircle size={20} />}
                          sx={{ py: 1.2, fontWeight: 700 }}
                        >
                          Verify & Assign Voter
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        <CircularProgress color="warning" size={40} thickness={4} sx={{ mb: 2 }} />
                        <Typography variant="h6" color="warning.main" sx={{ fontWeight: 800 }}>
                          Voting Happening...
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          A voter is currently using this machine. Please wait until they cast their ballot.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default BoothOfficerDashboard;;
