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
  Skeleton
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

  const { data: activeElections } = useQuery({
    queryKey: ['active-elections'],
    queryFn: async () => {
      const res = await axiosInstance.get('/elections/get-elections?status=ACTIVE');
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
    { title: 'Total Elections', value: stats?.totalElections || 0, icon: <Vote size={24} />, color: '#3f51b5' },
    { title: 'Total Voters', value: stats?.totalVoters || 0, icon: <Users size={24} />, color: '#4caf50' },
    { title: 'Total Candidates', value: stats?.totalCandidates || 0, icon: <UserCheck size={24} />, color: '#f50057' },
    { title: 'Active Booths', value: stats?.activeBooths || 0, icon: <Monitor size={24} />, color: '#ff9800' },
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
        <Button 
          variant="contained" 
          startIcon={<Plus size={20} />}
          onClick={() => navigate('/school-admin/elections')}
        >
          New Election
        </Button>
      </Box>

      <Grid container spacing={3}>
        {statCards.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card sx={{ height: '100%', borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    backgroundColor: `${stat.color}15`, 
                    color: stat.color,
                    display: 'flex'
                  }}>
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Active Elections
              </Typography>
              <Button 
                endIcon={<ArrowRight size={16} />} 
                onClick={() => navigate('/school-admin/elections')}
              >
                Manage All
              </Button>
            </Box>
            
            {!activeElections || activeElections.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Vote size={48} color="lightgray" style={{ marginBottom: '16px' }} />
                <Typography color="text.secondary">
                  No active elections at the moment
                </Typography>
              </Box>
            ) : (
              <List>
                {activeElections?.map((election: any) => (
                  <ListItem key={election.id} divider sx={{ px: 0, py: 2 }}>
                    <ListItemText 
                      primary={election.name}
                      secondary={election.end_time ? `Ends on ${new Date(election.end_time).toLocaleString()}` : 'Configuring...'}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    <Chip label="LIVE" color="success" size="small" sx={{ fontWeight: 700 }} />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Quick Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TrendingUp size={20} color="#4caf50" />
                <Typography variant="body2">
                  System health is optimal
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <UserCheck size={20} color="#3f51b5" />
                <Typography variant="body2">
                  Ready to start new elections
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Monitor size={20} color="#ff9800" />
                <Typography variant="body2">
                  Monitor booth connectivity
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SchoolAdminDashboard;
