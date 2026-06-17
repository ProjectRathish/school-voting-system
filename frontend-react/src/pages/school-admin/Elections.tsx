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
  Tooltip,
  alpha
} from '@mui/material';
import { Plus, Edit, Trash2, Play, Save, Settings, Search, Pause, Square, CheckSquare, Eye, EyeOff, Sparkles, BarChart3, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { Alert, CircularProgress, Snackbar } from '@mui/material';
import { useElectionStore } from '../../store/electionStore';
import { useEffect } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode } from 'lucide-react';

const Elections = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    start_time: '',
    end_time: ''
  });
  const [editingElection, setEditingElection] = useState<any>(null);
  const [duplicatingElectionId, setDuplicatingElectionId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmStartId, setConfirmStartId] = useState<number | null>(null);
  const [confirmEndId, setConfirmEndId] = useState<number | null>(null);
  const [confirmCodeInput, setConfirmCodeInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [duplicationOptions, setDuplicationOptions] = useState({
    includeSections: true,
    includeClasses: true,
    includeVoters: false,
    includePosts: true,
    includeCandidates: false
  });

  const queryClient = useQueryClient();
  const { setSelectedElection, selectedElectionId, selectedElectionName, selectedElectionStatus, clearSelection } = useElectionStore();

  const { data: elections, isLoading } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => {
      const res = await axiosInstance.get('/elections/get-elections');
      return res.data;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['school-admin-stats'],
    queryFn: async () => {
      const res = await axiosInstance.get('/elections/get-stats');
      return res.data;
    }
  });



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
      if (editingElection && String(editingElection.id) === selectedElectionId) {
        setSelectedElection(selectedElectionId, formData.name, selectedElectionStatus);
      }
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      queryClient.invalidateQueries({ queryKey: ['school-admin-stats'] });
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
      queryClient.invalidateQueries({ queryKey: ['school-admin-stats'] });
      setTimeout(() => setSuccess(null), 3000);
    }
  });




  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, confirmation_text }: { id: number, status: string, confirmation_text?: string }) => {
      return await axiosInstance.put(`/elections/${id}/status`, { status, confirmation_text });
    },
    onSuccess: (response, variables) => {
      const { status, id } = variables;
      const election = elections?.find((e: any) => e.id === id);
      const name = election?.name || 'Election';

      if (status === 'ACTIVE') {
        setSuccess(`Election "${name}" is now LIVE!`);
        setSelectedElection(String(id), name, status);
      } else if (status === 'CLOSED') {
        setSuccess(`Election "${name}" has been CLOSED permanently.`);
        if (selectedElectionId === String(id)) {
          clearSelection();
        }
      } else if (status === 'CONFIGURING') {
        setSuccess(`Context switched to: ${name}`);
        setSelectedElection(String(id), name, status);
      } else if (status === 'DRAFT') {
        setSuccess(`Election "${name}" set back to Draft.`);
        if (selectedElectionId === String(id)) {
          clearSelection();
        }
      } else {
        setSuccess(`Status updated to ${status}`);
        if (selectedElectionId === String(id)) {
          setSelectedElection(String(id), name, status);
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      queryClient.invalidateQueries({ queryKey: ['active-elections'] });
      queryClient.invalidateQueries({ queryKey: ['school-admin-stats'] });
      setTimeout(() => setSuccess(null), 4000);
    }
  });

  const duplicateElectionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => await axiosInstance.post(`/elections/${id}/duplicate`, data),
    onSuccess: (resp) => {
      setSuccess('Election duplicated successfully!');
      setDuplicatingElectionId(null);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      queryClient.invalidateQueries({ queryKey: ['school-admin-stats'] });
      setTimeout(() => setSuccess(null), 4000);
      
      // Optionally switch context to the new one
      const newId = resp.data.election_id;
      const newName = formData.name || 'Copy of Election';
      setSelectedElection(String(newId), newName, 'DRAFT');
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Duplication failed')
  });

  const handleContextSwitch = (election: any, isClearing: boolean) => {
    if (isClearing) {
      clearSelection();
      setSuccess('Context reverted to latest draft/configuring election');
    } else {
      setSelectedElection(String(election.id), election.name, election.status);
      setSuccess(`Context switched to: ${election.name} (Limited Access Mode)`);
    }
    setTimeout(() => setSuccess(null), 3000);
  };


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

    if (duplicatingElectionId) {
      duplicateElectionMutation.mutate({ 
        id: duplicatingElectionId, 
        data: { ...formData, ...duplicationOptions } 
      });
      return;
    }

    upsertElectionMutation.mutate(formData);
  };

  const handleEditClick = (election: any) => {
    setEditingElection(election);
    setFormData({
      name: election.name,
      start_time: dayjs(election.start_time).format('YYYY-MM-DDTHH:mm'),
      end_time: dayjs(election.end_time).format('YYYY-MM-DDTHH:mm')
    });
    setError(null);
    setOpen(true);
  };

  const changeStatus = (id: number, status: string, confirmation_text?: string) => {
    updateStatusMutation.mutate({ id, status, confirmation_text });
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 4, flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-1px', color: 'text.primary' }}>
            Elections
          </Typography>
          <Typography variant="body2" color="text.secondary">Create and manage your school voting events</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', md: 'auto' }, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            size="small"
            placeholder="Search elections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1, bgcolor: 'background.paper', borderRadius: 2 }}
            InputProps={{
              startAdornment: <Search size={18} style={{ marginRight: 8, color: 'gray' }} />,
              sx: { borderRadius: 2 }
            }}
          />
          <Button 
            variant="contained" 
            startIcon={<Plus size={20} />} 
            onClick={() => { setError(null); setOpen(true); }}
            sx={{ borderRadius: 2, height: { xs: 44, sm: 40 }, px: 3, fontWeight: 700 }}
          >
            Create Election
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          {success}
        </Alert>
      </Snackbar>
      
      {/* Current Context Banner */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex'
      }}>
        <Box sx={{ 
          p: '1.5px', 
          borderRadius: '16px', 
          background: 'linear-gradient(45deg, #6366f1, #a855f7, #f43f5e)',
          boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.4)',
          position: 'relative'
        }}>
          <Box sx={{ 
            px: 3, 
            py: 2, 
            borderRadius: '15px', 
            background: theme => theme.palette.mode === 'dark' ? '#1e1e28' : '#fff',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2.5
          }}>
            <Box sx={{ 
              width: 45, 
              height: 45, 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
            }}>
              <Sparkles size={22} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ 
                color: 'text.secondary', 
                fontWeight: 800, 
                textTransform: 'uppercase', 
                letterSpacing: 1.5,
                fontSize: '0.65rem',
                display: 'block',
                mb: 0.5
              }}>
                {selectedElectionStatus ? `STAGE: ${selectedElectionStatus}` : 'Active Configuration'}
              </Typography>
              <Typography variant="h6" sx={{ 
                fontWeight: 900, 
                color: 'text.primary', 
                lineHeight: 1.1,
                background: 'linear-gradient(45deg, #6366f1, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.25rem'
              }}>
                {selectedElectionName || 'None Selected'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.08) }}>
                <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Election Name</TableCell>
                <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Code</TableCell>
                <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Start Time</TableCell>
                <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>End Time</TableCell>
                <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center"><CircularProgress size={24} /></TableCell>
              </TableRow>
            ) : filteredElections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: 'text.secondary' }}>
                  {searchQuery ? 'No elections match your search' : 'No elections found. Create one to get started.'}
                </TableCell>
              </TableRow>
            ) : filteredElections.map((election: any) => {
              const isSelected = selectedElectionId === String(election.id);
              return (
              <TableRow key={election.id}>
                <TableCell sx={{ fontWeight: 600 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {election.name}
                    {isSelected && (
                      <Chip 
                        label={(election.status === 'ACTIVE' || election.status === 'PAUSED') ? "Configuring with limited access" : "Current Context"} 
                        size="small" 
                        color={(election.status === 'ACTIVE' || election.status === 'PAUSED') ? "warning" : "primary"} 
                        sx={{ height: 20, fontSize: '0.65rem' }} 
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>
                  {election.election_code}
                </TableCell>
                <TableCell>{new Date(election.start_time).toLocaleString()}</TableCell>
                <TableCell>{new Date(election.end_time).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    label={election.status}
                    color={getStatusColor(election.status) as any}
                    size="small"
                    icon={election.status === 'ACTIVE' ? (
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        bgcolor: 'white', 
                        borderRadius: '50%',
                        ml: 1,
                        animation: 'pulse 1.2s infinite ease-in-out',
                        '@keyframes pulse': {
                          '0%': { opacity: 1, transform: 'scale(0.8)', boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.7)' },
                          '70%': { opacity: 0, transform: 'scale(1.5)', boxShadow: '0 0 0 4px rgba(255, 255, 255, 0)' },
                          '100%': { opacity: 0, transform: 'scale(1.5)', boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)' }
                        }
                      }} />
                    ) : undefined}
                    sx={{ 
                      fontWeight: 700,
                      px: 0.5,
                      ...(election.status === 'ACTIVE' && {
                        boxShadow: '0 0 10px rgba(76, 175, 80, 0.3)'
                      })
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'inline-flex', gap: 0.5, alignItems: 'center' }}>
                    {/* View/Manage/Copy Election Data (Available in ACTIVE, PAUSED, or CLOSED states) */}
                    {(election.status === 'ACTIVE' || election.status === 'PAUSED' || election.status === 'CLOSED') && (
                      <>
                        <Tooltip title={isSelected ? (election.status === 'CLOSED' ? "View Results" : "Quit limited access") : (election.status === 'CLOSED' ? "View Results" : "Configure with limited access")}>
                          <IconButton 
                            color={isSelected ? "primary" : "secondary"} 
                            onClick={() => {
                              if (election.status === 'CLOSED') {
                                navigate('/school-admin/results', { state: { electionId: election.id } });
                              } else {
                                handleContextSwitch(election, isSelected);
                              }
                            }}
                            disabled={updateStatusMutation.isPending}
                            sx={{
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              ...(isSelected && election.status !== 'CLOSED' ? {
                                backgroundColor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'primary.dark',
                                  transform: 'scale(1.05)',
                                },
                                boxShadow: '0 0 12px rgba(99, 102, 241, 0.5)',
                              } : {
                                backgroundColor: 'transparent',
                                '&:hover': {
                                  backgroundColor: 'action.hover',
                                },
                                '&:focus': {
                                  outline: 'none',
                                  backgroundColor: 'transparent',
                                }
                              })
                            }}
                          >
                            {election.status === 'CLOSED' ? <BarChart3 size={18} /> : <Eye size={18} />}
                          </IconButton>
                        </Tooltip>


                      </>
                    )}

                    {/* Configuration Toggle (Available in DRAFT or CONFIGURING) */}
                    {(election.status === 'DRAFT' || election.status === 'CONFIGURING') && (
                      <Tooltip title={election.status === 'CONFIGURING' ? "Active Configuration" : "Set to Configuration Mode"}>
                        <IconButton
                          color={(election.status === 'CONFIGURING' && isSelected) ? 'primary' : 'default'}
                          onClick={() => handleConfigure(election)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <Settings size={18} fill={(election.status === 'CONFIGURING' && isSelected) ? "currentColor" : "none"} />
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
                        <IconButton color="success" onClick={() => setConfirmStartId(election.id)} disabled={updateStatusMutation.isPending}>
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

                    {/* End Election (Available ONLY in ACTIVE) */}
                    {election.status === 'ACTIVE' && (
                      <Tooltip title="End Election Permanently">
                        <IconButton color="error" onClick={() => setConfirmEndId(election.id)} disabled={updateStatusMutation.isPending}>
                          <Square size={18} />
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* Edit Election Specs (Draft, Config, Ready) */}
                    {(election.status === 'DRAFT' || election.status === 'CONFIGURING' || election.status === 'READY') && (
                      <>
                        <Tooltip title="Edit Details">
                          <IconButton color="primary" onClick={() => handleEditClick(election)} disabled={updateStatusMutation.isPending}>
                            <Edit size={18} />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}

                    {/* Duplicate Election */}
                    {(election.status !== 'ACTIVE' && election.status !== 'PAUSED') && (
                      <Tooltip title="Duplicate Election">
                        <IconButton 
                          color="info" 
                          onClick={() => {
                            setDuplicatingElectionId(election.id);
                            setFormData({
                              name: `Copy of ${election.name}`,
                              start_time: dayjs(election.start_time).format('YYYY-MM-DDTHH:mm'),
                              end_time: dayjs(election.end_time).format('YYYY-MM-DDTHH:mm')
                            });
                            setOpen(true);
                          }}
                          disabled={updateStatusMutation.isPending || duplicateElectionMutation.isPending}
                        >
                          <Copy size={18} />
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* Delete Election (Not allowed once active) */}
                    {(election.status !== 'ACTIVE' && election.status !== 'PAUSED') && (
                      <Tooltip title="Delete Election">
                        <IconButton color="error" onClick={() => setDeleteId(election.id)} disabled={updateStatusMutation.isPending}>
                          <Trash2 size={18} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );})}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit/Clone Election Dialog */}
      <Dialog 
        open={open} 
        onClose={() => { 
          setOpen(false); 
          setEditingElection(null); 
          setDuplicatingElectionId(null);
          setFormData({ name: '', start_time: '', end_time: '' });
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingElection ? 'Edit Election' : duplicatingElectionId ? 'Duplicate Election' : 'Create New Election'}
        </DialogTitle>
        <DialogContent>
          {!editingElection && stats?.plan && (
            <Alert severity={(stats.totalElections >= (stats.plan.custom_max_elections || stats.plan.max_elections)) ? "error" : "info"} sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Plan Usage: {stats.totalElections} / {stats.plan.custom_max_elections || stats.plan.max_elections} Elections
              </Typography>
              {stats.totalElections >= (stats.plan.custom_max_elections || stats.plan.max_elections) && (
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  You have reached your election limit. Please upgrade your plan or delete an existing election.
                </Typography>
              )}
            </Alert>
          )}
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

            {duplicatingElectionId && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Duplication Options
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Button 
                    variant={duplicationOptions.includeSections ? "contained" : "outlined"} 
                    size="small" 
                    onClick={() => setDuplicationOptions({...duplicationOptions, includeSections: !duplicationOptions.includeSections})}
                    sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                    startIcon={duplicationOptions.includeSections ? <CheckSquare size={16} /> : <Square size={16} />}
                  >
                    Sections
                  </Button>
                  <Button 
                    variant={duplicationOptions.includeClasses ? "contained" : "outlined"} 
                    size="small" 
                    onClick={() => setDuplicationOptions({...duplicationOptions, includeClasses: !duplicationOptions.includeClasses})}
                    sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                    startIcon={duplicationOptions.includeClasses ? <CheckSquare size={16} /> : <Square size={16} />}
                  >
                    Classes
                  </Button>
                  <Button 
                    variant={duplicationOptions.includePosts ? "contained" : "outlined"} 
                    size="small" 
                    onClick={() => setDuplicationOptions({...duplicationOptions, includePosts: !duplicationOptions.includePosts})}
                    sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                    startIcon={duplicationOptions.includePosts ? <CheckSquare size={16} /> : <Square size={16} />}
                  >
                    Positions
                  </Button>
                  <Button 
                    variant={duplicationOptions.includeVoters ? "contained" : "outlined"} 
                    size="small" 
                    onClick={() => setDuplicationOptions({...duplicationOptions, includeVoters: !duplicationOptions.includeVoters})}
                    sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                    startIcon={duplicationOptions.includeVoters ? <CheckSquare size={16} /> : <Square size={16} />}
                  >
                    Voters
                  </Button>
                  <Button 
                    variant={duplicationOptions.includeCandidates ? "contained" : "outlined"} 
                    size="small" 
                    disabled={!duplicationOptions.includeVoters || !duplicationOptions.includePosts}
                    onClick={() => setDuplicationOptions({...duplicationOptions, includeCandidates: !duplicationOptions.includeCandidates})}
                    sx={{ justifyContent: 'flex-start', borderRadius: 2, gridColumn: 'span 2' }}
                    startIcon={duplicationOptions.includeCandidates ? <CheckSquare size={16} /> : <Square size={16} />}
                  >
                    Candidates (Requires Voters & Positions)
                  </Button>
                </Box>
                {!duplicationOptions.includeVoters && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
                    Note: Candidates can only be duplicated if both Voters and Positions are also selected.
                  </Typography>
                )}
              </Box>
            )}


          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => { setOpen(false); setEditingElection(null); setDuplicatingElectionId(null); setFormData({ name: '', start_time: '', end_time: '' }); }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpsert}
            disabled={upsertElectionMutation.isPending || (!editingElection && stats?.plan && stats.totalElections >= (stats.plan.custom_max_elections || stats.plan.max_elections))}
            sx={{ fontWeight: 700 }}
            startIcon={upsertElectionMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <Save size={20} />}
          >
            {upsertElectionMutation.isPending || duplicateElectionMutation.isPending 
              ? (editingElection ? 'Updating...' : duplicatingElectionId ? 'Duplicating...' : 'Creating...') 
              : (editingElection ? 'Update Election' : duplicatingElectionId ? 'Duplicate Election' : 'Create Election')}
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

      {/* Start Confirmation Dialog */}
      <Dialog open={!!confirmStartId} onClose={() => { setConfirmStartId(null); setConfirmCodeInput(''); }}>
        <DialogTitle>Confirm Start Election</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.6 }}>
            Are you sure you want to start this election? Once started, voting will be live. Please ensure all candidates and posts are correctly configured.
          </Typography>
          <Box sx={{ 
            mt: 2, 
            p: 3, 
            bgcolor: 'action.hover', 
            borderRadius: 2, 
            border: '1px solid', 
            borderColor: 'primary.main',
            opacity: 0.9
          }}>
            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>Required Code:</span>
              <Box component="span" sx={{ 
                bgcolor: 'background.paper', 
                px: 1, 
                py: 0.5, 
                borderRadius: 1, 
                border: '1px solid',
                borderColor: 'divider',
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '1rem',
                color: 'primary.main'
              }}>
                {elections?.find((e: any) => e.id === confirmStartId)?.election_code}
              </Box>
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type code to confirm"
              value={confirmCodeInput}
              onChange={(e) => setConfirmCodeInput(e.target.value)}
              autoFocus
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'background.paper'
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => { setConfirmStartId(null); setConfirmCodeInput(''); }}
            sx={{ color: 'text.secondary', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            color="success"
            variant="contained"
            disableElevation
            onClick={() => {
              const election = elections?.find((e: any) => e.id === confirmStartId);
              if (confirmStartId && election && confirmCodeInput === election.election_code) {
                changeStatus(confirmStartId, 'ACTIVE', confirmCodeInput);
                setConfirmStartId(null);
                setConfirmCodeInput('');
              }
            }}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
            disabled={updateStatusMutation.isPending || !confirmCodeInput || confirmCodeInput !== elections?.find((e: any) => e.id === confirmStartId)?.election_code}
          >
            {updateStatusMutation.isPending ? 'Starting...' : 'Start Election'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* End Confirmation Dialog */}
      <Dialog open={!!confirmEndId} onClose={() => { setConfirmEndId(null); setConfirmCodeInput(''); }}>
        <DialogTitle>Confirm End Election</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.6 }}>
            Are you sure you want to permanently end this election? Once closed, no more votes can be cast, and results will be finalized. This action cannot be undone.
          </Typography>
          <Box sx={{ 
            mt: 2, 
            p: 3, 
            bgcolor: 'action.hover', 
            borderRadius: 2, 
            border: '1px solid', 
            borderColor: 'error.main',
            opacity: 0.9
          }}>
            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500, color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>Required Code:</span>
              <Box component="span" sx={{ 
                bgcolor: 'background.paper', 
                px: 1, 
                py: 0.5, 
                borderRadius: 1, 
                border: '1px solid',
                borderColor: 'divider',
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '1rem',
                color: 'error.main'
              }}>
                {elections?.find((e: any) => e.id === confirmEndId)?.election_code}
              </Box>
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type code to confirm"
              value={confirmCodeInput}
              onChange={(e) => setConfirmCodeInput(e.target.value)}
              autoFocus
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'background.paper'
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => { setConfirmEndId(null); setConfirmCodeInput(''); }}
            sx={{ color: 'text.secondary', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            disableElevation
            onClick={() => {
              const election = elections?.find((e: any) => e.id === confirmEndId);
              if (confirmEndId && election && confirmCodeInput === election.election_code) {
                changeStatus(confirmEndId, 'CLOSED', confirmCodeInput);
                setConfirmEndId(null);
                setConfirmCodeInput('');
              }
            }}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
            disabled={updateStatusMutation.isPending || !confirmCodeInput || confirmCodeInput !== elections?.find((e: any) => e.id === confirmEndId)?.election_code}
          >
            {updateStatusMutation.isPending ? 'Ending...' : 'End Election Permanently'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Elections;
