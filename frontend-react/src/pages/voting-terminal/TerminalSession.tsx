import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  CircularProgress, 
  Alert, 
  Card, 
  CardContent, 
  Grid, 
  Avatar, 
  IconButton, 
  useTheme,
  alpha,
  Dialog,
  DialogContent,
  Chip
} from '@mui/material';
import { 
  Vote, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  LogOut,
  Sparkles,
  ShieldCheck,
  SmartphoneIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';
import { useQuery } from '@tanstack/react-query';

const TerminalSession = () => {
  const theme = useTheme();
  const [token, setToken] = useState(localStorage.getItem('terminal_token') || '');
  const [setupToken, setSetupToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Voting State
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<number, number>>({});
  const [isCasting, setIsCasting] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);

  // 1. Verify Machine Status (Polling)
  const { data: machine, refetch: refreshStatus } = useQuery({
    queryKey: ['terminal-status', token],
    queryFn: async () => {
       const res = await axiosInstance.get('/machines/verify', {
          headers: { 'machine-token': token }
       });
       return res.data;
    },
    enabled: !!token,
    refetchInterval: (data: any) => {
       // Poll every 3 seconds if machine is FREE or UNKNOWN
       if (!data) return 3000;
       return data.status === 'FREE' ? 3000 : false;
    }
  });

  // 2. Fetch Ballot Data
  const { data: ballotData, isLoading: ballotLoading, error: ballotError } = useQuery({
    queryKey: ['ballot', token],
    queryFn: async () => {
       const res = await axiosInstance.get('/machines/ballot/fetch', {
          headers: { 'machine-token': token }
       });
       return res.data;
    },
    enabled: !!token && machine?.status === 'BUSY'
  });

  useEffect(() => {
    if (token) {
      setIsInitializing(false);
    } else {
      setIsInitializing(false);
    }
  }, [token]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupToken) return;
    setError(null);
    try {
      await axiosInstance.get('/machines/verify', {
        headers: { 'machine-token': setupToken }
      });
      localStorage.setItem('terminal_token', setupToken);
      setToken(setupToken);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid machine token');
    }
  };

  const handleReset = () => {
    localStorage.removeItem('terminal_token');
    setToken('');
    setSelections({});
    setStep(0);
  };

  const handleCastVote = async () => {
    setIsCasting(true);
    try {
      const votes = Object.entries(selections).map(([postId, candidateId]) => ({
        post_id: parseInt(postId),
        candidate_id: candidateId
      }));
      
      await axiosInstance.post('/machines/vote/cast', { votes }, {
        headers: { 'machine-token': token }
      });
      
      setSuccessDialog(true);
      setSelections({});
      setStep(0);
      setTimeout(() => {
         setSuccessDialog(false);
         refreshStatus();
      }, 5000);

    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cast vote');
    } finally {
      setIsCasting(false);
    }
  };

  if (isInitializing) return (
     <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
     </Box>
  );

  // SETUP SCREEN
  if (!token) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: `radial-gradient(circle at 50% 50%, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${theme.palette.background.default} 100%)` 
      }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Paper sx={{ p: 4, width: 400, borderRadius: 4, textAlign: 'center' }}>
            <Box sx={{ 
              width: 70, height: 70, borderRadius: 3, 
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', mx: 'auto', mb: 3,
              boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
            }}>
              <ShieldCheck size={40} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Terminal Setup</Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Enter the machine registration token to authorize this device as an official EVM terminal.
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

            <form onSubmit={handleSetup}>
              <TextField 
                fullWidth 
                label="Machine Token" 
                placeholder="Enter 64-character token"
                value={setupToken}
                onChange={(e) => setSetupToken(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Button 
                fullWidth 
                variant="contained" 
                size="large" 
                type="submit"
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
              >
                Authorize Device
              </Button>
            </form>
          </Paper>
        </motion.div>
      </Box>
    );
  }

  // IDLE SCREEN
  if (machine?.status === 'FREE') {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 4,
        background: `radial-gradient(circle at 50% 50%, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${theme.palette.background.default} 100%)`
      }}>
        <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
           <IconButton onClick={handleReset} color="error" title="De-register Device">
              <LogOut />
           </IconButton>
        </Box>

        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Box sx={{ 
            width: 120, height: 120, borderRadius: '50%', 
            background: alpha(theme.palette.primary.main, 0.1),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'primary.main', mb: 4
          }}>
            <SmartphoneIcon size={64} />
          </Box>
        </motion.div>

        <Typography variant="h3" sx={{ fontWeight: 900, textAlign: 'center', mb: 2 }}>
           Wating for Voter...
        </Typography>
        <Typography color="text.secondary" variant="h6" sx={{ textAlign: 'center', mb: 6, opacity: 0.7 }}>
           The ballot will automatically load once authorized by the booth officer.
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 4, color: 'success.main' }}>
           <CircularProgress size={20} color="inherit" />
           <Typography sx={{ fontWeight: 700 }}>Connection Active • Terminal: {machine.machine_code}</Typography>
        </Box>
      </Box>
    );
  }

  // BALLOT SCREEN (BUSY)
  const posts = ballotData?.ballot || [];
  const isLastStep = step === posts.length;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ p: 4, background: theme.palette.mode === 'dark' ? '#1e1e28' : '#fff', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ px: 2, py: 1, bgcolor: 'primary.main', borderRadius: 2, color: 'white', display: 'flex', alignItems: 'center' }}>
               <Vote />
            </Box>
            <Box>
               <Typography variant="h6" sx={{ fontWeight: 800 }}>Electronic Voting Terminal</Typography>
               <Typography variant="caption" color="text.secondary">{machine?.machine_code} • {machine?.booth_name || 'Booth Protected'}</Typography>
            </Box>
         </Box>
         {!isLastStep && posts.length > 0 && (
            <Chip 
               label={`Post ${step + 1} of ${posts.length}`} 
               color="primary" 
               sx={{ fontWeight: 800, px: 2 }} 
            />
         )}
      </Box>

      {/* Main Ballot Area */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 4 }}>
         <AnimatePresence mode="wait">
            {ballotLoading ? (
               <Box key="loading" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress size={60} />
               </Box>
            ) : ballotError ? (
               <Box key="error" sx={{ textAlign: 'center', mt: 10 }}>
                  <AlertCircle size={64} color="red" style={{ marginBottom: 16 }} />
                  <Typography variant="h4" color="error" sx={{ fontWeight: 800 }}>Error Loading Ballot</Typography>
                  <Typography color="text.secondary">{String(ballotError)}</Typography>
                  <Button variant="contained" sx={{ mt: 4 }} onClick={() => refreshStatus()}>Retry</Button>
               </Box>
            ) : !isLastStep && posts[step] ? (
               <motion.div 
                  key={posts[step].post_id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  style={{ height: '100%' }}
               >
                  <Typography variant="h4" sx={{ fontWeight: 900, textAlign: 'center', mb: 8, color: 'primary.main' }}>
                     PLEASE SELECT A CANDIDATE FOR:<br />
                     <span style={{ textTransform: 'uppercase' }}>{posts[step].post_name}</span>
                  </Typography>

                  <Grid container spacing={4} sx={{ maxWidth: 1200, mx: 'auto', justifyContent: 'center' }}>
                     {posts[step].candidates.map((c: any) => {
                        const isSelected = selections[posts[step].post_id] === c.candidate_id;
                        return (
                           <Grid item xs={12} sm={6} md={3} key={c.candidate_id}>
                              <Card 
                                 component={motion.div}
                                 whileHover={{ scale: 1.02 }}
                                 whileTap={{ scale: 0.98 }}
                                 onClick={() => setSelections(p => ({ ...p, [posts[step].post_id]: c.candidate_id }))}
                                 sx={{ 
                                    height: '100%',
                                    cursor: 'pointer',
                                    borderRadius: 4,
                                    border: '3px solid',
                                    borderColor: isSelected ? 'primary.main' : 'transparent',
                                    bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                                    boxShadow: isSelected ? theme.shadows[10] : theme.shadows[2],
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    minHeight: 250
                                 }}
                              >
                                 {isSelected && (
                                    <Box sx={{ position: 'absolute', top: 12, right: 12, color: 'primary.main' }}>
                                       <CheckCircle2 size={32} />
                                    </Box>
                                 )}
                                 <CardContent sx={{ textAlign: 'center', p: 4 }}>
                                    <Avatar 
                                       src={c.photo}
                                       sx={{ width: 120, height: 120, mx: 'auto', mb: 3, border: '4px solid white', boxShadow: theme.shadows[3] }}
                                    >
                                       <User size={60} />
                                    </Avatar>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{c.candidate_name}</Typography>
                                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                       <Sparkles size={16} color={theme.palette.secondary.main} />
                                       <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{c.symbol || 'Independent'}</Typography>
                                    </Box>
                                 </CardContent>
                              </Card>
                           </Grid>
                        );
                     })}
                  </Grid>
               </motion.div>
            ) : isLastStep ? (
               <motion.div 
                  key="review"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ maxWidth: 800, marginLeft: 'auto', marginRight: 'auto', paddingBottom: 80 }}
               >
                  <Typography variant="h4" sx={{ fontWeight: 900, textAlign: 'center', mb: 2 }}>REVIEW YOUR VOTES</Typography>
                  <Typography sx={{ textAlign: 'center', color: 'text.secondary', mb: 6 }}>
                     Please verify your selections before final submission.
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                     {posts.map((post: any) => {
                        const sel = selections[post.post_id];
                        const cand = post.candidates.find((c: any) => c.candidate_id === sel);
                        return (
                           <Paper key={post.post_id} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3, borderRadius: 3 }}>
                              <Box sx={{ bgcolor: 'secondary.main', color: 'white', p: 1.5, borderRadius: 2 }}>
                                 <Sparkles />
                              </Box>
                              <Box sx={{ flexGrow: 1 }}>
                                 <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary' }}>{post.post_name}</Typography>
                                 <Typography variant="h6" sx={{ fontWeight: 700 }}>{cand?.candidate_name || 'NOT SELECTED'}</Typography>
                              </Box>
                              {cand ? <CheckCircle2 color="green" /> : <AlertCircle color="red" />}
                           </Paper>
                        );
                     })}
                  </Box>
               </motion.div>
            ) : null}
         </AnimatePresence>
      </Box>

      {/* Footer Controls */}
      <Box sx={{ p: 4, background: theme.palette.mode === 'dark' ? '#1e1e28' : '#fff', borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
         {step > 0 && !isLastStep ? (
            <Button 
               size="large" 
               startIcon={<ArrowLeft />} 
               variant="outlined"
               onClick={() => setStep(s => s - 1)}
               sx={{ px: 4, py: 2, borderRadius: 3, fontWeight: 700 }}
            >
               Previous Post
            </Button>
         ) : isLastStep ? (
            <Button 
               size="large" 
               startIcon={<ArrowLeft />} 
               variant="outlined"
               onClick={() => setStep(posts.length - 1)}
               disabled={isCasting}
               sx={{ px: 4, py: 2, borderRadius: 3, fontWeight: 700 }}
            >
               Change Selections
            </Button>
         ) : <Box />}

         {!isLastStep ? (
            <Button 
               size="large" 
               endIcon={<ArrowRight />} 
               variant="contained"
               onClick={() => setStep(s => s + 1)}
               sx={{ px: 8, py: 2, borderRadius: 3, fontWeight: 700 }}
            >
               Next Post
            </Button>
         ) : (
            <Button 
               size="large" 
               variant="contained" 
               color="success"
               onClick={handleCastVote}
               disabled={isCasting}
               sx={{ 
                  px: 10, py: 2.5, borderRadius: 3, fontWeight: 900, fontSize: '1.2rem',
                  boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)'
               }}
            >
               {isCasting ? <CircularProgress size={28} color="inherit" /> : 'Confirm & Cast Vote'}
            </Button>
         )}
      </Box>

      {/* Success Dialog */}
      <Dialog 
         open={successDialog} 
         disableEscapeKeyDown
         PaperProps={{ sx: { borderRadius: 4, p: 4, textAlign: 'center' } }}
      >
         <DialogContent>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
               <Box sx={{ 
                  width: 100, height: 100, borderRadius: '50%', 
                  bgcolor: 'success.main', color: 'white', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mx: 'auto', mb: 3, boxShadow: '0 10px 30px rgba(76, 175, 80, 0.3)'
               }}>
                  <CheckCircle2 size={64} />
               </Box>
            </motion.div>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>Vote Cast Succesfully!</Typography>
            <Typography color="text.secondary" variant="h6">
               Thank you for participating in the election.<br />
               Your response has been secured.
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 4, opacity: 0.6 }}>
               Terminal will reset automatically in a few seconds...
            </Typography>
         </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TerminalSession;
