import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Grid, Card, CardContent,
  Avatar, Accordion, AccordionSummary, AccordionDetails, Paper, Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Vote, Shield, Users, BarChart3, Info, ArrowRight,
  CheckCircle2, Monitor, Landmark, FileSpreadsheet, PlayCircle,
  Trophy, Settings, ChevronDown
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const getPlanFeatures = (planName: string, maxVoters: number, maxElections: number) => {
  const baseFeatures = [
    `Up to ${maxVoters.toLocaleString()} Registered Voters`,
    `${maxElections} Active ${maxElections === 1 ? 'Election' : 'Elections'}`,
    "Encrypted Ballot Receipts",
    "Central Polling Infrastructure"
  ];
  
  if (planName === 'Free') {
    return [
      ...baseFeatures,
      "Standard Results Display",
      "Email Support"
    ];
  } else if (planName === 'Standard') {
    return [
      ...baseFeatures,
      "Cinematic Winners Presentation Mode",
      "Confetti & Spotlight Visuals",
      "Multi-booth Officer Terminals",
      "24/7 System Support"
    ];
  } else { // Premium
    return [
      ...baseFeatures,
      "Sound FX & Confetti animations",
      "Unlimited Officer logins",
      "Dedicated Account Manager",
      "Full Voter register Excel imports"
    ];
  }
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = React.useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = React.useState(true);
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'annual'>('monthly');

  React.useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axiosInstance.get('/plans/public');
        setPlans(response.data);
      } catch (err) {
        console.error('Failed to fetch pricing plans:', err);
        // Fallback static plans if backend is unreachable
        setPlans([
          { id: 1, name: 'Free', price: 0.00, max_voters: 450, max_elections: 1, description: 'Basic plan for small schools' },
          { id: 2, name: 'Standard', price: 1499.00, max_voters: 1200, max_elections: 3, description: 'Ideal for medium sized schools' },
          { id: 3, name: 'Premium', price: 2499.00, max_voters: 2500, max_elections: 5, description: 'Full featured plan for large schools' }
        ]);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 80 }
    }
  };

  const steps = [
    {
      icon: <Settings size={24} color="#818cf8" />,
      title: "1. Setup School Profile & Base Configurations",
      description: "Define class divisions (e.g. Class 10, Class 11) and sections/sections levels. Configure infrastructure requirements and platform settings to map the physical school layout."
    },
    {
      icon: <Landmark size={24} color="#38bdf8" />,
      title: "2. Create Election & Posts",
      description: "Initialize a new election context. Define election details and create the respective posts (e.g., School Captain, Head Boy/Girl, Sports Prefect) with gender or class eligibility filters."
    },
    {
      icon: <FileSpreadsheet size={24} color="#34d399" />,
      title: "3. Import Voter Registry & Appoint Staff",
      description: "Upload voter registers instantly using Excel templates. Create staff accounts and assign them to roles like Election Commissioners or Booth Officers."
    },
    {
      icon: <Users size={24} color="#a78bfa" />,
      title: "4. Candidate Nominations & Ballot Prep",
      description: "Open the online nomination window. Students submit applications, which are vetted and approved by admins. Assign official candidate photos, symbols, and names to build the digital ballot."
    },
    {
      icon: <Monitor size={24} color="#fb7185" />,
      title: "5. Configure EVM Polling Booths",
      description: "Set up local voting booths. Assign booths to specific officer terminals and map them to local hardware devices securely with a one-time passcode verification."
    },
    {
      icon: <PlayCircle size={24} color="#fbbf24" />,
      title: "6. Launch and Run Live Polling",
      description: "Start the election. Voters verify at the officer desk, get issued a secure token, and walk to the EVM terminal to cast their votes. Track turnout in real-time on the live admin monitor."
    },
    {
      icon: <Trophy size={24} color="#f472b6" />,
      title: "7. Publish & Spotlight Results",
      description: "Close the voting booths. Instantly calculate results and launch the public presentation screen on a TV or projector, featuring automatic winners podiums, confetti bursts, and celebratory background music!"
    }
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#0f172a',
      background: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.12) 0%, transparent 45%), radial-gradient(circle at 90% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 45%), #0a0f1d',
      color: '#f8fafc',
      fontFamily: 'Outfit, sans-serif',
      pb: 8,
      overflowX: 'hidden'
    }}>
      {/* Navigation Header */}
      <Container maxWidth="lg" sx={{ pt: 3, pb: 2 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(12px)',
          bgcolor: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 6,
          px: { xs: 3, md: 4 },
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex', alignItems: 'center', justify: 'center',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
            }}>
              <Vote size={22} color="white" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.5px', background: 'linear-gradient(45deg, #ffffff, #c7d2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              E-Vote Portal
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="text"
              sx={{ color: '#94a3b8', fontWeight: 600, display: { xs: 'none', sm: 'block' }, '&:hover': { color: 'white' } }}
              onClick={() => {
                const element = document.getElementById('flow-guide');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Onboarding Guide
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                borderRadius: '12px',
                fontWeight: 700,
                textTransform: 'none',
                px: 3.5,
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Login to Portal
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ mt: { xs: 6, md: 10 }, mb: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={7}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <Typography variant="caption" sx={{
                  color: '#818cf8', fontWeight: 800, fontSize: '0.85rem', letterSpacing: 2,
                  textTransform: 'uppercase', display: 'inline-block', mb: 2,
                  px: 2, py: 0.5, borderRadius: 5, border: '1px solid rgba(129, 140, 248, 0.2)',
                  bgcolor: 'rgba(129, 140, 248, 0.05)'
                }}>
                  Next-Gen School Elections
                </Typography>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Typography variant="h2" sx={{
                  fontWeight: 950,
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.2rem' },
                  letterSpacing: '-2px',
                  lineHeight: 1.1,
                  background: 'linear-gradient(to right, #ffffff, #e0e7ff, #a5b4fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 3
                }}>
                  Digital Democracy For Your School
                </Typography>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Typography variant="body1" sx={{ color: '#94a3b8', fontSize: { xs: '1rem', md: '1.25rem' }, lineHeight: 1.6, mb: 4, maxW: 600 }}>
                  A secure, audited, and beautifully animated E-voting system designed to manage your school parliament elections effortlessly. Set up EVM terminals, coordinate booths in real-time, and display results with cinematic win overlays.
                </Typography>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', gap: 2.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/login')}
                    endIcon={<ArrowRight size={18} />}
                    sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
                      borderRadius: '14px',
                      fontWeight: 800,
                      textTransform: 'none',
                      py: 1.8,
                      px: 4.5,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Get Started & Login
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => {
                      const element = document.getElementById('flow-guide');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    sx={{
                      borderRadius: '14px',
                      fontWeight: 700,
                      textTransform: 'none',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#cbd5e1',
                      py: 1.8,
                      px: 4.5,
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255, 255, 255, 0.02)',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    View System Workflow
                  </Button>
                </Box>
              </motion.div>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center' }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 50, delay: 0.3 }}
            >
              <Box sx={{
                position: 'relative',
                p: '2px',
                borderRadius: '30px',
                background: 'linear-gradient(135deg, #6366f1, #d946ef)',
                boxShadow: '0 30px 60px -15px rgba(99, 102, 241, 0.5)'
              }}>
                <Box sx={{
                  bgcolor: '#0a0f1d',
                  borderRadius: '28px',
                  p: 4,
                  width: '100%',
                  maxW: 380,
                  textAlign: 'center'
                }}>
                  <Avatar sx={{ width: 80, height: 80, mx: 'auto', bgcolor: 'rgba(99,102,241,0.1)', mb: 3 }}>
                    <Shield size={45} color="#818cf8" />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Fully Auditable & Secure</Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.6, mb: 3 }}>
                    Encrypted voter credentials, hardware-bound voting booths, and multi-layered audit logging guarantee a 100% fair election.
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
                    <Box sx={{ px: 2, py: 1, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#fbbf24' }}>EVM</Typography>
                      <Typography variant="caption" color="textSecondary">Simulation</Typography>
                    </Box>
                    <Box sx={{ px: 2, py: 1, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#34d399' }}>Live</Typography>
                      <Typography variant="caption" color="textSecondary">Monitor</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Overview Cards */}
      <Container maxWidth="lg" sx={{ mb: 10 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4, height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: 'rgba(56,189,248,0.1)', display: 'flex', alignItems: 'center', justify: 'center', mb: 3 }}>
                  <Shield size={24} color="#38bdf8" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>Security & Trust</Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
                  One-time passcodes, encrypted tokens, and secure local terminal lockdowns prevent double voting and protect student confidentiality.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4, height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: 'rgba(52,211,153,0.1)', display: 'flex', alignItems: 'center', justify: 'center', mb: 3 }}>
                  <BarChart3 size={24} color="#34d399" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>Live Dashboard Tracking</Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
                  Appointed commissioners and administrators monitor polling booth activity, voter turnout metrics, and machine diagnostics in real-time.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4, height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: 'rgba(244,114,182,0.1)', display: 'flex', alignItems: 'center', justify: 'center', mb: 3 }}>
                  <Trophy size={24} color="#f472b6" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>Spotlight Presentation</Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
                  Celebrate the outcomes with a stunning podium results screen designed for projectors or TVs, featuring custom confetti and music loops.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Onboarding Flow Section */}
      <Container id="flow-guide" maxWidth="md" sx={{ mb: 10, scrollMarginTop: 40 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="caption" sx={{ color: '#818cf8', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Newly Registered?
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1.5px', mt: 1, mb: 2 }}>
            Step-by-Step Onboarding Workflow
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8', maxW: 600, mx: 'auto' }}>
            Follow this step-by-step roadmap to configure, launch, and run your school's parliament elections from scratch.
          </Typography>
        </Box>

        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 5, bgcolor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
          {steps.map((step, idx) => (
            <Box key={idx} sx={{
              display: 'flex',
              gap: 3,
              mb: idx === steps.length - 1 ? 0 : 4,
              borderLeft: idx === steps.length - 1 ? 'none' : '2px dashed rgba(255,255,255,0.1)',
              pl: { xs: 1, sm: 3 },
              position: 'relative'
            }}>
              {/* Dot icon */}
              <Box sx={{
                position: 'absolute',
                left: { xs: -13, sm: -13 },
                top: 0,
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: '#0f172a',
                border: '2px solid rgba(99, 102, 241, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#818cf8' }} />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, mt: -0.5 }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {step.icon}
                  </Avatar>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'white' }}>
                    {step.title}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.6, ml: { xs: 0, sm: 7 } }}>
                  {step.description}
                </Typography>
              </Box>

            </Box>
          ))}
        </Paper>
      </Container>

      {/* Pricing Section */}
      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="caption" sx={{
            color: '#818cf8', fontWeight: 800, fontSize: '0.85rem', letterSpacing: 2,
            textTransform: 'uppercase', display: 'inline-block', mb: 2,
            px: 2, py: 0.5, borderRadius: 5, border: '1px solid rgba(129, 140, 248, 0.2)',
            bgcolor: 'rgba(129, 140, 248, 0.05)'
          }}>
            Pricing Options
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1.5px', mt: 1, mb: 2 }}>
            Simple, Transparent Plans
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8', maxW: 600, mx: 'auto', mb: 4 }}>
            Choose a plan that fits your school's election scale. Save more with annual subscriptions.
          </Typography>

          {/* Monthly / Annual Toggle */}
          <Box sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            bgcolor: 'rgba(15, 23, 42, 0.6)', 
            border: '1px solid rgba(255,255,255,0.08)', 
            borderRadius: '24px', 
            p: 0.5, 
            mb: 2,
            backdropFilter: 'blur(10px)'
          }}>
            <Button
              onClick={() => setBillingCycle('monthly')}
              sx={{
                borderRadius: '20px',
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 700,
                color: billingCycle === 'monthly' ? '#ffffff' : '#94a3b8',
                bgcolor: billingCycle === 'monthly' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: billingCycle === 'monthly' ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
                '&:hover': { bgcolor: billingCycle === 'monthly' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.03)' }
              }}
            >
              Monthly
            </Button>
            <Button
              onClick={() => setBillingCycle('annual')}
              sx={{
                borderRadius: '20px',
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 700,
                color: billingCycle === 'annual' ? '#ffffff' : '#94a3b8',
                bgcolor: billingCycle === 'annual' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: billingCycle === 'annual' ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
                '&:hover': { bgcolor: billingCycle === 'annual' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.03)' }
              }}
            >
              Annual (Save 20%)
            </Button>
          </Box>
        </Box>

        {loadingPlans ? (
          <Grid container spacing={4} justifyContent="center">
            {[1, 2, 3].map((item) => (
              <Grid item xs={12} md={4} key={item}>
                <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 5, height: 450, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ width: 100, height: 24, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
                    <Box sx={{ width: 150, height: 48, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
                    <Box sx={{ width: '100%', height: 16, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1 }} />
                    <Box sx={{ width: '80%', height: 16, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1 }} />
                  </Box>
                  <Box sx={{ width: '100%', height: 48, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3 }} />
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={4} justifyContent="center" alignItems="stretch">
            {plans.map((plan) => {
              const isPopular = plan.name === 'Standard';
              const isPremium = plan.name === 'Premium';
              const priceNum = parseFloat(plan.price);
              
              // Calculate discounted price for annual cycle
              const monthlyEquivalentPrice = billingCycle === 'annual' ? priceNum * 0.8 : priceNum;
              const formattedPrice = monthlyEquivalentPrice === 0 
                ? 'Free' 
                : `₹${Math.round(monthlyEquivalentPrice).toLocaleString()}`;
              
              const billingText = monthlyEquivalentPrice === 0 
                ? 'forever' 
                : `/ month${billingCycle === 'annual' ? ` (billed ₹${Math.round(monthlyEquivalentPrice * 12).toLocaleString()} annually)` : ''}`;

              const features = getPlanFeatures(plan.name, plan.max_voters, plan.max_elections);

              return (
                <Grid item xs={12} md={4} key={plan.id} sx={{ display: 'flex' }}>
                  <motion.div
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    style={{ display: 'flex', width: '100%' }}
                  >
                    <Card sx={{
                      bgcolor: isPopular 
                        ? 'rgba(99, 102, 241, 0.1)' 
                        : isPremium 
                          ? 'rgba(236, 72, 153, 0.05)' 
                          : 'rgba(30, 41, 59, 0.4)',
                      border: '1px solid',
                      borderColor: isPopular 
                        ? 'rgba(99, 102, 241, 0.4)' 
                        : isPremium 
                          ? 'rgba(236, 72, 153, 0.3)' 
                          : 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 5,
                      boxShadow: isPopular 
                        ? '0 20px 40px -15px rgba(99, 102, 241, 0.25)' 
                        : isPremium 
                          ? '0 20px 40px -15px rgba(236, 72, 153, 0.15)' 
                          : 'none',
                      p: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      width: '100%',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {/* Popular Badge */}
                      {isPopular && (
                        <Box sx={{
                          position: 'absolute',
                          top: 20,
                          right: 20,
                          bgcolor: '#6366f1',
                          color: 'white',
                          px: 2,
                          py: 0.5,
                          borderRadius: 3,
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: 1
                        }}>
                          Most Popular
                        </Box>
                      )}

                      <Box>
                        {/* Plan Name */}
                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: isPopular ? '#818cf8' : isPremium ? '#f472b6' : 'white' }}>
                          {plan.name}
                        </Typography>
                        
                        {/* Plan Description */}
                        <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                          {plan.description}
                        </Typography>

                        {/* Price */}
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 4 }}>
                          <Typography variant="h3" sx={{ fontWeight: 950, color: 'white', letterSpacing: '-1.5px' }}>
                            {formattedPrice}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                            {billingText}
                          </Typography>
                        </Box>

                        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', mb: 4 }} />

                        {/* Features List */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                          {features.map((feature, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justify: 'center', 
                                width: 20, 
                                height: 20, 
                                borderRadius: '50%', 
                                bgcolor: isPopular ? 'rgba(99, 102, 241, 0.15)' : isPremium ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255, 255, 255, 0.05)'
                              }}>
                                <CheckCircle2 size={14} color={isPopular ? '#818cf8' : isPremium ? '#f472b6' : '#cbd5e1'} />
                              </Box>
                              <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 500 }}>
                                {feature}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>

                      {/* Action Button */}
                      <Button
                        variant={isPopular ? 'contained' : 'outlined'}
                        fullWidth
                        size="large"
                        onClick={() => navigate('/login')}
                        sx={{
                          borderRadius: '12px',
                          py: 1.6,
                          fontWeight: 800,
                          textTransform: 'none',
                          background: isPopular 
                            ? 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)' 
                            : 'transparent',
                          borderColor: isPopular 
                            ? 'transparent' 
                            : isPremium 
                              ? 'rgba(236, 72, 153, 0.3)' 
                              : 'rgba(255, 255, 255, 0.15)',
                          color: isPopular 
                            ? 'white' 
                            : isPremium 
                              ? '#f472b6' 
                              : '#cbd5e1',
                          '&:hover': {
                            background: isPopular 
                              ? 'linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)' 
                              : 'transparent',
                            borderColor: isPopular 
                              ? 'transparent' 
                              : isPremium 
                                ? '#f472b6' 
                                : 'white',
                            bgcolor: isPopular 
                              ? 'transparent' 
                              : 'rgba(255, 255, 255, 0.02)'
                          }
                        }}
                      >
                        {priceNum === 0 ? 'Start Free' : 'Choose Plan'}
                      </Button>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>

      {/* FAQ / Guidelines Accordion */}
      <Container maxWidth="md" sx={{ mb: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-1px' }}>
            Onboarding Q&A & Guidelines
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Accordion sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px !important', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ChevronDown color="#94a3b8" />}>
              <Typography sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}><Info size={18} color="#818cf8" /> What credentials do students need to vote?</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', pt: 2 }}>
              <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
                Students do not need complex passwords. The Booth Officer checks the student's Admission Number, verifies their details, marks them as checked in, and generates a one-time secure physical token. The student scans or inputs this token at the EVM terminal to authorize their ballot paper.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px !important', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ChevronDown color="#94a3b8" />}>
              <Typography sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}><Info size={18} color="#38bdf8" /> Can we run multiple voting terminals at once?</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', pt: 2 }}>
              <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
                Yes! The system is designed for multi-booth scalability. You can register multiple voting machines (EVM laptops/tablets) under the **Infrastructure** panel, pair them with the central school admin, and run parallel voting booths simultaneously.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px !important', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ChevronDown color="#94a3b8" />}>
              <Typography sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}><Info size={18} color="#34d399" /> How are candidate symbols managed?</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', pt: 2 }}>
              <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
                When adding or editing candidates under **Candidates**, you can upload an official photo and select/upload an election symbol (like a cup, car, shield, or flag). These symbols are rendered clearly on the EVM ballot interface during voting to help younger students identify their preferred candidate.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Container>

      {/* Footer */}
      <Container maxWidth="lg" sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', pt: 6, mt: 4 }}>
        <Box sx={{ display: 'flex', justify: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            &copy; {new Date().getFullYear()} School Parliament E-Vote Management System. All Rights Reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <CheckCircle2 size={16} color="#34d399" />
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              Officially Secure & Audited
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
