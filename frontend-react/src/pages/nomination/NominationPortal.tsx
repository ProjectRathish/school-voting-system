import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, TextField, Button, Alert, CircularProgress,
  Stepper, Step, StepLabel, MenuItem, Select, FormControl, InputLabel,
  Card, CardContent, Avatar, Divider, Container, Dialog, DialogTitle, DialogContent, DialogActions, Slider
} from '@mui/material';
import { Sparkles, ArrowRight, CheckCircle2, User, Image as ImageIcon, Camera, Scissors } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';

const NominationPortal = () => {
  const { code } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [admissionNo, setAdmissionNo] = useState('');
  const [voterData, setVoterData] = useState<any>(null);
  const [eligiblePosts, setEligiblePosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState('');
  const [electionInfo, setElectionInfo] = useState<any>(null);
  
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Cropping state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const res = await axiosInstance.get(`/elections/public/${code}`);
        setElectionInfo(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Election not found or closed.');
      }
    };
    if (code) fetchElection();
  }, [code]);

  const handleVerify = async () => {
    if (!admissionNo) return;
    setVerifying(true);
    setError(null);
    try {
      const res = await axiosInstance.get(`/candidates/public/eligible-posts?election_id=${electionInfo.id}&admission_no=${admissionNo}`);
      setVoterData({ id: res.data.voter_id, name: res.data.student_name });
      setEligiblePosts(res.data.posts);
      setActiveStep(1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPost) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('election_id', electionInfo.id);
    formData.append('admission_no', admissionNo);
    formData.append('post_id', selectedPost);
    if (photo) formData.append('photo', photo);

    try {
      await axiosInstance.post('/candidates/public/self-nominate', formData);
      setSuccess('Nomination submitted successfully! Please wait for official approval.');
      setActiveStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: any) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    if (imageToCrop && croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
        setPhoto(croppedImage as File);
        setPhotoPreview(URL.createObjectURL(croppedImage as Blob));
        setCropDialogOpen(false);
      } catch (e) {
        console.error(e);
        setError('Error cropping image');
      }
    }
  };

  if (error && activeStep === 0 && !electionInfo) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <Card sx={{ maxWidth: 400, width: '100%', borderRadius: 4, textAlign: 'center', p: 2 }}>
          <CardContent>
            <Typography variant="h5" color="error" gutterBottom sx={{ fontWeight: 800 }}>Error</Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>{error}</Typography>
            <Button variant="contained" onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
      py: 6,
      px: 2
    }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4, color: 'white' }}>
          <Sparkles size={48} style={{ marginBottom: '16px' }} />
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: -1 }}>
            Student Nomination
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
            {electionInfo?.name || 'Loading Election...'}
          </Typography>
        </Box>

        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 6, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
            <Step><StepLabel>Verify</StepLabel></Step>
            <Step><StepLabel>Nominate</StepLabel></Step>
            <Step><StepLabel>Finish</StepLabel></Step>
          </Stepper>

          {activeStep === 0 && (
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>Verify Student Status</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Please enter your admission number to check your eligibility for this election.
              </Typography>
              <TextField
                fullWidth
                label="Admission Number"
                variant="filled"
                value={admissionNo}
                onChange={(e) => setAdmissionNo(e.target.value)}
                sx={{ mb: 4 }}
                slotProps={{ input: { sx: { borderRadius: '12px 12px 0 0', fontWeight: 700, fontSize: '1.2rem' } } }}
              />
              {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleVerify}
                disabled={!admissionNo || verifying}
                sx={{ py: 2, borderRadius: 3, fontWeight: 800, fontSize: '1.1rem' }}
                endIcon={verifying ? <CircularProgress size={20} color="inherit" /> : <ArrowRight />}
              >
                {verifying ? 'Verifying...' : 'Continue'}
              </Button>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, p: 2, bgcolor: 'action.hover', borderRadius: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}><User /></Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">LOGGED IN AS</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>{voterData?.name}</Typography>
                </Box>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Select Position</Typography>
              <FormControl fullWidth sx={{ mb: 4 }}>
                <InputLabel>Choose the post you want to contest for</InputLabel>
                <Select
                  value={selectedPost}
                  label="Choose the post you want to contest for"
                  onChange={(e) => setSelectedPost(e.target.value)}
                  sx={{ borderRadius: 3 }}
                >
                  {eligiblePosts.map(post => (
                    <MenuItem key={post.id} value={post.id}>{post.name}</MenuItem>
                  ))}
                </Select>
                {eligiblePosts.length === 0 && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                    You are not eligible for any positions in this election based on your class/gender.
                  </Typography>
                )}
              </FormControl>

              <Divider sx={{ my: 4 }} />

              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Candidate Photo</Typography>
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', mb: 4 }}>
                <Avatar 
                  src={photoPreview || ''} 
                  sx={{ width: 100, height: 100, borderRadius: 4, bgcolor: 'action.selected' }}
                >
                  {!photoPreview && <Camera size={32} />}
                </Avatar>
                <Box>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<ImageIcon size={18} />}
                    sx={{ borderRadius: 2, mb: 1 }}
                  >
                    Upload Photo
                    <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                  </Button>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Use a clear formal passport-size photo.
                  </Typography>
                </Box>
              </Box>

              {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="text" fullWidth onClick={() => setActiveStep(0)}>Back</Button>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={!selectedPost || loading}
                  sx={{ py: 2, borderRadius: 3, fontWeight: 800 }}
                  startIcon={loading && <CircularProgress size={20} color="inherit" />}
                >
                  {loading ? 'Submitting...' : 'Submit Nomination'}
                </Button>
              </Box>
            </Box>
          )}

          {activeStep === 2 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircle2 size={80} color="#10b981" style={{ marginBottom: '24px' }} />
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>Success!</Typography>
              <Typography sx={{ color: 'text.secondary', mb: 4 }}>
                Your nomination for <strong>{eligiblePosts.find(p => p.id === selectedPost)?.name}</strong> has been submitted. 
                Please wait for the election officer to review and approve your candidacy.
              </Typography>
              <Button variant="outlined" size="large" onClick={() => window.location.reload()} sx={{ borderRadius: 3 }}>
                Fill another nomination
              </Button>
            </Box>
          )}
        </Paper>
      </Container>

      {/* Crop Dialog */}
      <Dialog open={cropDialogOpen} onClose={() => setCropDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Crop Candidate Photo</DialogTitle>
        <DialogContent sx={{ height: 400, position: 'relative' }}>
          {imageToCrop && (
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          )}
        </DialogContent>
        <Box sx={{ p: 3 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Zoom Control</Typography>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(_, value) => setZoom(value as number)}
          />
        </Box>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCropDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCropSave} startIcon={<Scissors size={18} />}>Save Crop</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NominationPortal;
