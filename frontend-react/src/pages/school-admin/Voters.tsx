import { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress, IconButton,
  FormControl, InputLabel, Select, MenuItem, InputAdornment,
  Chip, Grid, Tooltip, Snackbar, TablePagination, LinearProgress, alpha
} from '@mui/material';
import { Plus, Upload, Search, Trash2, Download, Edit, Settings, Lock, Unlock, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { useElectionStore } from '../../store/electionStore';
import { NavLink } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';

const Voters = () => {
  const { selectedElectionId, selectedElectionName, selectedElectionStatus } = useElectionStore();
  const isConfiguring = selectedElectionStatus === 'DRAFT' || selectedElectionStatus === 'CONFIGURING';
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedSex, setSelectedSex] = useState('ANY');
  const [selectedStatus, setSelectedStatus] = useState('ANY');
  const [selectedIsCandidate, setSelectedIsCandidate] = useState('ANY');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
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
  const [openClearConfirm, setOpenClearConfirm] = useState(false);
  const [clearVotersInput, setClearVotersInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: classes } = useQuery({
    queryKey: ['classes', selectedElectionId],
    enabled: !!selectedElectionId,
    queryFn: async () => (await axiosInstance.get(`/classes/get-classes?election_id=${selectedElectionId}`)).data
  });

  const { data: sections } = useQuery({
    queryKey: ['sections', selectedElectionId],
    enabled: !!selectedElectionId,
    queryFn: async () => (await axiosInstance.get(`/sections/get-sections?election_id=${selectedElectionId}`)).data
  });

  const { data: votersData, isLoading, isFetching } = useQuery({
    queryKey: ['voters', selectedElectionId, page, rowsPerPage, debouncedSearch, selectedClass, selectedSection, selectedDivision, selectedSex, selectedStatus, selectedIsCandidate],
    enabled: !!selectedElectionId,
    queryFn: async () => {
      const resp = await axiosInstance.get('/voters/get-voters', {
        params: {
          election_id: selectedElectionId,
          page: page + 1,
          limit: rowsPerPage,
          search: debouncedSearch,
          class_id: selectedClass,
          section_id: selectedSection,
          division: selectedDivision,
          sex: selectedSex,
          status: selectedStatus,
          is_candidate: selectedIsCandidate
        }
      });
      return resp.data;
    }
  });

  const voters = votersData?.data || [];
  const totalCount = votersData?.total || 0;

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, selectedClass, selectedDivision, selectedSex, selectedStatus, selectedIsCandidate]);

  const addVoterMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.post('/voters/create', { ...data, election_id: selectedElectionId }),
    onSuccess: () => {
      setSuccess('Voter added successfully!');
      setOpenAdd(false);
      setVoterForm({ admission_no: '', name: '', class_id: '', division: '', sex: 'M' });
      queryClient.invalidateQueries({ queryKey: ['voters'] });
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
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error updating voter')
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('file', uploadFile!);
      formData.append('election_id', selectedElectionId!);
      return axiosInstance.post('/voters/upload', formData);
    },
    onSuccess: (resp: any) => {
      if (resp.data.errors?.length) {
        setUploadErrors(resp.data.errors);
        setSuccess(`Imported with ${resp.data.errors.length} errors.`);
      } else {
        setSuccess('Imported successfully!');
        setOpenUpload(false);
      }
      queryClient.invalidateQueries({ queryKey: ['voters'] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Upload failed')
  });

  const deleteVoterMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/voters/${id}`),
    onSuccess: () => {
      setSuccess('Voter deleted!');
      setDeleteConfirmOpen(false);
      queryClient.invalidateQueries({ queryKey: ['voters'] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error deleting voter')
  });

  const clearVotersMutation = useMutation({
    mutationFn: () => axiosInstance.post('/voters/clear-voters', { election_id: selectedElectionId }),
    onSuccess: () => {
      setSuccess('All voters cleared!');
      setOpenClearConfirm(false);
      setClearVotersInput('');
      queryClient.invalidateQueries({ queryKey: ['voters'] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error clearing voters')
  });

  const handleDownloadTemplate = async () => {
    try {
      const response = await axiosInstance.get(`/voters/download-template?election_id=${selectedElectionId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Voter_Import_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download template', err);
    }
  };

  const handleEdit = (voter: any) => {
    setSelectedVoter(voter);
    setVoterForm({
      admission_no: voter.admission_no,
      name: voter.name,
      class_id: voter.class_id || '',
      division: voter.division || '',
      sex: voter.sex
    });
    setOpenEdit(true);
  };

  const handleExport = async () => {
     try {
       const resp = await axiosInstance.get(`/voters/get-voters`, { params: { election_id: selectedElectionId, limit: 10000 } });
       const data = resp.data.data;
       const csv = "Admission No,Name,Class,Division,Sex\n" + data.map((v:any) => `${v.admission_no},${v.name},${v.class_name},${v.division},${v.sex}`).join("\n");
       const blob = new Blob([csv], { type: 'text/csv' });
       const url = window.URL.createObjectURL(blob);
       const link = document.createElement('a');
       link.href = url;
       link.download = `voters_${selectedElectionName}.csv`;
       link.click();
     } catch (err) { setError('Export failed'); }
  };

  const handlePrintSignatureSheet = async () => {
    try {
      setError(null);
      // Fetch all voters for the current selection (no pagination)
      const resp = await axiosInstance.get(`/voters/get-voters`, { 
        params: { 
          election_id: selectedElectionId, 
          limit: 10000,
          class_id: selectedClass,
          division: selectedDivision,
          sex: selectedSex,
          status: selectedStatus,
          is_candidate: selectedIsCandidate,
          search: debouncedSearch
        } 
      });
      const data = resp.data.data;
      if (!data || data.length === 0) {
        setError("No voters found in the current filtered list to print.");
        return;
      }

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const style = `
        @page { size: A4; margin: 15mm; }
        body { font-family: 'Inter', sans-serif; color: #1e1e28; margin: 0; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 30px; }
        h1 { margin: 0; font-size: 1.5rem; text-transform: uppercase; }
        h2 { margin: 5px 0; font-size: 1rem; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #f0f0f0; text-align: left; padding: 10px; border: 1px solid #ccc; text-transform: uppercase; font-size: 10px; }
        td { padding: 8px 10px; border: 1px solid #ccc; font-size: 12px; }
        .signature-box { height: 35px; min-width: 150px; }
        .page-break { page-break-after: always; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: right; font-size: 9px; color: #999; }
        .voter-row:nth-child(even) { background-color: #f9f9f9; }
      `;

      let html = `<html><head><title>Signature Sheet - ${selectedElectionName}</title><style>${style}</style></head><body>`;
      
      // Group voters by Class + Division for easier signing
      const groups: Record<string, any[]> = {};
      data.forEach((v: any) => {
        const key = `${v.class_name} ${v.division || ''}`.trim();
        if (!groups[key]) groups[key] = [];
        groups[key].push(v);
      });

      const groupKeys = Object.keys(groups).sort();
      
      groupKeys.forEach((key, index) => {
        html += `<div class="voter-group ${index > 0 ? 'page-break' : ''}">`;
        html += `<div class="header">
                   <h1>${selectedElectionName}</h1>
                   <h2>VOTER SIGNATURE SHEET - ${key}</h2>
                 </div>`;
        html += `<table><thead><tr>
                   <th style="width: 50px;">#</th>
                   <th style="width: 120px;">ADMISSION NO</th>
                   <th>FULL NAME</th>
                   <th style="width: 200px;">SIGNATURE / THUMB</th>
                 </tr></thead><tbody>`;
        
        groups[key].forEach((v, i) => {
          html += `<tr class="voter-row">
                     <td>${i + 1}</td>
                     <td style="font-family: monospace;">${v.admission_no}</td>
                     <td style="font-weight: 700;">${v.name}</td>
                     <td class="signature-box"></td>
                   </tr>`;
        });
        
        html += `</tbody></table></div>`;
      });

      html += `<div class="footer">Generated on ${new Date().toLocaleString()} | School Voting System</div>`;
      html += `</body><script>window.onload = () => { window.print(); window.close(); };</script></html>`;

      printWindow.document.write(html);
      printWindow.document.close();
    } catch (err) { setError('Failed to generate PDF signature sheet'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Voter Management</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isConfiguring && (
            <>
              <Button color="error" variant="outlined" startIcon={<Trash2 size={20} />} onClick={() => setOpenClearConfirm(true)} disabled={!selectedElectionId || !voters?.length}>
                Clear List
              </Button>
              <Button variant="outlined" startIcon={<Download size={20} />} onClick={handleDownloadTemplate}>
                Download Voter List Template
              </Button>
              <Button variant="outlined" startIcon={<Upload size={20} />} onClick={() => { setUploadErrors([]); setOpenUpload(true); }}>
                Bulk Upload
              </Button>
            </>
          )}
          {selectedElectionStatus !== 'CLOSED' && (
            <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => setOpenAdd(true)}>
              Add Voter
            </Button>
          )}
        </Box>
      </Box>

      <Paper sx={{ mb: 3, borderRadius: 1, overflow: 'hidden' }}>
        {/* EXPORT & TOOLS */}
        <Box sx={{ p: 2, bgcolor: 'background.default', display: 'flex', gap: 2, justifyContent: 'flex-end', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 'auto', display: 'flex', alignItems: 'center', fontWeight: 700 }}>
             <Settings size={14} style={{ marginRight: 8 }} /> EXPORT & TOOLS
          </Typography>
           <Button variant="outlined" size="small" startIcon={<Download size={18} />} onClick={handleExport} disabled={!voters?.length}>Export CSV</Button>
           <Button variant="contained" size="small" color="secondary" startIcon={<Download size={18} />} onClick={handlePrintSignatureSheet} disabled={!voters?.length}>Print Signature Sheet (PDF)</Button>
         </Box>

        <Box sx={{ p: 4, bgcolor: 'background.paper' }}>
          {/* Section 1: Broad Search Interface - FULL WIDTH */}
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by name or admission number..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{ 
                startAdornment: <InputAdornment position="start"><Search size={22} color="#666" /></InputAdornment>,
                sx: { 
                  height: 60,
                  bgcolor: 'background.default',
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 800
                }
              }}
            />
          </Box>

          {/* Section 2: Refined Filters Grid - FORCED FULL WIDTH FOR FIRST TWO */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2 }}>
               <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 800 }}>Section</InputLabel>
                <Select value={selectedSection} label="Section" onChange={e => setSelectedSection(e.target.value)} sx={{ height: 60, borderRadius: 2 }}>
                  <MenuItem value="">All Sections</MenuItem>
                  {sections?.map((s: any) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2 }}>
               <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 800 }}>Class</InputLabel>
                <Select value={selectedClass} label="Class" onChange={e => setSelectedClass(e.target.value)} sx={{ height: 60, borderRadius: 2 }}>
                  <MenuItem value="">All Classes</MenuItem>
                  {classes?.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2 }}>
               <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 800 }}>Division</InputLabel>
                <Select value={selectedDivision} label="Division" onChange={e => setSelectedDivision(e.target.value)} sx={{ height: 60, borderRadius: 2 }}>
                  <MenuItem value="">All Divisions</MenuItem>
                  {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(div => (
                    <MenuItem key={div} value={div}>Division {div}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 800 }}>Gender</InputLabel>
                <Select value={selectedSex} label="Gender" onChange={e => setSelectedSex(e.target.value)} sx={{ height: 60, borderRadius: 2 }}>
                   <MenuItem value="ANY">Any Gender</MenuItem>
                   <MenuItem value="M">Male (M)</MenuItem>
                   <MenuItem value="F">Female (F)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 2 }}>
               <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 800 }}>Voting Status</InputLabel>
                <Select value={selectedStatus} label="Voting Status" onChange={e => setSelectedStatus(e.target.value)} sx={{ height: 60, borderRadius: 2 }}>
                   <MenuItem value="ANY">Any Status</MenuItem>
                   <MenuItem value="READY">Ready</MenuItem>
                   <MenuItem value="VOTED">Voted</MenuItem>
                   <MenuItem value="BLOCKED">Blocked</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 2 }}>
               <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 800 }}>Candidacy</InputLabel>
                <Select value={selectedIsCandidate} label="Candidacy" onChange={e => setSelectedIsCandidate(e.target.value)} sx={{ height: 60, borderRadius: 2 }}>
                   <MenuItem value="ANY">Any</MenuItem>
                   <MenuItem value="YES">Candidate</MenuItem>
                   <MenuItem value="NO">Voter Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        
        {/* Active Filter Status Message - Reduced size as requested */}
        <Box sx={{ px: 4, py: 2, bgcolor: 'rgba(0,0,0,0.02)', borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
             {isLoading ? "Updating list..." : `Showing ${totalCount} records matching your filters`}
           </Typography>
           {(selectedClass || selectedDivision || selectedSex !== 'ANY' || selectedStatus !== 'ANY' || selectedIsCandidate !== 'ANY' || searchQuery) && (
             <Button variant="outlined" color="error" size="small" onClick={() => { 
               setSelectedClass(''); 
               setSelectedSection('');
               setSelectedDivision(''); 
               setSelectedSex('ANY'); 
               setSelectedStatus('ANY'); 
               setSelectedIsCandidate('ANY'); 
               setSearchQuery('');
             }}>Clear All Filters</Button>
           )}
        </Box>
      </Paper>

      {selectedElectionId && (
        <>
          {isFetching && <LinearProgress sx={{ height: 3, mb: -0.3, zIndex: 1, position: 'relative' }} />}
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.08) }}>
                  <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Admission No</TableCell>
                  <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Class</TableCell>
                  <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Division</TableCell>
                  <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Gender</TableCell>
                  {!isConfiguring && <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Status</TableCell>}
                  <TableCell align="right" sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8 }}><CircularProgress size={32} /></TableCell></TableRow>
                ) : voters?.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8, color: 'text.secondary' }}>No voters found</TableCell></TableRow>
                ) : voters?.map((v: any) => (
                  <TableRow key={v.id} hover>
                    <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {v.admission_no}
                        {v.is_blocked === 1 && <Chip label="BLOCKED" size="small" color="error" sx={{ height: 18 }} />}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{v.name}</TableCell>
                    <TableCell>{v.class_name}</TableCell>
                    <TableCell>{v.division || '-'}</TableCell>
                    <TableCell>{v.sex}</TableCell>
                    {!isConfiguring && (
                       <TableCell>
                         <Chip 
                            label={v.has_voted ? "Voted" : "Ready"} 
                            color={v.has_voted ? "success" : "primary"} 
                            size="small" 
                            variant="outlined" 
                          />
                       </TableCell>
                    )}
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <IconButton onClick={() => { setSelectedVoter(v); setOpenBlockConfirm(true); }} color={v.is_blocked ? "success" : "warning"} size="small">
                          {v.is_blocked ? <Unlock size={16} /> : <Lock size={16} />}
                        </IconButton>
                        {isConfiguring && (
                          <>
                            <IconButton onClick={() => handleEdit(v)} color="primary" size="small"><Edit size={16} /></IconButton>
                            <IconButton onClick={() => { setVoterToDelete(v); setDeleteConfirmOpen(true); }} color="error" size="small"><Trash2 size={16} /></IconButton>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[25, 50, 100]}
          />
        </>
      )}

      {/* Add Voter Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Voter</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField fullWidth label="Admission No" value={voterForm.admission_no} onChange={e => setVoterForm(p => ({ ...p, admission_no: e.target.value.toUpperCase() }))} required autoFocus />
            <TextField fullWidth label="Full Name" value={voterForm.name} onChange={e => setVoterForm(p => ({ ...p, name: e.target.value }))} required />
            <FormControl fullWidth required>
              <InputLabel>Class</InputLabel>
              <Select value={voterForm.class_id} label="Class" onChange={e => setVoterForm(p => ({ ...p, class_id: e.target.value }))}>
                {classes?.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField fullWidth label="Division (Optional)" value={voterForm.division} onChange={e => setVoterForm(p => ({ ...p, division: e.target.value.toUpperCase() }))} />
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select value={voterForm.sex} label="Gender" onChange={e => setVoterForm(p => ({ ...p, sex: e.target.value }))}>
                <MenuItem value="M">Male (M)</MenuItem>
                <MenuItem value="F">Female (F)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" disabled={addVoterMutation.isPending} onClick={() => addVoterMutation.mutate(voterForm)}>
            {addVoterMutation.isPending ? <CircularProgress size={20} /> : 'Save Voter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Voter Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Voter: {selectedVoter?.name}</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField fullWidth label="Admission No" value={voterForm.admission_no} onChange={e => setVoterForm(p => ({ ...p, admission_no: e.target.value.toUpperCase() }))} required />
            <TextField fullWidth label="Full Name" value={voterForm.name} onChange={e => setVoterForm(p => ({ ...p, name: e.target.value }))} required />
            <FormControl fullWidth required>
              <InputLabel>Class</InputLabel>
              <Select value={voterForm.class_id} label="Class" onChange={e => setVoterForm(p => ({ ...p, class_id: e.target.value }))}>
                {classes?.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField fullWidth label="Division (Optional)" value={voterForm.division} onChange={e => setVoterForm(p => ({ ...p, division: e.target.value.toUpperCase() }))} />
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select value={voterForm.sex} label="Gender" onChange={e => setVoterForm(p => ({ ...p, sex: e.target.value }))}>
                <MenuItem value="M">Male (M)</MenuItem>
                <MenuItem value="F">Female (F)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button variant="contained" disabled={updateVoterMutation.isPending} onClick={() => updateVoterMutation.mutate(voterForm)}>
            {updateVoterMutation.isPending ? <CircularProgress size={20} /> : 'Update Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Are you absolutely sure you want to delete <strong>{voterToDelete?.name}</strong> (Adm No: {voterToDelete?.admission_no})? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => deleteVoterMutation.mutate(voterToDelete?.id)}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Block/Unblock Confirmation */}
      <Dialog open={openBlockConfirm} onClose={() => setOpenBlockConfirm(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{selectedVoter?.is_blocked ? 'Unblock Voter' : 'Block Voter'}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {selectedVoter?.is_blocked 
              ? 'This student will be allowed to vote again. Proceed?' 
              : 'This student will be completely blocked from voting. Proceed?'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenBlockConfirm(false)}>Cancel</Button>
          <Button variant="contained" color={selectedVoter?.is_blocked ? 'success' : 'warning'} onClick={() => updateVoterMutation.mutate({ is_blocked: !selectedVoter?.is_blocked })}>
            {selectedVoter?.is_blocked ? 'Yes, Unblock' : 'Yes, Block'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openUpload} onClose={() => setOpenUpload(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Bulk Import Voters</DialogTitle>
        <DialogContent>
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={handleDownloadTemplate} startIcon={<Download size={16} />}>
                Download Template
              </Button>
            }
          >
            Select an Excel/CSV file with Admission No, Name, Class ID, Division, and Sex.
          </Alert>
          <input type="file" ref={fileRef} accept=".xlsx,.xls,.csv" onChange={e => setUploadFile(e.target.files?.[0] || null)} />
          {uploadErrors.length > 0 && (
            <Box sx={{ mt: 2, p: 1, bgcolor: 'error.lighter', borderRadius: 1 }}>
              <Typography variant="caption" color="error" sx={{ fontWeight: 700 }}>Errors found: {uploadErrors.length}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenUpload(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => uploadMutation.mutate()} disabled={!uploadFile || uploadMutation.isPending}>Upload</Button>
        </DialogActions>
      </Dialog>

      {/* Clear Voters Confirmation */}
      <Dialog open={openClearConfirm} onClose={() => { setOpenClearConfirm(false); setClearVotersInput(''); }} maxWidth="xs" fullWidth>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, color: 'error.main' }}>
             <AlertTriangle size={32} />
             <Typography variant="h5" sx={{ fontWeight: 900 }}>CRITICAL ACTION</Typography>
          </Box>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 700 }}>Delete ALL voters for {selectedElectionName}?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Type <strong>DELETE ALL</strong> to verify.</Typography>
          <TextField fullWidth value={clearVotersInput} onChange={e => setClearVotersInput(e.target.value.toUpperCase())} autoFocus />
          <DialogActions sx={{ pt: 3 }}>
            <Button onClick={() => setOpenClearConfirm(false)}>Cancel</Button>
            <Button variant="contained" color="error" disabled={clearVotersInput !== 'DELETE ALL'} onClick={() => clearVotersMutation.mutate()}>Clear List</Button>
          </DialogActions>
        </Paper>
      </Dialog>

      {/* Processing Loader */}
      <Dialog open={uploadMutation.isPending || clearVotersMutation.isPending} disableEscapeKeyDown>
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6">Processing Data...</Typography>
          <Typography variant="caption" color="text.secondary">Do not refresh page</Typography>
        </Paper>
      </Dialog>
      
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" variant="filled">{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="error" variant="filled">{error}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Voters;
