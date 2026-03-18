import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress, IconButton,
  Chip, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Plus, Trash2, Edit, Sparkles, Settings, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { useElectionStore } from '../../store/electionStore';
import { NavLink } from 'react-router-dom';

const Posts = () => {
  const [openPost, setOpenPost] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const { selectedElectionId, selectedElectionName, selectedElectionStatus } = useElectionStore();
  const isConfiguring = selectedElectionStatus === 'DRAFT' || selectedElectionStatus === 'CONFIGURING';
  const [postForm, setPostForm] = useState({
    name: '', gender_rule: 'ANY', candidate_classes: [] as number[], voting_classes: [] as number[]
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Helper to fetch class names for the table view
  const getClassName = (id: number) => {
    return classes?.find((c: any) => c.id === id)?.name || id;
  };

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

  const upsertPostMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingPost) {
        return axiosInstance.put(`/posts/${editingPost.id}`, { ...data, election_id: selectedElectionId });
      }
      return axiosInstance.post('/posts/create', { ...data, election_id: selectedElectionId });
    },
    onSuccess: () => {
      setSuccess(editingPost ? 'Post updated!' : 'Post created!');
      setOpenPost(false);
      setEditingPost(null);
      setPostForm({ name: '', gender_rule: 'ANY', candidate_classes: [], voting_classes: [] });
      queryClient.invalidateQueries({ queryKey: ['posts', selectedElectionId] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error saving post')
  });

  const handleEditClick = (post: any) => {
    setEditingPost(post);
    setPostForm({
      name: post.name,
      gender_rule: post.gender_rule,
      candidate_classes: post.candidate_classes || [],
      voting_classes: post.voting_classes || []
    });
    setOpenPost(true);
  };

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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search size={18} style={{ marginRight: 8, color: 'gray' }} />
            }}
          />
          {isConfiguring && (
            <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => { setError(null); setEditingPost(null); setPostForm({ name: '', gender_rule: 'ANY', candidate_classes: [], voting_classes: [] }); setOpenPost(true); }} disabled={!selectedElectionId}>
              Add Post
            </Button>
          )}
        </Box>
      </Box>

      {!isConfiguring && selectedElectionId && (
        <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>
           <strong>Configuration Locked:</strong> Adding, editing, or deleting posts is strictly disabled once an election leaves Configuration Mode.
        </Alert>
      )}

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
      {error && !openPost && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {selectedElectionId ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Post Name</TableCell>
                <TableCell>Gender Rule</TableCell>
                <TableCell>Candidate Classes</TableCell>
                <TableCell>Voting Classes</TableCell>
                {isConfiguring && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={isConfiguring ? 5 : 4} align="center"><CircularProgress size={24} /></TableCell></TableRow>
              ) : (posts?.filter((post: any) => post.name.toLowerCase().includes(searchQuery.toLowerCase())) || []).length === 0 ? (
                <TableRow><TableCell colSpan={isConfiguring ? 5 : 4} align="center" sx={{ color: 'text.secondary' }}>
                  {searchQuery ? 'No posts match your search' : 'No posts created yet'}
                </TableCell></TableRow>
              ) : (posts?.filter((post: any) => post.name.toLowerCase().includes(searchQuery.toLowerCase())) || []).map((post: any) => (
                <TableRow key={post.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{post.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={post.gender_rule === 'M' ? '♂ Male Only' : post.gender_rule === 'F' ? '♀ Female Only' : '⚥ Any'}
                      color={post.gender_rule === 'M' ? 'info' : post.gender_rule === 'F' ? 'secondary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 200 }}>
                    {Array.isArray(post.candidate_classes) && post.candidate_classes.length > 0
                      ? post.candidate_classes.map((id: number) => (
                          <Chip key={id} label={getClassName(id)} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))
                      : '-'}
                  </TableCell>
                  <TableCell sx={{ minWidth: 200 }}>
                    {Array.isArray(post.voting_classes) && post.voting_classes.length > 0
                      ? post.voting_classes.map((id: number) => (
                          <Chip key={id} label={getClassName(id)} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))
                      : '-'}
                  </TableCell>
                  {isConfiguring && (
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleEditClick(post)}>
                        <Edit size={18} />
                      </IconButton>
                      <IconButton color="error" onClick={() => deletePostMutation.mutate(post.id)}>
                        <Trash2 size={18} />
                      </IconButton>
                    </TableCell>
                  )}
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

      {/* Create/Edit Post Dialog */}
      <Dialog open={openPost} onClose={() => { setError(null); setOpenPost(false); setEditingPost(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPost ? 'Edit Post' : 'Add New Post'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}
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
            <Box sx={{ 
              p: 2, 
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 2,
              bgcolor: 'background.default' 
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Candidate Classes
                </Typography>
                <Chip 
                  label="Select All" 
                  size="small" 
                  onClick={() => setPostForm(p => ({ ...p, candidate_classes: p.candidate_classes.length === classes?.length ? [] : classes?.map((c: any) => c.id) || [] }))} 
                  sx={{ height: 20, fontSize: '0.65rem', cursor: 'pointer' }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {classes?.map((c: any) => {
                  const isSelected = postForm.candidate_classes.includes(c.id);
                  return (
                    <Chip
                      key={c.id}
                      label={c.name}
                      onClick={() => {
                        setPostForm(p => ({
                          ...p,
                          candidate_classes: isSelected 
                            ? p.candidate_classes.filter(id => id !== c.id)
                            : [...p.candidate_classes, c.id]
                        }));
                      }}
                      color={isSelected ? "primary" : "default"}
                      variant={isSelected ? "filled" : "outlined"}
                      sx={{ transition: 'all 0.2s', '&:hover': { transform: 'scale(1.05)', boxShadow: 2 } }}
                    />
                  );
                })}
              </Box>
            </Box>

            <Box sx={{ 
              p: 2, 
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 2,
              bgcolor: 'background.default' 
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Voting Classes (Eligible to Vote)
                </Typography>
                <Chip 
                  label="Select All" 
                  size="small" 
                  onClick={() => setPostForm(p => ({ ...p, voting_classes: p.voting_classes.length === classes?.length ? [] : classes?.map((c: any) => c.id) || [] }))} 
                  sx={{ height: 20, fontSize: '0.65rem', cursor: 'pointer' }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {classes?.map((c: any) => {
                  const isSelected = postForm.voting_classes.includes(c.id);
                  return (
                    <Chip
                      key={c.id}
                      label={c.name}
                      onClick={() => {
                        setPostForm(p => ({
                          ...p,
                          voting_classes: isSelected 
                            ? p.voting_classes.filter(id => id !== c.id)
                            : [...p.voting_classes, c.id]
                        }));
                      }}
                      color={isSelected ? "secondary" : "default"}
                      variant={isSelected ? "filled" : "outlined"}
                      sx={{ transition: 'all 0.2s', '&:hover': { transform: 'scale(1.05)', boxShadow: 2 } }}
                    />
                  );
                })}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => { setError(null); setOpenPost(false); setEditingPost(null); }}>Cancel</Button>
          <Button variant="contained" onClick={() => upsertPostMutation.mutate(postForm)}
            disabled={upsertPostMutation.isPending || !postForm.name}>
            {upsertPostMutation.isPending ? <CircularProgress size={20} /> : (editingPost ? 'Update Post' : 'Create Post')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Posts;
