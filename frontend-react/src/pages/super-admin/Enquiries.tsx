import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress, IconButton, Chip,
  InputAdornment, Stack,
} from '@mui/material';
import { CheckCircle, XCircle, Eye, EyeOff, ShieldCheck, Search } from 'lucide-react';
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';

const Enquiries = () => {
  const [selected, setSelected] = useState<any>(null);
  const [openView, setOpenView] = useState(false);
  const [openApprove, setOpenApprove] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [approveForm, setApproveForm] = useState({ school_code: '', admin_username: '', admin_password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [successCredentials, setSuccessCredentials] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: enquiries, isLoading } = useQuery({
    queryKey: ['enquiries'],
    queryFn: async () => (await axiosInstance.get('/platform/enquiries')).data
  });

  const filteredEnquiries = useMemo(() => {
    if (!enquiries?.data) return [];
    return enquiries.data.filter((e: any) => 
      e.school_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.contact_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.contact_phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [enquiries, searchQuery]);

  const approveMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.post('/platform/approve-school', data),
    onSuccess: (res) => {
      setSuccess('School account created and approved!');
      setOpenApprove(false);
      setApproveForm({ school_code: '', admin_username: '', admin_password: '' });
      setSuccessCredentials({
        code: res.data.code,
        username: res.data.admin_username,
        password: approveForm.admin_password, // Use the password from the form
        name: selected?.school_name
      });
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error approving school')
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.put(`/platform/enquiries/${id}/reject`, {}),
    onSuccess: () => {
      setSuccess('Enquiry rejected!');
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error rejecting enquiry')
  });

  const handleApprove = async (enquiry: any) => {
    setSelected(enquiry);
    setOpenApprove(true);
    
    try {
      // Fetch sequential code instead of just using school name
      const resp = await axiosInstance.get('/platform/next-school-code');
      setApproveForm({ 
        school_code: resp.data.suggestedCode, 
        admin_username: 'admin', 
        admin_password: 'admin@123' 
      });
    } catch (err) {
      // Fallback to name-based suggestion if API fails
      const code = enquiry.school_name?.replace(/\s+/g, '').substring(0, 6).toUpperCase() || '';
      setApproveForm({ school_code: code, admin_username: 'admin', admin_password: 'admin@123' });
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'APPROVED') return 'success';
    if (status === 'REJECTED') return 'error';
    return 'warning';
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>School Enquiries</Typography>

      {success && !openApprove && !openReject && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}
      {error && !openApprove && !openReject && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Paper sx={{ mb: 3, p: 2, borderRadius: 3 }}>
        <TextField
          fullWidth
          placeholder="Search enquiries by school name, contact person, email or phone..."
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>School Name</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Applied On</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            ) : filteredEnquiries.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ color: 'text.secondary', py: 8 }}>No enquiries found</TableCell></TableRow>
            ) : filteredEnquiries.map((e: any) => (
              <TableRow key={e.id}>
                <TableCell sx={{ fontWeight: 600 }}>{e.school_name}</TableCell>
                <TableCell>{e.contact_person}</TableCell>
                <TableCell>{e.contact_email}</TableCell>
                <TableCell>{e.contact_phone}</TableCell>
                <TableCell>
                  <Chip label={e.status} color={getStatusColor(e.status) as any} size="small" />
                </TableCell>
                <TableCell>{new Date(e.created_at).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => { setSelected(e); setOpenView(true); }}>
                    <Eye size={16} />
                  </IconButton>
                  {(e.status === 'PENDING' || e.status === 'REJECTED') && (
                    <>
                      <IconButton size="small" color="success" onClick={() => handleApprove(e)} title="Approve">
                        <CheckCircle size={16} />
                      </IconButton>
                      {e.status === 'PENDING' && (
                        <IconButton size="small" color="error" onClick={() => { setSelected(e); setOpenReject(true); }} title="Reject">
                          <XCircle size={16} />
                        </IconButton>
                      )}
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Enquiry Dialog */}
      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Enquiry Details</DialogTitle>
        <DialogContent>
          {selected && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {[
                ['School Name', selected.school_name],
                ['Contact Person', selected.contact_person],
                ['Email', selected.contact_email],
                ['Phone', selected.contact_phone],
                ['Location', selected.location],
              ].map(([label, value]) => (
                <Box key={label}>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                  <Typography variant="body1" fontWeight={500}>{value || '—'}</Typography>
                </Box>
              ))}
              {selected.message && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Message</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 0.5 }}>
                    <Typography variant="body2">{selected.message}</Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenView(false)}>Close</Button>
          {(selected?.status === 'PENDING' || selected?.status === 'REJECTED') && (
            <Button variant="contained" color="success" onClick={() => { setOpenView(false); handleApprove(selected); }}>
              Approve School
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Approve School Dialog */}
      <Dialog open={openApprove} onClose={() => { setOpenApprove(false); setError(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Approve & Create School Account</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
          <Alert severity="info" sx={{ mt: 1, mb: 3 }}>
            Approving <b>{selected?.school_name}</b> will create the school in the system and set up their Admin login.
          </Alert>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField 
              label="School Code" 
              fullWidth 
              required 
              helperText="Strictly system generated"
              value={approveForm.school_code}
              InputProps={{ readOnly: true }}
              sx={{ bgcolor: 'action.hover' }}
            />
            <TextField 
              label="Admin Username" 
              fullWidth 
              required 
              value={approveForm.admin_username}
              onChange={e => setApproveForm(p => ({ ...p, admin_username: e.target.value }))}
            />
            <TextField 
              label="Admin Password" 
              fullWidth 
              required 
              type={showPassword ? 'text' : 'password'}
              value={approveForm.admin_password}
              onChange={e => setApproveForm(p => ({ ...p, admin_password: e.target.value }))}
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
          <Button onClick={() => setOpenApprove(false)}>Cancel</Button>
          <Button variant="contained" color="success"
            onClick={() => approveMutation.mutate({ enquiry_id: selected?.id, ...approveForm })}
            disabled={approveMutation.isPending}>
            {approveMutation.isPending ? <CircularProgress size={20} /> : '✓ Approve & Create School'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Reject Enquiry Confirmation Dialog */}
      <Dialog open={openReject} onClose={() => setOpenReject(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reject enquiry?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to reject the enquiry from <strong>{selected?.school_name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will mark the enquiry as rejected.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenReject(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={() => {
              if (selected) {
                rejectMutation.mutate(selected.id);
                setOpenReject(false);
              }
            }}
            disabled={rejectMutation.isPending}
          >
            {rejectMutation.isPending ? <CircularProgress size={20} /> : 'Reject Enquiry'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SUCCESS CREDENTIALS POP-UP */}
      <Dialog open={!!successCredentials} onClose={() => setSuccessCredentials(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <Box sx={{ bgcolor: 'success.main', color: 'white', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <ShieldCheck size={32} />
          </Box>
          <Typography variant="h5" fontWeight={800}>Approval Successful!</Typography>
          <Typography variant="body2" color="text.secondary">School account is now active</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ bgcolor: 'info.light', p: 3, borderRadius: 3, mb: 3 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7 }}>SCHOOL CODE / USERNAME</Typography>
                <Typography variant="h6" fontWeight={800}>{successCredentials?.code}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7 }}>ADMIN PASSWORD</Typography>
                <Typography variant="h6" fontWeight={800} color="primary">{successCredentials?.password}</Typography>
              </Box>
            </Stack>
          </Box>
          <Alert severity="warning" sx={{ mb: 0 }}>
            Share these details with the school manually. This is shown only once.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4 }}>
          <Button fullWidth variant="contained" size="large" onClick={() => setSuccessCredentials(null)}>
            I've Informed the School
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Enquiries;
