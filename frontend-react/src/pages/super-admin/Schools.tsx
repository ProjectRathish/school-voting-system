import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, CircularProgress, IconButton, Button,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Alert, TextField, InputAdornment, Divider, Stack, Tooltip,
  Checkbox, FormControlLabel, Select, MenuItem
} from '@mui/material';
import { 
  Plus, Trash2, Eye, EyeOff, ShieldCheck, Download, Copy, Printer, XCircle, 
  School as SchoolIcon, Key, Edit, Mail, Send, Search, Phone
} from 'lucide-react';
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';

const Schools = () => {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    code: '',
    location: '',
    admin_password: 'admin@123',
    admin_username: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [viewingCredential, setViewingCredential] = useState<any>(null);
  const [successCredentials, setSuccessCredentials] = useState<any>(null); // For the pop-up
  const [resetPasswordFor, setResetPasswordFor] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('admin@123');
  const [editingSchool, setEditingSchool] = useState<any>(null);
  const [resendEmailDialog, setResendEmailDialog] = useState<any>(null);
  const [doResetOnResend, setDoResetOnResend] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryCode, setCountryCode] = useState('+91');

  const countryCodes = [
    { code: '+91', flag: '🇮🇳', label: 'IND' },
    { code: '+1', flag: '🇺🇸', label: 'USA' },
    { code: '+44', flag: '🇬🇧', label: 'GBR' },
    { code: '+971', flag: '🇦🇪', label: 'UAE' },
    { code: '+61', flag: '🇦🇺', label: 'AUS' },
    { code: '+65', flag: '🇸🇬', label: 'SGP' },
  ];
  const queryClient = useQueryClient();

  const { data: schools, isLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => (await axiosInstance.get('/platform/schools')).data
  });

  const filteredSchools = useMemo(() => {
    if (!schools?.data) return [];
    return schools.data.filter((s: any) => 
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [schools, searchQuery]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/platform/schools/${id}`),
    onSuccess: () => {
      setSuccess('School deleted successfully');
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-stats'] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error deleting school. Ensure no related data exists.');
      setDeleteId(null);
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.post('/platform/schools', data),
    onSuccess: (res) => {
      setSuccess('School created successfully!');
      setOpenCreate(false);
      setSuccessCredentials({
        code: res.data.code,
        username: res.data.admin_username,
        password: createForm.admin_password,
        name: createForm.name
      });
      setCreateForm({
        name: '',
        contact_person: '',
        contact_email: '',
        contact_phone: '',
        code: '',
        location: '',
        admin_password: 'admin@123',
        admin_username: ''
      });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-stats'] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error creating school')
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.put(`/platform/schools/${data.school_id}/reset-password`, { new_password: data.password }),
    onSuccess: () => {
      setSuccess('Password reset successfully!');
      setResetPasswordFor(null);
      setNewPassword('admin@123'); // Reset password field
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error resetting password')
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.put(`/platform/schools/${data.id}`, data),
    onSuccess: () => {
      setSuccess('School details updated successfully!');
      setEditingSchool(null);
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error updating school')
  });

  const resendEmailMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.post(`/platform/schools/${data.id}/resend-welcome`, {
      reset_password: data.reset,
      new_password: data.reset ? 'admin@123' : null
    }),
    onSuccess: (res) => {
      setSuccess(res.data.message);
      setResendEmailDialog(null);
      setDoResetOnResend(false);
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error resending email')
  });

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
  };

  const handleOpenCreate = async () => {
    setOpenCreate(true);
    try {
      const resp = await axiosInstance.get('/platform/next-school-code');
      setCreateForm(p => ({ ...p, code: resp.data.suggestedCode, admin_username: resp.data.suggestedCode }));
    } catch (err) {
      console.error("Error fetching next code", err);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Approved Schools</Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={handleOpenCreate}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Create School
        </Button>
      </Box>

      {success && !openCreate && !resetPasswordFor && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}
      {error && !openCreate && !resetPasswordFor && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Paper sx={{ mb: 3, p: 2, borderRadius: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by school name, code, location or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} style={{ opacity: 0.5 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'action.hover'
            }
          }}
        />
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>School Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Registered On</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8 }}><CircularProgress size={30} /></TableCell></TableRow>
            ) : filteredSchools.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8, color: 'text.secondary' }}>No schools found</TableCell></TableRow>
            ) : filteredSchools.map((s: any) => (
              <TableRow key={s.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{s.name}</TableCell>
                <TableCell><Chip label={s.code} size="small" variant="outlined" color="primary" sx={{ fontWeight: 600 }} /></TableCell>
                <TableCell>{s.location || '—'}</TableCell>
                <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Tooltip title="View Credentials">
                      <IconButton size="small" color="primary" onClick={() => setViewingCredential(s)}>
                        <ShieldCheck size={18} />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Resend Welcome Email">
                      <IconButton size="small" color="info" onClick={() => setResendEmailDialog(s)}>
                        <Mail size={18} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit School Details">
                      <IconButton size="small" sx={{ color: 'info.dark' }} onClick={() => setEditingSchool(s)}>
                        <Edit size={18} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Reset Admin Password">
                      <IconButton size="small" color="warning" onClick={() => setResetPasswordFor(s)}>
                        <Key size={18} />
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" color="error" onClick={() => handleDeleteClick(s.id)}>
                      <Trash2 size={18} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => { setDeleteId(null); setDeleteConfirmInput(''); }}>
        <DialogTitle sx={{ color: 'error.main', fontWeight: 700 }}>Strict Confirmation Required</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2, color: 'text.primary' }}>
            Are you sure you want to delete <b>{schools?.data?.find((s: any) => s.id === deleteId)?.name}</b>? This action is <b>permanent</b> and will delete all elections, candidates, and votes.
          </DialogContentText>
          <DialogContentText sx={{ mb: 3 }}>
            To confirm, please type the school code: <b style={{ color: 'red' }}>{schools?.data?.find((s: any) => s.id === deleteId)?.code}</b>
          </DialogContentText>
          <TextField
            fullWidth
            size="small"
            placeholder="Enter school code here"
            value={deleteConfirmInput}
            onChange={(e) => setDeleteConfirmInput(e.target.value.toUpperCase())}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => { setDeleteId(null); setDeleteConfirmInput(''); }}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            disabled={deleteMutation.isPending || deleteConfirmInput !== schools?.data?.find((s: any) => s.id === deleteId)?.code}
          >
            {deleteMutation.isPending ? <CircularProgress size={20} /> : 'Confirm Permanent Deletion'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manual Create School Dialog */}
      <Dialog open={openCreate} onClose={() => { setOpenCreate(false); setError(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Create New School Account</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField label="School Name" fullWidth required
              value={createForm.name}
              onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField label="Contact Person" fullWidth required
                value={createForm.contact_person}
                onChange={e => setCreateForm(p => ({ ...p, contact_person: e.target.value }))}
              />
              <TextField label="Contact Phone" fullWidth required
                value={createForm.contact_phone}
                onChange={e => setCreateForm(p => ({ ...p, contact_phone: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        variant="standard"
                        sx={{ 
                          mr: 1, 
                          width: 70,
                          '&:before, &:after': { border: 'none' },
                          '& .MuiSelect-select': { 
                            display: 'flex', 
                            alignItems: 'center',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            py: 0
                          }
                        }}
                        disableUnderline
                      >
                        {countryCodes.map((c) => (
                          <MenuItem key={c.code} value={c.code} sx={{ gap: 1 }}>
                            <span>{c.flag}</span>
                            <span style={{ fontSize: '0.8rem' }}>{c.code}</span>
                          </MenuItem>
                        ))}
                      </Select>
                      <Divider orientation="vertical" flexItem sx={{ mr: 1, height: 20, alignSelf: 'center' }} />
                      <Phone size={18} style={{ opacity: 0.5 }} />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
            <TextField label="Contact Email" fullWidth required type="email"
              value={createForm.contact_email}
              onChange={e => setCreateForm(p => ({ ...p, contact_email: e.target.value }))}
            />
            <TextField label="Location" fullWidth
              value={createForm.location}
              onChange={e => setCreateForm(p => ({ ...p, location: e.target.value }))}
            />
            <TextField
              label="School Code (Username)"
              fullWidth
              required
              helperText="Strictly system generated"
              value={createForm.code}
              InputProps={{ readOnly: true }}
              sx={{ bgcolor: 'action.hover' }}
            />
            <Typography variant="subtitle2" sx={{ mt: 1, color: 'text.secondary' }}>Admin Security</Typography>
            <TextField
              label="Admin Password"
              fullWidth
              required
              type={showPassword ? 'text' : 'password'}
              value={createForm.admin_password}
              onChange={e => setCreateForm(p => ({ ...p, admin_password: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant="contained"
            onClick={() => {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(createForm.contact_email)) {
                setError("Please enter a valid email address");
                return;
              }
              setError(null);
              createMutation.mutate(createForm);
            }}
            disabled={createMutation.isPending}>
            {createMutation.isPending ? <CircularProgress size={20} /> : 'Create School Account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Identity Card/Credential Dialog */}
      <Dialog
        open={!!viewingCredential}
        onClose={() => setViewingCredential(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
      >
        <Box sx={{
          background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
          p: 4,
          textAlign: 'center',
          color: 'white',
          position: 'relative'
        }}>
          <IconButton
            onClick={() => setViewingCredential(null)}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
          >
            <XCircle size={20} />
          </IconButton>
          <Box sx={{
            width: 80,
            height: 80,
            bgcolor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
            border: '2px solid rgba(255,255,255,0.4)'
          }}>
            <SchoolIcon size={40} />
          </Box>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>{viewingCredential?.name}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>Official School Credential</Typography>
        </Box>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              School Identity Code
            </Typography>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'action.hover',
              p: 2,
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'primary.main'
            }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.dark', letterSpacing: 2 }}>
                {viewingCredential?.code}
              </Typography>
              <IconButton size="small" onClick={() => navigator.clipboard.writeText(viewingCredential?.code)}>
                <Copy size={18} />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              Direct Login Link
            </Typography>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
              p: 1.5,
              borderRadius: 2,
              overflow: 'hidden'
            }}>
              <Typography variant="caption" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.9 }}>
                {window.location.origin}/login?school={viewingCredential?.code}
              </Typography>
              <IconButton size="small" sx={{ color: 'inherit' }} onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/login?school=${viewingCredential?.code}`);
              }}>
                <Copy size={16} />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>Primary Admin Details</Typography>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">Username:</Typography>
              <Typography variant="body2" fontWeight={700}>{viewingCredential?.code}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">Default Password:</Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'orange' }}>•••••••• (system-default)</Typography>
            </Box>
          </Stack>

          <Alert severity="info" sx={{ mt: 4, borderRadius: 2 }}>
            <Typography variant="caption" sx={{ display: 'block' }}>
              Give this code to the school administrator. They can log in using their <b>School Code</b> and the password set during creation.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: 'action.hover' }}>
          <Button startIcon={<Printer size={18} />} onClick={() => window.print()}>Print Card</Button>
          <Button variant="contained" startIcon={<Download size={18} />} fullWidth>Download Digital Copy</Button>
        </DialogActions>
      </Dialog>

      {/* SUCCESS CREDENTIALS POP-UP */}
      <Dialog open={!!successCredentials} onClose={() => setSuccessCredentials(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <Box sx={{ bgcolor: 'success.main', color: 'white', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <ShieldCheck size={32} />
          </Box>
          <Typography variant="h5" fontWeight={800}>School Created!</Typography>
          <Typography variant="body2" color="text.secondary">Share these credentials with the school admin</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ bgcolor: 'info.light', p: 3, borderRadius: 3, mb: 3 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7 }}>SCHOOL CODE / USERNAME</Typography>
                <Typography variant="h6" fontWeight={800}>{successCredentials?.code}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7 }}>TEMPORARY PASSWORD</Typography>
                <Typography variant="h6" fontWeight={800} color="primary">{successCredentials?.password}</Typography>
              </Box>
            </Stack>
          </Box>
          <Alert severity="warning" sx={{ mb: 0 }}>
            This is shown only once. Please copy or note it down now.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4 }}>
          <Button fullWidth variant="contained" size="large" onClick={() => setSuccessCredentials(null)}>
            I've Noted it Down
          </Button>
        </DialogActions>
      </Dialog>

      {/* RESET PASSWORD DIALOG */}
      <Dialog open={!!resetPasswordFor} onClose={() => { setResetPasswordFor(null); setNewPassword('admin@123'); setError(null); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Reset Password: {resetPasswordFor?.name}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="New Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              helperText="Minimum 6 characters recommended"
              type={showPassword ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => { setResetPasswordFor(null); setNewPassword('admin@123'); }}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => resetPasswordMutation.mutate({ school_id: resetPasswordFor.id, password: newPassword })}
            disabled={resetPasswordMutation.isPending}
          >
            {resetPasswordMutation.isPending ? <CircularProgress size={20} /> : 'Update Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT SCHOOL DIALOG */}
      <Dialog open={!!editingSchool} onClose={() => { setEditingSchool(null); setError(null); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit School Profile</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField label="School Name" fullWidth value={editingSchool?.name} onChange={e => setEditingSchool({...editingSchool, name: e.target.value})} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField label="Contact Person" fullWidth value={editingSchool?.contact_person} onChange={e => setEditingSchool({...editingSchool, contact_person: e.target.value})} />
              <TextField label="Contact Phone" fullWidth 
                value={editingSchool?.phone} 
                onChange={e => setEditingSchool({...editingSchool, phone: e.target.value})} 
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        variant="standard"
                        sx={{ 
                          mr: 1, 
                          width: 70,
                          '&:before, &:after': { border: 'none' },
                          '& .MuiSelect-select': { 
                            display: 'flex', 
                            alignItems: 'center',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            py: 0
                          }
                        }}
                        disableUnderline
                      >
                        {countryCodes.map((c) => (
                          <MenuItem key={c.code} value={c.code} sx={{ gap: 1 }}>
                            <span>{c.flag}</span>
                            <span style={{ fontSize: '0.8rem' }}>{c.code}</span>
                          </MenuItem>
                        ))}
                      </Select>
                      <Divider orientation="vertical" flexItem sx={{ mr: 1, height: 20, alignSelf: 'center' }} />
                      <Phone size={18} style={{ opacity: 0.5 }} />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
            <TextField label="Contact Email" fullWidth type="email" value={editingSchool?.email} onChange={e => setEditingSchool({...editingSchool, email: e.target.value})} />
            <TextField label="Location" fullWidth value={editingSchool?.location} onChange={e => setEditingSchool({...editingSchool, location: e.target.value})} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditingSchool(null)}>Cancel</Button>
          <Button variant="contained" 
            onClick={() => {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (editingSchool.email && !emailRegex.test(editingSchool.email)) {
                setError("Please enter a valid email address");
                return;
              }
              setError(null);
              updateMutation.mutate(editingSchool);
            }}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? <CircularProgress size={20} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* RESEND EMAIL DIALOG */}
      <Dialog open={!!resendEmailDialog} onClose={() => { setResendEmailDialog(null); setDoResetOnResend(false); }}>
        <DialogTitle>Resend Welcome Credentials</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            You are about to resend the welcome invitation to <b>{resendEmailDialog?.email}</b>.
          </DialogContentText>
          
          <Box sx={{ border: '1px solid', borderColor: 'divider', p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={doResetOnResend} 
                  onChange={(e) => setDoResetOnResend(e.target.checked)} 
                  color="warning" 
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Reset password before sending?</Typography>
                  <Typography variant="caption" color="text.secondary">If checked, password will be reset to <b>admin@123</b></Typography>
                </Box>
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => { setResendEmailDialog(null); setDoResetOnResend(false); }}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<Send size={18} />}
            onClick={() => resendEmailMutation.mutate({ id: resendEmailDialog.id, reset: doResetOnResend })}
            disabled={resendEmailMutation.isPending}
          >
            {resendEmailMutation.isPending ? <CircularProgress size={20} /> : 'Send Email Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Schools;
