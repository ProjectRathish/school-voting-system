import { useState, useRef, useMemo } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress, IconButton,
  FormControl, InputLabel, Select, MenuItem, Tabs, Tab, InputAdornment,
  Chip, Grid
} from '@mui/material';
import { Plus, Upload, Search, Trash2, Download, Settings, Sparkles } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { useElectionStore } from '../../store/electionStore';
import { NavLink } from 'react-router-dom';

const Voters = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const { selectedElectionId, selectedElectionName } = useElectionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const [voterForm, setVoterForm] = useState({ admission_no: '', name: '', class_id: '', sex: 'M' });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
    mutationFn: (data: any) => axiosInstance.post('/voters/add', { ...data, election_id: selectedElectionId }),
    onSuccess: () => {
      setSuccess('Voter added successfully!');
      setOpenAdd(false);
      setVoterForm({ admission_no: '', name: '', class_id: '', sex: 'M' });
      queryClient.invalidateQueries({ queryKey: ['voters', selectedElectionId] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error adding voter')
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!uploadFile) throw new Error('No file selected');
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('election_id', selectedElectionId || '');
      return axiosInstance.post('/voters/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: (data: any) => {
      setSuccess(`Import complete! ${data.data?.inserted || 0} voters added.`);
      setOpenUpload(false);
      setUploadFile(null);
      queryClient.invalidateQueries({ queryKey: ['voters', selectedElectionId] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Upload failed')
  });

  const deleteVoterMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/voters/${id}`),
    onSuccess: () => {
      setSuccess('Voter removed successfully');
      queryClient.invalidateQueries({ queryKey: ['voters', selectedElectionId] });
    }
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

  const handleExport = () => {
    // Basic CSV export
    const headers = ['Admission No', 'Name', 'Class', 'Sex', 'Has Voted'];
    const rows = filteredVoters?.map((v: any) => [
      v.admission_no, v.name, v.class_name, v.sex, v.has_voted ? 'Yes' : 'No'
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
          <Button variant="outlined" startIcon={<Upload size={20} />} onClick={() => setOpenUpload(true)} disabled={!selectedElectionId}>
            Bulk Upload
          </Button>
          <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => setOpenAdd(true)} disabled={!selectedElectionId}>
            Add Voter
          </Button>
        </Box>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Paper sx={{ mb: 3, borderRadius: 3 }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
               <Box sx={{ 
                 p: '1.5px', // Slightly thicker for crisp border
                 borderRadius: '20px', 
                 background: 'linear-gradient(45deg, #6366f1, #a855f7)',
                 boxShadow: '0 4px 15px -5px rgba(99, 102, 241, 0.3)',
                 display: 'flex'
               }}>
                 <Box sx={{ 
                   px: 2, 
                   py: 1.2, 
                   borderRadius: '18.5px', // Matched to outer radius
                   background: theme => theme.palette.mode === 'dark' ? '#1a1a24' : '#fff',
                   display: 'flex', 
                   alignItems: 'center', 
                   gap: 2,
                   width: '100%'
                 }}>
                    <Box sx={{ 
                      width: 38, 
                      height: 38, 
                      borderRadius: '10px', 
                      background: 'linear-gradient(135deg, #6366f1, #4338ca)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <Sparkles size={18} />
                    </Box>
                    <Box>
                       <Typography variant="caption" sx={{ 
                         color: 'text.secondary', 
                         fontWeight: 800, 
                         textTransform: 'uppercase', 
                         fontSize: '0.6rem', 
                         letterSpacing: 1, 
                         display: 'block' 
                       }}>
                          Active Configuration
                       </Typography>
                       <Typography variant="subtitle1" sx={{ 
                         fontWeight: 800, 
                         lineHeight: 1.1, 
                         background: 'linear-gradient(45deg, #6366f1, #a855f7)', 
                         WebkitBackgroundClip: 'text', 
                         WebkitTextFillColor: 'transparent' 
                       }}>
                         {selectedElectionName || 'None Selected'}
                       </Typography>
                    </Box>
                 </Box>
               </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
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
            <Grid size={{ xs: 12, md: 3 }}>
              <Button fullWidth variant="outlined" startIcon={<Download size={18} />} onClick={handleExport} disabled={!filteredVoters?.length}>
                Export List
              </Button>
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
                <TableCell sx={{ fontWeight: 700 }}>Gender</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8 }}><CircularProgress size={32} /></TableCell></TableRow>
              ) : filteredVoters?.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8, color: 'text.secondary' }}>No voters found</TableCell></TableRow>
              ) : filteredVoters?.map((v: any) => (
                <TableRow key={v.id} hover>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{v.admission_no}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{v.name}</TableCell>
                  <TableCell>{v.class_name}</TableCell>
                  <TableCell>
                    <Chip label={v.sex === 'M' ? 'Male' : 'Female'} size="small" variant="outlined"
                      color={v.sex === 'M' ? 'info' : 'secondary'} />
                  </TableCell>
                  <TableCell>
                    <Chip label={v.has_voted ? 'Voted' : 'Ready'} size="small"
                      color={v.has_voted ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => deleteVoterMutation.mutate(v.id)} color="error" size="small">
                      <Trash2 size={16} />
                    </IconButton>
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
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Individual Voter</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField label="Admission Number" fullWidth required
              value={voterForm.admission_no} onChange={e => setVoterForm(p => ({ ...p, admission_no: e.target.value.toUpperCase() }))} />
            <TextField label="Student Full Name" fullWidth required
              value={voterForm.name} onChange={e => setVoterForm(p => ({ ...p, name: e.target.value }))} />
            <FormControl fullWidth required>
              <InputLabel>Class</InputLabel>
              <Select value={voterForm.class_id} label="Class"
                onChange={e => setVoterForm(p => ({ ...p, class_id: e.target.value }))}>
                {classes?.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
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
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => addVoterMutation.mutate(voterForm)}
            disabled={addVoterMutation.isPending}>
            {addVoterMutation.isPending ? <CircularProgress size={20} /> : 'Save Voter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={openUpload} onClose={() => setOpenUpload(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Import Voters via Excel</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 1, mb: 3 }}>
            Download the template or ensure your .xlsx file has these columns: <b>admission_no, name, class, sex</b>
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
          <Button onClick={() => setOpenUpload(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => uploadMutation.mutate()}
            disabled={!uploadFile || uploadMutation.isPending}>
            {uploadMutation.isPending ? <CircularProgress size={20} /> : 'Confirm Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Voters;
