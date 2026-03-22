import { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, CircularProgress, IconButton,
  FormControl, InputLabel, Select, MenuItem, Avatar, Chip, Autocomplete, TextField, Tooltip, Grid
} from '@mui/material';
import { Plus, Trash2, User, Sparkles, Edit, Camera, Image, Upload } from 'lucide-react';
import { useElectionStore } from '../../store/electionStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import getCroppedImg from '../../utils/cropImage';
import Cropper from 'react-easy-crop';
import { Slider } from '@mui/material';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const Candidates = () => {
  const { selectedElectionId, selectedElectionName, selectedElectionStatus } = useElectionStore();
  const [selectedPost, setSelectedPost] = useState('');
  const [open, setOpen] = useState(false);
  const [candidateForm, setCandidateForm] = useState({ voter_id: '', post_id: '' });
  const [editingCandidate, setEditingCandidate] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [symbol, setSymbol] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [symbolPreview, setSymbolPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const symbolInputRef = useRef<HTMLInputElement>(null);

  // Cropping state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [croppingFor, setCroppingFor] = useState<'photo' | 'symbol' | null>(null);


  const { data: elections } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => (await axiosInstance.get('/elections/get-elections')).data
  });

  const { data: posts } = useQuery({
    queryKey: ['posts', selectedElectionId],
    enabled: !!selectedElectionId,
    queryFn: async () => (await axiosInstance.get(`/posts/get-posts?election_id=${selectedElectionId}`)).data
  });

  const { data: voters } = useQuery({
    queryKey: ['voters', selectedElectionId],
    enabled: !!selectedElectionId,
    queryFn: async () => (await axiosInstance.get(`/voters/get-voters?election_id=${selectedElectionId}`)).data
  });

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['candidates', selectedElectionId, selectedPost],
    enabled: !!selectedElectionId,
    queryFn: async () => {
      const params = new URLSearchParams({ election_id: selectedElectionId });
      if (selectedPost) params.append('post_id', selectedPost);
      return (await axiosInstance.get(`/candidates/get-candidates?${params}`)).data;
    }
  });

  const isConfiguring = selectedElectionStatus === 'CONFIGURING' || selectedElectionStatus === 'DRAFT';

  const addCandidateMutation = useMutation({
    mutationFn: (data: any) => {
      const formData = new FormData();
      formData.append('election_id', selectedElectionId || '');
      formData.append('voter_id', data.voter_id);
      formData.append('post_id', data.post_id);
      
      // Get admission_no for multer
      const voter = voters?.find((v: any) => v.id === data.voter_id);
      if (voter) {
        formData.append('admission_no', voter.admission_no);
      }

      if (photo) formData.append('photo', photo, 'candidate_photo.jpg');
      if (symbol) formData.append('symbol', symbol, 'candidate_symbol.png');
      
      return axiosInstance.post('/candidates/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      setSuccess('Candidate registered!');
      setOpen(false);
      setCandidateForm({ voter_id: '', post_id: '' });
      setPhoto(null);
      setSymbol(null);
      setPhotoPreview(null);
      setSymbolPreview(null);
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['voters'] });
      queryClient.invalidateQueries({ queryKey: ['school-admin-stats'] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error registering candidate')
  });

  const deleteCandidateMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/candidates/${id}`),
    onSuccess: () => {
      setSuccess('Candidate removed!');
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['voters'] });
      queryClient.invalidateQueries({ queryKey: ['school-admin-stats'] });
    }
  });

  const updateCandidateMutation = useMutation({
    mutationFn: (data: any) => {
      const formData = new FormData();
      formData.append('election_id', selectedElectionId || '');
      if (data.post_id) formData.append('post_id', data.post_id);
      
      // MULTER NEEDS ADMISSION NO
      if (editingCandidate?.admission_no) {
        formData.append('admission_no', editingCandidate.admission_no);
      }

      if (photo) formData.append('photo', photo, 'candidate_photo.jpg');
      if (symbol) formData.append('symbol', symbol, 'candidate_symbol.png');
      
      return axiosInstance.put(`/candidates/${editingCandidate.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      setSuccess('Candidate updated!');
      setEditOpen(false);
      setEditingCandidate(null);
      setPhoto(null);
      setSymbol(null);
      setPhotoPreview(null);
      setSymbolPreview(null);
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error updating candidate')
  });

// Validation effect
  useEffect(() => {
    if (candidateForm.voter_id && candidateForm.post_id) {
      const voter = voters?.find((v: any) => v.id === candidateForm.voter_id);
      const post = posts?.find((p: any) => p.id === candidateForm.post_id);

      if (voter && post) {
        // Check gender
        if (post.gender_rule !== 'ANY' && voter.sex !== post.gender_rule) {
          setEligibilityError(`This post is reserved for ${post.gender_rule === 'M' ? 'Male' : 'Female'} candidates only.`);
        } 
        // Check block status
        else if (voter.is_blocked) {
          setEligibilityError(`This student is currently blocked and cannot be registered as a candidate.`);
        }
        // Check class
        else if (post.candidate_classes && !post.candidate_classes.includes(voter.class_id)) {
          setEligibilityError(`Students from class ${voter.class_name} are not eligible for this post.`);
        }
        else {
          setEligibilityError(null);
        }
      }
    } else {
      setEligibilityError(null);
    }
  }, [candidateForm.voter_id, candidateForm.post_id, voters, posts]);

  // Photo handling with crop
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setCroppingFor('photo');
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setCroppingFor('symbol');
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropConfirm = async () => {
    if (imageToCrop && croppedAreaPixels && croppingFor) {
      try {
        const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
        const fileName = croppingFor === 'photo' ? 'photo.jpg' : 'symbol.png';
        const file = new File([croppedImage], fileName, { type: croppingFor === 'photo' ? 'image/jpeg' : 'image/png' });
        
        if (croppingFor === 'photo') {
          setPhoto(file);
          setPhotoPreview(URL.createObjectURL(file));
        } else {
          setSymbol(file);
          setSymbolPreview(URL.createObjectURL(file));
        }
        setCropDialogOpen(false);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Candidate Management</Typography>
        {isConfiguring && (
          <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => { setError(null); setOpen(true); }} disabled={!selectedElectionId}>
            Register Candidate
          </Button>
        )}
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}
      {error && !open && !editOpen && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Current Context Banner */}
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

      {!isConfiguring && selectedElectionId && (
        <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>
           <strong>Configuration Locked:</strong> Adding or removing candidates is completely disabled because this election is no longer in Configuration Mode.
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {selectedElectionId && (
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

      {selectedElectionId && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Candidate</TableCell>
                <TableCell>Admission No</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Post</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Symbol</TableCell>
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
                      <Avatar src={c.photo ? `${BASE_URL}${c.photo}?v=${new Date().getTime()}` : undefined} sx={{ bgcolor: 'primary.main' }}>
                        {c.candidate_name?.charAt(0) || <User size={16} />}
                      </Avatar>
                      <Typography fontWeight={600}>{c.candidate_name}</Typography>
                      {c.is_blocked === 1 && (
                        <Chip label="DISQUALIFIED" size="small" color="error" variant="filled" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 900, ml: 1 }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{c.admission_no}</TableCell>
                  <TableCell>{c.class_name}</TableCell>
                  <TableCell><Chip label={c.post_name} size="small" color="primary" /></TableCell>
                  <TableCell>
                    <Chip label={c.sex === 'M' ? '♂ Male' : '♀ Female'} size="small"
                      color={c.sex === 'M' ? 'info' : 'secondary'} />
                  </TableCell>
                  <TableCell>
                    {c.symbol ? (
                      <Avatar src={`${BASE_URL}${c.symbol}?v=${new Date().getTime()}`} variant="square" sx={{ width: 32, height: 32, bgcolor: 'transparent', p: 0.5 }}>
                         <Image size={16} />
                      </Avatar>
                    ) : (
                      <Typography variant="caption" color="text.secondary">No Symbol</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {isConfiguring && (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="Edit Candidate">
                          <IconButton onClick={() => {
                            setEditingCandidate(c);
                            setCandidateForm({ 
                              voter_id: c.voter_id, 
                              post_id: c.post_id 
                            });
                            setPhotoPreview(c.photo ? `${BASE_URL}${c.photo}?v=${new Date().getTime()}` : null);
                            setSymbolPreview(c.symbol ? `${BASE_URL}${c.symbol}?v=${new Date().getTime()}` : null);
                            setEditOpen(true);
                          }} color="primary" size="small">
                            <Edit size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove Candidate">
                          <IconButton onClick={() => deleteCandidateMutation.mutate(c.id)} color="error" size="small">
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      </Box>
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
        <DialogTitle sx={{ fontWeight: 700 }}>Register Candidate</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}
          {eligibilityError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {eligibilityError}
            </Alert>
          )}
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
            <Autocomplete
              options={voters || []}
              getOptionLabel={(v: any) => `${v.name} (${v.admission_no}) — ${v.class_name || 'Class ' + v.class_id}${v.division ? ' Division ' + v.division : ''}`}
              value={voters?.find((v: any) => v.id === candidateForm.voter_id) || null}
              onChange={(_, newValue) => {
                setCandidateForm(p => ({ ...p, voter_id: newValue ? newValue.id : '' }));
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Search Student (Name or Admission No)" 
                  required 
                  placeholder="Type to search..."
                />
              )}
              renderOption={(props, v: any) => (
                <Box component="li" {...props} sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{v.name} ({v.admission_no})</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {v.class_name || 'Class ' + v.class_id} {v.division ? ` Division ${v.division}` : ''}
                    </Typography>
                  </Box>
                  {v.is_blocked ? (
                    <Chip label="BLOCKED" size="small" color="error" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                  ) : null}
                </Box>
              )}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              noOptionsText="No students found"
              popupIcon={null}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block', color: 'text.secondary' }}>CANDIDATE PHOTO</Typography>
                <input type="file" ref={photoInputRef} hidden accept="image/*" onChange={handlePhotoChange} />
                <Box 
                  onClick={() => photoInputRef.current?.click()}
                  sx={{ 
                    border: '2px dashed', 
                    borderColor: photoPreview ? 'success.main' : 'divider',
                    borderRadius: 3,
                    height: 120,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                  }}
                >
                  {photoPreview ? (
                    <img src={photoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <Camera size={24} color="#bdbdbd" />
                      <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>Select & Crop</Typography>
                    </>
                  )}
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block', color: 'text.secondary' }}>CANDIDATE SYMBOL</Typography>
                <input type="file" ref={symbolInputRef} hidden accept="image/*" onChange={handleSymbolChange} />
                <Box 
                  onClick={() => symbolInputRef.current?.click()}
                  sx={{ 
                    border: '2px dashed', 
                    borderColor: symbolPreview ? 'success.main' : 'divider',
                    borderRadius: 3,
                    height: 120,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                  }}
                >
                  {symbolPreview ? (
                    <img src={symbolPreview} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} />
                  ) : (
                    <>
                      <Image size={24} color="#bdbdbd" />
                      <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>Select & Crop</Typography>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => addCandidateMutation.mutate(candidateForm)}
            disabled={addCandidateMutation.isPending || !candidateForm.voter_id || !candidateForm.post_id || !!eligibilityError || !photo || !symbol}>
            {addCandidateMutation.isPending ? <CircularProgress size={20} /> : 'Register'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Candidate Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Edit Candidate: {editingCandidate?.candidate_name}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Post</InputLabel>
              <Select 
                value={candidateForm.post_id} 
                label="Post"
                onChange={e => setCandidateForm(p => ({ ...p, post_id: e.target.value }))}
              >
                {posts?.map((p: any) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Grid container spacing={4}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, mb: 1.5, display: 'block', color: 'text.secondary', textAlign: 'center' }}>CANDIDATE PHOTO</Typography>
                <input type="file" ref={photoInputRef} hidden accept="image/*" onChange={handlePhotoChange} />
                <Box 
                  onClick={() => photoInputRef.current?.click()}
                  sx={{ 
                    border: '2px dashed', 
                    borderColor: 'primary.main',
                    borderRadius: '50%',
                    width: 160,
                    height: 160,
                    mx: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    bgcolor: 'action.hover',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    '&:hover': { transform: 'scale(1.02)', borderColor: 'primary.dark', bgcolor: 'action.selected', boxShadow: '0 8px 30px rgba(99, 102, 241, 0.2)' }
                  }}
                >
                  {photoPreview ? (
                    <img src={photoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Candidate" />
                  ) : (
                    <>
                      <Camera size={28} color="#6366f1" />
                      <Typography variant="caption" sx={{ mt: 1, color: 'primary.main', fontWeight: 600 }}>Change Photo</Typography>
                    </>
                  )}
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, mb: 1.5, display: 'block', color: 'text.secondary', textAlign: 'center' }}>CANDIDATE SYMBOL</Typography>
                <input type="file" ref={symbolInputRef} hidden accept="image/*" onChange={handleSymbolChange} />
                <Box 
                  onClick={() => symbolInputRef.current?.click()}
                  sx={{ 
                    border: '2px dashed', 
                    borderColor: 'primary.main',
                    borderRadius: 4,
                    width: 160,
                    height: 160,
                    mx: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    bgcolor: 'action.hover',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    '&:hover': { transform: 'scale(1.02)', borderColor: 'primary.dark', bgcolor: 'action.selected', boxShadow: '0 8px 30px rgba(99, 102, 241, 0.2)' }
                  }}
                >
                  {symbolPreview ? (
                    <img src={symbolPreview} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '15px' }} alt="Symbol" />
                  ) : (
                    <>
                      <Image size={28} color="#6366f1" />
                      <Typography variant="caption" sx={{ mt: 1, color: 'primary.main', fontWeight: 600 }}>Change Symbol</Typography>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => updateCandidateMutation.mutate(candidateForm)}
            disabled={updateCandidateMutation.isPending}
          >
            {updateCandidateMutation.isPending ? <CircularProgress size={20} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Cropping Dialog */}
      <Dialog open={cropDialogOpen} onClose={() => setCropDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Crop {croppingFor === 'photo' ? 'Candidate Photo' : 'Candidate Symbol'}
        </DialogTitle>
        <DialogContent sx={{ position: 'relative', height: 400, bgcolor: '#f5f5f5', p: 0 }}>
          {imageToCrop && (
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              cropShape={croppingFor === 'photo' ? 'round' : 'rect'}
              showGrid={false}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, flexDirection: 'column', alignItems: 'stretch', gap: 2 }}>
          <Box sx={{ px: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Zoom</Typography>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(_e, newValue) => setZoom(newValue as number)}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => setCropDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCropConfirm} variant="contained" sx={{ px: 4 }}>
              Apply Crop
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Candidates;
