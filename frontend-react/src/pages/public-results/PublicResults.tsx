import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Button, IconButton, Chip, Card, CardContent,
  LinearProgress, CircularProgress, Alert, Tooltip, Zoom, Avatar
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Play, Pause, Eye, EyeOff, Sparkles, Maximize2, Minimize2,
  ChevronRight, ChevronLeft, ArrowLeft, RefreshCw, Star, Volume2, VolumeX
} from 'lucide-react';
import axios from 'axios';
import { getMediaUrl, getBaseUrl } from '../../api/axiosInstance';
import { useAuthStore } from '../../store/authStore';

const MEDIA_URL = getMediaUrl();
const API_URL = getBaseUrl();

// Custom Canvas Confetti Component
const ConfettiEffect = ({ trigger }: { trigger: any }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      shape: 'circle' | 'square' | 'star';
    }> = [];

    const colors = ['#fbbf24', '#f59e0b', '#3b82f6', '#ec4899', '#10b981', '#8b5cf6', '#a78bfa', '#f43f5e'];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const spawnConfetti = () => {
      const shapes: Array<'circle' | 'square' | 'star'> = ['circle', 'square', 'star'];
      
      // Left side burst
      for (let i = 0; i < 90; i++) {
        particles.push({
          x: 0,
          y: canvas.height * 0.85,
          size: Math.random() * 10 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: Math.random() * 15 + 5,
          speedY: -(Math.random() * 22 + 12),
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 12 - 6,
          opacity: 1.2,
          shape: shapes[Math.floor(Math.random() * shapes.length)]
        });
      }
      
      // Right side burst
      for (let i = 0; i < 90; i++) {
        particles.push({
          x: canvas.width,
          y: canvas.height * 0.85,
          size: Math.random() * 10 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: -(Math.random() * 15 + 5),
          speedY: -(Math.random() * 22 + 12),
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 12 - 6,
          opacity: 1.2,
          shape: shapes[Math.floor(Math.random() * shapes.length)]
        });
      }
    };

    spawnConfetti();

    const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, color: string) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      let step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, idx) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += 0.4; // gravity
        p.speedX *= 0.98; // wind resistance
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.006;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(p.opacity, 0);

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        } else if (p.shape === 'star') {
          drawStar(ctx, 0, 0, 5, p.size, p.size / 2, p.color);
        } else {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
        
        ctx.restore();

        if (p.y > canvas.height || p.opacity <= 0) {
          particles.splice(idx, 1);
        }
      });

      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [trigger]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }} />;
};

const PublicResults = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  
  // Presenter settings
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [showVotes, setShowVotes] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Autoplay music once data has successfully loaded
  useEffect(() => {
    if (!loading && data && audioRef.current) {
      audioRef.current.volume = 0.45; // pleasant soft background level
      audioRef.current.play()
        .then(() => {
          setIsPlayingMusic(true);
        })
        .catch(err => {
          console.log("Autoplay blocked by browser policy:", err);
          setIsPlayingMusic(false);
        });
    }
  }, [loading, data]);

  // Clean up audio when the component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlayingMusic(true);
        })
        .catch(err => {
          console.error("Failed to play audio:", err);
        });
    }
  };
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch results
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/elections/public/${electionId}/results`);
        setData(response.data);
        // Trigger initial celebration
        setConfettiTrigger(prev => prev + 1);
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

    if (electionId) {
      fetchResults();
    }
  }, [electionId]);

  // Slideshow Auto Play Logic
  useEffect(() => {
    if (isAutoPlaying && data?.results?.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentPostIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % data.results.length;
          setConfettiTrigger(c => c + 1);
          return nextIndex;
        });
      }, 10000); // 10 seconds per post
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlaying, data]);

  // Listen for Fullscreen Changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  const handleNextPost = () => {
    if (!data?.results) return;
    setCurrentPostIndex(prev => {
      const next = (prev + 1) % data.results.length;
      setConfettiTrigger(c => c + 1);
      return next;
    });
  };

  const handlePrevPost = () => {
    if (!data?.results) return;
    setCurrentPostIndex(prev => {
      const next = prev === 0 ? data.results.length - 1 : prev - 1;
      setConfettiTrigger(c => c + 1);
      return next;
    });
  };

  const triggerConfetti = () => {
    setConfettiTrigger(prev => prev + 1);
  };

  const handleExit = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
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
          Calculating Winners and Loading Visuals...
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

  const { election, results, turnout } = data;
    const currentPost = results[currentPostIndex];
    const candidates = currentPost?.candidates || [];

    // Helper for Podium placements
    const firstPlace = candidates[0];
    const secondPlace = candidates[1];
    const thirdPlace = candidates[2];
    const remainingCandidates = candidates.slice(3);

    return (
      <Box sx={{
        minHeight: '100vh',
        bgcolor: '#0f172a',
        background: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.12) 0%, transparent 45%), radial-gradient(circle at 90% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 45%), #0a0f1d',
        color: '#f8fafc',
        fontFamily: 'Outfit, sans-serif',
        position: 'relative',
        overflowX: 'hidden',
        pb: 12
      }}>
        {/* Audio Element */}
        <audio ref={audioRef} src="/celebration.mp3" loop />

        {/* Confetti canvas */}
        <ConfettiEffect trigger={confettiTrigger} />

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
            {election.school_logo ? (
              <Avatar
                src={`${MEDIA_URL}${election.school_logo}`}
                alt={election.school_name}
                sx={{
                  width: 48,
                  height: 48,
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                }}
              />
            ) : (
              <Avatar sx={{ width: 48, height: 48, bgcolor: '#818cf8', fontWeight: 800 }}>
                {election.school_name?.substring(0, 2).toUpperCase()}
              </Avatar>
            )}
            <Box>
              <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                {election.school_name || 'School Election Panel'}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
                {election.name}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* Turnout badge */}
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Voter Turnout Rate
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 800, color: '#fbbf24' }}>
                {turnout?.turnout_percentage?.toFixed(1)}% <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400 }}>({turnout?.votes_cast}/{turnout?.total_voters})</span>
              </Typography>
            </Box>

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
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ maxW: 1400, mx: 'auto', px: { xs: 2, md: 6 }, mt: 4 }}>
          {results.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Typography variant="h5" color="text.secondary">No results found for this election.</Typography>
            </Box>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPostIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.45 }}
              >
                {/* Category Header */}
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                  <Typography variant="caption" sx={{
                    color: '#818cf8', fontWeight: 800, fontSize: '0.85rem', letterSpacing: 3,
                    textTransform: 'uppercase', display: 'inline-block', mb: 1,
                    px: 2, py: 0.5, borderRadius: 5, border: '1px solid rgba(129, 140, 248, 0.2)',
                    bgcolor: 'rgba(129, 140, 248, 0.05)'
                  }}>
                    Category {currentPostIndex + 1} of {results.length}
                  </Typography>
                  <Typography variant="h3" sx={{
                    fontWeight: 900,
                    fontSize: { xs: '2.2rem', md: '3.2rem' },
                    letterSpacing: '-1.5px',
                    background: 'linear-gradient(to right, #ffffff, #c7d2fe, #ffffff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mt: 0.5
                  }}>
                    🏆 {currentPost.post_name}
                  </Typography>
                </Box>

                {/* Podium View */}
                <Grid container spacing={4} justifyContent="center" alignItems="flex-end" sx={{ mb: 6 }}>
                  {/* 2nd Place Card */}
                  {secondPlace && (
                    <Grid item xs={12} sm={4} md={3} order={{ xs: 2, sm: 1 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        style={{ width: '100%', maxWidth: 300 }}
                      >
                        <Card sx={{
                          position: 'relative',
                          overflow: 'visible',
                          border: '1.5px solid rgba(148, 163, 184, 0.2)',
                          background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.08) 0%, rgba(148, 163, 184, 0.02) 100%)',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                          borderRadius: 4
                        }}>
                          <Box sx={{
                            position: 'absolute', top: -25, left: '50%', transform: 'translateX(-50%)',
                            bgcolor: '#cbd5e1', width: 45, height: 45, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#0f172a', fontWeight: 800, fontSize: '1.2rem',
                            border: '4px solid #0a0f1d', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                          }}>
                            2nd
                          </Box>
                          
                          <CardContent sx={{ pt: 4, pb: 3, textAlign: 'center' }}>
                            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                              <Avatar
                                src={secondPlace.photo ? `${MEDIA_URL}${secondPlace.photo}` : undefined}
                                sx={{
                                  width: 100, height: 100, mx: 'auto',
                                  border: '3px solid #cbd5e1',
                                  boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
                                }}
                              />
                              {secondPlace.symbol && (
                                <Avatar
                                  src={`${MEDIA_URL}${secondPlace.symbol}`}
                                  sx={{
                                    width: 32, height: 32, position: 'absolute', bottom: 0, right: 4,
                                    bgcolor: 'white', border: '2.5px solid #cbd5e1', boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                                  }}
                                />
                              )}
                            </Box>

                            <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', mb: 0.5 }}>
                              {secondPlace.candidate_name}
                            </Typography>
                            
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 2 }}>
                              Symbol: {secondPlace.symbol_name || 'Official'}
                            </Typography>

                            {showVotes && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, color: '#cbd5e1' }}>
                                  {secondPlace.vote_count} <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>votes</span>
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={currentPost.total_votes > 0 ? (secondPlace.vote_count / currentPost.total_votes) * 100 : 0}
                                    sx={{ flexGrow: 1, height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: '#cbd5e1' } }}
                                  />
                                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#cbd5e1' }}>
                                    {currentPost.total_votes > 0 ? ((secondPlace.vote_count / currentPost.total_votes) * 100).toFixed(0) : 0}%
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  )}

                  {/* 1st Place Winner Card */}
                  {firstPlace && (
                    <Grid item xs={12} sm={4} md={4} order={{ xs: 1, sm: 2 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.05, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 100, delay: 0.1 }}
                        style={{ width: '100%', maxWidth: 360, zIndex: 10 }}
                      >
                        <Card sx={{
                          position: 'relative',
                          overflow: 'visible',
                          border: '2.5px solid #fbbf24',
                          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.03) 100%)',
                          boxShadow: '0 15px 45px rgba(251, 191, 36, 0.25), 0 0 30px rgba(99, 102, 241, 0.15)',
                          borderRadius: 5
                        }}>
                          {/* Winner top tag */}
                          <Box sx={{
                            position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)',
                            bgcolor: '#fbbf24', color: '#0f172a', py: 0.6, px: 2.5, borderRadius: 5,
                            display: 'flex', alignItems: 'center', gap: 0.8, fontWeight: 900,
                            fontSize: '0.85rem', letterSpacing: 1.5, textTransform: 'uppercase',
                            boxShadow: '0 8px 20px rgba(251, 191, 36, 0.4)', border: '3px solid #0a0f1d'
                          }}>
                            <Trophy size={16} /> WINNER
                          </Box>

                          <CardContent sx={{ pt: 5, pb: 4, textAlign: 'center' }}>
                            <Box sx={{ position: 'relative', display: 'inline-block', mb: 3.5 }}>
                              <Box sx={{
                                position: 'absolute', inset: -10, borderRadius: '50%',
                                background: 'conic-gradient(from 0deg, #fbbf24, #f59e0b, transparent, #fbbf24)',
                                animation: 'spin 4s linear infinite',
                                '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } }
                              }} />
                              <Avatar
                                src={firstPlace.photo ? `${MEDIA_URL}${firstPlace.photo}` : undefined}
                                sx={{
                                  width: 140, height: 140, mx: 'auto',
                                  border: '4px solid #fbbf24',
                                  position: 'relative', zIndex: 1,
                                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                                }}
                              />
                              {firstPlace.symbol && (
                                <Avatar
                                  src={`${MEDIA_URL}${firstPlace.symbol}`}
                                  sx={{
                                    width: 42, height: 42, position: 'absolute', bottom: -2, right: 6,
                                    bgcolor: 'white', border: '3px solid #fbbf24', boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                                    zIndex: 2
                                  }}
                                />
                              )}
                            </Box>

                            <Typography variant="h5" sx={{ fontWeight: 900, color: 'white', mb: 0.5, fontSize: '1.6rem', letterSpacing: '-0.5px' }}>
                              {firstPlace.candidate_name}
                            </Typography>
                            
                            <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 600, display: 'block', mb: 3, letterSpacing: 1 }}>
                              Symbol: {firstPlace.symbol_name || 'Official'}
                            </Typography>

                            {showVotes && (
                              <Box sx={{ mt: 3, px: 2 }}>
                                <Typography variant="h3" sx={{ fontWeight: 950, color: '#fbbf24', display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.5 }}>
                                  {firstPlace.vote_count} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 600 }}>votes</span>
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={currentPost.total_votes > 0 ? (firstPlace.vote_count / currentPost.total_votes) * 100 : 0}
                                    sx={{
                                      flexGrow: 1, height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.05)',
                                      '& .MuiLinearProgress-bar': { bgcolor: '#fbbf24' }
                                    }}
                                  />
                                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#fbbf24' }}>
                                    {currentPost.total_votes > 0 ? ((firstPlace.vote_count / currentPost.total_votes) * 100).toFixed(0) : 0}%
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  )}

                  {/* 3rd Place Card */}
                  {thirdPlace && (
                    <Grid item xs={12} sm={4} md={3} order={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.35 }}
                        style={{ width: '100%', maxWidth: 300 }}
                      >
                        <Card sx={{
                          position: 'relative',
                          overflow: 'visible',
                          border: '1.5px solid rgba(180, 83, 9, 0.2)',
                          background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(217, 119, 6, 0.02) 100%)',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                          borderRadius: 4
                        }}>
                          <Box sx={{
                            position: 'absolute', top: -25, left: '50%', transform: 'translateX(-50%)',
                            bgcolor: '#b45309', width: 45, height: 45, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 800, fontSize: '1.1rem',
                            border: '4px solid #0a0f1d', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                          }}>
                            3rd
                          </Box>
                          
                          <CardContent sx={{ pt: 4, pb: 3, textAlign: 'center' }}>
                            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                              <Avatar
                                src={thirdPlace.photo ? `${MEDIA_URL}${thirdPlace.photo}` : undefined}
                                sx={{
                                  width: 100, height: 100, mx: 'auto',
                                  border: '3px solid #b45309',
                                  boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
                                }}
                              />
                              {thirdPlace.symbol && (
                                <Avatar
                                  src={`${MEDIA_URL}${thirdPlace.symbol}`}
                                  sx={{
                                    width: 32, height: 32, position: 'absolute', bottom: 0, right: 4,
                                    bgcolor: 'white', border: '2.5px solid #b45309', boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                                  }}
                                />
                              )}
                            </Box>

                            <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', mb: 0.5 }}>
                              {thirdPlace.candidate_name}
                            </Typography>
                            
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 2 }}>
                              Symbol: {thirdPlace.symbol_name || 'Official'}
                            </Typography>

                            {showVotes && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, color: '#d97706' }}>
                                  {thirdPlace.vote_count} <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>votes</span>
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={currentPost.total_votes > 0 ? (thirdPlace.vote_count / currentPost.total_votes) * 100 : 0}
                                    sx={{ flexGrow: 1, height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: '#d97706' } }}
                                  />
                                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#d97706' }}>
                                    {currentPost.total_votes > 0 ? ((thirdPlace.vote_count / currentPost.total_votes) * 100).toFixed(0) : 0}%
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  )}
                </Grid>

                {/* Other Candidates List (Rank 4+) */}
                {remainingCandidates.length > 0 && (
                  <Box sx={{ maxWidth: 800, mx: 'auto', mt: 6 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 2.5, px: 1, color: '#94a3b8' }}>
                      Runner-Ups Breakdown
                    </Typography>
                    <Paper sx={{
                      borderRadius: 4, bgcolor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)',
                      overflow: 'hidden', backdropFilter: 'blur(8px)'
                    }}>
                      {remainingCandidates.map((c: any, index: number) => {
                        const rank = index + 4;
                        return (
                          <Box key={c.candidate_id} sx={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            p: 2, borderBottom: index === remainingCandidates.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }, transition: 'background-color 0.2s'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography sx={{ width: 30, textAlign: 'center', color: '#94a3b8', fontWeight: 800 }}>
                                #{rank}
                              </Typography>
                              <Avatar src={c.photo ? `${MEDIA_URL}${c.photo}` : undefined} sx={{ width: 40, height: 40 }} />
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {c.symbol && <Avatar src={`${MEDIA_URL}${c.symbol}`} sx={{ width: 20, height: 20, bgcolor: 'white' }} />}
                                <Typography sx={{ fontWeight: 700, color: 'white' }}>{c.candidate_name}</Typography>
                              </Box>
                            </Box>

                            {showVotes && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, width: 220 }}>
                                <Box sx={{ flexGrow: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={currentPost.total_votes > 0 ? (c.vote_count / currentPost.total_votes) * 100 : 0}
                                    sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: '#94a3b8' } }}
                                  />
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 800, color: '#94a3b8', minWidth: 70, textAlign: 'right' }}>
                                  {c.vote_count} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>({currentPost.total_votes > 0 ? ((c.vote_count / currentPost.total_votes) * 100).toFixed(0) : 0}%)</span>
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                    </Paper>
                  </Box>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </Box>

        {/* Floating Control/Navigation Bar */}
        <Box sx={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 500,
          bgcolor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 8,
          py: 1,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, md: 2 },
          boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}>
          <Tooltip title="Exit Presentation" TransitionComponent={Zoom}>
            <IconButton onClick={handleExit} sx={{ color: '#94a3b8', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}>
              <ArrowLeft size={20} />
            </IconButton>
          </Tooltip>

          <Box sx={{ width: '1px', height: 28, bgcolor: 'rgba(255,255,255,0.15)', mx: 0.5 }} />

          <Tooltip title="Previous Post" TransitionComponent={Zoom}>
            <IconButton
              onClick={handlePrevPost}
              disabled={results.length <= 1}
              sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }, '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' } }}
            >
              <ChevronLeft size={22} />
            </IconButton>
          </Tooltip>

          <Tooltip title={isAutoPlaying ? "Pause Auto-play" : "Start Auto-play (10s cycle)"} TransitionComponent={Zoom}>
            <Button
              variant="contained"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              sx={{
                minWidth: 42,
                width: 42,
                height: 42,
                borderRadius: '50%',
                p: 0,
                background: isAutoPlaying
                  ? 'linear-gradient(135deg, #ec4899 0%, #be123c 100%)'
                  : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                boxShadow: 'none',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: isAutoPlaying ? '0 0 15px rgba(236, 72, 153, 0.4)' : '0 0 15px rgba(79, 70, 229, 0.4)'
                }
              }}
            >
              {isAutoPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" style={{ marginLeft: 3 }} />}
            </Button>
          </Tooltip>

          <Tooltip title="Next Post" TransitionComponent={Zoom}>
            <IconButton
              onClick={handleNextPost}
              disabled={results.length <= 1}
              sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }, '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' } }}
            >
              <ChevronRight size={22} />
            </IconButton>
          </Tooltip>

          <Box sx={{ width: '1px', height: 28, bgcolor: 'rgba(255,255,255,0.15)', mx: 0.5 }} />

          <Tooltip title={showVotes ? "Hide Vote Counts (Suspense Mode)" : "Show Vote Counts"} TransitionComponent={Zoom}>
            <IconButton
              onClick={() => setShowVotes(!showVotes)}
              sx={{
                color: showVotes ? '#fbbf24' : '#94a3b8',
                '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)' }
              }}
            >
              {showVotes ? <Eye size={20} /> : <EyeOff size={20} />}
            </IconButton>
          </Tooltip>

          <Tooltip title={isPlayingMusic ? "Mute Background Music" : "Play Background Music"} TransitionComponent={Zoom}>
            <IconButton 
              onClick={toggleMusic} 
              sx={{ 
                color: isPlayingMusic ? '#fbbf24' : '#94a3b8', 
                '&:hover': { color: isPlayingMusic ? '#f59e0b' : 'white', bgcolor: 'rgba(255,255,255,0.05)' },
                animation: !isPlayingMusic ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.15)', color: '#818cf8' },
                  '100%': { transform: 'scale(1)' }
                }
              }}
            >
              {isPlayingMusic ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Shoot Confetti" TransitionComponent={Zoom}>
            <IconButton onClick={triggerConfetti} sx={{ color: '#a78bfa', '&:hover': { color: '#c084fc', bgcolor: 'rgba(255,255,255,0.05)' } }}>
              <Sparkles size={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"} TransitionComponent={Zoom}>
            <IconButton onClick={toggleFullscreen} sx={{ color: '#94a3b8', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}>
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  };

export default PublicResults;
