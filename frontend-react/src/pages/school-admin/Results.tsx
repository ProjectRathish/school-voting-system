import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Button, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress,
  Snackbar, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download, Trophy, Users, BarChart3, Sparkles, ExternalLink, Copy, Check, Share2 } from 'lucide-react';
import { useElectionStore } from '../../store/electionStore';
import { useQuery } from '@tanstack/react-query';
import axiosInstance, { getMediaUrl } from '../../api/axiosInstance';

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  const mediaUrl = getMediaUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${mediaUrl}${cleanPath}`;
};
const formatPosition = (index: number) => {
  const rank = index + 1;
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
};
const COLORS = ['#3f51b5', '#f50057', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4'];

const Results = () => {
  const { 
    selectedElectionName,
    selectedElectionStatus
  } = useElectionStore();
  const [selectedElection, setSelectedElection] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<{ post: any, candidate: any } | null>(null);
  const location = useLocation();
  const incomingId = location.state?.electionId;

  useEffect(() => {
    if (incomingId) {
      setSelectedElection(String(incomingId));
    }
  }, [incomingId]);

  const { data: elections } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => (await axiosInstance.get('/elections/get-elections')).data
  });

  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ['results', selectedElection],
    enabled: !!selectedElection,
    queryFn: async () => (await axiosInstance.get(`/elections/${selectedElection}/results`)).data
  });

  const { data: detailedResults } = useQuery({
    queryKey: ['detailed-results', selectedElection],
    enabled: !!selectedElection,
    queryFn: async () => (await axiosInstance.get(`/elections/${selectedElection}/detailed-results`)).data
  });

  const selectedElectionData = elections?.find((e: any) => e.id == selectedElection);
  const canViewResults = selectedElectionData?.status === 'CLOSED';

  const [copied, setCopied] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleOpenDetails = (post: any, candidate: any) => {
    setSelectedCandidate({ post, candidate });
    setDetailsOpen(true);
  };

  const getSelectedCandidateDetails = () => {
    if (!selectedCandidate) return null;
    const { post, candidate } = selectedCandidate;

    const detailedPost = detailedResults?.post_breakdown?.find(
      (p: any) => p.post_id === post.post_id
    );
    const detailedCandidate = detailedPost?.candidates?.find(
      (c: any) => c.candidate_id === candidate.candidate_id
    );

    return {
      candidate_name: candidate.candidate_name,
      post_name: post.post_name,
      photo: candidate.photo,
      symbol: candidate.symbol,
      total_votes: detailedCandidate ? detailedCandidate.total_votes : (candidate.vote_count || 0),
      is_nota: candidate.is_nota,
      demographics: detailedCandidate ? detailedCandidate.demographics : {
        male_votes: 0,
        female_votes: 0,
        classes: {},
        sections: {}
      }
    };
  };

  const selectedCandidateDetails = getSelectedCandidateDetails();

  const handleCopyLink = () => {
    const electionCode = selectedElectionData?.election_code || selectedElection;
    const link = `${window.location.protocol}//${window.location.host}/public-results/${electionCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setSnackbarOpen(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async () => {
    try {
      const res = await axiosInstance.get(`/elections/${selectedElection}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `election_${selectedElection}_results.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {}
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-1px', color: 'text.primary' }}>Results & Analytics</Typography>
        {canViewResults && (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<ExternalLink size={18} />} 
              onClick={() => {
                const electionCode = selectedElectionData?.election_code || selectedElection;
                window.open(`/public-results/${electionCode}`, '_blank');
              }}
              sx={{
                background: theme => theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)'
                  : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
              }}
            >
              Launch Presentation Screen
            </Button>
            <Button 
              variant="outlined" 
              color="primary"
              startIcon={copied ? <Check size={18} /> : <Copy size={18} />} 
              onClick={handleCopyLink}
            >
              {copied ? 'Link Copied!' : 'Copy Public Link'}
            </Button>
            <Button variant="outlined" startIcon={<Download size={18} />} onClick={handleExport}>
              Export Excel
            </Button>
          </Box>
        )}
      </Box>

      <Paper sx={{ p: 3, mb: 1.5, borderRadius: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Select Election</InputLabel>
          <Select 
            value={selectedElection} 
            label="Select Election" 
            onChange={e => {
              const id = e.target.value;
              setSelectedElection(id);
            }}
          >
            {elections?.filter((el: any) => el.status === 'CLOSED').map((el: any) => (
              <MenuItem key={el.id} value={el.id}>
                 {el.name}
              </MenuItem>
            ))}
            {elections?.filter((el: any) => el.status === 'CLOSED').length === 0 && (
              <MenuItem disabled value="">
                No valid elections found
              </MenuItem>
            )}
          </Select>
        </FormControl>
      </Paper>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, ml: 1, fontWeight: 500 }}>
        Note: Final results can only be viewed for <b>Closed</b> elections.
      </Typography>

      {canViewResults && (
        <Alert severity="info" icon={<Share2 size={20} />} sx={{ mb: 3, borderRadius: 2 }}>
          This election is closed. You can display the results on a big screen or projector using the <b>Launch Presentation Screen</b> button above, or share the public link with students to view the winner's spotlight page.
        </Alert>
      )}


      {selectedElection && canViewResults && (
        <>
          {resultsLoading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
          ) : (
            <>
              {/* Turnout Summary */}
              {results?.turnout && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ 
                      borderRadius: 4, 
                      border: '1px solid', 
                      borderColor: 'divider',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                      background: 'linear-gradient(135deg, background.paper 0%, action.hover 100%)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 30px rgba(99,102,241,0.08)',
                        borderColor: 'primary.light'
                      }
                    }}>
                      <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          width: 56, 
                          height: 56, 
                          borderRadius: 3, 
                          background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(79,70,229,0.2) 100%)',
                          color: '#6366f1'
                        }}>
                          <Users size={28} />
                        </Box>
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'text.primary', lineHeight: 1.1 }}>
                            {results.turnout.total_voters}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5 }}>
                            Total Voters
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ 
                      borderRadius: 4, 
                      border: '1px solid', 
                      borderColor: 'divider',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                      background: 'linear-gradient(135deg, background.paper 0%, action.hover 100%)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 30px rgba(16,185,129,0.08)',
                        borderColor: 'success.light'
                      }
                    }}>
                      <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          width: 56, 
                          height: 56, 
                          borderRadius: 3, 
                          background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.2) 100%)',
                          color: '#10b981'
                        }}>
                          <BarChart3 size={28} />
                        </Box>
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'text.primary', lineHeight: 1.1 }}>
                            {results.turnout.votes_cast}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5 }}>
                            Votes Cast
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ 
                      borderRadius: 4, 
                      border: '1px solid', 
                      borderColor: 'divider',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                      background: 'linear-gradient(135deg, background.paper 0%, action.hover 100%)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 30px rgba(245,158,11,0.08)',
                        borderColor: 'warning.light'
                      }
                    }}>
                      <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          width: 56, 
                          height: 56, 
                          borderRadius: 3, 
                          background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(217,119,6,0.2) 100%)',
                          color: '#f59e0b'
                        }}>
                          <Trophy size={28} />
                        </Box>
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'text.primary', lineHeight: 1.1 }}>
                            {results.turnout.turnout_percentage?.toFixed(1)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5 }}>
                            Turnout Rate
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* Results by Post */}
              {results?.results?.map((post: any) => (
                <Paper key={post.post_id} sx={{ 
                  p: 3, 
                  mb: 4, 
                  borderRadius: 4, 
                  overflow: 'hidden', 
                  border: '1px solid', 
                  borderColor: 'divider',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.015)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, pl: 1.5, borderLeft: '4px solid', borderColor: 'primary.main' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {post.post_name}
                    </Typography>
                  </Box>

                  {/* UNCONTESTED POST — single candidate auto-winner */}
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: post.is_uncontested ? 12 : 7 }}>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow sx={{ '& th': { borderBottom: '2px solid', borderColor: 'divider', pb: 2, fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 } }}>
                                <TableCell>Position</TableCell>
                                <TableCell>Candidate</TableCell>
                                <TableCell>Votes</TableCell>
                                <TableCell align="right">Details</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {post.candidates?.map((c: any, idx: number) => {
                                const total = post.candidates.reduce((s: number, x: any) => s + (x.vote_count || 0), 0);
                                const pct = total > 0 ? ((c.vote_count || 0) / total) * 100 : 0;
                                return (
                                  <TableRow 
                                    key={c.candidate_id}
                                    sx={{ 
                                      backgroundColor: 'transparent',
                                      transition: 'all 0.2s ease-in-out',
                                      '&:hover': { 
                                        backgroundColor: 'action.hover',
                                        transform: 'scale(1.005)'
                                      }
                                    }}
                                  >
                                    <TableCell sx={{ py: 2 }}>
                                      <Box sx={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 2,
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        letterSpacing: 0.5,
                                        textTransform: 'uppercase',
                                        ...(idx === 0 ? {
                                          bgcolor: 'rgba(251, 191, 36, 0.12)',
                                          color: '#b45309',
                                          border: '1px solid rgba(251, 191, 36, 0.3)'
                                        } : idx === 1 ? {
                                          bgcolor: 'rgba(148, 163, 184, 0.12)',
                                          color: '#475569',
                                          border: '1px solid rgba(148, 163, 184, 0.3)'
                                        } : idx === 2 ? {
                                          bgcolor: 'rgba(249, 115, 22, 0.1)',
                                          color: '#c2410c',
                                          border: '1px solid rgba(249, 115, 22, 0.2)'
                                        } : {
                                          bgcolor: 'action.selected',
                                          color: 'text.secondary',
                                          border: '1px solid',
                                          borderColor: 'divider'
                                        })
                                      }}>
                                        {formatPosition(idx)}
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Avatar 
                                          src={!c.is_nota ? getImageUrl(c.photo) : undefined} 
                                          sx={{ width: 40, height: 40, border: '1px solid', borderColor: 'divider', bgcolor: c.is_nota ? '#334155' : 'inherit' }}
                                        >
                                          {c.is_nota && <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', fontSize: '0.65rem' }}>NOTA</Typography>}
                                        </Avatar>
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                          <Typography variant="body2" sx={{ fontWeight: idx === 0 ? 800 : 600, color: 'text.primary', fontFamily: 'Outfit, sans-serif' }}>
                                            {c.candidate_name}
                                          </Typography>
                                          {c.symbol && !c.is_nota && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                                              <img 
                                                src={getImageUrl(c.symbol)} 
                                                alt="symbol" 
                                                style={{ width: 20, height: 20, objectFit: 'contain', backgroundColor: 'white', borderRadius: '4px', padding: '1px', border: '1px solid #e2e8f0' }} 
                                              />
                                            </Box>
                                          )}
                                        </Box>
                                      </Box>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', fontSize: '1rem' }}>
                                      {post.is_uncontested ? '0 (Uncontested)' : c.vote_count}
                                    </TableCell>
                                    <TableCell align="right">
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => handleOpenDetails(post, c)}
                                        startIcon={<BarChart3 size={14} />}
                                        sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', px: 2 }}
                                      >
                                        Stats
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Grid>
                      {!post.is_uncontested && (
                        <Grid size={{ xs: 12, md: 5 }}>
                          <Paper variant="outlined" sx={{ 
                            p: 2, 
                            borderRadius: 3, 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center',
                            alignItems: 'center',
                            bgcolor: 'background.default',
                            borderColor: 'divider',
                            minHeight: 250
                          }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1, mb: 1, fontFamily: 'Outfit, sans-serif' }}>
                              Vote Distribution
                            </Typography>
                            <ResponsiveContainer width="100%" height={200}>
                              <PieChart>
                                <Pie 
                                  data={post.candidates?.map((c: any) => ({ name: c.candidate_name, value: c.vote_count || 0 }))}
                                  cx="50%" 
                                  cy="50%" 
                                  innerRadius={50}
                                  outerRadius={70} 
                                  paddingAngle={3}
                                  dataKey="value"
                                >
                                  {post.candidates?.map((_: any, idx: number) => (
                                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '0.75rem', fontFamily: 'Outfit, sans-serif' }} />
                                <Tooltip contentStyle={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </Paper>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
              ))}


            </>
          )}
        </>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Public results link copied to clipboard!"
      />

      {/* Detailed Candidate Results Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        {selectedCandidateDetails && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={getImageUrl(selectedCandidateDetails.photo)}
                    sx={{ width: 56, height: 56, bgcolor: selectedCandidateDetails.is_nota ? '#334155' : 'inherit' }}
                  >
                    {selectedCandidateDetails.is_nota && <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', fontSize: '0.6rem' }}>NOTA</Typography>}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {selectedCandidateDetails.candidate_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Candidate for <b>{selectedCandidateDetails.post_name}</b>
                    </Typography>
                  </Box>
                </Box>
                {selectedCandidateDetails.symbol && !selectedCandidateDetails.is_nota && (
                  <img
                    src={getImageUrl(selectedCandidateDetails.symbol)}
                    alt="symbol"
                    style={{ width: 40, height: 40, objectFit: 'contain', marginLeft: 'auto', border: '1px solid #e2e8f0', borderRadius: 4, padding: 2 }}
                  />
                )}
              </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ py: 3 }}>
              <Grid container spacing={3}>
                {/* Total Votes Card */}
                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined" sx={{ bgcolor: 'action.hover', borderRadius: 2 }}>
                    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.75rem', letterSpacing: 0.5 }}>
                        TOTAL VOTES RECEIVED
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>
                        {selectedCandidateDetails.total_votes}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Gender Breakdown */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Gender Breakdown
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Male: <b>{selectedCandidateDetails.demographics.male_votes}</b>
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Female: <b>{selectedCandidateDetails.demographics.female_votes}</b>
                      </Typography>
                    </Box>
                    {/* Gender Split Bar */}
                    {selectedCandidateDetails.total_votes > 0 ? (
                      <Box sx={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', bgcolor: 'action.disabledBackground' }}>
                        <Box 
                          sx={{ 
                            width: `${(selectedCandidateDetails.demographics.male_votes / selectedCandidateDetails.total_votes) * 100}%`, 
                            bgcolor: '#3f51b5' 
                          }} 
                        />
                        <Box 
                          sx={{ 
                            width: `${(selectedCandidateDetails.demographics.female_votes / selectedCandidateDetails.total_votes) * 100}%`, 
                            bgcolor: '#f50057' 
                          }} 
                        />
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', bgcolor: 'action.disabledBackground', justifyContent: 'center', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>No votes recorded</Typography>
                      </Box>
                    )}
                    {selectedCandidateDetails.total_votes > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {((selectedCandidateDetails.demographics.male_votes / selectedCandidateDetails.total_votes) * 100).toFixed(0)}% Male
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {((selectedCandidateDetails.demographics.female_votes / selectedCandidateDetails.total_votes) * 100).toFixed(0)}% Female
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Class & Section breakdown */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Votes by Class
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200, borderRadius: 2 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="right">Votes</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.keys(selectedCandidateDetails.demographics.classes).length > 0 ? (
                          Object.entries(selectedCandidateDetails.demographics.classes)
                            .sort((a, b) => b[1] - a[1])
                            .map(([className, votes]: any) => (
                              <TableRow key={className}>
                                <TableCell>{className}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>{votes}</TableCell>
                              </TableRow>
                            ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={2} align="center" sx={{ color: 'text.secondary', py: 2 }}>
                              No class data
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Votes by Section
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200, borderRadius: 2 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Section</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="right">Votes</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.keys(selectedCandidateDetails.demographics.sections).length > 0 ? (
                          Object.entries(selectedCandidateDetails.demographics.sections)
                            .sort((a, b) => b[1] - a[1])
                            .map(([sectionName, votes]: any) => (
                              <TableRow key={sectionName}>
                                <TableCell>Section {sectionName}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>{votes}</TableCell>
                              </TableRow>
                            ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={2} align="center" sx={{ color: 'text.secondary', py: 2 }}>
                              No section data
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={() => setDetailsOpen(false)} variant="contained" color="primary" sx={{ borderRadius: 2 }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Results;
