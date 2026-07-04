import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress, IconButton,
  Chip, FormControl, InputLabel, Select, MenuItem, Tooltip, Snackbar, alpha, Switch, FormControlLabel
} from '@mui/material';
import { Plus, Trash2, Edit, Sparkles, Settings, Search, Copy } from 'lucide-react';
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
    name: '', priority: 0, gender_rule: 'ANY', allow_nota: 0, candidate_classes: [] as number[], voting_classes: [] as number[]
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [postToDelete, setPostToDelete] = useState<any>(null);
  const [openImport, setOpenImport] = useState(false);
  const [sourceElection, setSourceElection] = useState('');
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

  const { data: elections } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => (await axiosInstance.get('/elections/get-elections')).data
  });

  const importPostsMutation = useMutation({
    mutationFn: (from_election_id: string) => axiosInstance.post(`/elections/${selectedElectionId}/import-posts`, { from_election_id }),
    onSuccess: (res) => {
      setSuccess(res.data.message);
      setOpenImport(false);
      setSourceElection('');
      queryClient.invalidateQueries({ queryKey: ['posts', selectedElectionId] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error importing positions')
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
      setPostForm({ name: '', priority: 0, gender_rule: 'ANY', allow_nota: 0, candidate_classes: [], voting_classes: [] });
      queryClient.invalidateQueries({ queryKey: ['posts', selectedElectionId] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error saving post')
  });

  const handleEditClick = (post: any) => {
    setEditingPost(post);
    setPostForm({
      name: post.name,
      priority: post.priority || 0,
      gender_rule: post.gender_rule,
      allow_nota: post.allow_nota !== undefined ? post.allow_nota : 0,
      candidate_classes: post.candidate_classes || [],
      voting_classes: post.voting_classes || []
    });
    setOpenPost(true);
  };

  const deletePostMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/posts/${id}`),
    onSuccess: () => {
      setSuccess('Post deleted!');
      setPostToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['posts', selectedElectionId] });
    }
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 4, flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-1px', color: 'text.primary' }}>Post Management</Typography>
        <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', md: 'auto' }, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            size="small"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1, bgcolor: 'background.paper', borderRadius: 2 }}
            InputProps={{
              startAdornment: <Search size={18} style={{ marginRight: 8, color: 'gray' }} />,
              sx: { borderRadius: 2 }
            }}
          />
          {isConfiguring && (
            <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', sm: 'auto' }, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button 
                variant="outlined" 
                startIcon={<Copy size={18} />} 
                onClick={() => setOpenImport(true)} 
                disabled={!selectedElectionId}
                sx={{ borderRadius: 2, height: { xs: 44, sm: 40 } }}
              >
                Import Structure
              </Button>
              <Button 
                variant="contained" 
                startIcon={<Plus size={20} />} 
                onClick={() => { setError(null); setEditingPost(null); setPostForm({ name: '', priority: 0, gender_rule: 'ANY', allow_nota: 0, candidate_classes: [], voting_classes: [] }); setOpenPost(true); }} 
                disabled={!selectedElectionId}
                sx={{ borderRadius: 2, height: { xs: 44, sm: 40 }, fontWeight: 700 }}
              >
                Add Post
              </Button>
            </Box>
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
                {selectedElectionName || 'No Election Selected'}
              </Typography>
            </Box>
          </Box>
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

      <Snackbar
        open={!!error && !openPost}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
          {error}
        </Alert>
      </Snackbar>
      {selectedElectionId ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.08) }}>
                <TableCell sx={{ fontWeight: 800 }}>Order</TableCell>
                <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Post Name</TableCell>
                <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Gender Rule</TableCell>
                <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>NOTA</TableCell>
                <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Candidate Classes</TableCell>
                <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Voting Classes</TableCell>
                {isConfiguring && <TableCell align="right" sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={isConfiguring ? 7 : 6} align="center"><CircularProgress size={24} /></TableCell></TableRow>
              ) : (posts?.filter((post: any) => post.name.toLowerCase().includes(searchQuery.toLowerCase())) || []).length === 0 ? (
                <TableRow><TableCell colSpan={isConfiguring ? 7 : 6} align="center" sx={{ color: 'text.secondary' }}>
                  {searchQuery ? 'No posts match your search' : 'No posts created yet'}
                </TableCell></TableRow>
              ) : (posts?.filter((post: any) => post.name.toLowerCase().includes(searchQuery.toLowerCase())) || []).sort((a,b) => a.priority - b.priority).map((post: any) => (
                <TableRow key={post.id}>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>#{post.priority || 0}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{post.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={post.gender_rule === 'M' ? '♂ Male Only' : post.gender_rule === 'F' ? '♀ Female Only' : '⚥ Any'}
                      color={post.gender_rule === 'M' ? 'info' : post.gender_rule === 'F' ? 'secondary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                     <Chip 
                        label={post.allow_nota !== 0 ? 'Enabled' : 'Disabled'} 
                        color={post.allow_nota !== 0 ? 'success' : 'error'} 
                        size="small" 
                        variant="outlined"
                     />
                  </TableCell>
                  <TableCell sx={{ minWidth: 200 }}>
                    {Array.isArray(post.candidate_classes) && post.candidate_classes.length > 0
                      ? [...post.candidate_classes].sort((a,b) => getClassName(a).toString().localeCompare(getClassName(b).toString(), undefined, {numeric: true})).map((id: number) => (
                          <Chip key={id} label={getClassName(id)} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))
                      : '-'}
                  </TableCell>
                  <TableCell sx={{ minWidth: 200 }}>
                    {Array.isArray(post.voting_classes) && post.voting_classes.length > 0
                      ? [...post.voting_classes].sort((a,b) => getClassName(a).toString().localeCompare(getClassName(b).toString(), undefined, {numeric: true})).map((id: number) => (
                          <Chip key={id} label={getClassName(id)} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))
                      : '-'}
                  </TableCell>
                  {isConfiguring && (
                    <TableCell align="right">
                      <Tooltip title="Edit Post">
                        <IconButton color="primary" onClick={() => handleEditClick(post)}>
                          <Edit size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Post">
                        <IconButton color="error" onClick={() => setPostToDelete(post)}>
                          <Trash2 size={18} />
                        </IconButton>
                      </Tooltip>
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
            <TextField
              fullWidth
              label="Position Name"
              value={postForm.name}
              onChange={(e) => setPostForm({ ...postForm, name: e.target.value.toUpperCase() })}
              placeholder="E.G. SCHOOL CAPTAIN"
            />
            <TextField
              fullWidth
              label="Display Order (Priority)"
              type="number"
              value={postForm.priority}
              onChange={(e) => setPostForm({ ...postForm, priority: parseInt(e.target.value) || 0 })}
              helperText="Lower numbers appear first (e.g., 1 for School Captain, 2 for Vice Captain)"
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
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.default' }}>
               <FormControlLabel
                  control={<Switch checked={!!postForm.allow_nota} onChange={(e) => setPostForm(p => ({ ...p, allow_nota: e.target.checked ? 1 : 0 }))} />}
                  label={
                     <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>Enable NOTA</Typography>
                        <Typography variant="caption" color="text.secondary">Allow "None of the Above" option for this post</Typography>
                     </Box>
                  }
               />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => { setError(null); setOpenPost(false); setEditingPost(null); }}>Cancel</Button>
          <Button variant="contained" onClick={() => upsertPostMutation.mutate(postForm)}
            disabled={upsertPostMutation.isPending || !postForm.name || postForm.candidate_classes.length === 0 || postForm.voting_classes.length === 0}>
            {upsertPostMutation.isPending ? <CircularProgress size={20} /> : (editingPost ? 'Update Post' : 'Create Post')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!postToDelete} onClose={() => setPostToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the post <strong>{postToDelete?.name}</strong>? 
          This will also remove all candidate records associated with this post.
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setPostToDelete(null)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={() => deletePostMutation.mutate(postToDelete.id)}
            disabled={deletePostMutation.isPending}
          >
            {deletePostMutation.isPending ? <CircularProgress size={20} /> : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Positions Dialog */}
      <Dialog open={openImport} onClose={() => setOpenImport(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Import Position Structure</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Choose a previous election to copy its position names and eligibility rules.
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Select Source Election</InputLabel>
            <Select 
              value={sourceElection} 
              label="Select Source Election" 
              onChange={e => setSourceElection(e.target.value as string)}
            >
              {elections?.filter((e: any) => String(e.id) !== String(selectedElectionId)).map((e: any) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.name} ({new Date(e.created_at).getFullYear()})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
            This only copies the list of positions (e.g., President, Secretary). Candidates and Votes are not copied.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenImport(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<Copy size={18} />}
            disabled={!sourceElection || importPostsMutation.isPending}
            onClick={() => importPostsMutation.mutate(sourceElection)}
          >
            {importPostsMutation.isPending ? <CircularProgress size={20} /> : 'Import Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Posts;
