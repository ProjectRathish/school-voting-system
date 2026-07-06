import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress, IconButton,
  FormControl, InputLabel, Select, MenuItem, InputAdornment,
  Chip, Grid, Tooltip, Snackbar, TablePagination, LinearProgress, alpha,
  List, ListItem, ListItemText, Divider, Checkbox
} from '@mui/material';
import { Plus, Upload, Search, Trash2, Download, Edit, Settings, Lock, Unlock, AlertTriangle, Sparkles, FileText, ChevronDown } from 'lucide-react';
import { Menu } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { useElectionStore } from '../../store/electionStore';
import { NavLink } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuthStore } from '../../store/authStore';

const Voters = () => {
  const { selectedElectionId, selectedElectionName, selectedElectionStatus } = useElectionStore();
  const { user } = useAuthStore();
  const isConfiguring = selectedElectionStatus === 'DRAFT' || selectedElectionStatus === 'CONFIGURING';

  const { data: stats } = useQuery({
    queryKey: ['school-admin-stats'],
    queryFn: async () => {
      const res = await axiosInstance.get('/elections/get-stats');
      return res.data;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [selectedClass, setSelectedClass] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState<string[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string[]>([]);
  const [selectedSex, setSelectedSex] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [signatureMenuAnchor, setSignatureMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedVoterIds, setSelectedVoterIds] = useState<number[]>([]);
  const [openBulkDeleteConfirm, setOpenBulkDeleteConfirm] = useState(false);
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
          class_id: selectedClass.join(','),
          section_id: selectedSection.join(','),
          division: selectedDivision.join(','),
          sex: selectedSex.join(','),
          status: selectedStatus.join(','),
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
  }, [debouncedSearch, selectedClass, selectedSection, selectedDivision, selectedSex, selectedStatus, selectedIsCandidate]);

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
      setUploadProgress(0);
      const formData = new FormData();
      formData.append('file', uploadFile!);
      formData.append('election_id', selectedElectionId!);
      return axiosInstance.post('/voters/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percentCompleted);
        }
      });
    },
    onSuccess: (resp: any) => {
      if (resp.data.errors?.length) {
        setUploadErrors(resp.data.errors);
        setSuccess(`Imported with ${resp.data.errors.length} errors.`);
      } else {
        setSuccess('Imported successfully!');
        setOpenUpload(false);
      }
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: ['voters'] });
    },
    onError: (err: any) => {
      setUploadProgress(0);
      setError(err.response?.data?.message || 'Upload failed');
    }
  });

  const deleteVoterMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/voters/${id}`),
    onSuccess: () => {
      setSuccess('Voter deleted successfully');
      setDeleteConfirmOpen(false);
      setVoterToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['voters'] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error deleting voter')
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => axiosInstance.post('/voters/bulk-delete', { election_id: selectedElectionId, voter_ids: ids }),
    onSuccess: (resp: any) => {
      setSuccess(resp.data.message || 'Selected voters deleted successfully');
      setOpenBulkDeleteConfirm(false);
      setSelectedVoterIds([]);
      queryClient.invalidateQueries({ queryKey: ['voters'] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error deleting voters')
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
                   <div style="font-weight: 800; font-size: 1.2rem; color: #4338ca; margin-bottom: 5px;">${user?.school_name || 'School Voting System'}</div>
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

  const handleExportSignatureExcel = async () => {
    try {
      setError(null);
      const resp = await axiosInstance.get(`/voters/get-voters`, { 
        params: { election_id: selectedElectionId, limit: 10000, class_id: selectedClass, division: selectedDivision, sex: selectedSex, search: debouncedSearch } 
      });
      const data = resp.data.data;
      if (!data?.length) return;

      const csv = "Admission No,Name,Class,Division,Signature\n" + 
        data.map((v: any) => `"${v.admission_no}","${v.name}","${v.class_name}","${v.division || ''}","_________________"`).join("\n");
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Signature_Sheet_${selectedElectionName}.csv`;
      link.click();
      setSignatureMenuAnchor(null);
    } catch (err) { setError('Failed to export Excel'); }
  };

  const handleExportSignatureWord = async () => {
    try {
      setError(null);
      const resp = await axiosInstance.get(`/voters/get-voters`, { 
        params: { election_id: selectedElectionId, limit: 10000, class_id: selectedClass, division: selectedDivision, sex: selectedSex, search: debouncedSearch } 
      });
      const data = resp.data.data;
      if (!data?.length) return;

      const style = `
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #f0f0f0; border: 1px solid #000; padding: 5px; }
        td { border: 1px solid #000; padding: 5px; }
      `;

      let html = `<html><head><style>${style}</style></head><body>`;
      html += `<h1>${user?.school_name}</h1>`;
      html += `<h2>${selectedElectionName} - Signature Sheet</h2>`;
      html += `<table><thead><tr><th>#</th><th>Admission No</th><th>Name</th><th>Class</th><th>Signature</th></tr></thead><tbody>`;
      data.forEach((v: any, i: number) => {
        html += `<tr><td>${i+1}</td><td>${v.admission_no}</td><td>${v.name}</td><td>${v.class_name} ${v.division || ''}</td><td></td></tr>`;
      });
      html += `</tbody></table></body></html>`;

      const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Signature_Sheet_${selectedElectionName}.doc`;
      link.click();
      setSignatureMenuAnchor(null);
    } catch (err) { setError('Failed to export Word'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 4, flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-1px', color: 'text.primary' }}>Voter Management</Typography>
        <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', md: 'auto' }, flexWrap: 'wrap' }}>
          {isConfiguring && (
            <>
              <Button color="error" variant="outlined" startIcon={<Trash2 size={20} />} onClick={() => setOpenClearConfirm(true)} disabled={!selectedElectionId || !voters?.length} sx={{ borderRadius: 2, flexGrow: { xs: 1, sm: 0 } }}>
                Clear List
              </Button>
              <Button variant="outlined" startIcon={<Upload size={20} />} onClick={() => { setUploadErrors([]); setOpenUpload(true); }} sx={{ borderRadius: 2, flexGrow: { xs: 1, sm: 0 } }}>
                Bulk Upload
              </Button>
            </>
          )}
          {selectedElectionId && selectedElectionStatus !== 'CLOSED' && (
            <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => setOpenAdd(true)} sx={{ borderRadius: 2, flexGrow: { xs: 1, sm: 1 }, py: 1, fontWeight: 700 }}>
              Add Voter
            </Button>
          )}
        </Box>
      </Box>

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

      {!selectedElectionId && (
        <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
          <strong>No Election Selected:</strong> Please select or configure an election from the navigation panel to view, add, or manage voters.
        </Alert>
      )}

      {selectedElectionId && (
        <Paper sx={{ mb: 3, borderRadius: 1, overflow: 'hidden' }}>
        {/* EXPORT & TOOLS */}
        <Box sx={{ 
          p: 2, 
          bgcolor: 'background.default', 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          justifyContent: { xs: 'center', sm: 'flex-end' }, 
          flexDirection: { xs: 'column', sm: 'row' },
          borderBottom: '1px solid', 
          borderColor: 'divider' 
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 'auto', display: 'flex', alignItems: 'center', fontWeight: 700 }}>
             <Settings size={14} style={{ marginRight: 8 }} /> EXPORT & TOOLS
          </Typography>
           <Button variant="outlined" size="small" startIcon={<Download size={18} />} onClick={handleExport} disabled={!voters?.length}>Export CSV</Button>
           <Button 
            variant="contained" 
            size="small" 
            color="secondary" 
            startIcon={<FileText size={18} />} 
            endIcon={<ChevronDown size={14} />}
            onClick={(e) => setSignatureMenuAnchor(e.currentTarget)} 
            disabled={!voters?.length}
           >
            Signature Sheet Options
           </Button>
           <Menu
            anchorEl={signatureMenuAnchor}
            open={Boolean(signatureMenuAnchor)}
            onClose={() => setSignatureMenuAnchor(null)}
            PaperProps={{ sx: { borderRadius: 2, mt: 1, minWidth: 200 } }}
           >
             <MenuItem onClick={handlePrintSignatureSheet} sx={{ gap: 1.5 }}>
               <FileText size={16} /> Print / Save as PDF
             </MenuItem>
             <MenuItem onClick={handleExportSignatureExcel} sx={{ gap: 1.5 }}>
               <Download size={16} /> Download as Excel (CSV)
             </MenuItem>
             <MenuItem onClick={handleExportSignatureWord} sx={{ gap: 1.5 }}>
               <Download size={16} /> Download as Word (.doc)
             </MenuItem>
           </Menu>
         </Box>

        <Box sx={{ p: 4, bgcolor: 'background.paper' }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
          <TextField
            placeholder="Search Voters (Name / Admission No)..."
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', md: 'auto' } }}>
            <FormControl sx={{ minWidth: { xs: 'calc(50% - 8px)', sm: 180 } }} size="small">
              <InputLabel>Section</InputLabel>
              <Select 
                multiple
                value={selectedSection} 
                label="Section" 
                onChange={(e) => setSelectedSection(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[])}
                renderValue={(selected) => selected.map(id => sections?.find((s: any) => String(s.id) === String(id))?.name).join(', ')}
              >
                {sections?.map((s: any) => (
                  <MenuItem key={s.id} value={s.id}>
                    <Checkbox checked={selectedSection.indexOf(s.id) > -1} size="small" />
                    <ListItemText primary={s.name} primaryTypographyProps={{ fontSize: '0.875rem' }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: { xs: 'calc(50% - 8px)', sm: 150 } }} size="small">
              <InputLabel>Class</InputLabel>
              <Select 
                multiple
                value={selectedClass} 
                label="Class" 
                onChange={(e) => setSelectedClass(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[])}
                renderValue={(selected) => selected.map(id => classes?.find((c: any) => String(c.id) === String(id))?.name).join(', ')}
              >
                {classes?.filter((c: any) => selectedSection.length === 0 || selectedSection.some(sid => String(c.section_id) === String(sid))).map((c: any) => (
                  <MenuItem key={c.id} value={c.id}>
                    <Checkbox checked={selectedClass.indexOf(c.id) > -1} size="small" />
                    <ListItemText primary={c.name} primaryTypographyProps={{ fontSize: '0.875rem' }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: { xs: 'calc(50% - 8px)', sm: 110 } }} size="small">
              <InputLabel>Division</InputLabel>
              <Select 
                multiple
                value={selectedDivision} 
                label="Division" 
                onChange={(e) => setSelectedDivision(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[])}
                renderValue={(selected) => selected.join(', ')}
              >
                {['A', 'B', 'C', 'D', 'E', 'F'].map(div => (
                  <MenuItem key={div} value={div}>
                    <Checkbox checked={selectedDivision.indexOf(div) > -1} size="small" />
                    <ListItemText primary={div} primaryTypographyProps={{ fontSize: '0.875rem' }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: { xs: 'calc(50% - 8px)', sm: 110 } }} size="small">
              <InputLabel>Sex</InputLabel>
              <Select 
                multiple
                value={selectedSex} 
                label="Sex" 
                onChange={(e) => setSelectedSex(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[])}
                renderValue={(selected) => selected.map(s => s === 'M' ? 'Male' : 'Female').join(', ')}
              >
                <MenuItem value="M">
                  <Checkbox checked={selectedSex.indexOf('M') > -1} size="small" />
                  <ListItemText primary="Male" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </MenuItem>
                <MenuItem value="F">
                  <Checkbox checked={selectedSex.indexOf('F') > -1} size="small" />
                  <ListItemText primary="Female" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }} size="small">
              <InputLabel>Status</InputLabel>
              <Select 
                multiple
                value={selectedStatus} 
                label="Status" 
                onChange={(e) => setSelectedStatus(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[])}
                renderValue={(selected) => selected.map(s => {
                   if (s === 'READY') return 'Ready';
                   if (s === 'VOTED') return 'Voted';
                   if (s === 'BLOCKED') return 'Blocked';
                   return s;
                }).join(', ')}
              >
                <MenuItem value="READY">
                  <Checkbox checked={selectedStatus.indexOf('READY') > -1} size="small" />
                  <ListItemText primary="Ready to Vote" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </MenuItem>
                <MenuItem value="VOTED">
                  <Checkbox checked={selectedStatus.indexOf('VOTED') > -1} size="small" />
                  <ListItemText primary="Voted" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </MenuItem>
                <MenuItem value="BLOCKED">
                  <Checkbox checked={selectedStatus.indexOf('BLOCKED') > -1} size="small" />
                  <ListItemText primary="Blocked" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        </Box>
        
        {/* Active Filter Status Message - Reduced size as requested */}
        <Box sx={{ px: 4, py: 2, bgcolor: 'rgba(0,0,0,0.02)', borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
             {isLoading ? "Updating list..." : `Showing ${totalCount} records matching your filters`}
           </Typography>
           {(selectedClass.length > 0 || selectedSection.length > 0 || selectedDivision.length > 0 || selectedSex.length > 0 || selectedStatus.length > 0 || selectedIsCandidate !== 'ANY' || searchQuery) && (
             <Button variant="outlined" color="error" size="small" onClick={() => { 
               setSelectedClass([]); 
               setSelectedSection([]);
               setSelectedDivision([]); 
               setSelectedSex([]); 
               setSelectedStatus([]); 
               setSelectedIsCandidate('ANY'); 
               setSearchQuery('');
             }}>Clear All Filters</Button>
           )}
        </Box>
      </Paper>
      )}

      {selectedElectionId && (
        <>
          {selectedVoterIds.length > 0 && (
            <Paper sx={{ 
              mb: 2, 
              p: 2, 
              bgcolor: theme => alpha(theme.palette.primary.main, 0.05), 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              border: '1px solid',
              borderColor: 'primary.light',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.1)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Checkbox 
                  indeterminate={selectedVoterIds.length > 0 && selectedVoterIds.length < voters.length}
                  checked={voters.length > 0 && selectedVoterIds.length === voters.length}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedVoterIds(voters.map((v: any) => v.id));
                    else setSelectedVoterIds([]);
                  }}
                />
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'primary.main' }}>
                  {selectedVoterIds.length} Voters Selected
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button size="small" onClick={() => setSelectedVoterIds([])} sx={{ fontWeight: 700 }}>Cancel</Button>
                <Button 
                  variant="contained" 
                  color="error" 
                  startIcon={<Trash2 size={18} />} 
                  onClick={() => setOpenBulkDeleteConfirm(true)}
                  sx={{ borderRadius: 2, fontWeight: 800, px: 3 }}
                >
                  Delete Selected
                </Button>
              </Box>
            </Paper>
          )}
          {isFetching && <LinearProgress sx={{ height: 3, mb: -0.3, zIndex: 1, position: 'relative' }} />}
          <TableContainer component={Paper} sx={{ borderRadius: 1, overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.08) }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedVoterIds.length > 0 && selectedVoterIds.length < voters.length}
                      checked={voters.length > 0 && selectedVoterIds.length === voters.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVoterIds(voters.map((v: any) => v.id));
                        } else {
                          setSelectedVoterIds([]);
                        }
                      }}
                      sx={{ color: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'inherit' }}
                    />
                  </TableCell>
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
                  <TableRow><TableCell colSpan={8} align="center" sx={{ py: 8 }}><CircularProgress size={32} /></TableCell></TableRow>
                ) : voters?.length === 0 ? (
                  <TableRow><TableCell colSpan={8} align="center" sx={{ py: 8, color: 'text.secondary' }}>No voters found</TableCell></TableRow>
                ) : voters?.map((v: any) => (
                  <TableRow key={v.id} hover selected={selectedVoterIds.includes(v.id)}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedVoterIds.includes(v.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedVoterIds([...selectedVoterIds, v.id]);
                          } else {
                            setSelectedVoterIds(selectedVoterIds.filter(id => id !== v.id));
                          }
                        }}
                      />
                    </TableCell>
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
          {stats?.plan && (
            <Alert severity={stats.totalVoters >= (stats.plan.custom_max_voters || stats.plan.max_voters) ? "error" : "info"} sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Voter Usage: {stats.totalVoters} / {stats.plan.custom_max_voters || stats.plan.max_voters} Voters
              </Typography>
              {stats.totalVoters >= (stats.plan.custom_max_voters || stats.plan.max_voters) && (
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  You have reached your voter limit. Please upgrade your plan or delete existing voters.
                </Typography>
              )}
            </Alert>
          )}
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
          <Button 
            variant="contained" 
            disabled={addVoterMutation.isPending || (stats?.plan && stats.totalVoters >= (stats.plan.custom_max_voters || stats.plan.max_voters))} 
            onClick={() => addVoterMutation.mutate(voterForm)}
          >
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

      {/* Bulk Delete Confirmation */}
      <Dialog open={openBulkDeleteConfirm} onClose={() => setOpenBulkDeleteConfirm(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'error.main', fontWeight: 800 }}>
          <AlertTriangle size={24} /> Bulk Delete Confirmation
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the <strong>{selectedVoterIds.length}</strong> selected voters? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenBulkDeleteConfirm(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={() => bulkDeleteMutation.mutate(selectedVoterIds)}
            disabled={bulkDeleteMutation.isPending}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {bulkDeleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
          </Button>
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
          {stats?.plan && (
            <Alert severity={stats.totalVoters >= (stats.plan.custom_max_voters || stats.plan.max_voters) ? "error" : "info"} sx={{ mb: 2, borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Voter Usage: {stats.totalVoters} / {stats.plan.custom_max_voters || stats.plan.max_voters} Voters
              </Typography>
            </Alert>
          )}
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
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" color="error" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AlertTriangle size={18} />
                Validation Errors ({uploadErrors.length})
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  maxHeight: 200, 
                  overflow: 'auto', 
                  bgcolor: alpha('#f44336', 0.05),
                  borderColor: alpha('#f44336', 0.2),
                  borderRadius: 2
                }}
              >
                <List size="small" disablePadding>
                  {uploadErrors.map((err, i) => (
                    <React.Fragment key={i}>
                      <ListItem sx={{ py: 1 }}>
                        <ListItemText 
                          primary={
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main' }}>
                              Row {typeof err === 'object' ? (err as any).row || i + 1 : i + 1}:
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" display="block">
                              {typeof err === 'object' ? (err as any).message || JSON.stringify(err) : err}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {i < uploadErrors.length - 1 && <Divider sx={{ opacity: 0.5 }} />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Please fix these issues in your file and try uploading again.
              </Typography>
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
      <Dialog open={uploadMutation.isPending || clearVotersMutation.isPending} disableEscapeKeyDown maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          {uploadMutation.isPending ? (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Uploading Voters...</Typography>
                <Typography variant="body2" color="text.secondary">Please wait while we process the file</Typography>
              </Box>
              <Box sx={{ width: '100%', mb: 2 }}>
                <LinearProgress 
                  variant={uploadProgress > 0 ? "determinate" : "indeterminate"} 
                  value={uploadProgress} 
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {uploadProgress > 0 ? `${uploadProgress}% Completed` : 'Preparing...'}
              </Typography>
            </>
          ) : (
            <>
              <CircularProgress sx={{ mb: 3 }} size={50} thickness={4} />
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Processing Data...</Typography>
              <Typography variant="body2" color="text.secondary">This may take a moment</Typography>
            </>
          )}
          <Typography variant="caption" display="block" sx={{ mt: 3, opacity: 0.5 }}>
            Do not refresh or close this tab
          </Typography>
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
