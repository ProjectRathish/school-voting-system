import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, CircularProgress, IconButton,
  FormControl, InputLabel, Select, MenuItem, Avatar, Chip
} from '@mui/material';
import { Plus, Trash2, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';

const Candidates = () => {
  const [selectedElection, setSelectedElection] = useState('');
  const [selectedPost, setSelectedPost] = useState('');
  const [open, setOpen] = useState(false);
  const [candidateForm, setCandidateForm] = useState({ voter_id: '', post_id: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: elections } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => (await axiosInstance.get('/elections/get-elections')).data
  });

  const { data: posts } = useQuery({
    queryKey: ['posts', selectedElection],
    enabled: !!selectedElection,
    queryFn: async () => (await axiosInstance.get(`/posts/get-posts?election_id=${selectedElection}`)).data
  });

  const { data: voters } = useQuery({
    queryKey: ['voters', selectedElection],
    enabled: !!selectedElection,
    queryFn: async () => (await axiosInstance.get(`/voters/get-voters?election_id=${selectedElection}`)).data
  });

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['candidates', selectedElection, selectedPost],
    enabled: !!selectedElection,
    queryFn: async () => {
      const params = new URLSearchParams({ election_id: selectedElection });
      if (selectedPost) params.append('post_id', selectedPost);
      return (await axiosInstance.get(`/candidates/get-candidates?${params}`)).data;
    }
  });

  const selectedElectionObj = elections?.find((e: any) => String(e.id) === String(selectedElection));
  const isConfiguring = selectedElectionObj && (selectedElectionObj.status === 'CONFIGURING' || selectedElectionObj.status === 'DRAFT');

  const addCandidateMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.post('/candidates/register', { ...data, election_id: selectedElection }),
    onSuccess: () => {
      setSuccess('Candidate registered!');
      setOpen(false);
      setCandidateForm({ voter_id: '', post_id: '' });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error registering candidate')
  });

  const deleteCandidateMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/candidates/${id}`),
    onSuccess: () => {
      setSuccess('Candidate removed!');
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    }
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Candidate Management</Typography>
        {isConfiguring && (
          <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => { setError(null); setOpen(true); }} disabled={!selectedElection}>
            Register Candidate
          </Button>
        )}
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {!isConfiguring && selectedElection && (
        <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>
           <strong>Configuration Locked:</strong> Adding or removing candidates is completely disabled because this election is no longer in Configuration Mode.
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 280 }}>
            <InputLabel>Select Election</InputLabel>
            <Select value={selectedElection} label="Select Election" onChange={e => { setSelectedElection(e.target.value); setSelectedPost(''); }}>
              {elections?.map((el: any) => <MenuItem key={el.id} value={el.id}>{el.name}</MenuItem>)}
            </Select>
          </FormControl>
          {selectedElection && (
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Post</InputLabel>
              <Select value={selectedPost} label="Filter by Post" onChange={e => setSelectedPost(e.target.value)}>
                <MenuItem value="">All Posts</MenuItem>
                {posts?.map((p: any) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
              </Select>
            </FormControl>
          )}
        </Box>
      </Paper>

      {selectedElection && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Candidate</TableCell>
                <TableCell>Admission No</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Post</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={24} /></TableCell></TableRow>
              ) : candidates?.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ color: 'text.secondary' }}>No candidates registered</TableCell></TableRow>
              ) : candidates?.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={c.photo ? `/uploads/${c.photo}` : undefined} sx={{ bgcolor: 'primary.main' }}>
                        {c.candidate_name?.charAt(0) || <User size={16} />}
                      </Avatar>
                      <Typography fontWeight={600}>{c.candidate_name || c.voter_name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{c.admission_no}</TableCell>
                  <TableCell>{c.class_name}</TableCell>
                  <TableCell><Chip label={c.post_name} size="small" color="primary" /></TableCell>
                  <TableCell>
                    <Chip label={c.sex === 'M' ? '♂ Male' : '♀ Female'} size="small"
                      color={c.sex === 'M' ? 'info' : 'secondary'} />
                  </TableCell>
                  <TableCell align="right">
                    {isConfiguring && (
                      <IconButton onClick={() => deleteCandidateMutation.mutate(c.id)} color="error" size="small">
                        <Trash2 size={16} />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Register Candidate Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register Candidate</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Post</InputLabel>
              <Select value={candidateForm.post_id} label="Post"
                onChange={e => setCandidateForm(p => ({ ...p, post_id: e.target.value }))}>
                {posts?.map((p: any) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name} ({p.gender_rule === 'M' ? '♂ Males only' : p.gender_rule === 'F' ? '♀ Females only' : '⚥ Any'})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Student (Voter)</InputLabel>
              <Select value={candidateForm.voter_id} label="Student (Voter)"
                onChange={e => setCandidateForm(p => ({ ...p, voter_id: e.target.value }))}>
                {voters?.map((v: any) => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.name} ({v.admission_no}) — {v.class_name || 'Class ' + v.class_id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => addCandidateMutation.mutate(candidateForm)}
            disabled={addCandidateMutation.isPending || !candidateForm.voter_id || !candidateForm.post_id}>
            {addCandidateMutation.isPending ? <CircularProgress size={20} /> : 'Register'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Candidates;
