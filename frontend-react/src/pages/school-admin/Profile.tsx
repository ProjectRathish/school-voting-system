import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Avatar, 
  IconButton, 
  Alert, 
  CircularProgress,
  Divider,
  Stack,
  alpha,
  useTheme,
  InputAdornment
} from '@mui/material';
import { Camera, Save, Phone, Mail, MapPin, Building2, Globe, Lock, KeyRound, Eye, EyeOff, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Slider } from '@mui/material';
import Cropper from 'react-easy-crop';
import { useAuthStore } from '../../store/authStore';
import axiosInstance from '../../api/axiosInstance';
import getCroppedImg from '../../utils/cropImage';
const Profile = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState('+91');

  // Cropping state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const countryCodes = [
    { code: '+91', flag: '🇮🇳', label: 'IND' },
    { code: '+1', flag: '🇺🇸', label: 'USA' },
    { code: '+44', flag: '🇬🇧', label: 'GBR' },
    { code: '+971', flag: '🇦🇪', label: 'UAE' },
    { code: '+61', flag: '🇦🇺', label: 'AUS' },
    { code: '+65', flag: '🇸🇬', label: 'SGP' },
  ];

  const { data: school, isLoading } = useQuery({
    queryKey: ['school-me'],
    queryFn: async () => (await axiosInstance.get('/schools/me')).data
  });

  const [formData, setFormData] = useState({
    location: '',
    phone: '',
    email: '',
    address: '',
    contact_person: ''
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (school) {
      setFormData({
        location: school.location || '',
        phone: school.phone || '',
        email: school.email || '',
        address: school.address || '',
        contact_person: school.contact_person || ''
      });
      if (school.logo) {
        setLogoPreview(`http://localhost:3000${school.logo}`);
      }
    }
  }, [school]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => await axiosInstance.put('/schools/update-profile', data),
    onSuccess: () => {
      setSuccess('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['school-me'] });
      setTimeout(() => setSuccess(null), 5000);
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Update failed')
  });

  const updateLogoMutation = useMutation({
    mutationFn: async (file: File | Blob) => {
      const fd = new FormData();
      fd.append('logo', file, 'school_logo.png');
      return await axiosInstance.post('/schools/logo', fd);
    },

    onSuccess: (res) => {
      setSuccess('Logo updated successfully!');
      setLogoPreview(`http://localhost:3000${res.data.logo}`);
      queryClient.invalidateQueries({ queryKey: ['school-me'] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Logo upload failed')
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.put('/auth/change-password', data),
    onSuccess: () => {
      setSuccess('Password updated successfully!');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setSuccess(null), 5000);
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Password update failed')
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result as string);
        setCropDialogOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropConfirm = async () => {
    if (imageToCrop && croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
        setCropDialogOpen(false);
        setLogoPreview(URL.createObjectURL(croppedImage));
        updateLogoMutation.mutate(croppedImage);
      } catch (e) {
        console.error(e);
        setError('Error cropping image');
      }
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError("New passwords do not match");
      return;
    }
    changePasswordMutation.mutate({
      current_password: passwordData.current_password,
      new_password: passwordData.new_password
    });
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && !validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    setError(null);
    updateProfileMutation.mutate(formData);
  };

  if (isLoading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Profile Management</Typography>
        <Typography color="text.secondary">Update your school's public identity and contact information</Typography>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

      <Box>
        <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={logoPreview || undefined}
                  sx={{ 
                    width: 160, 
                    height: 160, 
                    fontSize: '4rem', 
                    bgcolor: 'primary.main',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                    border: `4px solid ${theme.palette.background.paper}`
                  }}
                >
                  {school?.name?.charAt(0)}
                </Avatar>
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    bgcolor: 'background.paper',
                    boxShadow: theme.shadows[3],
                    '&:hover': { bgcolor: 'background.paper', transform: 'scale(1.1)' },
                    transition: 'all 0.2s'
                  }}
                >
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                  <Camera size={20} color={theme.palette.primary.main} />
                </IconButton>
              </Box>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ 
                  fontWeight: 700, 
                  color: 'primary.main', 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'inline-block',
                  px: 2, py: 0.5, borderRadius: 5,
                  letterSpacing: 1
                }}>
                  CODE: {school?.code || 'FETCHING...'}
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="body2" sx={{ 
              fontWeight: 700, 
              color: 'primary.main', 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'inline-block',
              px: 2, py: 0.5, borderRadius: 5,
              mb: 3,
              mt: 1
            }}>
              OFFICIAL ACCOUNT
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            <Stack spacing={2} sx={{ textAlign: 'left' }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }}>
                  <Building2 size={18} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Official Institution</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                  <Globe size={18} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Active Platform Access</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 4, borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h2" sx={{ 
                fontWeight: 800, 
                color: 'text.primary', 
                letterSpacing: '-1.5px', 
                mb: 1.5,
                lineHeight: 1.1
              }}>
                {user?.school_name || school?.name}
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5, 
                px: 2, 
                py: 1, 
                bgcolor: alpha(theme.palette.warning.main, 0.1), 
                color: 'warning.main', 
                borderRadius: 2, 
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                alignSelf: 'flex-start', 
                width: 'fit-content' 
              }}>
                <Building2 size={18} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  This institution name is verified and cannot be edited.
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 4, opacity: 0.1 }} />
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <TextField
                    label="Contact Person"
                    fullWidth
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="e.g. Principal/Admin Name"
                    InputProps={{
                      startAdornment: <User size={18} style={{ marginRight: 12, opacity: 0.5 }} />
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <TextField
                    label="Contact Email"
                    fullWidth
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. contact@myschool.com"
                    InputProps={{
                      startAdornment: <Mail size={18} style={{ marginRight: 12, opacity: 0.5 }} />
                    }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <TextField
                    label="Contact Phone"
                    fullWidth
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            variant="standard"
                            sx={{ 
                              mr: 1, 
                              width: 85,
                              '&:before, &:after': { border: 'none' },
                              '& .MuiSelect-select': { 
                                display: 'flex', 
                                alignItems: 'center',
                                gap: 0.5,
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                py: 0
                              }
                            }}
                            disableUnderline
                          >
                            {countryCodes.map((c) => (
                              <MenuItem key={c.code} value={c.code} sx={{ gap: 1.5 }}>
                                <Typography sx={{ fontSize: '1.2rem' }}>{c.flag}</Typography>
                                <Typography sx={{ fontWeight: 600 }}>{c.code}</Typography>
                              </MenuItem>
                            ))}
                          </Select>
                          <Divider orientation="vertical" flexItem sx={{ mr: 1.5, height: 24, alignSelf: 'center' }} />
                          <Phone size={18} style={{ opacity: 0.5 }} />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 12, lg: 4 }}>
                  <TextField
                    label="City/Location"
                    fullWidth
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Mumbai, Maharashtra"
                    InputProps={{
                      startAdornment: <MapPin size={18} style={{ marginRight: 12, opacity: 0.5 }} />
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Full Address"
                    fullWidth
                    multiline
                    rows={5}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full postal address of the institution"
                  />
                </Grid>

                <Grid size={{ xs: 12 }} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    size="large"
                    startIcon={updateProfileMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <Save size={20} />}
                    disabled={updateProfileMutation.isPending}
                    sx={{ px: 4, borderRadius: 3 }}
                  >
                    Save Profile Changes
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
      <Grid container spacing={4} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 4, borderRadius: 4 }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main' }}>
                <Lock size={20} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Security Settings</Typography>
                <Typography variant="body2" color="text.secondary">Update your account password regularly to stay secure</Typography>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 4, opacity: 0.1 }} />

            <form onSubmit={handlePasswordSubmit}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField 
                    label="Current Password" 
                    type={showCurrent ? 'text' : 'password'} 
                    fullWidth 
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowCurrent(!showCurrent)} edge="end">
                            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField 
                    label="New Password" 
                    type={showNew ? 'text' : 'password'} 
                    fullWidth 
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowNew(!showNew)} edge="end">
                            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField 
                    label="Confirm New Password" 
                    type={showConfirm ? 'text' : 'password'} 
                    fullWidth 
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end">
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    type="submit" 
                    variant="outlined" 
                    color="error"
                    disabled={changePasswordMutation.isPending}
                    startIcon={changePasswordMutation.isPending ? <CircularProgress size={20}/> : <KeyRound size={20} />}
                    sx={{ borderRadius: 3, px: 4 }}
                  >
                    Update Password
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
      </Box>

      {/* Image Cropping Dialog */}
      <Dialog 
        open={cropDialogOpen} 
        onClose={() => setCropDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Crop Your School Logo</DialogTitle>
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
              cropShape="round"
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
              aria-labelledby="Zoom"
              onChange={(_e, newValue) => setZoom(newValue as number)}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => setCropDialogOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button 
              onClick={handleCropConfirm} 
              variant="contained" 
              sx={{ borderRadius: 2, px: 4 }}
              disabled={updateLogoMutation.isPending}
            >
              Apply & Save
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
