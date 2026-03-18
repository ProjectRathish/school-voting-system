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
  TextField,
  Tooltip
} from '@mui/material';
import { Plus, Edit, Trash2, Play, Save, Settings, Search, Pause, Square, CheckSquare, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { Alert, CircularProgress } from '@mui/material';
import { useElectionStore } from '../../store/electionStore';
import { useEffect } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';

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
  const [searchQuery, setSearchQuery] = useState('');

  const queryClient = useQueryClient();
  const { setSelectedElection, selectedElectionId, selectedElectionStatus } = useElectionStore();

  const { data: elections, isLoading } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => {
      const res = await axiosInstance.get('/elections/get-elections');
      return res.data;
    }
  });

  // Auto-sync global store natively but allow manual override
  useEffect(() => {
    if (elections && Array.isArray(elections)) {
      const configElection = elections.find((e: any) => e.status === 'CONFIGURING');
      
      if (configElection && !selectedElectionId) {
        setSelectedElection(String(configElection.id), configElection.name, configElection.status);
      } else if (selectedElectionId) {
        const synced = elections.find((e: any) => String(e.id) === selectedElectionId);
        if (synced && synced.status !== selectedElectionStatus) {
          setSelectedElection(String(synced.id), synced.name, synced.status);
        }
      }
    }
  }, [elections, selectedElectionId, selectedElectionStatus, setSelectedElection]);

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

  const changeStatus = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleConfigure = (election: any) => {
    if (election.status === 'CONFIGURING') {
      changeStatus(election.id, 'DRAFT'); // Toggle off config mode
    } else {
      changeStatus(election.id, 'CONFIGURING');
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

  const filteredElections = elections?.filter((e: any) => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Elections
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search elections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search size={18} style={{ marginRight: 8, color: 'gray' }} />
            }}
          />
          <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => { setError(null); setOpen(true); }}>
            Create Election
          </Button>
        </Box>
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
              <TableRow>
                <TableCell colSpan={5} align="center"><CircularProgress size={24} /></TableCell>
              </TableRow>
            ) : filteredElections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary' }}>
                  {searchQuery ? 'No elections match your search' : 'No elections found. Create one to get started.'}
                </TableCell>
              </TableRow>
            ) : filteredElections.map((election: any) => (
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
                  {/* View/Manage Election Data (Available in all states) */}
                  <Tooltip title="View Election Context (Voters, Classes)">
                    <IconButton color="secondary" onClick={() => setSelectedElection(String(election.id), election.name, election.status)} disabled={updateStatusMutation.isPending}>
                       <Eye size={18} />
                    </IconButton>
                  </Tooltip>

                  {/* Configuration Toggle (Available in DRAFT or CONFIGURING) */}
                  {(election.status === 'DRAFT' || election.status === 'CONFIGURING') && (
                    <Tooltip title={election.status === 'CONFIGURING' ? "Active Configuration" : "Set to Configuration Mode"}>
                      <IconButton 
                        color={election.status === 'CONFIGURING' ? 'primary' : 'default'} 
                        onClick={() => handleConfigure(election)}
                        disabled={updateStatusMutation.isPending}
                      >
                        <Settings size={18} fill={election.status === 'CONFIGURING' ? "currentColor" : "none"} />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Ready Toggle (Available in CONFIGURING) */}
                  {election.status === 'CONFIGURING' && (
                    <Tooltip title="Mark Configuration as Ready">
                      <IconButton color="info" onClick={() => changeStatus(election.id, 'READY')} disabled={updateStatusMutation.isPending}>
                        <CheckSquare size={18} />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Back to Draft (Available in READY) */}
                  {election.status === 'READY' && (
                    <Tooltip title="Unlock Configuration (Back to Draft)">
                      <IconButton color="default" onClick={() => changeStatus(election.id, 'CONFIGURING')} disabled={updateStatusMutation.isPending}>
                        <Settings size={18} />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Start Election (Available in READY or PAUSED) */}
                  {(election.status === 'READY' || election.status === 'PAUSED') && (
                    <Tooltip title="Start Election">
                      <IconButton color="success" onClick={() => changeStatus(election.id, 'ACTIVE')} disabled={updateStatusMutation.isPending}>
                        <Play size={18} />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Pause Election (Available in ACTIVE) */}
                  {election.status === 'ACTIVE' && (
                    <Tooltip title="Pause Election">
                      <IconButton color="warning" onClick={() => changeStatus(election.id, 'PAUSED')} disabled={updateStatusMutation.isPending}>
                        <Pause size={18} />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* End Election (Available in ACTIVE or PAUSED) */}
                  {(election.status === 'ACTIVE' || election.status === 'PAUSED') && (
                    <Tooltip title="End Election Permanently">
                      <IconButton color="error" onClick={() => changeStatus(election.id, 'CLOSED')} disabled={updateStatusMutation.isPending}>
                        <Square size={18} />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Edit Election Specs (Draft, Config, Ready) */}
                  {(election.status === 'DRAFT' || election.status === 'CONFIGURING' || election.status === 'READY') && (
                    <Tooltip title="Edit Details">
                      <IconButton color="primary" onClick={() => handleEditClick(election)} disabled={updateStatusMutation.isPending}>
                        <Edit size={18} />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Delete Election (Not allowed once active/completed) */}
                  {(election.status !== 'ACTIVE' && election.status !== 'CLOSED' && election.status !== 'PAUSED') && (
                    <Tooltip title="Delete Election">
                      <IconButton color="error" onClick={() => setDeleteId(election.id)} disabled={updateStatusMutation.isPending}>
                        <Trash2 size={18} />
                      </IconButton>
                    </Tooltip>
                  )}
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
            <Box sx={{ display: 'flex', gap: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker 
                  label="Start Time" 
                  value={formData.start_time ? dayjs(formData.start_time) : null}
                  onChange={(newValue) => setFormData({ ...formData, start_time: newValue ? newValue.format('YYYY-MM-DDTHH:mm') : '' })}
                  sx={{ width: '100%' }}
                />
                <DateTimePicker 
                  label="End Time" 
                  value={formData.end_time ? dayjs(formData.end_time) : null}
                  onChange={(newValue) => setFormData({ ...formData, end_time: newValue ? newValue.format('YYYY-MM-DDTHH:mm') : '' })}
                  sx={{ width: '100%' }}
                />
              </LocalizationProvider>
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
