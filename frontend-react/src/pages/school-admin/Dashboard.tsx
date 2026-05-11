import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Skeleton,
  Tooltip
} from '@mui/material';
import { 
  Plus, 
  Vote, 
  Users, 
  UserCheck, 
  Monitor,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const SchoolAdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['school-admin-stats'],
    queryFn: async () => {
      const res = await axiosInstance.get('/elections/get-stats');
      return res.data;
    }
  });

  const { data: elections } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => {
      const res = await axiosInstance.get('/elections/get-elections');
      return res.data || [];
    }
  });

  if (isLoading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Box><Skeleton width={300} height={40} /><Skeleton width={200} height={20} /></Box>
          <Skeleton width={150} height={50} variant="rectangular" sx={{ borderRadius: 2 }} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Card sx={{ p: 2, borderRadius: 3 }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mb: 2 }} />
                <Skeleton width="60%" height={24} sx={{ mb: 1 }} />
                <Skeleton width="40%" height={20} />
              </Card>
            </Grid>
          ))}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3, height: 400, borderRadius: 3 }}>
              <Skeleton width="40%" height={32} sx={{ mb: 3 }} />
              <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, height: 400, borderRadius: 3 }}>
              <Skeleton width="60%" height={32} sx={{ mb: 3 }} />
              <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  const statCards = [
    { title: 'Total Elections', value: stats?.totalElections || 0, icon: <Vote size={24} />, color: '#3f51b5', bg: '/assets/dashboard/bg_blue.png' },
    { title: 'Total Voters', value: stats?.totalVoters || 0, icon: <Users size={24} />, color: '#4caf50', bg: '/assets/dashboard/bg_green.png' },
    { title: 'Total Candidates', value: stats?.totalCandidates || 0, icon: <UserCheck size={24} />, color: '#f50057', bg: '/assets/dashboard/bg_red.png' },
    { title: 'Active Booths', value: stats?.activeBooths || 0, icon: <Monitor size={24} />, color: '#ff9800', bg: '/assets/dashboard/bg_orange.png' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
            {user?.school_name || 'School Dashboard'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5 }}>
            Administration Panel • {user?.username}
          </Typography>
        </Box>
        <Tooltip title={stats?.plan && stats.totalElections >= (stats.plan.custom_max_elections || stats.plan.max_elections) ? "Subscription limit reached" : ""}>
          <span>
            <Button 
              variant="contained" 
              startIcon={<Plus size={20} />}
              onClick={() => navigate('/school-admin/elections')}
              disabled={stats?.plan && stats.totalElections >= (stats.plan.custom_max_elections || stats.plan.max_elections)}
              sx={{ borderRadius: 2, px: 3 }}
            >
              New Election
            </Button>
          </span>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {statCards.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
              color: '#fff',
              border: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: `0 12px 24px -10px ${stat.color}88`,
                '& .card-bg': {
                  transform: 'scale(1.1) rotate(5deg)',
                }
              }
            }}>
              <Box 
                className="card-bg"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${stat.bg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.4,
                  transition: 'transform 0.6s ease',
                  zIndex: 0
                }} 
              />
              <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '12px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                    color: '#fff',
                    display: 'flex',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.5px' }}>
                  {stat.value}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, opacity: 0.9 }}>
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Election Overview
              </Typography>
              <Button 
                endIcon={<ArrowRight size={16} />} 
                onClick={() => navigate('/school-admin/elections')}
              >
                Manage All
              </Button>
            </Box>
            
            {!elections || elections.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Vote size={48} color="lightgray" style={{ marginBottom: '16px' }} />
                <Typography color="text.secondary">
                  No elections created yet
                </Typography>
              </Box>
            ) : (
              <List>
                {elections?.slice(0, 5).map((election: any) => (
                  <ListItem key={election.id} divider sx={{ px: 0, py: 2 }}>
                    <ListItemText 
                      primary={election.name}
                      secondary={election.status === 'DRAFT' || election.status === 'CONFIGURING' ? 'Configuring...' : (election.end_time ? `Ends on ${new Date(election.end_time).toLocaleDateString()}` : 'No end time')}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    <Chip 
                      label={election.status} 
                      color={
                        election.status === 'ACTIVE' ? 'success' : 
                        election.status === 'CONFIGURING' ? 'primary' :
                        election.status === 'READY' ? 'info' :
                        election.status === 'PAUSED' ? 'warning' :
                        election.status === 'CLOSED' ? 'error' : 'default'
                      } 
                      size="small" 
                      sx={{ fontWeight: 700, fontSize: '0.65rem' }} 
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Subscription Plan
              </Typography>
              <Chip 
                label={stats?.plan?.plan_name || 'Free'} 
                size="small" 
                color="primary"
                sx={{ fontWeight: 800, px: 1 }}
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>Voters Usage</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  {stats?.totalVoters} / {stats?.plan?.custom_max_voters || stats?.plan?.max_voters || 0}
                </Typography>
              </Box>
              <Box sx={{ height: 8, bgcolor: 'action.hover', borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ 
                  height: '100%', 
                  width: `${Math.min(100, (stats?.totalVoters / (stats?.plan?.custom_max_voters || stats?.plan?.max_voters || 1)) * 100)}%`,
                  bgcolor: (stats?.totalVoters / (stats?.plan?.custom_max_voters || stats?.plan?.max_voters || 1)) > 0.9 ? 'error.main' : 'primary.main',
                  borderRadius: 4
                }} />
              </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>Elections Usage</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  {stats?.totalElections} / {stats?.plan?.custom_max_elections || stats?.plan?.max_elections || 0}
                </Typography>
              </Box>
              <Box sx={{ height: 8, bgcolor: 'action.hover', borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ 
                  height: '100%', 
                  width: `${Math.min(100, (stats?.totalElections / (stats?.plan?.custom_max_elections || stats?.plan?.max_elections || 1)) * 100)}%`,
                  bgcolor: (stats?.totalElections / (stats?.plan?.custom_max_elections || stats?.plan?.max_elections || 1)) > 0.9 ? 'error.main' : 'primary.main',
                  borderRadius: 4
                }} />
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>Status</Typography>
                <Chip 
                  label={stats?.plan?.subscription_status || 'ACTIVE'} 
                  size="small" 
                  color={stats?.plan?.subscription_status === 'ACTIVE' ? 'success' : 'warning'} 
                  variant="outlined"
                  sx={{ fontWeight: 700, height: 20 }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>Valid Until</Typography>
                <Typography variant="caption" sx={{ fontWeight: 800 }}>
                  {stats?.plan?.subscription_expiry ? new Date(stats.plan.subscription_expiry).toLocaleDateString() : 'Lifetime'}
                </Typography>
              </Box>
            </Box>

            {(stats?.totalVoters / (stats?.plan?.custom_max_voters || stats?.plan?.max_voters || 1)) > 0.8 && (
              <Alert severity="warning" sx={{ mt: 3, borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.75rem' } }}>
                You are approaching your resource limit. Contact support to upgrade.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SchoolAdminDashboard;
