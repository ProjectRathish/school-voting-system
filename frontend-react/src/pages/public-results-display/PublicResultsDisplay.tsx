import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Button, Alert, CircularProgress,
  Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, LinearProgress, Avatar, Dialog, DialogTitle, DialogContent,
  DialogActions, Tooltip, Zoom, IconButton, Chip
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { Trophy, Users, BarChart3, Star, ArrowLeft, RefreshCw, Activity, Sun, Moon } from 'lucide-react';
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
  const [isDarkMode, setIsDarkMode] = useState(false); // Default light mode

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
        minHeight: '100vh', bgcolor: '#f8fafc', color: '#0f172a', gap: 2
      }}>
        <CircularProgress size={50} sx={{ color: '#6366f1' }} />
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
        minHeight: '100vh', bgcolor: '#f8fafc', px: 3
      }}>
        <Alert severity="error" variant="filled" sx={{ maxWidth: 500, borderRadius: 2, mb: 3, bgcolor: '#be123c' }}>
          {error || 'An unexpected error occurred.'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowLeft />}
          onClick={handleExit}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
          }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  const { election, post_breakdown } = data;
  const turnout = rawResultsData?.turnout || { votes_cast: 0, total_voters: 0, turnout_percentage: 0 };

  // Dynamic style variables based on isDarkMode
  const bgGradient = isDarkMode 
    ? 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 45%), radial-gradient(circle at 90% 80%, rgba(236, 72, 153, 0.05) 0%, transparent 45%), #0a0f1d' 
    : 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.03) 0%, transparent 45%), #f8fafc';
  const bgColor = isDarkMode ? '#0f172a' : '#f8fafc';
  const textColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const headerBg = isDarkMode ? 'rgba(10, 15, 30, 0.6)' : 'rgba(255, 255, 255, 0.85)';
  const borderStyle = isDarkMode ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid rgba(0, 0, 0, 0.07)';
  
  const cardBg = isDarkMode ? 'rgba(15, 23, 42, 0.4)' : '#ffffff';
  const cardBorder = isDarkMode ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)';
  const cardText = isDarkMode ? 'white' : '#0f172a';
  const cardSubtext = isDarkMode ? '#94a3b8' : '#64748b';

  const paperBg = isDarkMode ? 'rgba(15, 23, 42, 0.5)' : '#ffffff';
  const paperBorder = isDarkMode ? '1.5px solid rgba(255, 255, 255, 0.06)' : '1.5px solid rgba(0, 0, 0, 0.06)';
  const paperTitle = isDarkMode ? '#f8fafc' : '#0f172a';

  const thColor = isDarkMode ? '#94a3b8' : '#475569';
  const thBorder = isDarkMode ? '2px solid rgba(255, 255, 255, 0.08)' : '2px solid rgba(0, 0, 0, 0.06)';
  const tdBorder = isDarkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.04)';
  const tdText = isDarkMode ? 'white' : '#0f172a';

  const rankBgOther = isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)';
  const rankColorOther = isDarkMode ? '#94a3b8' : '#64748b';

  const chartBg = isDarkMode ? 'rgba(10, 15, 30, 0.4)' : '#ffffff';
  const chartBorder = isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
  const legendColor = isDarkMode ? '#94a3b8' : '#475569';

  // Modal Dynamic style variables
  const modalBg = isDarkMode ? '#0f172a' : '#ffffff';
  const modalGradient = isDarkMode 
    ? 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 60%)' 
    : 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.04) 0%, transparent 60%)';
  const modalBorder = isDarkMode ? '1.5px solid rgba(255, 255, 255, 0.08)' : '1.5px solid rgba(0, 0, 0, 0.08)';
  const modalText = isDarkMode ? 'white' : '#0f172a';
  const modalSubtext = isDarkMode ? '#94a3b8' : '#64748b';
  const modalCardBg = isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
  const modalCardBorder = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const modalTableBg = isDarkMode ? 'rgba(10, 15, 30, 0.3)' : 'rgba(0, 0, 0, 0.01)';

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: bgColor,
      background: bgGradient,
      color: textColor,
      fontFamily: 'Outfit, sans-serif',
      pb: 8,
      transition: 'background 0.3s, color 0.3s, bgcolor 0.3s'
    }}>
      {/* Top Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 3, md: 6 },
        py: 2.5,
        borderBottom: borderStyle,
        backdropFilter: 'blur(12px)',
        bgcolor: headerBg,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'background-color 0.3s, border-bottom 0.3s'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Go Back">
            <IconButton onClick={handleExit} sx={{ color: isDarkMode ? '#94a3b8' : '#475569', '&:hover': { color: textColor, bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' } }}>
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
                border: isDarkMode ? '2px solid rgba(255, 255, 255, 0.2)' : '2px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)'
              }}
            />
          ) : (
            <Avatar sx={{ width: 44, height: 44, bgcolor: '#6366f1', color: 'white', fontWeight: 800 }}>
              {election.school_name?.substring(0, 2).toUpperCase()}
            </Avatar>
          )}
          <Box>
            <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#475569', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.7rem' }}>
              {election.school_name || 'School Election Panel'}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: textColor, lineHeight: 1.2 }}>
              {election.name}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label="OFFICIAL RESULTS"
            icon={<Star size={14} color="#10b981" />}
            sx={{
              bgcolor: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              fontWeight: 800,
              fontSize: '0.75rem',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              px: 0.5,
              '& .MuiChip-icon': { color: 'inherit' }
            }}
          />

          {/* Theme Mode Toggle Button */}
          <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <IconButton 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              sx={{ 
                color: isDarkMode ? '#fbbf24' : '#6366f1', 
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                border: '1px solid',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' },
                width: 38,
                height: 38
              }}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </IconButton>
          </Tooltip>

          <IconButton 
            onClick={fetchDisplayData}
            sx={{ 
              color: isDarkMode ? '#94a3b8' : '#475569', 
              bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              border: '1px solid',
              borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              '&:hover': { color: textColor, bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' },
              width: 38,
              height: 38
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
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{
              borderRadius: 4,
              border: cardBorder,
              bgcolor: cardBg,
              backdropFilter: 'blur(10px)',
              boxShadow: isDarkMode ? '0 4px 30px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.02)',
              transition: 'background-color 0.3s, border 0.3s'
            }}>
              <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 56, height: 56, borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(79,70,229,0.18) 100%)',
                  color: '#6366f1'
                }}>
                  <Users size={28} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: cardText, lineHeight: 1.1 }}>
                    {turnout.total_voters}
                  </Typography>
                  <Typography variant="body2" sx={{ color: cardSubtext, fontWeight: 500, mt: 0.5 }}>
                    Total Voters
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{
              borderRadius: 4,
              border: cardBorder,
              bgcolor: cardBg,
              backdropFilter: 'blur(10px)',
              boxShadow: isDarkMode ? '0 4px 30px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.02)',
              transition: 'background-color 0.3s, border 0.3s'
            }}>
              <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 56, height: 56, borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.18) 100%)',
                  color: '#10b981'
                }}>
                  <Activity size={28} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: cardText, lineHeight: 1.1 }}>
                    {turnout.votes_cast}
                  </Typography>
                  <Typography variant="body2" sx={{ color: cardSubtext, fontWeight: 500, mt: 0.5 }}>
                    Votes Cast
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{
              borderRadius: 4,
              border: cardBorder,
              bgcolor: cardBg,
              backdropFilter: 'blur(10px)',
              boxShadow: isDarkMode ? '0 4px 30px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.02)',
              transition: 'background-color 0.3s, border 0.3s'
            }}>
              <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 56, height: 56, borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(217,119,6,0.18) 100%)',
                  color: '#f59e0b'
                }}>
                  <Trophy size={28} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: cardText, lineHeight: 1.1 }}>
                    {turnout.turnout_percentage?.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: cardSubtext, fontWeight: 500, mt: 0.5 }}>
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
                bgcolor: paperBg,
                border: paperBorder,
                boxShadow: isDarkMode ? '0 8px 32px rgba(0, 0, 0, 0.25)' : '0 8px 24px rgba(0, 0, 0, 0.02)',
                backdropFilter: 'blur(8px)',
                transition: 'background-color 0.3s, border 0.3s'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, pb: 1, borderBottom: borderStyle }}>
                  <Typography variant="h5" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5, color: paperTitle, display: 'flex', alignItems: 'center', gap: 1 }}>
                    🏆 {post.post_name}
                  </Typography>
                </Box>

                <Grid container spacing={4}>
                  {/* Candidates List Table */}
                  <Grid size={{ xs: 12, md: hasVotes ? 7 : 12 }}>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ '& th': { borderBottom: thBorder, pb: 1.5, fontWeight: 700, color: thColor, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 } }}>
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
                                '& td': { borderBottom: tdBorder, py: 2 },
                                '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)' },
                                transition: 'background-color 0.2s'
                              }}>
                                <TableCell sx={{ pl: 1 }}>
                                  <Box sx={{
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    px: 1.5, py: 0.5, borderRadius: 2, fontSize: '0.7rem', fontWeight: 800,
                                    textTransform: 'uppercase',
                                    ...(isWinner ? {
                                      bgcolor: 'rgba(251, 191, 36, 0.12)',
                                      color: '#b45309',
                                      border: '1px solid rgba(251, 191, 36, 0.3)'
                                    } : idx === 1 && c.total_votes > 0 ? {
                                      bgcolor: 'rgba(148, 163, 184, 0.12)',
                                      color: isDarkMode ? '#cbd5e1' : '#475569',
                                      border: '1px solid rgba(148, 163, 184, 0.3)'
                                    } : idx === 2 && c.total_votes > 0 ? {
                                      bgcolor: 'rgba(249, 115, 22, 0.1)',
                                      color: '#c2410c',
                                      border: '1px solid rgba(249, 115, 22, 0.2)'
                                    } : {
                                      bgcolor: rankBgOther,
                                      color: rankColorOther,
                                      border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)'
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
                                        width: 44, height: 44, border: isDarkMode ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid rgba(0,0,0,0.1)',
                                        bgcolor: c.is_nota ? '#334155' : 'inherit'
                                      }}
                                    >
                                      {c.is_nota && <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', fontSize: '0.65rem' }}>NOTA</Typography>}
                                    </Avatar>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                      <Typography variant="body2" sx={{ fontWeight: isWinner ? 800 : 600, color: tdText, fontSize: '0.95rem' }}>
                                        {c.candidate_name}
                                      </Typography>
                                      {c.symbol && !c.is_nota && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.75, width: '100%' }}>
                                          <img
                                            src={getImageUrl(c.symbol)}
                                            alt={c.symbol_name || "symbol"}
                                            style={{ width: 20, height: 20, objectFit: 'contain', backgroundColor: 'white', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', padding: '1px' }}
                                          />
                                          {c.symbol_name && (
                                            <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : '#475569', fontWeight: 600, fontSize: '0.75rem' }}>
                                              {c.symbol_name}
                                            </Typography>
                                          )}
                                        </Box>
                                      )}
                                    </Box>
                                  </Box>
                                </TableCell>
                                
                                <TableCell sx={{ fontWeight: 800, fontSize: '1.05rem', color: isWinner ? '#f59e0b' : tdText }}>
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
                                      borderColor: isDarkMode ? 'rgba(129, 140, 248, 0.4)' : 'rgba(99, 102, 241, 0.4)',
                                      color: isDarkMode ? '#93c5fd' : '#4f46e5',
                                      '&:hover': {
                                        borderColor: isDarkMode ? '#60a5fa' : '#3f51b5',
                                        bgcolor: isDarkMode ? 'rgba(96, 165, 250, 0.05)' : 'rgba(99, 102, 241, 0.05)'
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
                    <Grid size={{ xs: 12, md: 5 }}>
                      <Paper variant="outlined" sx={{ 
                        p: 2, 
                        borderRadius: 3, 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center',
                        alignItems: 'center',
                        bgcolor: chartBg,
                        borderColor: chartBorder,
                        minHeight: 250,
                        transition: 'background-color 0.3s, border 0.3s'
                      }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: legendColor, letterSpacing: 1, mb: 1, fontFamily: 'Outfit, sans-serif' }}>
                          Vote Distribution
                        </Typography>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={post.candidates?.map((c: any) => ({ name: c.candidate_name, value: c.total_votes || 0 }))}
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
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '0.75rem', fontFamily: 'Outfit, sans-serif', color: legendColor, paddingTop: '10px' }} />
                            <RechartsTooltip contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: 8, color: textColor }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </Paper>
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
            bgcolor: modalBg,
            backgroundImage: modalGradient,
            border: modalBorder,
            color: modalText,
            transition: 'background-color 0.3s, color 0.3s, border 0.3s'
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
                        border: isDarkMode ? '2px solid rgba(255,255,255,0.1)' : '2px solid rgba(0,0,0,0.08)',
                        bgcolor: candidate.is_nota ? '#334155' : 'inherit'
                      }}
                    >
                      {candidate.is_nota && <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', fontSize: '0.65rem' }}>NOTA</Typography>}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: modalText, letterSpacing: '-0.5px' }}>
                        {candidate.candidate_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: modalSubtext, display: 'block', mt: 0.25 }}>
                        Candidate for <b>{post.post_name}</b> {candidate.symbol_name ? `• Symbol: ${candidate.symbol_name}` : ''}
                      </Typography>
                    </Box>
                  </Box>
                  {candidate.symbol && !candidate.is_nota && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={getImageUrl(candidate.symbol)}
                        sx={{
                          width: 42,
                          height: 42,
                          bgcolor: 'white',
                          border: isDarkMode ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid rgba(0,0,0,0.08)',
                          p: 0.5
                        }}
                      />
                      {candidate.symbol_name && (
                        <Typography variant="caption" sx={{ color: modalSubtext, fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
                          {candidate.symbol_name}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </DialogTitle>
              
              <DialogContent dividers sx={{ py: 3, borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                <Grid container spacing={3}>
                  {/* Total Votes Card */}
                  <Grid size={{ xs: 12 }}>
                    <Card sx={{
                      bgcolor: modalCardBg,
                      border: `1px solid ${modalCardBorder}`,
                      borderRadius: 3
                    }}>
                      <CardContent sx={{ py: 2.5, '&:last-child': { pb: 2.5 } }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: modalSubtext, letterSpacing: 1, textTransform: 'uppercase' }}>
                          Total Votes Received
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 900, color: '#fbbf24', mt: 0.5 }}>
                          {candidate.total_votes}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Class Split and Section Split (High Priority) */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: modalText }}>
                      Votes by Class
                    </Typography>
                    <TableContainer component={Paper} sx={{ maxHeight: 200, borderRadius: 3, bgcolor: modalTableBg, border: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)' }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow sx={{ '& th': { bgcolor: modalBg, borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)', fontWeight: 700, color: modalSubtext } }}>
                            <TableCell>Class</TableCell>
                            <TableCell align="right">Votes</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {candidate.demographics?.classes && Object.keys(candidate.demographics.classes).length > 0 ? (
                            Object.entries(candidate.demographics.classes)
                              .sort((a: any, b: any) => b[1] - a[1])
                              .map(([className, votes]: any) => (
                                <TableRow key={className} sx={{ '& td': { borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)', color: modalText } }}>
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

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: modalText }}>
                      Votes by Section
                    </Typography>
                    <TableContainer component={Paper} sx={{ maxHeight: 200, borderRadius: 3, bgcolor: modalTableBg, border: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)' }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow sx={{ '& th': { bgcolor: modalBg, borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)', fontWeight: 700, color: modalSubtext } }}>
                            <TableCell>Section</TableCell>
                            <TableCell align="right">Votes</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {candidate.demographics?.sections && Object.keys(candidate.demographics.sections).length > 0 ? (
                            Object.entries(candidate.demographics.sections)
                              .sort((a: any, b: any) => b[1] - a[1])
                              .map(([sectionName, votes]: any) => (
                                <TableRow key={sectionName} sx={{ '& td': { borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)', color: modalText } }}>
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

                  {/* Gender Split Breakdown (Low Priority) */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: modalText }}>
                      Gender Breakdown
                    </Typography>
                    <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: modalTableBg, border: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="body2" sx={{ color: '#3b82f6', fontWeight: 700 }}>
                          Male: {candidate.demographics?.male_votes || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#ec4899', fontWeight: 700 }}>
                          Female: {candidate.demographics?.female_votes || 0}
                        </Typography>
                      </Box>
                      {candidate.total_votes > 0 ? (
                        <Box sx={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
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
                        <Box sx={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#64748b' }}>No votes recorded</Typography>
                        </Box>
                      )}
                      {candidate.total_votes > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" sx={{ color: modalSubtext, fontWeight: 700 }}>
                            {(((candidate.demographics?.male_votes || 0) / candidate.total_votes) * 100).toFixed(0)}% Male
                          </Typography>
                          <Typography variant="caption" sx={{ color: modalSubtext, fontWeight: 700 }}>
                            {(((candidate.demographics?.female_votes || 0) / candidate.total_votes) * 100).toFixed(0)}% Female
                          </Typography>
                        </Box>
                      )}
                    </Paper>
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
