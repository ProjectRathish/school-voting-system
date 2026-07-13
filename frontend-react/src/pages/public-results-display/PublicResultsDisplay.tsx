import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Button, Alert, CircularProgress,
  Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, LinearProgress, Avatar, Dialog, DialogTitle, DialogContent,
  DialogActions, Tooltip, Zoom, IconButton, Chip
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { Trophy, Users, BarChart3, Star, ArrowLeft, RefreshCw, Activity } from 'lucide-react';
import axios from 'axios';
import { getMediaUrl, getBaseUrl } from '../../api/axiosInstance';
import { useAuthStore } from '../../store/authStore';

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  const mediaUrl = getMediaUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${mediaUrl}${cleanPath}`;
};
const API_URL = getBaseUrl();

const formatPosition = (index: number) => {
  const rank = index + 1;
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
};

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

const PublicResultsDisplay = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [rawResultsData, setRawResultsData] = useState<any>(null); // For turnout calculations
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<{ post: any, candidate: any } | null>(null);

  const fetchDisplayData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch basic public results to get the turnout data
      const resultsResponse = await axios.get(`${API_URL}/elections/public/${electionId}/results`);
      setRawResultsData(resultsResponse.data);

      // Fetch detailed public demographics data
      const detailedResponse = await axios.get(`${API_URL}/elections/public/${electionId}/detailed-results`);
      setData(detailedResponse.data);

    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Unable to fetch results. Make sure the election is CLOSED and the link is correct.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (electionId) {
      fetchDisplayData();
    }
  }, [electionId]);

  const handleOpenDetails = (post: any, candidate: any) => {
    setSelectedCandidate({ post, candidate });
    setDetailsOpen(true);
  };

  const handleExit = () => {
    if (isAuthenticated) {
      navigate('/school-admin/results', { state: { electionId: data?.election?.id || electionId } });
    } else {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', bgcolor: '#0f172a', color: 'white', gap: 2
      }}>
        <CircularProgress size={50} sx={{ color: '#818cf8' }} />
        <Typography variant="h6" sx={{ fontFamily: 'Outfit', fontWeight: 500 }}>
          Loading Results Dashboard...
        </Typography>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', bgcolor: '#0f172a', px: 3
      }}>
        <Alert severity="error" variant="filled" sx={{ maxWidth: 500, borderRadius: 2, mb: 3, bgcolor: '#be123c' }}>
          {error || 'An unexpected error occurred.'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowLeft />}
          onClick={handleExit}
          sx={{
            background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
            boxShadow: '0 4px 15px rgba(129, 140, 248, 0.4)'
          }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  const { election, post_breakdown } = data;
  const turnout = rawResultsData?.turnout || { votes_cast: 0, total_voters: 0, turnout_percentage: 0 };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#0f172a',
      background: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 45%), radial-gradient(circle at 90% 80%, rgba(236, 72, 153, 0.05) 0%, transparent 45%), #0a0f1d',
      color: '#f8fafc',
      fontFamily: 'Outfit, sans-serif',
      pb: 8
    }}>
      {/* Top Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 3, md: 6 },
        py: 2.5,
        borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        backdropFilter: 'blur(12px)',
        bgcolor: 'rgba(10, 15, 30, 0.6)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Go Back">
            <IconButton onClick={handleExit} sx={{ color: '#94a3b8', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}>
              <ArrowLeft size={20} />
            </IconButton>
          </Tooltip>
          {election.school_logo ? (
            <Avatar
              src={getImageUrl(election.school_logo)}
              alt={election.school_name}
              sx={{
                width: 44,
                height: 44,
                border: '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
              }}
            />
          ) : (
            <Avatar sx={{ width: 44, height: 44, bgcolor: '#818cf8', fontWeight: 800 }}>
              {election.school_name?.substring(0, 2).toUpperCase()}
            </Avatar>
          )}
          <Box>
            <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.7rem' }}>
              {election.school_name || 'School Election Panel'}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
              {election.name}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Chip
            label="OFFICIAL RESULTS"
            icon={<Star size={14} color="#10b981" />}
            sx={{
              bgcolor: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              fontWeight: 800,
              fontSize: '0.75rem',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              px: 0.5,
              '& .MuiChip-icon': { color: 'inherit' }
            }}
          />
          <IconButton 
            onClick={fetchDisplayData}
            sx={{ 
              color: '#94a3b8', 
              bgcolor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.08)' } 
            }}
          >
            <RefreshCw size={16} />
          </IconButton>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ maxWidth: 1300, mx: 'auto', px: { xs: 2, md: 6 }, mt: 5 }}>
        {/* Turnout Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.06)',
              bgcolor: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)'
            }}>
              <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 56, height: 56, borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(79,70,229,0.2) 100%)',
                  color: '#818cf8'
                }}>
                  <Users size={28} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', lineHeight: 1.1 }}>
                    {turnout.total_voters}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500, mt: 0.5 }}>
                    Total Voters
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card sx={{
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.06)',
              bgcolor: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)'
            }}>
              <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 56, height: 56, borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.2) 100%)',
                  color: '#34d399'
                }}>
                  <Activity size={28} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', lineHeight: 1.1 }}>
                    {turnout.votes_cast}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500, mt: 0.5 }}>
                    Votes Cast
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card sx={{
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.06)',
              bgcolor: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)'
            }}>
              <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 56, height: 56, borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(217,119,6,0.2) 100%)',
                  color: '#fbbf24'
                }}>
                  <Trophy size={28} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', lineHeight: 1.1 }}>
                    {turnout.turnout_percentage?.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500, mt: 0.5 }}>
                    Turnout Rate
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Results per Post */}
        {post_breakdown.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h5" color="text.secondary">No results found for this election.</Typography>
          </Box>
        ) : (
          post_breakdown.map((post: any) => {
            const hasVotes = post.candidates && post.candidates.some((c: any) => c.total_votes > 0);
            return (
              <Paper key={post.post_id} sx={{
                p: { xs: 3, md: 4 },
                mb: 5,
                borderRadius: 5,
                bgcolor: 'rgba(15, 23, 42, 0.5)',
                border: '1.5px solid rgba(255, 255, 255, 0.06)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
                backdropFilter: 'blur(8px)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, pb: 1, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <Typography variant="h5" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1 }}>
                    🏆 {post.post_name}
                  </Typography>
                </Box>

                <Grid container spacing={4}>
                  {/* Candidates List Table */}
                  <Grid item xs={12} md={hasVotes ? 7 : 12}>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ '& th': { borderBottom: '2px solid rgba(255,255,255,0.08)', pb: 1.5, fontWeight: 700, color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 } }}>
                            <TableCell sx={{ pl: 1 }}>Rank</TableCell>
                            <TableCell>Candidate</TableCell>
                            <TableCell>Votes</TableCell>
                            <TableCell align="right" sx={{ pr: 1 }}>Detailed Analytics</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {post.candidates?.map((c: any, idx: number) => {
                            const isWinner = idx === 0 && c.total_votes > 0;
                            return (
                              <TableRow key={c.candidate_id} sx={{
                                '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 2 },
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.015)' },
                                transition: 'background-color 0.2s'
                              }}>
                                <TableCell sx={{ pl: 1 }}>
                                  <Box sx={{
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    px: 1.5, py: 0.5, borderRadius: 2, fontSize: '0.7rem', fontWeight: 800,
                                    textTransform: 'uppercase',
                                    ...(isWinner ? {
                                      bgcolor: 'rgba(251, 191, 36, 0.12)',
                                      color: '#fbbf24',
                                      border: '1px solid rgba(251, 191, 36, 0.3)'
                                    } : idx === 1 && c.total_votes > 0 ? {
                                      bgcolor: 'rgba(148, 163, 184, 0.12)',
                                      color: '#cbd5e1',
                                      border: '1px solid rgba(148, 163, 184, 0.3)'
                                    } : idx === 2 && c.total_votes > 0 ? {
                                      bgcolor: 'rgba(249, 115, 22, 0.1)',
                                      color: '#f97316',
                                      border: '1px solid rgba(249, 115, 22, 0.2)'
                                    } : {
                                      bgcolor: 'rgba(255,255,255,0.04)',
                                      color: '#94a3b8',
                                      border: '1px solid rgba(255,255,255,0.05)'
                                    })
                                  }}>
                                    {formatPosition(idx)}
                                  </Box>
                                </TableCell>
                                
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar
                                      src={!c.is_nota ? getImageUrl(c.photo) : undefined}
                                      sx={{
                                        width: 44, height: 44, border: '1.5px solid rgba(255,255,255,0.1)',
                                        bgcolor: c.is_nota ? '#334155' : 'inherit'
                                      }}
                                    >
                                      {c.is_nota && <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', fontSize: '0.65rem' }}>NOTA</Typography>}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="body2" sx={{ fontWeight: isWinner ? 800 : 600, color: 'white', fontSize: '0.95rem' }}>
                                        {c.candidate_name}
                                      </Typography>
                                      {c.symbol && !c.is_nota && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                          <img
                                            src={getImageUrl(c.symbol)}
                                            alt="symbol"
                                            style={{ width: 18, height: 18, objectFit: 'contain', backgroundColor: 'white', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                                          />
                                        </Box>
                                      )}
                                    </Box>
                                  </Box>
                                </TableCell>
                                
                                <TableCell sx={{ fontWeight: 800, fontSize: '1.05rem', color: isWinner ? '#fbbf24' : 'white' }}>
                                  {c.total_votes}
                                </TableCell>
                                
                                <TableCell align="right" sx={{ pr: 1 }}>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleOpenDetails(post, c)}
                                    startIcon={<BarChart3 size={14} />}
                                    sx={{
                                      borderRadius: 2.5,
                                      fontWeight: 700,
                                      textTransform: 'none',
                                      borderColor: 'rgba(129, 140, 248, 0.4)',
                                      color: '#93c5fd',
                                      '&:hover': {
                                        borderColor: '#60a5fa',
                                        bgcolor: 'rgba(96, 165, 250, 0.05)'
                                      }
                                    }}
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

                  {/* Vote Distribution Pie Chart */}
                  {hasVotes && (
                    <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Box sx={{
                        p: 2.5,
                        borderRadius: 4,
                        width: '100%',
                        bgcolor: 'rgba(10, 15, 30, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 280
                      }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: 1, mb: 1 }}>
                          Vote Distribution
                        </Typography>
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie
                              data={post.candidates?.map((c: any) => ({ name: c.candidate_name, value: c.total_votes || 0 }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={75}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {post.candidates?.map((_: any, idx: number) => (
                                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                              ))}
                            </Pie>
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '0.75rem', color: '#94a3b8', paddingTop: '10px' }} />
                            <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8, color: 'white' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            );
          })
        )}
      </Box>

      {/* Candidate Demographics Stats Modal */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 1.5,
            bgcolor: '#0f172a',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 60%)',
            border: '1.5px solid rgba(255, 255, 255, 0.08)',
            color: 'white'
          }
        }}
      >
        {selectedCandidate && (() => {
          const { post, candidate } = selectedCandidate;
          return (
            <>
              <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={!candidate.is_nota ? getImageUrl(candidate.photo) : undefined}
                      sx={{
                        width: 56,
                        height: 56,
                        border: '2px solid rgba(255,255,255,0.1)',
                        bgcolor: candidate.is_nota ? '#334155' : 'inherit'
                      }}
                    >
                      {candidate.is_nota && <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', fontSize: '0.65rem' }}>NOTA</Typography>}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
                        {candidate.candidate_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.25 }}>
                        Candidate for <b>{post.post_name}</b>
                      </Typography>
                    </Box>
                  </Box>
                  {candidate.symbol && !candidate.is_nota && (
                    <Avatar
                      src={getImageUrl(candidate.symbol)}
                      sx={{
                        width: 42,
                        height: 42,
                        bgcolor: 'white',
                        border: '1.5px solid rgba(255,255,255,0.1)',
                        p: 0.5
                      }}
                    />
                  )}
                </Box>
              </DialogTitle>
              
              <DialogContent dividers sx={{ py: 3, borderColor: 'rgba(255,255,255,0.06)' }}>
                <Grid container spacing={3}>
                  {/* Total Votes Card */}
                  <Grid item xs={12}>
                    <Card sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: 3
                    }}>
                      <CardContent sx={{ py: 2.5, '&:last-child': { pb: 2.5 } }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' }}>
                          Total Votes Received
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 900, color: '#fbbf24', mt: 0.5 }}>
                          {candidate.total_votes}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Gender Split Breakdown */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: '#cbd5e1' }}>
                      Gender Breakdown
                    </Typography>
                    <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(10, 15, 30, 0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="body2" sx={{ color: '#93c5fd', fontWeight: 700 }}>
                          Male: {candidate.demographics?.male_votes || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#f472b6', fontWeight: 700 }}>
                          Female: {candidate.demographics?.female_votes || 0}
                        </Typography>
                      </Box>
                      {candidate.total_votes > 0 ? (
                        <Box sx={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', bgcolor: 'rgba(255,255,255,0.05)' }}>
                          <Box
                            sx={{
                              width: `${((candidate.demographics?.male_votes || 0) / candidate.total_votes) * 100}%`,
                              bgcolor: '#3b82f6'
                            }}
                          />
                          <Box
                            sx={{
                              width: `${((candidate.demographics?.female_votes || 0) / candidate.total_votes) * 100}%`,
                              bgcolor: '#ec4899'
                            }}
                          />
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', bgcolor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#64748b' }}>No votes recorded</Typography>
                        </Box>
                      )}
                      {candidate.total_votes > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                            {(((candidate.demographics?.male_votes || 0) / candidate.total_votes) * 100).toFixed(0)}% Male
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                            {(((candidate.demographics?.female_votes || 0) / candidate.total_votes) * 100).toFixed(0)}% Female
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>

                  {/* Class Split and Section Split */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#cbd5e1' }}>
                      Votes by Class
                    </Typography>
                    <TableContainer component={Paper} sx={{ maxHeight: 200, borderRadius: 3, bgcolor: 'rgba(10, 15, 30, 0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow sx={{ '& th': { bgcolor: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, color: '#94a3b8' } }}>
                            <TableCell>Class</TableCell>
                            <TableCell align="right">Votes</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {candidate.demographics?.classes && Object.keys(candidate.demographics.classes).length > 0 ? (
                            Object.entries(candidate.demographics.classes)
                              .sort((a: any, b: any) => b[1] - a[1])
                              .map(([className, votes]: any) => (
                                <TableRow key={className} sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#cbd5e1' } }}>
                                  <TableCell>{className}</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 800 }}>{votes}</TableCell>
                                </TableRow>
                              ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={2} align="center" sx={{ color: '#64748b', py: 2 }}>
                                No class data
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#cbd5e1' }}>
                      Votes by Section
                    </Typography>
                    <TableContainer component={Paper} sx={{ maxHeight: 200, borderRadius: 3, bgcolor: 'rgba(10, 15, 30, 0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow sx={{ '& th': { bgcolor: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, color: '#94a3b8' } }}>
                            <TableCell>Section</TableCell>
                            <TableCell align="right">Votes</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {candidate.demographics?.sections && Object.keys(candidate.demographics.sections).length > 0 ? (
                            Object.entries(candidate.demographics.sections)
                              .sort((a: any, b: any) => b[1] - a[1])
                              .map(([sectionName, votes]: any) => (
                                <TableRow key={sectionName} sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#cbd5e1' } }}>
                                  <TableCell>Section {sectionName}</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 800 }}>{votes}</TableCell>
                                </TableRow>
                              ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={2} align="center" sx={{ color: '#64748b', py: 2 }}>
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
                <Button
                  onClick={() => setDetailsOpen(false)}
                  variant="contained"
                  sx={{
                    borderRadius: 2.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)'
                    }
                  }}
                >
                  Close
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Box>
  );
};

export default PublicResultsDisplay;
