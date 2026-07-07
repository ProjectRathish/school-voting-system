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

const MEDIA_URL = getMediaUrl();
const COLORS = ['#3f51b5', '#f50057', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4'];

const Results = () => {
  const { 
    setSelectedElection: setGlobalElection,
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

      {/* Current Context Banner */}
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


      <Paper sx={{ p: 3, mb: 1.5, borderRadius: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Select Election</InputLabel>
          <Select 
            value={selectedElection} 
            label="Select Election" 
            onChange={e => {
              const id = e.target.value;
              setSelectedElection(id);
              const election = elections?.find((el: any) => String(el.id) === String(id));
              if (election) {
                setGlobalElection(String(election.id), election.name, election.status);
              }
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
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Users size={36} color="#3f51b5" />
                        <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>{results.turnout.total_voters}</Typography>
                        <Typography color="text.secondary">Total Voters</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <BarChart3 size={36} color="#4caf50" />
                        <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>{results.turnout.votes_cast}</Typography>
                        <Typography color="text.secondary">Votes Cast</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Trophy size={36} color="#ff9800" />
                        <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                          {results.turnout.turnout_percentage?.toFixed(1)}%
                        </Typography>
                        <Typography color="text.secondary">Turnout Rate</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* Results by Post */}
              {results?.results?.map((post: any) => (
                <Paper key={post.post_id} sx={{ p: 3, mb: 3, borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    🏆 {post.post_name}
                  </Typography>

                  {/* UNCONTESTED POST — single candidate auto-winner */}
                  {post.is_uncontested ? (
                    <Box sx={{
                      background: 'linear-gradient(135deg, #fef9c3 0%, #fde68a 50%, #fef3c7 100%)',
                      border: '2px solid #f59e0b',
                      borderRadius: 3,
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {/* Decorative background sparkle */}
                      <Box sx={{
                        position: 'absolute', right: -20, top: -20,
                        fontSize: 120, opacity: 0.07, userSelect: 'none', lineHeight: 1
                      }}>🏆</Box>

                      {/* Winner Photo */}
                      <Avatar 
                        src={post.candidates[0]?.photo ? `${MEDIA_URL}${post.candidates[0].photo}` : undefined} 
                        sx={{ 
                          width: 80, 
                          height: 80, 
                          boxShadow: '0 8px 24px rgba(245,158,11,0.3)',
                          border: '3px solid #f59e0b'
                        }}
                      />

                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{
                          display: 'inline-block', px: 1.5, py: 0.5, mb: 1,
                          bgcolor: '#f59e0b', borderRadius: 1,
                        }}>
                          <Typography variant="caption" sx={{ color: 'white', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, fontSize: '0.65rem' }}>
                            Uncontested Winner
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography variant="h5" sx={{ fontWeight: 900, color: '#78350f', lineHeight: 1.2 }}>
                            {post.candidates[0]?.candidate_name}
                          </Typography>
                          {post.candidates[0]?.symbol && (
                            <img 
                              src={`${MEDIA_URL}${post.candidates[0].symbol}`} 
                              alt="symbol" 
                              style={{ width: 28, height: 28, objectFit: 'contain', backgroundColor: 'white', borderRadius: '4px', padding: '2px', border: '1px solid #fde68a' }} 
                            />
                          )}
                        </Box>
                        <Typography variant="body2" sx={{ color: '#92400e', mt: 0.5, fontWeight: 500 }}>
                          Only candidate for this post — automatically declared winner. No voting was required.
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          onClick={() => handleOpenDetails(post, post.candidates[0])}
                          startIcon={<BarChart3 size={14} />}
                          sx={{ borderRadius: 2, mt: 1.5, borderColor: '#f59e0b', color: '#78350f', '&:hover': { borderColor: '#d97706', bgcolor: 'rgba(245,158,11,0.08)' } }}
                        >
                          View Stats
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    /* CONTESTED POST — normal vote table + pie chart */
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 7 }}>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Rank</TableCell>
                                <TableCell>Candidate</TableCell>
                                <TableCell>Votes</TableCell>
                                <TableCell sx={{ minWidth: 150 }}>Progress</TableCell>
                                <TableCell align="right">Details</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {post.candidates?.map((c: any, idx: number) => {
                                const total = post.candidates.reduce((s: number, x: any) => s + (x.vote_count || 0), 0);
                                const pct = total > 0 ? ((c.vote_count || 0) / total) * 100 : 0;
                                return (
                                  <TableRow key={c.candidate_id}
                                    sx={{ backgroundColor: idx === 0 ? 'success.light' : 'transparent', opacity: idx === 0 ? 0.9 : 1 }}>
                                    <TableCell>
                                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                                    </TableCell>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Avatar 
                                          src={c.photo && !c.is_nota ? `${MEDIA_URL}${c.photo}` : undefined} 
                                          sx={{ width: 36, height: 36, bgcolor: c.is_nota ? '#334155' : 'inherit' }}
                                        >
                                          {c.is_nota && <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', fontSize: '0.6rem' }}>NOTA</Typography>}
                                        </Avatar>
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                          <Typography variant="body2" sx={{ fontWeight: idx === 0 ? 700 : 500, color: 'text.primary' }}>
                                            {c.candidate_name}
                                          </Typography>
                                          {c.symbol && !c.is_nota && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                                              <img 
                                                src={`${MEDIA_URL}${c.symbol}`} 
                                                alt="symbol" 
                                                style={{ width: 18, height: 18, objectFit: 'contain', backgroundColor: 'white', borderRadius: '4px', padding: '1px', border: '1px solid #e2e8f0' }} 
                                              />
                                            </Box>
                                          )}
                                        </Box>
                                      </Box>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>{c.vote_count}</TableCell>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LinearProgress variant="determinate" value={pct}
                                          sx={{ flexGrow: 1, height: 8, borderRadius: 4 }} />
                                        <Typography variant="caption">{pct.toFixed(0)}%</Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => handleOpenDetails(post, c)}
                                        startIcon={<BarChart3 size={14} />}
                                        sx={{ borderRadius: 2 }}
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
                      <Grid size={{ xs: 12, md: 5 }}>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie data={post.candidates?.map((c: any) => ({ name: c.candidate_name, value: c.vote_count || 0 }))}
                              cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                              {post.candidates?.map((_: any, idx: number) => (
                                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                              ))}
                            </Pie>
                            <Legend />
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </Grid>
                    </Grid>
                  )}
                </Paper>
              ))}

              {/* Demographics charts */}
              {detailedResults?.demographics && (
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Voter Demographics
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={detailedResults.demographics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="class_name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="male_votes" name="Male" fill="#3f51b5" />
                      <Bar dataKey="female_votes" name="Female" fill="#f50057" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              )}
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
                    src={selectedCandidateDetails.photo ? `${MEDIA_URL}${selectedCandidateDetails.photo}` : undefined}
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
                    src={`${MEDIA_URL}${selectedCandidateDetails.symbol}`}
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
                        🔵 Male: <b>{selectedCandidateDetails.demographics.male_votes}</b>
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        🔴 Female: <b>{selectedCandidateDetails.demographics.female_votes}</b>
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
