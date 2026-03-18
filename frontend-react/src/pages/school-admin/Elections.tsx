import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { Plus, Edit, Trash2, Play, Save, Settings } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { Alert, CircularProgress } from '@mui/material';
import { useElectionStore } from '../../store/electionStore';
import { useEffect } from 'react';

const Elections = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    start_time: '',
    end_time: ''
  });
  const [editingElection, setEditingElection] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { setSelectedElection, selectedElectionId } = useElectionStore();

  const { data: elections, isLoading } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => {
      const res = await axiosInstance.get('/elections/get-elections');
      return res.data;
    }
  });

  // Auto-sync global store with the election currently in CONFIGURING status
  useEffect(() => {
    if (elections && Array.isArray(elections)) {
      const configElection = elections.find((e: any) => e.status === 'CONFIGURING');
      if (configElection) {
        setSelectedElection(String(configElection.id), configElection.name);
      } else if (!configElection && selectedElectionId) {
         // If no election is CONFIGURING but we have one in store, check if it still exists
         const exists = elections.find((e: any) => String(e.id) === selectedElectionId);
         if (!exists) setSelectedElection(null, null);
      }
    }
  }, [elections, setSelectedElection, selectedElectionId]);

  const upsertElectionMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingElection) {
        return await axiosInstance.put(`/elections/${editingElection.id}`, data);
      }
      return await axiosInstance.post('/elections/create', data);
    },
    onSuccess: () => {
      setSuccess(editingElection ? 'Election updated successfully!' : 'Election created successfully!');
      setOpen(false);
      setEditingElection(null);
      setFormData({ name: '', start_time: '', end_time: '' });
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      setTimeout(() => setSuccess(null), 5000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Operation failed');
    }
  });

  const deleteElectionMutation = useMutation({
    mutationFn: async (id: number) => await axiosInstance.delete(`/elections/${id}`),
    onSuccess: () => {
      setSuccess('Election deleted successfully');
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      setTimeout(() => setSuccess(null), 3000);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      return await axiosInstance.put(`/elections/${id}/status`, { status });
    },
    onSuccess: () => {
      setSuccess('Election status updated');
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      setTimeout(() => setSuccess(null), 3000);
    }
  });



  const handleUpsert = () => {
    setError(null);
    if (!formData.name || !formData.start_time || !formData.end_time) {
      setError('Please fill in all fields');
      return;
    }

    const start = new Date(formData.start_time);
    const end = new Date(formData.end_time);

    if (start >= end) {
      setError('Start date/time must be earlier than the end date/time');
      return;
    }

    upsertElectionMutation.mutate(formData);
  };

  const handleEditClick = (election: any) => {
    setEditingElection(election);
    setFormData({
      name: election.name,
      start_time: new Date(election.start_time).toISOString().slice(0, 16),
      end_time: new Date(election.end_time).toISOString().slice(0, 16)
    });
    setError(null);
    setOpen(true);
  };

  const handlePlayClick = (election: any) => {
    const nextStatus = election.status === 'READY' || election.status === 'PAUSED' ? 'ACTIVE' : 'READY';
    updateStatusMutation.mutate({ id: election.id, status: nextStatus });
  };

  const handleConfigure = (election: any) => {
    if (election.status === 'CONFIGURING') {
      // If already configuring, maybe toggle it off? No, usually keep it.
      // But let's allow setting it back to DRAFT if they want to stop configuring
      updateStatusMutation.mutate({ id: election.id, status: 'DRAFT' });
    } else {
      updateStatusMutation.mutate({ id: election.id, status: 'CONFIGURING' });
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'DRAFT': return 'default';
      case 'CONFIGURING': return 'primary';
      case 'PAUSED': return 'warning';
      case 'CLOSED': return 'error';
      case 'READY': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Elections
        </Typography>
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => { setError(null); setOpen(true); }}>
          Create Election
        </Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Election Name</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} align="center">Loading...</TableCell></TableRow>
            ) : elections?.map((election: any) => (
              <TableRow key={election.id}>
                <TableCell sx={{ fontWeight: 600 }}>{election.name}</TableCell>
                <TableCell>{new Date(election.start_time).toLocaleString()}</TableCell>
                <TableCell>{new Date(election.end_time).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={election.status} 
                    color={getStatusColor(election.status) as any} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    color={election.status === 'CONFIGURING' ? 'primary' : 'default'} 
                    onClick={() => handleConfigure(election)}
                    disabled={updateStatusMutation.isPending}
                    title={election.status === 'CONFIGURING' ? "Active Configuration" : "Set to Configuration Mode"}
                  >
                    <Settings size={18} fill={election.status === 'CONFIGURING' ? "currentColor" : "none"} />
                  </IconButton>
                  <IconButton color="primary" onClick={() => handleEditClick(election)}>
                    <Edit size={18} />
                  </IconButton>
                  <IconButton 
                    color={election.status === 'ACTIVE' ? 'warning' : 'success'} 
                    onClick={() => handlePlayClick(election)}
                    disabled={updateStatusMutation.isPending || election.status === 'CONFIGURING'}
                  >
                    {election.status === 'ACTIVE' ? <Chip label="Pause" size="small" variant="outlined" sx={{ cursor: 'pointer' }} /> : <Play size={18} />}
                  </IconButton>
                  <IconButton color="error" onClick={() => setDeleteId(election.id)}>
                    <Trash2 size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Election Dialog */}
      <Dialog open={open} onClose={() => { setOpen(false); setEditingElection(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingElection ? 'Edit Election' : 'Create New Election'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField 
              label="Election Name" 
              fullWidth 
              placeholder="e.g. Student Council 2025"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              '& input::-webkit-calendar-picker-indicator': {
                filter: theme => theme.palette.mode === 'dark' ? 'invert(1)' : 'brightness(0) opacity(0.6)',
                cursor: 'pointer',
                '&:hover': { opacity: 1 }
              }
            }}>
              <TextField 
                label="Start Time" 
                type="datetime-local" 
                fullWidth 
                InputLabelProps={{ shrink: true }}
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
              <TextField 
                label="End Time" 
                type="datetime-local" 
                fullWidth 
                InputLabelProps={{ shrink: true }}
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </Box>


          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => { setOpen(false); setEditingElection(null); }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUpsert}
            disabled={upsertElectionMutation.isPending}
            startIcon={upsertElectionMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <Save size={20} />}
          >
            {upsertElectionMutation.isPending ? (editingElection ? 'Updating...' : 'Creating...') : (editingElection ? 'Update Election' : 'Create Election')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this election? This action cannot be undone and will delete all associated data (voters, candidates, etc.).
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button 
            color="error" 
            variant="contained" 
            onClick={() => deleteId && deleteElectionMutation.mutate(deleteId)}
            disabled={deleteElectionMutation.isPending}
          >
            {deleteElectionMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Elections;
