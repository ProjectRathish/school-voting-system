import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress, IconButton,
  Grid, Chip, FormControl, InputLabel, Select, MenuItem, Accordion,
  AccordionSummary, AccordionDetails
} from '@mui/material';
import { Plus, Trash2, ChevronDown, Sparkles, Settings } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { useElectionStore } from '../../store/electionStore';
import { NavLink } from 'react-router-dom';

const Posts = () => {
  const [openPost, setOpenPost] = useState(false);
  const { selectedElectionId, selectedElectionName } = useElectionStore();
  const [postForm, setPostForm] = useState({
    name: '', gender_rule: 'ANY', candidate_classes: [] as number[], voting_classes: [] as number[]
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // No local election query needed

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', selectedElectionId],
    enabled: !!selectedElectionId,
    queryFn: async () => (await axiosInstance.get(`/posts/get-posts?election_id=${selectedElectionId}`)).data
  });

  const { data: classes } = useQuery({
    queryKey: ['classes', selectedElectionId],
    enabled: !!selectedElectionId,
    queryFn: async () => (await axiosInstance.get(`/classes/get-classes?election_id=${selectedElectionId}`)).data
  });

  const createPostMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.post('/posts/create', { ...data, election_id: selectedElectionId }),
    onSuccess: () => {
      setSuccess('Post created!');
      setOpenPost(false);
      setPostForm({ name: '', gender_rule: 'ANY', candidate_classes: [], voting_classes: [] });
      queryClient.invalidateQueries({ queryKey: ['posts', selectedElectionId] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error creating post')
  });

  const deletePostMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/posts/${id}`),
    onSuccess: () => {
      setSuccess('Post deleted!');
      queryClient.invalidateQueries({ queryKey: ['posts', selectedElectionId] });
    }
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Post Management</Typography>
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => setOpenPost(true)} disabled={!selectedElectionId}>
          Add Post
        </Button>
      </Box>

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

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}


      {selectedElectionId ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Post Name</TableCell>
                <TableCell>Gender Rule</TableCell>
                <TableCell>Candidate Classes</TableCell>
                <TableCell>Voting Classes</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={24} /></TableCell></TableRow>
              ) : posts?.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ color: 'text.secondary' }}>No posts created yet</TableCell></TableRow>
              ) : posts?.map((post: any) => (
                <TableRow key={post.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{post.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={post.gender_rule === 'M' ? '♂ Male Only' : post.gender_rule === 'F' ? '♀ Female Only' : '⚥ Any'}
                      color={post.gender_rule === 'M' ? 'info' : post.gender_rule === 'F' ? 'secondary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{Array.isArray(post.candidate_classes) ? post.candidate_classes.length + ' classes' : '-'}</TableCell>
                  <TableCell>{Array.isArray(post.voting_classes) ? post.voting_classes.length + ' classes' : '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => deletePostMutation.mutate(post.id)} color="error">
                      <Trash2 size={18} />
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

      {/* Create Post Dialog */}
      <Dialog open={openPost} onClose={() => setOpenPost(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Post</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField label="Post Name" fullWidth placeholder="e.g. Head Boy, House Captain"
              value={postForm.name}
              onChange={e => setPostForm(p => ({ ...p, name: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Gender Eligibility</InputLabel>
              <Select value={postForm.gender_rule} label="Gender Eligibility"
                onChange={e => setPostForm(p => ({ ...p, gender_rule: e.target.value }))}>
                <MenuItem value="ANY">Any Gender</MenuItem>
                <MenuItem value="M">Male Only</MenuItem>
                <MenuItem value="F">Female Only</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Candidate Classes</InputLabel>
              <Select multiple value={postForm.candidate_classes} label="Candidate Classes"
                onChange={e => setPostForm(p => ({ ...p, candidate_classes: e.target.value as number[] }))}>
                {classes?.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Voting Classes (who can vote for this post)</InputLabel>
              <Select multiple value={postForm.voting_classes} label="Voting Classes (who can vote for this post)"
                onChange={e => setPostForm(p => ({ ...p, voting_classes: e.target.value as number[] }))}>
                {classes?.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenPost(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => createPostMutation.mutate(postForm)}
            disabled={createPostMutation.isPending || !postForm.name}>
            {createPostMutation.isPending ? <CircularProgress size={20} /> : 'Create Post'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Posts;
