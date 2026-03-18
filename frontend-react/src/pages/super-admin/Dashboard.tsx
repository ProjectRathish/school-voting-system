import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText, 
  Button,
  CircularProgress,
  IconButton
} from '@mui/material';
import { 
  School, 
  HelpCircle, 
  Vote, 
  Clock,
  ArrowRight,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['super-admin-stats'],
    queryFn: async () => {
      const res = await axiosInstance.get('/platform/stats');
      return res.data;
    }
  });

  const { data: recentEnquiries } = useQuery({
    queryKey: ['recent-enquiries'],
    queryFn: async () => {
      const res = await axiosInstance.get('/platform/enquiries?limit=5');
      return res.data?.data || [];
    }
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  const statCards = [
    { title: 'Total Schools', value: stats?.totalSchools || 0, icon: <School size={24} />, color: '#3f51b5' },
    { title: 'Pending Enquiries', value: stats?.pendingEnquiries || 0, icon: <HelpCircle size={24} />, color: '#f50057' },
    { title: 'Active Elections', value: stats?.activeElections || 0, icon: <Vote size={24} />, color: '#4caf50' },
    { title: 'Expiring Soon', value: stats?.expiringSoon || 0, icon: <Clock size={24} />, color: '#ff9800' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Super Admin Dashboard
        </Typography>
        <IconButton onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={20} className={isFetching ? 'animate-spin' : ''} />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {statCards.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
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
                Recent School Enquiries
              </Typography>
              <Button 
                endIcon={<ArrowRight size={16} />} 
                onClick={() => navigate('/super-admin/enquiries')}
              >
                View All
              </Button>
            </Box>
            <List>
              {recentEnquiries && recentEnquiries.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                  No recent enquiries found
                </Typography>
              ) : recentEnquiries?.map((enquiry: any) => (
                <ListItem 
                  key={enquiry.id}
                  divider
                  sx={{ px: 0, py: 2 }}
                >
                  <ListItemText 
                    primary={enquiry.school_name}
                    secondary={`${enquiry.contact_person} • ${new Date(enquiry.created_at).toLocaleDateString()}`}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                  <Box>
                    <Typography variant="caption" sx={{ 
                      px: 1.5, 
                      py: 0.5, 
                      borderRadius: 1, 
                      backgroundColor: enquiry.status === 'PENDING' ? '#fff3e0' : enquiry.status === 'APPROVED' ? '#e8f5e9' : '#ffebee',
                      color: enquiry.status === 'PENDING' ? '#e65100' : enquiry.status === 'APPROVED' ? '#2e7d32' : '#c62828',
                      fontWeight: 600
                    }}>
                      {enquiry.status}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<School size={20} />}
                onClick={() => navigate('/super-admin/schools')}
                sx={{ justifyContent: 'flex-start', py: 1.5 }}
              >
                Manage Schools
              </Button>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<HelpCircle size={20} />}
                onClick={() => navigate('/super-admin/enquiries')}
                sx={{ justifyContent: 'flex-start', py: 1.5 }}
              >
                Process Enquiries
              </Button>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 700, mt: 4, mb: 3 }}>
              Platform Growth
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'primary.main', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <TrendingUp size={24} />
                <Typography variant="subtitle2" fontWeight={700}>Organic Growth</Typography>
              </Box>
              <Typography variant="h3" fontWeight={800}>+12%</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>New registrations this month</Typography>
            </Paper>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SuperAdminDashboard;
