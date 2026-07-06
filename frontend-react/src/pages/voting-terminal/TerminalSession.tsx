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
  Chip,
  LinearProgress
} from '@mui/material';
import { 
  Search, 
  Smartphone, 
  PlayCircle, 
  Lock, 
  Unlock, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone as SmartphoneIcon, 
  Vote, 
  ShieldCheck, 
  User, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  ChevronRight,
  Circle as CircleIcon,
  Check as CheckIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import ThemeToggle from '../../components/common/ThemeToggle';
import evmIcon from '../../assets/evm_icon.png';

// Simulated BEEP sound for tactile feedback
// EVM characteristic long beep sound
const playBeep = (duration = 0.4, frequency = 880) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime); 
    
    // Fade in/out slightly to prevent harsh pops
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.log("Audio failed", e);
  }
};

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

  // Session timeout (3 minutes = 180s, warning at 30s)
  const SESSION_TIMEOUT = 180;
  const WARNING_THRESHOLD = 30;
  const [sessionCountdown, setSessionCountdown] = useState(SESSION_TIMEOUT);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  const getFullUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = axiosInstance.defaults.baseURL?.replace('/api', '') || '';
    return `${baseUrl}${path}`;
  };

  const handleSelectCandidate = (postId: number, candId: number) => {
     if (selections[postId] === candId) return; // Prevent double-trigger
     
     playBeep(0.3, 880);
     setSelections(prev => ({ ...prev, [postId]: candId }));
     resetInactivityTimer();
     
     // Automatic transition to next post after a short delay (for the beep)
     setTimeout(() => {
        setStep(s => s + 1);
     }, 500);
  };

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
    refetchInterval: 3000
  });

  // 2. Fetch Ballot Data
  const { data: ballotData, isLoading: ballotLoading, error: ballotError } = useQuery({
    queryKey: ['ballot', token, machine?.current_voter_id],
    queryFn: async () => {
       const res = await axiosInstance.get('/machines/ballot/fetch', {
          headers: { 'machine-token': token }
       });
       return res.data;
    },
    enabled: !!token && machine?.status === 'BUSY'
  });

  // Reset selections and step when a new voter session is initialized or machine is FREE
  useEffect(() => {
    setSelections({});
    setStep(0);
    setSessionCountdown(SESSION_TIMEOUT);
    setShowTimeoutWarning(false);
  }, [machine?.current_voter_id, machine?.status]);

  // Session inactivity timeout — only active when machine is BUSY (voter is in session)
  useEffect(() => {
    if (machine?.status !== 'BUSY' || successDialog) return;

    const interval = setInterval(() => {
      setSessionCountdown(prev => {
        if (prev <= 1) {
          // Auto-reset session
          setSelections({});
          setStep(0);
          setShowTimeoutWarning(false);
          clearInterval(interval);
          return SESSION_TIMEOUT;
        }
        if (prev <= WARNING_THRESHOLD && !showTimeoutWarning) {
          setShowTimeoutWarning(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [machine?.status, successDialog, showTimeoutWarning]);

  const resetInactivityTimer = () => {
    setSessionCountdown(SESSION_TIMEOUT);
    setShowTimeoutWarning(false);
  };

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
      
      // Characteristic final cast beep (Long, higher pitch)
      playBeep(2.0, 1000);

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
        {/* Floating Theme Toggle */}
        <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
          <ThemeToggle />
        </Box>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Paper sx={{ p: 5, maxWidth: 500, width: '100%', borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <ShieldCheck size={56} color={theme.palette.primary.main} style={{ marginBottom: 16 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Terminal Setup</Typography>
              <Typography color="text.secondary">Enter the Machine Code to register this device for voting.</Typography>
            </Box>
            
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <form onSubmit={handleSetup}>
              <TextField 
                fullWidth
                label="Machine Code (e.g., VM-B1-1234)"
                variant="outlined"
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
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', position: 'relative' }}>
         {/* Floating Layout Tools */}
         <Box sx={{ position: 'absolute', top: 24, right: 24, display: 'flex', gap: 2 }}>
            <ThemeToggle />
            <IconButton onClick={handleReset} color="error" title="De-register Device" sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}>
               <LogOut />
            </IconButton>
         </Box>

        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Box sx={{ 
            width: 150, height: 150, borderRadius: '50%', 
            background: theme.palette.mode === 'dark' ? '#f5f5f5' : alpha(theme.palette.primary.main, 0.1),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mb: 4, overflow: 'hidden', p: 3
          }}>
            <Box component="img" src={evmIcon} sx={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.9, mixBlendMode: 'multiply' }} />
          </Box>
        </motion.div>

        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h2" sx={{ fontWeight: 900, mb: 0.5, letterSpacing: '-1px' }}>
             {machine.machine_name}
          </Typography>
          {machine.booth_name && (
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 2 }}>
               Booth {machine.booth_name}
            </Typography>
          )}
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 2, color: 'primary.main' }}>
           Waiting for Voter...
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
         
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
           {!isLastStep && posts.length > 0 && (
              <Chip 
                 label={`Post ${step + 1} of ${posts.length}`} 
                 color="primary" 
                 sx={{ fontWeight: 800, px: 2 }} 
              />
           )}
           <ThemeToggle />
         </Box>
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
                   <Typography variant="h5" sx={{ fontWeight: 900, textAlign: 'center', mb: 3, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 2 }}>
                      Ballot: {posts[step].post_name}
                   </Typography>

                   {/* EVM Style Vertical List */}
                   <Box sx={{ maxWidth: 900, mx: 'auto', border: '2px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper', boxShadow: 3 }}>
                      {posts[step].candidates.map((c: any, idx: number) => {
                         const isSelected = selections[posts[step].post_id] === c.candidate_id;
                         return (
                            <Box 
                               key={c.candidate_id}
                               onClick={() => handleSelectCandidate(posts[step].post_id, c.candidate_id)}
                               sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  borderBottom: idx === posts[step].candidates.length - 1 ? 'none' : '2px solid',
                                  borderColor: 'divider',
                                  bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                                  minHeight: { xs: 80, md: 100 }
                               }}
                            >
                               {/* Serial No */}
                               <Box sx={{ width: { xs: 40, md: 60 }, textAlign: 'center', borderRight: '1px solid', borderColor: 'divider', fontWeight: 900, color: 'text.secondary' }}>
                                  {idx + 1}
                               </Box>

                               {/* Candidate Info */}
                               <Box sx={{ flexGrow: 1, px: { xs: 1, md: 3 }, display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar 
                                     src={c.candidate_id === -1 ? undefined : getFullUrl(c.photo)} 
                                     sx={{ width: { xs: 50, md: 70 }, height: { xs: 50, md: 70 }, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: c.candidate_id === -1 ? 'error.main' : undefined }}
                                  >
                                     {c.candidate_id === -1 ? <span style={{ fontSize: 24, fontWeight: 'bold' }}>X</span> : <User />}
                                  </Avatar>
                                  <Box sx={{ flexGrow: 1 }}>
                                     <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1, fontSize: { xs: '1rem', md: '1.25rem' }, color: c.candidate_id === -1 ? 'error.main' : 'inherit' }}>{c.candidate_name}</Typography>
                                     <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mt: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        {c.candidate_id === -1 ? 'NOTA' : (c.symbol_name || 'Independent Candidate')}
                                     </Typography>
                                  </Box>
                                  {/* Actual Symbol Image instead of just text */}
                                  {c.symbol && (
                                     <Box 
                                        component="img" 
                                        src={getFullUrl(c.symbol)} 
                                        alt="Symbol"
                                        sx={{ 
                                           width: { xs: 45, md: 65 }, 
                                           height: { xs: 45, md: 65 }, 
                                           objectFit: 'contain',
                                           filter: theme.palette.mode === 'dark' ? 'brightness(0.9) contrast(1.1)' : 'none'
                                        }} 
                                     />
                                  )}
                               </Box>


                               {/* Lamp Column */}
                               <Box sx={{ width: 40, display: 'flex', justifyContent: 'center' }}>
                                  <Box sx={{ 
                                     width: 16, height: 16, borderRadius: '50%',
                                     bgcolor: isSelected ? '#ff1744' : '#333',
                                     boxShadow: isSelected ? '0 0 10px #ff1744' : 'none',
                                     transition: 'all 0.3s'
                                  }} />
                               </Box>

                               {/* Voting Button Column */}
                               <Box sx={{ width: { xs: 80, md: 120 }, textAlign: 'center', borderLeft: '1px solid', borderColor: 'divider', py: 1, px: 1 }}>
                                  <Box sx={{ 
                                     width: { xs: 50, md: 70 }, height: { xs: 35, md: 45 }, 
                                     bgcolor: '#455a64', borderRadius: 1.5, mx: 'auto',
                                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                                     boxShadow: 'inset 0 4px 0 rgba(255,255,255,0.2), 0 4px 0 #1c313a',
                                     '&:active': { transform: 'translateY(2px)', boxShadow: '0 2px 0 #1c313a' }
                                  }}>
                                     {isSelected && <CheckIcon color="white" size={24} />}
                                  </Box>
                               </Box>
                            </Box>
                         );
                      })}
                   </Box>
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

                  {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 3, fontWeight: 700 }}>{error}</Alert>}

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                     {posts.map((post: any) => {
                        const sel = selections[post.post_id];
                        const cand = post.candidates.find((c: any) => c.candidate_id === sel);
                        return (
                           <Paper key={post.post_id} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3, borderRadius: 3 }}>
                              {cand ? (
                                 <Avatar 
                                    src={cand.candidate_id === -1 ? undefined : getFullUrl(cand.photo)} 
                                    sx={{ width: 60, height: 60, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: cand.candidate_id === -1 ? 'error.main' : undefined }}
                                 >
                                    {cand.candidate_id === -1 ? <span style={{ fontSize: 24, fontWeight: 'bold' }}>X</span> : <User />}
                                 </Avatar>
                              ) : (
                                 <Box sx={{ bgcolor: 'secondary.main', color: 'white', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60 }}>
                                    <Sparkles />
                                 </Box>
                              )}
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
               disabled={!posts[step] || selections[posts[step].post_id] === undefined}
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
               disabled={isCasting || posts.some(p => selections[p.post_id] === undefined)}
               sx={{ 
                  px: 10, py: 2.5, borderRadius: 3, fontWeight: 900, fontSize: '1.2rem',
                  boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)'
               }}
            >
               {isCasting ? <CircularProgress size={28} color="inherit" /> : 'Confirm & Cast Vote'}
            </Button>
         )}
      </Box>

      {/* Session Timeout Warning Dialog */}
      <Dialog
        open={showTimeoutWarning && machine?.status === 'BUSY' && !successDialog}
        disableEscapeKeyDown
        PaperProps={{ sx: { borderRadius: 4, p: 3, textAlign: 'center', minWidth: 340 } }}
      >
        <DialogContent>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: 'warning.main' }}>Session Expiring</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            No activity detected. Session will reset in:
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 900, color: sessionCountdown <= 10 ? 'error.main' : 'warning.main', mb: 2 }}>
            {sessionCountdown}s
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(sessionCountdown / WARNING_THRESHOLD) * 100}
            color={sessionCountdown <= 10 ? 'error' : 'warning'}
            sx={{ borderRadius: 2, height: 8, mb: 3 }}
          />
          <Button
            variant="contained"
            size="large"
            onClick={resetInactivityTimer}
            sx={{ borderRadius: 3, px: 4, fontWeight: 700 }}
          >
            Continue Voting
          </Button>
        </DialogContent>
      </Dialog>

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
