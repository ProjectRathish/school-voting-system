import { useState } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, IconButton, Chip, Alert, FormControlLabel, Switch
} from '@mui/material';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';

const Plans = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    max_voters: 0,
    max_elections: 0,
    max_booths: 0,
    max_machines: 0,
    max_officers: 0,
    price: 0,
    duration_months: 12,
    description: '',
    is_active: 1
  });

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await axiosInstance.get('/plans');
      return res.data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (editPlan) {
        return await axiosInstance.put(`/plans/${editPlan.id}`, data);
      }
      return await axiosInstance.post('/plans', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      handleClose();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await axiosInstance.delete(`/plans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Error deleting plan');
    }
  });

  const handleOpen = (plan?: any) => {
    if (plan) {
      setEditPlan(plan);
      setFormData({
        name: plan.name,
        max_voters: plan.max_voters,
        max_elections: plan.max_elections,
        max_booths: plan.max_booths || 5,
        max_machines: plan.max_machines || 10,
        max_officers: plan.max_officers || 5,
        price: plan.price,
        duration_months: plan.duration_months || 12,
        description: plan.description || '',
        is_active: plan.is_active ?? 1
      });
    } else {
      setEditPlan(null);
      setFormData({
        name: '',
        max_voters: 450,
        max_elections: 1,
        max_booths: 2,
        max_machines: 2,
        max_officers: 2,
        price: 0,
        duration_months: 12,
        description: '',
        is_active: 1
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditPlan(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Subscription Plans</Typography>
          <Typography variant="body2" color="text.secondary">Define packages and resource limits for schools</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Plus size={20} />}
          onClick={() => handleOpen()}
          sx={{ borderRadius: 2 }}
        >
          Create New Plan
        </Button>
      </Box>

      {plans?.length === 0 && !isLoading && (
        <Alert severity="info" sx={{ mb: 3 }}>No plans defined yet. Create your first plan to start assigning them to schools.</Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Plan Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Max Voters</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Max Elections</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Max Booths</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Max Machines</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Max Officers</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Price (INR)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans?.map((plan: any) => (
              <TableRow key={plan.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'primary.lighter', color: 'primary.main' }}>
                      <Package size={18} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>{plan.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{plan.description}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{plan.max_voters}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{plan.max_elections}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{plan.max_booths}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{plan.max_machines}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{plan.max_officers}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>₹{plan.price}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {plan.duration_months >= 12
                    ? `${Math.round(plan.duration_months / 12)} yr${Math.round(plan.duration_months / 12) > 1 ? 's' : ''}`
                    : `${plan.duration_months} month${plan.duration_months > 1 ? 's' : ''}`}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={plan.is_active ? 'Active' : 'Inactive'} 
                    size="small" 
                    color={plan.is_active ? 'success' : 'default'}
                    sx={{ fontWeight: 700 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(plan)} color="primary"><Edit size={18} /></IconButton>
                  <IconButton onClick={() => { if(window.confirm('Delete this plan?')) deleteMutation.mutate(plan.id); }} color="error"><Trash2 size={18} /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{editPlan ? 'Edit Subscription Plan' : 'Create New Plan'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <TextField 
                label="Plan Name" 
                fullWidth 
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Premium Plan"
              />
              <TextField 
                label="Max Voters" 
                type="number" 
                fullWidth 
                required 
                value={formData.max_voters}
                onChange={(e) => setFormData({...formData, max_voters: parseInt(e.target.value)})}
              />
              <TextField 
                label="Max Elections" 
                type="number" 
                fullWidth 
                required 
                value={formData.max_elections}
                onChange={(e) => setFormData({...formData, max_elections: parseInt(e.target.value)})}
              />
              <TextField 
                label="Max Booths" 
                type="number" 
                fullWidth 
                required 
                value={formData.max_booths}
                onChange={(e) => setFormData({...formData, max_booths: parseInt(e.target.value)})}
              />
              <TextField 
                label="Max Machines" 
                type="number" 
                fullWidth 
                required 
                value={formData.max_machines}
                onChange={(e) => setFormData({...formData, max_machines: parseInt(e.target.value)})}
              />
              <TextField 
                label="Max Officers" 
                type="number" 
                fullWidth 
                required 
                value={formData.max_officers}
                onChange={(e) => setFormData({...formData, max_officers: parseInt(e.target.value)})}
              />
              <TextField 
                label="Price (INR)" 
                type="number" 
                fullWidth 
                required 
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
              />
              <TextField 
                label="Duration (Months)" 
                type="number" 
                fullWidth 
                required
                value={formData.duration_months}
                onChange={(e) => setFormData({...formData, duration_months: parseInt(e.target.value)})}
                helperText={`= ${formData.duration_months >= 12 ? (formData.duration_months / 12).toFixed(1) + ' year(s)' : formData.duration_months + ' month(s)'}`}
                inputProps={{ min: 1 }}
              />
              <TextField 
                label="Description" 
                fullWidth 
                multiline 
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active === 1}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked ? 1 : 0})}
                    color="success"
                  />
                }
                label={formData.is_active === 1 ? 'Active (visible to schools)' : 'Inactive (hidden from schools)'}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose} sx={{ fontWeight: 700 }}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              sx={{ fontWeight: 700, borderRadius: 2 }}
              disabled={mutation.isPending}
            >
              {editPlan ? 'Save Changes' : 'Create Plan'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Plans;
