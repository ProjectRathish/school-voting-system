import { useState, useEffect } from 'react';
import { 
  Paper, Typography, Box, Grid, Button, TextField, 
  InputAdornment, Chip, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { Search, PlayCircle, Lock, Unlock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { useAuthStore } from '../../store/authStore';
import evmIcon from '../../assets/evm_icon.png';

const BoothOfficerDashboard = () => {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [releaseConfirmOpen, setReleaseConfirmOpen] = useState(false);
  const [machineToRelease, setMachineToRelease] = useState<number | null>(null);

  // The active election is always the first (and only) assigned election
  const selectedElection = user?.election_id || user?.available_elections?.[0]?.id || '';
  const selectedElectionName = user?.available_elections?.find((e: any) => e.id === selectedElection)?.name
    || user?.election_name
    || null;

  // Fetch latest profile to ensure booth/election assignments are current
  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => (await axiosInstance.get('/auth/me')).data,
    refetchInterval: 10000 // Check every 10 seconds for assignment changes
  });

  useEffect(() => {
    if (profile) {
      // If server has different booth/election data, update the store
      if (profile.booth_id !== user?.booth_id || 
          JSON.stringify(profile.available_elections) !== JSON.stringify(user?.available_elections)) {
        updateUser({
          booth_id: profile.booth_id,
          election_id: profile.election_id,
          available_elections: profile.available_elections,
          school_name: profile.school_name,
          school_logo: profile.school_logo,
          school_code: profile.school_code
        });
      }
    }
  }, [profile, user, updateUser]);

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
        machine_id: data.machine_id,
        election_id: selectedElection
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

  const releaseMachineMutation = useMutation({
    mutationFn: async (machineId: number) => {
      return await axiosInstance.post(`/machines/${machineId}/release`);
    },
    onSuccess: () => {
      setSuccessMsg(`Session successfully reset. The terminal is now FREE.`);
      queryClient.invalidateQueries({ queryKey: ['booth-machines'] });
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Error resetting terminal session');
      setTimeout(() => setErrorMsg(null), 7000);
    }
  });

  const handleRelease = (machineId: number) => {
    setMachineToRelease(machineId);
    setReleaseConfirmOpen(true);
  };

  const handleReleaseConfirm = () => {
    if (machineToRelease !== null) {
      setErrorMsg(null);
      setSuccessMsg(null);
      releaseMachineMutation.mutate(machineToRelease);
      setReleaseConfirmOpen(false);
      setMachineToRelease(null);
    }
  };

  const hasBooth = !!user?.booth_id;
  const hasElection = !!selectedElection;

  if (!hasBooth || !hasElection) {
    let errorTitle = "No Active Assignment Found";
    let errorDescription: React.ReactNode = "You haven't been assigned to an active booth or election yet.";

    if (hasBooth && !hasElection) {
      errorTitle = "Election Not Assigned";
      const cleanBoothName = boothCode.toLowerCase().startsWith("booth") ? boothCode : `Booth ${boothCode}`;
      errorDescription = (
        <>
          You are successfully assigned to <strong>{cleanBoothName}{boothLocation ? ` (${boothLocation})` : ''}</strong>, but no active election has been assigned to you yet.
        </>
      );
    } else if (!hasBooth && hasElection) {
      errorTitle = "Booth Assignment Missing";
      errorDescription = `You are assigned to the election "${selectedElectionName || 'Selected Election'}" but no polling booth has been assigned to you yet.`;
    }

    return (
      <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 3, md: 4 } }}>
        <Box sx={{ width: '100%' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
            Booth Control Panel
          </Typography>
          <Paper sx={{ p: { xs: 4, sm: 8 }, textAlign: 'center', borderRadius: 3, mt: 4, bgcolor: 'rgba(255, 152, 0, 0.05)', border: '1px dashed orange' }}>
            <Box component="img" src={evmIcon} sx={{ width: 100, height: 100, mb: 3, opacity: 0.8, filter: 'grayscale(0.5)' }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
              {errorTitle}
            </Typography>
            <Typography color="text.secondary" variant="body1" sx={{ maxWidth: 500, mx: 'auto', mb: 4, fontWeight: 500 }}>
               You are currently logged in as {user?.username}. {errorDescription} Please contact the school administrator to finalize your assignment.
            </Typography>
            <Button variant="outlined" color="primary" onClick={() => window.location.reload()}>
               Check for Assignment
            </Button>
          </Paper>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, md: 3 } }}>
      <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.125rem' } }}>
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

        {/* Active Election Badge */}
        {selectedElectionName ? (
          <Box sx={{ mt: 2, display: 'inline-flex', alignItems: 'center', gap: 1.5, px: 2, py: 1, borderRadius: 2, bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Election:
            </Typography>
            <Chip
              label={selectedElectionName}
              color="primary"
              size="small"
              sx={{ fontWeight: 800, fontSize: '0.82rem', px: 0.5 }}
            />
          </Box>
        ) : null}
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
          <Box component="img" src={evmIcon} sx={{ width: 80, height: 80, mb: 2, opacity: 0.6 }} />
          <Typography color="text.secondary" variant="h6">
            No voting machines are registered to this booth.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {[...(machines || [])].sort((a, b) => {
            return a.machine_name.localeCompare(b.machine_name);
          }).map((machine: any) => {
            const isFree = machine.status === 'FREE';
            
            return (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={machine.id}>
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
                      <Box component="img" src={evmIcon} sx={{ width: 48, height: 48, borderRadius: 1 }} />
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1.1 }}>{machine.machine_name}</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mt: 0.5, letterSpacing: 0.5 }}>{machine.machine_code}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: machine.is_online ? 'success.main' : 'error.main',
                        boxShadow: machine.is_online ? '0 0 8px rgba(76, 175, 80, 0.8)' : 'none',
                        animation: machine.is_online ? 'pulse-green 2s infinite' : 'none',
                        '@keyframes pulse-green': {
                           '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)' },
                           '70%': { transform: 'scale(1)', boxShadow: '0 0 0 10px rgba(76, 175, 80, 0)' },
                           '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' },
                        }
                      }} />
                      <Chip 
                        label={isFree ? 'FREE' : 'BUSY'} 
                        size="small" 
                        color={isFree ? 'success' : 'warning'}
                        icon={isFree ? <Unlock size={14} /> : <Lock size={14} />}
                        sx={{ fontWeight: 800 }}
                      />
                    </Box>
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
                      <Box sx={{ textAlign: 'center', py: 1 }}>
                        <CircularProgress color="warning" size={36} thickness={4} sx={{ mb: 1.5 }} />
                        <Typography variant="h6" color="warning.main" sx={{ fontWeight: 800 }}>
                          Voting Happening...
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, px: 2 }}>
                          A voter is currently using this machine. Please wait until they cast their ballot.
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mt: 1.5 }}>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleRelease(machine.id)}
                            disabled={releaseMachineMutation.isPending}
                            sx={{ 
                              fontWeight: 700, 
                              borderRadius: 1.5, 
                              fontSize: '0.75rem',
                              px: 1.5,
                              py: 0.5,
                              textTransform: 'none'
                            }}
                          >
                            Reset Session
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
      {/* Release Machine Confirmation Dialog */}
      <Dialog 
        open={releaseConfirmOpen} 
        onClose={() => { setReleaseConfirmOpen(false); setMachineToRelease(null); }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Lock size={22} /> Cancel & Reset Active Session?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontWeight: 500, color: 'text.primary', mb: 2 }}>
            Are you sure you want to cancel the active voter session and reset this terminal?
          </DialogContentText>
          <DialogContentText variant="body2" color="text.secondary">
            This will immediately disconnect the voting screen on the terminal. The currently assigned voter will not be able to cast their vote unless they are verified and assigned again.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button 
            onClick={() => { setReleaseConfirmOpen(false); setMachineToRelease(null); }}
            variant="outlined"
            color="inherit"
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Go Back
          </Button>
          <Button 
            onClick={handleReleaseConfirm}
            variant="contained"
            color="error"
            autoFocus
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Yes, Reset Terminal
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
};

export default BoothOfficerDashboard;;
