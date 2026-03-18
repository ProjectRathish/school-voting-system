import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress, IconButton,
  FormControl, InputLabel, Select, MenuItem, Tabs, Tab
} from '@mui/material';
import { Plus, Trash2, Edit, Settings, Sparkles, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { useElectionStore } from '../../store/electionStore';
import { NavLink } from 'react-router-dom';

const ClassesAndSections = () => {
  const [tab, setTab] = useState(0);
  const { selectedElectionId, selectedElectionName, selectedElectionStatus } = useElectionStore();
  const isConfiguring = selectedElectionStatus === 'DRAFT' || selectedElectionStatus === 'CONFIGURING';
  const [openSection, setOpenSection] = useState(false);
  const [openClass, setOpenClass] = useState(false);
  const [sectionName, setSectionName] = useState('');
  const [editingSection, setEditingSection] = useState<any>(null);
  const [classForm, setClassForm] = useState({ name: '', section_id: '' });
  const [editingClass, setEditingClass] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchSection, setSearchSection] = useState('');
  const [searchClass, setSearchClass] = useState('');
  const queryClient = useQueryClient();

  // No local election query needed

  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ['sections', selectedElectionId],
    enabled: !!selectedElectionId,
    queryFn: async () => (await axiosInstance.get(`/sections/get-sections?election_id=${selectedElectionId}`)).data
  });

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes', selectedElectionId],
    enabled: !!selectedElectionId,
    queryFn: async () => (await axiosInstance.get(`/classes/get-classes?election_id=${selectedElectionId}`)).data
  });

  const upsertSectionMutation = useMutation({
    mutationFn: (name: string) => {
      if (editingSection) {
        return axiosInstance.put(`/sections/${editingSection.id}`, { name });
      }
      return axiosInstance.post('/sections/create', { name, election_id: selectedElectionId });
    },
    onSuccess: () => {
      setSuccess(editingSection ? 'Section updated!' : 'Section created!');
      setOpenSection(false);
      setEditingSection(null);
      setSectionName('');
      queryClient.invalidateQueries({ queryKey: ['sections', selectedElectionId] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error processing section')
  });

  const upsertClassMutation = useMutation({
    mutationFn: (data: typeof classForm) => {
      if (editingClass) {
        return axiosInstance.put(`/classes/${editingClass.id}`, data);
      }
      return axiosInstance.post('/classes/create', { ...data, election_id: selectedElectionId });
    },
    onSuccess: () => {
      setSuccess(editingClass ? 'Class updated!' : 'Class created!');
      setOpenClass(false);
      setEditingClass(null);
      setClassForm({ name: '', section_id: '' });
      queryClient.invalidateQueries({ queryKey: ['classes', selectedElectionId] });
      queryClient.invalidateQueries({ queryKey: ['voters', selectedElectionId] }); // Also invalidate voters as they rely on classes
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error processing class')
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/sections/${id}`),
    onSuccess: () => {
      setSuccess('Section deleted!');
      queryClient.invalidateQueries({ queryKey: ['sections', selectedElectionId] });
    }
  });

  const deleteClassMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/classes/${id}`),
    onSuccess: () => {
      setSuccess('Class deleted!');
      queryClient.invalidateQueries({ queryKey: ['classes', selectedElectionId] });
    }
  });

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>Classes & Sections</Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      {!isConfiguring && selectedElectionId && (
        <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>
           <strong>Configuration Locked:</strong> Adding, editing, or deleting classes and sections is strictly disabled because this election is no longer in Configuration Mode.
        </Alert>
      )}

      <Box sx={{ 
        mb: 4, 
        display: 'flex'
      }}>
        <Box sx={{ 
          p: '1.5px', // Slightly thicker for better visibility
          borderRadius: '24px', 
          background: 'linear-gradient(45deg, #6366f1, #a855f7, #f43f5e)',
          boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.4)',
          position: 'relative'
        }}>
          <Box sx={{ 
            px: 3, 
            py: 2, 
            borderRadius: '23px', // Matched to outer border radius
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
                display: 'block',
                mb: 0.5
              }}>
                Active Configuration
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
                {selectedElectionName || 'No Election Selected'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {selectedElectionId ? (
        <Paper>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Sections" />
            <Tab label="Classes" />
          </Tabs>

          {/* Sections Tab */}
          {tab === 0 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, mb: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search sections..."
                  value={searchSection}
                  onChange={(e) => setSearchSection(e.target.value)}
                  InputProps={{
                    startAdornment: <Search size={18} style={{ marginRight: 8, color: 'gray' }} />
                  }}
                />
                {isConfiguring && (
                  <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => { setError(null); setOpenSection(true); }}>
                    Add Section
                  </Button>
                )}
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Section Name</TableCell>
                      <TableCell>Created At</TableCell>
                      {isConfiguring && <TableCell align="right">Actions</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sectionsLoading ? (
                      <TableRow><TableCell colSpan={isConfiguring ? 3 : 2} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                    ) : (sections?.filter((s: any) => s.name.toLowerCase().includes(searchSection.toLowerCase())) || []).length === 0 ? (
                      <TableRow><TableCell colSpan={isConfiguring ? 3 : 2} align="center" sx={{ color: 'text.secondary' }}>
                        {searchSection ? 'No sections match your search' : 'No sections yet'}
                      </TableCell></TableRow>
                    ) : (sections?.filter((s: any) => s.name.toLowerCase().includes(searchSection.toLowerCase())) || []).map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{s.name}</TableCell>
                        <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                        {isConfiguring && (
                          <TableCell align="right">
                            <IconButton onClick={() => { setError(null); setEditingSection(s); setSectionName(s.name); setOpenSection(true); }} color="primary">
                              <Edit size={18} />
                            </IconButton>
                            <IconButton onClick={() => deleteSectionMutation.mutate(s.id)} color="error">
                              <Trash2 size={18} />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Classes Tab */}
          {tab === 1 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, mb: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search classes..."
                  value={searchClass}
                  onChange={(e) => setSearchClass(e.target.value)}
                  InputProps={{
                    startAdornment: <Search size={18} style={{ marginRight: 8, color: 'gray' }} />
                  }}
                />
                {isConfiguring && (
                  <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => { setError(null); setOpenClass(true); }}>
                    Add Class
                  </Button>
                )}
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Class Name</TableCell>
                      <TableCell>Section</TableCell>
                      <TableCell>Created At</TableCell>
                      {isConfiguring && <TableCell align="right">Actions</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {classesLoading ? (
                      <TableRow><TableCell colSpan={isConfiguring ? 4 : 3} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                    ) : (classes?.filter((c: any) => c.name.toLowerCase().includes(searchClass.toLowerCase()) || (c.section_name && c.section_name.toLowerCase().includes(searchClass.toLowerCase()))) || []).length === 0 ? (
                      <TableRow><TableCell colSpan={isConfiguring ? 4 : 3} align="center" sx={{ color: 'text.secondary' }}>
                        {searchClass ? 'No classes match your search' : 'No classes yet'}
                      </TableCell></TableRow>
                    ) : (classes?.filter((c: any) => c.name.toLowerCase().includes(searchClass.toLowerCase()) || (c.section_name && c.section_name.toLowerCase().includes(searchClass.toLowerCase()))) || []).map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                        <TableCell>{c.section_name || c.section_id}</TableCell>
                        <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                        {isConfiguring && (
                          <TableCell align="right">
                            <IconButton onClick={() => { 
                              setError(null);
                              setEditingClass(c); 
                              setClassForm({ name: c.name, section_id: c.section_id || '' }); 
                              setOpenClass(true); 
                            }} color="primary">
                              <Edit size={18} />
                            </IconButton>
                            <IconButton onClick={() => deleteClassMutation.mutate(c.id)} color="error">
                              <Trash2 size={18} />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Paper>
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

      <Dialog open={openSection} onClose={() => { setOpenSection(false); setEditingSection(null); }} maxWidth="xs" fullWidth>
        <DialogTitle>{editingSection ? 'Edit Section' : 'Add New Section'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, mt: 1, borderRadius: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Section Name" sx={{ mt: 1 }}
            placeholder="e.g. Primary, Secondary, Senior Secondary"
            value={sectionName} onChange={e => setSectionName(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => { setOpenSection(false); setEditingSection(null); }}>Cancel</Button>
          <Button variant="contained" onClick={() => upsertSectionMutation.mutate(sectionName)}
            disabled={upsertSectionMutation.isPending || !sectionName}>
            {upsertSectionMutation.isPending ? <CircularProgress size={20} /> : (editingSection ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openClass} onClose={() => { setOpenClass(false); setEditingClass(null); }} maxWidth="xs" fullWidth>
        <DialogTitle>{editingClass ? 'Edit Class' : 'Add New Class'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, mt: 1, borderRadius: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField fullWidth label="Class Name" placeholder="e.g. Grade 10-A"
              value={classForm.name} onChange={e => setClassForm(p => ({ ...p, name: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Section</InputLabel>
              <Select value={classForm.section_id} label="Section"
                onChange={e => setClassForm(p => ({ ...p, section_id: e.target.value }))}>
                {sections?.map((s: any) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => { setOpenClass(false); setEditingClass(null); }}>Cancel</Button>
          <Button variant="contained" onClick={() => upsertClassMutation.mutate(classForm)}
            disabled={upsertClassMutation.isPending || !classForm.name || !classForm.section_id}>
            {upsertClassMutation.isPending ? <CircularProgress size={20} /> : (editingClass ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassesAndSections;
