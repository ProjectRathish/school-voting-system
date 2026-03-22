import { useState, useRef, useMemo } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress, IconButton,
  FormControl, InputLabel, Select, MenuItem, Tabs, Tab, InputAdornment,
  Chip, Grid, Tooltip
} from '@mui/material';
import { Plus, Upload, Search, Trash2, Download, Edit, Sparkles, Settings, Lock, Unlock, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { useElectionStore } from '../../store/electionStore';
import { NavLink } from 'react-router-dom';

const Voters = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const { selectedElectionId, selectedElectionName, selectedElectionStatus } = useElectionStore();
  const isConfiguring = selectedElectionStatus === 'DRAFT' || selectedElectionStatus === 'CONFIGURING';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<any>(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const [openBlockConfirm, setOpenBlockConfirm] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [voterToDelete, setVoterToDelete] = useState<any>(null);
  const [voterForm, setVoterForm] = useState({ admission_no: '', name: '', class_id: '', division: '', sex: 'M' });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Removed local elections query as we use global state

  const { data: classes } = useQuery({
    queryKey: ['classes', selectedElectionId],
    enabled: !!selectedElectionId,
    queryFn: async () => (await axiosInstance.get(`/classes/get-classes?election_id=${selectedElectionId}`)).data
  });

  const { data: voters, isLoading } = useQuery({
    queryKey: ['voters', selectedElectionId],
    enabled: !!selectedElectionId,
    queryFn: async () => (await axiosInstance.get(`/voters/get-voters?election_id=${selectedElectionId}`)).data
  });

  const addVoterMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.post('/voters/create', { ...data, election_id: selectedElectionId }),
    onSuccess: () => {
      setSuccess('Voter added successfully!');
      setOpenAdd(false);
      setVoterForm({ admission_no: '', name: '', class_id: '', division: '', sex: 'M' });
      queryClient.invalidateQueries({ queryKey: ['voters'] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['school-admin-stats'] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error adding voter')
  });

  const updateVoterMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.put(`/voters/${selectedVoter?.id}`, data),
    onSuccess: () => {
      setSuccess('Voter details updated!');
      setOpenEdit(false);
      setOpenBlockConfirm(false);
      setSelectedVoter(null);
      queryClient.invalidateQueries({ queryKey: ['voters'] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['school-admin-stats'] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error updating voter')
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!uploadFile) throw new Error('No file selected');
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('election_id', selectedElectionId || '');
      return axiosInstance.post('/voters/upload', formData);
    },
    onSuccess: (response: any) => {
      const data = response.data;
      if (data.errors && data.errors.length > 0) {
        setUploadErrors(data.errors);
        setSuccess(`Import complete with ${data.errors.length} errors. ${data.inserted || 0} voters added.`);
      } else {
        setSuccess(`Import successful! ${data.inserted || 0} voters added.`);
        setOpenUpload(false);
        setUploadFile(null);
        setUploadErrors([]);
      }
      queryClient.invalidateQueries({ queryKey: ['voters'] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['school-admin-stats'] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Upload failed');
      setUploadErrors([]);
    }
  });

  const deleteVoterMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/voters/${id}`),
    onSuccess: () => {
      setSuccess('Voter deleted successfully!');
      setDeleteConfirmOpen(false);
      setVoterToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['voters'] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['school-admin-stats'] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error deleting voter')
  });

  const filteredVoters = useMemo(() => {
    return voters?.filter((v: any) => {
      const matchSearch = !searchQuery || 
        v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.admission_no?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchClass = currentTab === 0 ? true : 
                         currentTab === 1 ? (selectedClass ? v.class_id == selectedClass : true) :
                         true;
      
      return matchSearch && matchClass;
    });
  }, [voters, searchQuery, currentTab, selectedClass]);

  const handleDownloadTemplate = async () => {
    try {
      const resp = await axiosInstance.get(`/voters/download-template?election_id=${selectedElectionId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Voter_Import_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error downloading template');
    }
  };

  const handleDownloadSignatureSheet = async () => {
    try {
      const resp = await axiosInstance.get(`/reports/election/${selectedElectionId}/signature-sheet`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Voter_Signature_Sheets_${selectedElectionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error downloading signature sheet');
    }
  };

  const handleEdit = (voter: any) => {
    setSelectedVoter(voter);
    setVoterForm({
      admission_no: voter.admission_no,
      name: voter.name,
      class_id: voter.class_id || '', // We'll need class_id in the row data now
      division: voter.division || '',
      sex: voter.sex
    });
    setOpenEdit(true);
  };

  const handleExport = () => {
    // Basic CSV export
    const headers = ['Admission No', 'Name', 'Class', 'Division', 'Sex', 'Blocked', 'Voted'];
    const rows = filteredVoters?.map((v: any) => [
      v.admission_no, v.name, v.class_name, v.division || '-', v.sex, v.is_blocked ? 'Yes' : 'No', v.has_voted ? 'Yes' : 'No'
    ]);
    const csvContent = [headers, ...rows!].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `voters_export_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Voter Management</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isConfiguring && (
            <Button variant="outlined" startIcon={<Upload size={20} />} onClick={() => { setError(null); setUploadErrors([]); setOpenUpload(true); }} disabled={!selectedElectionId}>
              Bulk Upload
            </Button>
          )}
          {selectedElectionStatus !== 'CLOSED' && (
            <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => { setError(null); setOpenAdd(true); }} disabled={!selectedElectionId}>
              Add Voter
            </Button>
          )}
        </Box>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}
      {error && !openAdd && !openUpload && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {!isConfiguring && selectedElectionId && selectedElectionStatus !== 'CLOSED' && (
        <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>
          <strong>Configuration Locked:</strong> This election is active or ready. To ensure data integrity, bulk uploading, editing, and deleting voters is restricted. However, you are cleanly permitted to add missing voters individually.
        </Alert>
      )}

      {/* Moved Banner Outside */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex'
      }}>
        <Box sx={{ 
          p: '1.5px', 
          borderRadius: '24px', 
          background: 'linear-gradient(45deg, #6366f1, #a855f7, #f43f5e)',
          boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.4)',
          position: 'relative'
        }}>
          <Box sx={{ 
            px: 3, 
            py: 2, 
            borderRadius: '23px', 
            background: theme => theme.palette.mode === 'dark' ? '#1e1e28' : '#fff',
            display: 'flex',
            alignItems: 'center',
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

      <Paper sx={{ mb: 3, borderRadius: 3 }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search name or admission number..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button fullWidth variant="outlined" startIcon={<Download size={18} />} onClick={handleExport} disabled={!filteredVoters?.length} sx={{ height: '56px' }}>
                  Export CSV
                </Button>
                <Button fullWidth variant="contained" color="secondary" startIcon={<Download size={18} />} onClick={handleDownloadSignatureSheet} disabled={!voters?.length} sx={{ height: '56px' }}>
                  Signature Sheet (PDF)
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)} sx={{ px: 2 }}>
          <Tab label="All Voters" />
          <Tab label="Filter by Class" />
        </Tabs>

        {currentTab === 1 && (
          <Box sx={{ p: 2, backgroundColor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Select Class</InputLabel>
              <Select value={selectedClass} label="Select Class" onChange={e => setSelectedClass(e.target.value)}>
                <MenuItem value="">All Classes</MenuItem>
                {classes?.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        )}
      </Paper>

      {selectedElectionId ? (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Admission No</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Class</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Division</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Gender</TableCell>
                {!isConfiguring && <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>}
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8 }}><CircularProgress size={32} /></TableCell></TableRow>
              ) : filteredVoters?.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8, color: 'text.secondary' }}>No voters found</TableCell></TableRow>
              ) : filteredVoters?.map((v: any) => (
                <TableRow key={v.id} hover>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {v.admission_no}
                      {v.is_blocked === 1 && (
                        <Chip label="BLOCKED" size="small" color="error" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, borderRadius: 1 }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{v.name}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{v.class_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{v.section_name}</Typography>
                  </TableCell>
                  <TableCell>
                    {v.division ? <Chip label={v.division} size="small" variant="filled" color="primary" sx={{ borderRadius: 1.5, fontWeight: 700 }} /> : <Typography variant="caption" color="text.disabled">N/A</Typography>}
                  </TableCell>
                  <TableCell>
                    <Chip label={v.sex === 'M' ? 'Male' : 'Female'} size="small" variant="outlined"
                      color={v.sex === 'M' ? 'info' : 'secondary'} />
                  </TableCell>
                   {!isConfiguring && (
                    <TableCell>
                      {v.is_blocked ? (
                        <Chip label="Blocked" size="small" color="error" variant="filled" icon={<ShieldAlert size={14} />} />
                      ) : v.has_voted ? (
                        <Chip label="Voted" size="small" color="success" variant="filled" />
                      ) : (
                        <Chip label="Ready" size="small" color="primary" variant="outlined" />
                      )}
                    </TableCell>
                  )}
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title={v.is_blocked ? "Unblock Voter" : "Block Voter"}>
                          <IconButton 
                            onClick={() => {
                              setSelectedVoter(v);
                              setOpenBlockConfirm(true);
                            }} 
                            color={v.is_blocked ? "success" : "warning"} 
                            size="small"
                          >
                            {v.is_blocked ? <Unlock size={16} /> : <Lock size={16} />}
                          </IconButton>
                        </Tooltip>
                        {isConfiguring && (
                          <>
                            <Tooltip title="Edit Voter">
                              <IconButton onClick={() => handleEdit(v)} color="primary" size="small">
                                <Edit size={16} />
                              </IconButton>
                            </Tooltip>
                             <Tooltip title="Delete Voter">
                               <IconButton onClick={() => {
                                 setVoterToDelete(v);
                                 setDeleteConfirmOpen(true);
                               }} color="error" size="small">
                                 <Trash2 size={16} />
                               </IconButton>
                             </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
          <Settings size={48} color="lightgray" style={{ marginBottom: '16px' }} />
          <Typography variant="h6" sx={{ mb: 1 }}>No Election Selected for Configuration</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Please go to the Elections page and set an election to "Configuration Mode"
          </Typography>
          <Button variant="contained" component={NavLink} to="/school-admin/elections">
            Go to Elections
          </Button>
        </Paper>
      )}

      {/* Add Voter Dialog */}
      <Dialog open={openAdd} onClose={() => { setError(null); setOpenAdd(false); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Individual Voter</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField label="Admission Number" fullWidth required
              value={voterForm.admission_no} onChange={e => setVoterForm(p => ({ ...p, admission_no: e.target.value.toUpperCase() }))} />
            <TextField label="Student Full Name" fullWidth required
              value={voterForm.name} onChange={e => setVoterForm(p => ({ ...p, name: e.target.value }))} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 8 }}>
                <FormControl fullWidth required>
                  <InputLabel>Class</InputLabel>
                  <Select value={voterForm.class_id} label="Class"
                    onChange={e => setVoterForm(p => ({ ...p, class_id: e.target.value }))}>
                    {classes?.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField label="Division" fullWidth placeholder="e.g. A"
                  value={voterForm.division} onChange={e => setVoterForm(p => ({ ...p, division: e.target.value.toUpperCase() }))} />
              </Grid>
            </Grid>
            <FormControl fullWidth required>
              <InputLabel>Sex</InputLabel>
              <Select value={voterForm.sex} label="Sex"
                onChange={e => setVoterForm(p => ({ ...p, sex: e.target.value }))}>
                <MenuItem value="M">Male</MenuItem>
                <MenuItem value="F">Female</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => { setError(null); setOpenAdd(false); }}>Cancel</Button>
          <Button variant="contained" onClick={() => addVoterMutation.mutate(voterForm)}
            disabled={addVoterMutation.isPending}>
            {addVoterMutation.isPending ? <CircularProgress size={20} /> : 'Save Voter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Voter Dialog */}
      <Dialog open={openEdit} onClose={() => { setError(null); setOpenEdit(false); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Voter</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField label="Admission Number" fullWidth disabled
              value={voterForm.admission_no} />
            <TextField label="Student Full Name" fullWidth required
              value={voterForm.name} onChange={e => setVoterForm(p => ({ ...p, name: e.target.value }))} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 8 }}>
                <FormControl fullWidth required>
                  <InputLabel>Class</InputLabel>
                  <Select value={voterForm.class_id} label="Class"
                    onChange={e => setVoterForm(p => ({ ...p, class_id: e.target.value }))}>
                    {classes?.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField label="Division" fullWidth placeholder="e.g. A"
                  value={voterForm.division} onChange={e => setVoterForm(p => ({ ...p, division: e.target.value.toUpperCase() }))} />
              </Grid>
            </Grid>
            <FormControl fullWidth required>
              <InputLabel>Sex</InputLabel>
              <Select value={voterForm.sex} label="Sex"
                onChange={e => setVoterForm(p => ({ ...p, sex: e.target.value }))}>
                <MenuItem value="M">Male</MenuItem>
                <MenuItem value="F">Female</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => { setError(null); setOpenEdit(false); }}>Cancel</Button>
          <Button variant="contained" onClick={() => updateVoterMutation.mutate(voterForm)}
            disabled={updateVoterMutation.isPending}>
            {updateVoterMutation.isPending ? <CircularProgress size={20} /> : 'Update Voter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={openUpload} onClose={() => { setError(null); setOpenUpload(false); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Import Voters via Excel</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}
          {uploadErrors.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, maxHeight: 200, overflow: 'auto' }} onClose={() => setUploadErrors([])}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Errors found in {uploadFile?.name || 'file'}:</Typography>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.85rem' }}>
                {uploadErrors.map((err, idx) => <li key={idx}>{err}</li>)}
              </ul>
            </Alert>
          )}
          <Alert 
            severity="info" 
            sx={{ mt: 1, mb: 3 }}
            action={
              <Button color="inherit" size="small" variant="outlined" startIcon={<Download size={16} />} onClick={handleDownloadTemplate}>
                Template
              </Button>
            }
          >
            Download the template for column names: <b>admission_no, name, section, class, division, sex</b>. Check the <b>'Valid Classes'</b> tab in the template for correct names.
          </Alert>
          <input type="file" ref={fileRef} accept=".xlsx" style={{ display: 'none' }}
            onChange={e => setUploadFile(e.target.files?.[0] || null)} />
          <Box
            onClick={() => fileRef.current?.click()}
            sx={{
              border: '2px dashed',
              borderColor: uploadFile ? 'success.main' : 'divider',
              borderRadius: 3, p: 6, textAlign: 'center',
              backgroundColor: 'background.default',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' }
            }}
          >
            <Upload size={48} color={uploadFile ? '#4caf50' : '#bdbdbd'} />
            <Typography sx={{ mt: 2, fontWeight: 700 }}>
              {uploadFile ? uploadFile.name : 'Click to select Excel file'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Only .xlsx files are supported
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => { setError(null); setOpenUpload(false); }}>Cancel</Button>
          <Button variant="contained" onClick={() => uploadMutation.mutate()}
            disabled={!uploadFile || uploadMutation.isPending}>
            {uploadMutation.isPending ? <CircularProgress size={20} /> : 'Confirm Import'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Block Confirmation Dialog */}
      <Dialog open={openBlockConfirm} onClose={() => setOpenBlockConfirm(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ShieldAlert size={24} color="#f59e0b" />
          {selectedVoter?.is_blocked ? 'Unblock Voter?' : 'Restrict Voter?'}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            {selectedVoter?.is_blocked 
              ? `Are you sure you want to lift the restriction for this voter?`
              : `This will prevent the voter from participating in the election until unblocked.`}
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Voter Details</Typography>
            <Typography variant="body1" sx={{ fontWeight: 800, mt: 0.5 }}>{selectedVoter?.name}</Typography>
            <Grid container spacing={1} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 700 }}>ID: {selectedVoter?.admission_no}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {selectedVoter?.class_name} {selectedVoter?.division ? `(${selectedVoter.division})` : ''}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenBlockConfirm(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color={selectedVoter?.is_blocked ? "success" : "warning"} 
            onClick={() => updateVoterMutation.mutate({ is_blocked: selectedVoter?.is_blocked ? 0 : 1 })}
            disabled={updateVoterMutation.isPending}
            startIcon={selectedVoter?.is_blocked ? <Unlock size={18} /> : <Lock size={18} />}
          >
            {updateVoterMutation.isPending ? <CircularProgress size={20} /> : (selectedVoter?.is_blocked ? 'Confirm Unblock' : 'Confirm Block')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 2, fontWeight: 700 }}>
          <AlertTriangle color="#ef4444" />
          Confirm Deletion
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to delete **{voterToDelete?.name}** (ID: {voterToDelete?.admission_no})?
          </Typography>
          
          {!!voterToDelete?.is_candidate && (
            <Alert 
              severity="warning" 
              icon={<ShieldAlert size={20} />}
              sx={{ 
                bgcolor: '#fff7ed', 
                border: '1.5px solid', 
                borderColor: '#ea580c',
                color: '#9a3412',
                fontWeight: 600,
                borderRadius: 2.5,
                '& .MuiAlert-icon': { color: '#ea580c' }
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 0.5, letterSpacing: 0.5 }}>CANDIDACY ALERT</Typography>
              <strong>{voterToDelete?.name}</strong> is a registered **CANDIDATE** for the post of **{voterToDelete?.candidate_post_name || 'N/A'}**. Deleting this voter will automatically disqualify them and remove their candidacy record.
            </Alert>
          )}

          <Typography variant="caption" sx={{ mt: 2, color: 'text.secondary', display: 'block' }}>
            * This action cannot be undone. All voting history and related records for this voter will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={deleteVoterMutation.isPending}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={() => deleteVoterMutation.mutate(voterToDelete.id)}
            disabled={deleteVoterMutation.isPending}
            startIcon={deleteVoterMutation.isPending ? <CircularProgress size={16} /> : <Trash2 size={18} />}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Voters;
