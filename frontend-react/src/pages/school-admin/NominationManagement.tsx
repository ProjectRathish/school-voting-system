import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, IconButton, Alert, CircularProgress,
  Avatar, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  Tooltip, Badge
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Check, X, Eye, Clock, ShieldCheck, ShieldAlert, Settings, 
  Sparkles, QrCode, Printer, Link as LinkIcon 
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { useElectionStore } from '../../store/electionStore';
import { useAuthStore } from '../../store/authStore';

const NominationManagement = () => {
  const { selectedElectionId, selectedElectionName } = useElectionStore();
  const { user } = useAuthStore();
  const [selectedNomination, setSelectedNomination] = useState<any>(null);
  const [openView, setOpenView] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: nominations, isLoading } = useQuery({
    queryKey: ['nominations', selectedElectionId],
    queryFn: async () => (await axiosInstance.get(`/candidates/get-nominations?election_id=${selectedElectionId}`)).data,
    enabled: !!selectedElectionId
  });

  const { data: election, isLoading: isElectionLoading } = useQuery({
    queryKey: ['election', selectedElectionId],
    queryFn: async () => (await axiosInstance.get(`/elections/${selectedElectionId}`)).data,
    enabled: !!selectedElectionId
  });

  const toggleMutation = useMutation({
    mutationFn: (open: boolean) => axiosInstance.put(`/elections/${selectedElectionId}/toggle-nominations`, { 
        open 
    }),
    onSuccess: (_, open) => {
      queryClient.invalidateQueries({ queryKey: ['election', selectedElectionId] });
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      setSuccess(`Nomination window ${open ? 'opened' : 'closed'} successfully!`);
    },
    onError: (err: any) => {
      console.error('Toggle error:', err);
      setError(err.response?.data?.message || 'Failed to toggle nominations');
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: 'APPROVED' | 'REJECTED' }) => 
        axiosInstance.patch(`/candidates/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nominations'] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      setSuccess('Nomination status updated!');
      setOpenView(false);
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error updating status')
  });

  const handleDownloadNominationForm = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const style = `
      @page { size: A4; margin: 20mm; }
      body { font-family: 'Inter', sans-serif; color: #1e1e28; line-height: 1.6; }
      .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
      .school-name { font-size: 1.1rem; font-weight: 700; color: #1e1e28; text-transform: uppercase; margin-bottom: 5px; }
      .election-name { font-size: 1.2rem; font-weight: 700; margin-bottom: 10px; }
      .form-title { font-size: 1.5rem; font-weight: 900; text-decoration: underline; margin-top: 10px; }
      .field-container { margin-bottom: 25px; }
      .field-row { display: flex; margin-bottom: 20px; align-items: flex-end; }
      .field-label { font-weight: 700; min-width: 180px; font-size: 1.1rem; }
      .field-value { border-bottom: 1px dotted #000; flex-grow: 1; height: 1.2rem; margin-left: 10px; }
      .witness-section { margin-top: 40px; border: 1px solid #ccc; padding: 20px; border-radius: 8px; }
      .witness-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 15px; }
      .signature-section { margin-top: 60px; display: flex; justify-content: space-between; }
      .signature-box { text-align: center; width: 200px; }
      .sig-line { border-top: 1px solid #000; margin-top: 40px; padding-top: 5px; font-weight: 700; font-size: 0.9rem; }
      .instructions { margin-top: 50px; font-size: 0.85rem; color: #666; font-style: italic; }
    `;

    let html = `<html><head><title>Nomination Form - ${selectedElectionName}</title><style>${style}</style></head><body>`;
    html += `
      <div class="header">
        <div class="school-name">${user?.school_name || 'School Voting System'}</div>
        <div class="election-name">${selectedElectionName}</div>
        <div class="form-title">NOMINATION FORM</div>
      </div>

      <div class="field-container">
        <div class="field-row"><div class="field-label">Admission Number:</div><div class="field-value"></div></div>
        <div class="field-row"><div class="field-label">Full Name:</div><div class="field-value"></div></div>
        <div class="field-row">
          <div class="field-label">Class:</div><div class="field-value"></div>
          <div class="field-label" style="min-width: 100px; margin-left: 20px;">Division:</div><div class="field-value"></div>
        </div>
        <div class="field-row"><div class="field-label">Post Nominated For:</div><div class="field-value"></div></div>
      </div>

      <div class="witness-section">
        <div style="font-weight: 800; font-size: 1.1rem; margin-bottom: 10px;">Proposed/Witnessed By:</div>
        <div class="witness-grid">
          <div>
            <div style="font-weight: 600;">Witness 1:</div>
            <div style="border-bottom: 1px dotted #000; height: 30px; margin: 10px 0;"></div>
            <div style="font-size: 0.8rem;">(Name & Signature)</div>
          </div>
          <div>
            <div style="font-weight: 600;">Witness 2:</div>
            <div style="border-bottom: 1px dotted #000; height: 30px; margin: 10px 0;"></div>
            <div style="font-size: 0.8rem;">(Name & Signature)</div>
          </div>
        </div>
      </div>

      <div class="signature-section">
        <div class="signature-box">
          <div class="sig-line">Signature of Candidate</div>
        </div>
        <div class="signature-box">
          <div class="sig-line">Signature of Class Teacher</div>
        </div>
      </div>

      <div class="instructions">
        Note: This form must be filled clearly and submitted to the Election Commission before the deadline. 
        Incomplete forms will be rejected.
      </div>

      <div style="margin-top: 40px; text-align: right; font-size: 0.8rem; color: #999;">
        Generated on ${new Date().toLocaleDateString()} | E-Vote Management System
      </div>
    `;
    html += `</body><script>window.onload = () => { window.print(); window.close(); };</script></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (!selectedElectionId) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="warning">Please select an election context first.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'flex-start' }, flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-1.5px', mb: 1 }}>Nomination Management</Typography>
            
            {/* Current Context Banner */}
            <Box sx={{ 
              mb: 1, 
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
                      {election?.status ? `STAGE: ${election.status}` : 'Active Configuration'}
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
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'flex-start' }}>
            <Button
                variant="contained"
                startIcon={<Printer size={20} />}
                onClick={handleDownloadNominationForm}
                sx={{ 
                    borderRadius: 3, 
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                    px: 3,
                    height: { sm: 60 },
                    width: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 25px rgba(99, 102, 241, 0.4)',
                    }
                }}
            >
                DOWNLOAD NOMINATION FORM
            </Button>

            <Button
                variant="outlined"
                startIcon={<QrCode size={20} />}
                onClick={() => setQrOpen(true)}
                sx={{ borderRadius: 3, fontWeight: 700, height: { sm: 60 }, width: { xs: '100%', sm: 'auto' } }}
            >
                Portal QR
            </Button>

            <Paper sx={{ p: 1, px: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3, border: '1px solid', borderColor: 'divider', height: { sm: 60 }, width: { xs: '100%', sm: 'auto' }, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ 
                        width: 10, height: 10, borderRadius: '50%', 
                        bgcolor: election?.nomination_open ? 'success.main' : 'error.main',
                        boxShadow: election?.nomination_open ? '0 0 10px #4caf50' : 'none'
                    }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Nominations: {election?.nomination_open ? 'OPEN' : 'CLOSED'}
                    </Typography>
                </Box>
                <FormControlLabel
                    control={
                      <Switch 
                        disabled={isElectionLoading || toggleMutation.isPending}
                        checked={!!election?.nomination_open} 
                        onChange={e => toggleMutation.mutate(e.target.checked)} 
                      />
                    }
                    label={election?.nomination_open ? "Close" : "Open"}
                    sx={{ mr: 0 }}
                />
            </Paper>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Post Contesting</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Class & Section</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Applied On</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8 }}><CircularProgress /></TableCell></TableRow>
              ) : nominations?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Box sx={{ opacity: 0.5 }}>
                        <Clock size={48} style={{ marginBottom: 16 }} />
                        <Typography variant="h6">No pending nominations</Typography>
                        <Typography variant="body2">When students apply, they will appear here for review.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : nominations?.map((nom: any) => (
                <TableRow key={nom.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={nom.photo ? `${import.meta.env.VITE_API_URL}/uploads/${nom.photo}` : undefined}>
                        {nom.candidate_name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{nom.candidate_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{nom.admission_no}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={nom.post_name} size="small" sx={{ fontWeight: 700, bgcolor: 'primary.lighter', color: 'primary.dark' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{nom.class_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{nom.section_name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{new Date(nom.created_at).toLocaleString()}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                        icon={<Clock size={14} />} 
                        label="PENDING" 
                        size="small" 
                        variant="outlined"
                        color="warning"
                        sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title="View Details">
                            <IconButton onClick={() => { setSelectedNomination(nom); setOpenView(true); }} color="primary">
                                <Eye size={18} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Approve">
                            <IconButton 
                                onClick={() => statusMutation.mutate({ id: nom.id, status: 'APPROVED' })} 
                                sx={{ color: 'success.main', bgcolor: 'success.lighter' }}
                            >
                                <Check size={18} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                            <IconButton 
                                onClick={() => statusMutation.mutate({ id: nom.id, status: 'REJECTED' })} 
                                sx={{ color: 'error.main', bgcolor: 'error.lighter' }}
                            >
                                <X size={18} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* View Modal */}
      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Sparkles size={24} color="#6366f1" /> Nomination Review
        </DialogTitle>
        <DialogContent dividers>
          {selectedNomination && (
            <Box sx={{ p: 1 }}>
               <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
                  <Avatar 
                    src={selectedNomination.photo ? `${import.meta.env.VITE_API_URL}/uploads/${selectedNomination.photo}` : undefined}
                    sx={{ width: 100, height: 100, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>{selectedNomination.candidate_name}</Typography>
                    <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 700 }}>
                        Applying for: {selectedNomination.post_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Adm No: {selectedNomination.admission_no}</Typography>
                  </Box>
               </Box>

               <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: 'action.hover', mb: 3 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1.5 }}>
                    Validation Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Current Class:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedNomination.class_name}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Infrastructure Section:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedNomination.section_name}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Submission Time:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{new Date(selectedNomination.created_at).toLocaleString()}</Typography>
                      </Box>
                  </Box>
               </Paper>

               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 3, bgcolor: 'warning.lighter' }}>
                  <ShieldCheck size={24} color="#ed6c02" />
                  <Typography variant="body2" sx={{ color: 'warning.dark', fontWeight: 600 }}>
                    Please verify the student's eligibility and photo before approving. Approved candidates will appear on the ballot.
                  </Typography>
               </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setOpenView(false)} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={() => statusMutation.mutate({ id: selectedNomination.id, status: 'REJECTED' })}
            startIcon={<ShieldAlert size={18} />}
            sx={{ borderRadius: 2 }}
          >
            Reject
          </Button>
          <Button 
            variant="contained" 
            color="success" 
            onClick={() => statusMutation.mutate({ id: selectedNomination.id, status: 'APPROVED' })}
            startIcon={<ShieldCheck size={18} />}
            sx={{ borderRadius: 2 }}
          >
            Approve & Add to Ballot
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrOpen} onClose={() => setQrOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 800 }}>Nomination Portal Access</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <Box sx={{ 
            p: 3, 
            bgcolor: 'white', 
            borderRadius: 5, 
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
            mb: 3,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            {election && (
              <QRCodeSVG 
                value={`${window.location.origin}/nominate/${election.election_code}`}
                size={250}
                level="H"
                includeMargin
              />
            )}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>{selectedElectionName}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', px: 2, mb: 3, fontWeight: 500 }}>
            Students can scan this code to access the online nomination portal using their admission number.
          </Typography>
          
          <Box sx={{ bgcolor: 'action.hover', p: 2.5, borderRadius: 3, width: '100%', mb: 3, border: '1px dashed', borderColor: 'divider' }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LinkIcon size={14} color="#6366f1" />
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Portal URL</Typography>
             </Box>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', fontWeight: 700, color: 'primary.main' }}>
              {window.location.origin}/nominate/{election?.election_code}
            </Typography>
          </Box>

          <Button 
            variant="contained" 
            fullWidth 
            onClick={() => window.print()} 
            startIcon={<Printer size={18} />}
            sx={{ py: 1.5, borderRadius: 3, fontWeight: 700, boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)' }}
          >
            Print Notice Board QR
          </Button>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setQrOpen(false)} sx={{ fontWeight: 700 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NominationManagement;
