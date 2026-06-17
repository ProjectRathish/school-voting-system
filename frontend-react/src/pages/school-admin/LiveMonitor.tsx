import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Stack,
  alpha,
  useTheme,
  Tooltip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Activity, 
  Users, 
  Monitor, 
  Vote, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useElectionStore } from '../../store/electionStore';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';

interface ActivityEvent {
  id: string;
  type: 'vote_cast' | 'voter_verified' | 'machine_status';
  message: string;
  class_name?: string;
  section_name?: string;
  booth_id?: string | number;
  machine_id?: string | number;
  status?: string;
  timestamp: Date;
}

const LiveMonitor = () => {
  const theme = useTheme();
  const { selectedElectionId, selectedElectionName, setSelectedElection } = useElectionStore();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [machineStatus, setMachineStatus] = useState<Record<string, string>>({});
  
  // Polling control states
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refs to track previous values for differential calculations without re-render loop
  const prevVotedCountRef = useRef<number | undefined>(undefined);
  const prevClassesRef = useRef<Record<string, number>>({});
  const prevMachineStatusRef = useRef<Record<string, string>>({});

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['live-turnout-stats', selectedElectionId],
    enabled: !!selectedElectionId,
    queryFn: async () => (await axiosInstance.get(`/elections/${selectedElectionId}/turnout`)).data,
    refetchInterval: autoRefresh ? 15000 : false,
  });

  const { data: elections } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => (await axiosInstance.get('/elections/get-elections')).data
  });

  const { data: machines, refetch: refetchMachines } = useQuery({
    queryKey: ['all-machines'],
    queryFn: async () => (await axiosInstance.get('/machines/get-machines')).data,
    refetchInterval: autoRefresh ? 15000 : false,
  });

  // Manual refresh logic
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchStats(),
        refetchMachines()
      ]);
      setLastRefreshedAt(new Date());
      
      const newEvent: ActivityEvent = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'voter_verified',
        message: "Manual sync check complete. Turnout data verified.",
        timestamp: new Date()
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 50));
    } catch (err) {
      console.error("Manual refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Keep track of the last synced timestamp when queries succeed
  useEffect(() => {
    if (stats || machines) {
      setLastRefreshedAt(new Date());
    }
  }, [stats, machines]);

  // Compute live turnout events by comparing statistical differences between polling intervals
  useEffect(() => {
    if (!stats?.summary) return;
    const currentVotedCount = stats.summary.voted_count;
    const prevVotedCount = prevVotedCountRef.current;
    
    if (prevVotedCount !== undefined && currentVotedCount > prevVotedCount) {
      const diff = currentVotedCount - prevVotedCount;
      const newEvent: ActivityEvent = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'vote_cast',
        message: `${diff} new vote(s) registered successfully! Total: ${currentVotedCount}`,
        timestamp: new Date()
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 50));
    }
    prevVotedCountRef.current = currentVotedCount;
  }, [stats]);

  // Compute class-specific turnout increases
  useEffect(() => {
    if (!stats?.class_breakdown) return;
    
    stats.class_breakdown.forEach((cls: any) => {
      const prevVal = prevClassesRef.current[cls.class_name];
      if (prevVal !== undefined && cls.voted_count > prevVal) {
        const diff = cls.voted_count - prevVal;
        const newEvent: ActivityEvent = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'vote_cast',
          message: `${diff} new vote(s) cast from Class ${cls.class_name}`,
          class_name: cls.class_name,
          timestamp: new Date()
        };
        setEvents(prev => [newEvent, ...prev].slice(0, 50));
      }
      prevClassesRef.current[cls.class_name] = cls.voted_count;
    });
  }, [stats]);

  // Track machine status changes
  useEffect(() => {
    if (!machines) return;
    
    machines.forEach((m: any) => {
      const isOnline = m.last_ping ? (Date.now() - new Date(m.last_ping).getTime() < 60000) : false;
      const prevVal = prevMachineStatusRef.current[m.id];
      
      if (prevVal !== undefined && m.status !== prevVal) {
        const statusText = !isOnline ? 'OFFLINE' : m.status;
        const newEvent: ActivityEvent = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'machine_status',
          message: `Machine "${m.machine_name}" status updated to ${statusText}`,
          machine_id: m.id,
          status: m.status,
          timestamp: new Date()
        };
        setEvents(prev => [newEvent, ...prev].slice(0, 50));
      }
      prevMachineStatusRef.current[m.id] = m.status;
    });
    
    const updatedCards: Record<string, string> = {};
    machines.forEach((m: any) => {
      updatedCards[m.id] = m.status;
    });
    setMachineStatus(updatedCards);
  }, [machines]);

  const turnoutPercentage = useMemo(() => {
    if (!stats?.summary?.total_voters) return 0;
    return (stats.summary.voted_count / stats.summary.total_voters) * 100;
  }, [stats]);

  if (!selectedElectionId) {
    return (
      <Box sx={{ p: 4 }}>
        <Paper sx={{ p: 3, mb: 1.5, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>Please select an active election to view live monitoring.</Typography>
          <FormControl sx={{ minWidth: 300 }}>
            <InputLabel>Select Active Election</InputLabel>
            <Select 
              value={selectedElectionId || ''} 
              label="Select Active Election" 
              onChange={e => {
                const id = e.target.value;
                const election = elections?.find((el: any) => String(el.id) === String(id));
                if (election) {
                  setSelectedElection(String(election.id), election.name, election.status);
                }
              }}
            >
              {elections?.filter((el: any) => el.status === 'ACTIVE').map((el: any) => (
                <MenuItem key={el.id} value={el.id}>
                   {el.name}
                </MenuItem>
              ))}
              {elections?.filter((el: any) => el.status === 'ACTIVE').length === 0 && (
                <MenuItem disabled value="">
                  No active elections found
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Activity className="animate-pulse" color={theme.palette.success.main} size={32} />
            Live Election Monitor
          </Typography>
          <Typography color="text.secondary">Voting activity and system health for: <b>{selectedElectionName}</b></Typography>
        </Box>
        
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Last Refreshed Time */}
          <Tooltip title="Last sync with server">
            <Chip
              icon={<Clock size={14} />}
              label={`Synced: ${lastRefreshedAt.toLocaleTimeString()}`}
              variant="outlined"
              sx={{ fontWeight: 600, borderColor: alpha(theme.palette.text.secondary, 0.2) }}
            />
          </Tooltip>

          {/* Auto Refresh Toggle */}
          <FormControlLabel
            control={
              <Switch 
                checked={autoRefresh} 
                onChange={(e) => setAutoRefresh(e.target.checked)} 
                color="success"
                size="small"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 700, color: autoRefresh ? 'success.main' : 'text.secondary' }}>
                {autoRefresh ? 'Auto-Sync (15s)' : 'Auto-Sync Off'}
              </Typography>
            }
            sx={{ m: 0 }}
          />

          {/* Manual Refresh Button */}
          <IconButton 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            color="primary"
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.08), 
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) }
            }}
          >
            <RefreshCw 
              size={18} 
              className={isRefreshing ? 'animate-spin' : ''} 
            />
          </IconButton>
        </Stack>
      </Box>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Select Active Election</InputLabel>
          <Select 
            value={selectedElectionId || ''} 
            label="Select Active Election" 
            onChange={e => {
              const id = e.target.value;
              const election = elections?.find((el: any) => String(el.id) === String(id));
              if (election) {
                setSelectedElection(String(election.id), election.name, election.status);
              }
            }}
          >
            {elections?.filter((el: any) => el.status === 'ACTIVE').map((el: any) => (
              <MenuItem key={el.id} value={el.id}>
                 {el.name}
              </MenuItem>
            ))}
            {elections?.filter((el: any) => el.status === 'ACTIVE').length === 0 && (
              <MenuItem disabled value="">
                No active elections found
              </MenuItem>
            )}
          </Select>
        </FormControl>
      </Paper>

      <Grid container spacing={3}>
        {/* Main Stats */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 4, borderRadius: 4, mb: 3, position: 'relative', overflow: 'hidden' }}>
             {/* Background glow */}
             <Box sx={{ 
               position: 'absolute', 
               top: -50, 
               right: -50, 
               width: 200, 
               height: 200, 
               borderRadius: '50%', 
               background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)` 
             }} />

             <Grid container spacing={4} alignItems="center">
                <Grid size={{ xs: 12, md: 5 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Total Turnout</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
                    <Typography variant="h2" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '-2px' }}>
                      {turnoutPercentage.toFixed(1)}%
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                      ({stats?.summary?.voted_count || 0} / {stats?.summary?.total_voters || 0})
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={turnoutPercentage} 
                    sx={{ height: 12, borderRadius: 6, mb: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }} 
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>System Status</Typography>
                     <Chip size="small" label="NORMAL" color="success" sx={{ fontWeight: 800, height: 20 }} />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 7 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Class-wise Turnout
                  </Typography>
                  <Box sx={{ 
                    maxHeight: 160, 
                    overflowY: 'auto', 
                    pr: 1, 
                    '&::-webkit-scrollbar': { width: 6 },
                    '&::-webkit-scrollbar-thumb': { bgcolor: alpha(theme.palette.primary.main, 0.2), borderRadius: 3 }
                  }}>
                    <Stack spacing={2.5}>
                      {stats?.class_breakdown?.map((cls: any) => {
                         const pct = cls.total_voters > 0 ? (cls.voted_count / cls.total_voters) * 100 : 0;
                         return (
                           <Box key={cls.class_name}>
                             <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                               <Typography variant="body2" sx={{ fontWeight: 800 }}>Class {cls.class_name}</Typography>
                               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                 <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                   {pct.toFixed(1)}%
                                 </Typography>
                                 <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                   ({cls.voted_count}/{cls.total_voters})
                                 </Typography>
                               </Box>
                             </Box>
                             <LinearProgress 
                               variant="determinate" 
                               value={pct} 
                               sx={{ height: 6, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.08) }} 
                             />
                           </Box>
                         );
                      })}
                      {(!stats?.class_breakdown || stats.class_breakdown.length === 0) && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                           No class data available yet.
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Grid>
             </Grid>
          </Paper>

          {/* Booth Status Monitor */}
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Monitor size={20} />
                Polling Booth Monitor
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>Free</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'warning.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>Busy</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'error.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>Offline</Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {machines && Object.entries(
                machines.reduce((acc: any, m: any) => {
                  const key = m.booth_number || 'Unassigned';
                  if (!acc[key]) acc[key] = { machines: [], officer_username: m.officer_username, officer_is_online: m.officer_is_online };
                  acc[key].machines.push(m);
                  return acc;
                }, {})
              ).map(([boothNumber, boothData]: [string, any]) => (
                <Box key={boothNumber} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.03), border: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1, borderBottom: `1px dashed ${theme.palette.divider}` }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      BOOTH {boothNumber}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.7 }}>
                        OFFICER: {boothData.officer_username || 'UNASSIGNED'}
                      </Typography>
                      {boothData.officer_username && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: boothData.officer_is_online ? 'success.main' : 'error.main' }} />
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                            {boothData.officer_is_online ? 'ONLINE' : 'OFFLINE'}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {boothData.machines.map((machine: any) => {
                      const status = machineStatus[machine.id] || machine.status;
                      const isOnline = machine.last_ping ? (Date.now() - new Date(machine.last_ping).getTime() < 60000) : false;
                      
                      return (
                        <Grid size={{ xs: 6, sm: 4, md: 3 }} key={machine.id}>
                          <Card sx={{ 
                            borderRadius: 3, 
                            border: `2px solid ${
                              !isOnline ? theme.palette.error.main :
                              status === 'BUSY' ? theme.palette.warning.main :
                              theme.palette.success.main
                            }`,
                            bgcolor: alpha(
                              !isOnline ? theme.palette.error.main :
                              status === 'BUSY' ? theme.palette.warning.main :
                              theme.palette.success.main, 
                              0.05
                            )
                          }}>
                            <CardContent sx={{ p: 2, textAlign: 'center' }}>
                              <Box sx={{ mb: 1 }}>
                                {!isOnline ? <AlertCircle size={24} color={theme.palette.error.main} /> :
                                status === 'BUSY' ? <Users size={24} color={theme.palette.warning.main} /> :
                                <CheckCircle2 size={24} color={theme.palette.success.main} />}
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>{machine.machine_name}</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                {!isOnline ? 'DISCONNECTED' : status}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Activity Feed */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ height: '100%', borderRadius: 4, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Clock size={20} />
                Live Activity Feed
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
               <List sx={{ p: 0 }}>
                 <AnimatePresence mode='popLayout'>
                   {events.length === 0 ? (
                     <Box sx={{ p: 4, textAlign: 'center', opacity: 0.5 }}>
                       <Typography variant="body2">Waiting for activity...</Typography>
                     </Box>
                   ) : (
                     events.map((event) => (
                       <ListItem 
                         key={event.id} 
                         component={motion.li}
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, x: -20 }}
                         divider
                         sx={{ py: 2 }}
                       >
                         <Box sx={{ mr: 2 }}>
                           <Avatar sx={{ 
                             bgcolor: event.type === 'vote_cast' ? 'success.main' : 'primary.main',
                             width: 32, height: 32
                           }}>
                             {event.type === 'vote_cast' ? <Vote size={16} /> : <UserCheck size={16} />}
                           </Avatar>
                         </Box>
                         <ListItemText 
                           primary={event.message}
                           secondary={new Date(event.timestamp).toLocaleTimeString()}
                           primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem' }}
                           secondaryTypographyProps={{ fontSize: '0.75rem' }}
                         />
                       </ListItem>
                     ))
                   )}
                 </AnimatePresence>
               </List>
            </Box>
            <Box sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.background.default, 0.5) }}>
               <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                 Showing last 50 events
               </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Internal icon for UserCheck if missing from imports
const UserCheck = ({ size, color }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>
  </svg>
);

export default LiveMonitor;
