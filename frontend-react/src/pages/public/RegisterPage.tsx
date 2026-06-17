import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Container, Typography, Button, TextField, Paper,
  Stepper, Step, StepLabel, Grid, Card, CardContent,
  Chip, CircularProgress, Alert, Divider, Avatar, InputAdornment
} from '@mui/material';
import {
  School, User, Mail, Phone, MapPin, CreditCard,
  CheckCircle2, ArrowRight, ArrowLeft, Package, Zap,
  Shield, Star, Trophy, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';

/* ─── Types ─────────────────────────────────────────────── */
interface Plan {
  id: number;
  name: string;
  price: number;
  max_voters: number;
  max_elections: number;
  duration_months: number;
  description: string;
}

interface SchoolDetails {
  school_name: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  location: string;
}

/* ─── Helpers ─────────────────────────────────────────────── */
const getPlanIcon = (name: string) => {
  if (name?.toLowerCase().includes('premium')) return <Trophy size={24} />;
  if (name?.toLowerCase().includes('standard')) return <Star size={24} />;
  return <Zap size={24} />;
};

const getPlanGradient = (name: string) => {
  if (name?.toLowerCase().includes('premium'))
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  if (name?.toLowerCase().includes('standard'))
    return 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
  return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
};

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise(resolve => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const STEPS = ['School Details', 'Choose Plan', 'Payment'];

/* ─── Main Component ─────────────────────────────────────── */
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ school_code: string; plan_name: string } | null>(null);

  const [details, setDetails] = useState<SchoolDetails>({
    school_name: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    location: ''
  });

  // Load plans
  useEffect(() => {
    axiosInstance.get('/plans/public')
      .then(res => {
        setPlans(res.data);
        const preSelected = res.data.find((p: Plan) => p.id === Number(searchParams.get('plan')));
        if (preSelected) setSelectedPlan(preSelected);
      })
      .catch(() => setError('Could not load plans. Please refresh.'))
      .finally(() => setPlansLoading(false));
  }, [searchParams]);

  /* ─── Step 1 validation ─── */
  const isStep1Valid = () =>
    details.school_name.trim() &&
    details.contact_person.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.contact_email) &&
    details.contact_phone.trim().length >= 10;

  /* ─── Payment handler ─── */
  const handlePayment = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    setError('');

    try {
      const { data } = await axiosInstance.post('/register/order', {
        plan_id: selectedPlan.id,
        ...details
      });

      // Free plan — immediately activated
      if (data.free) {
        setSuccess({ school_code: data.school_code, plan_name: data.plan_name });
        return;
      }

      // Paid plan — open Razorpay checkout
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError('Payment gateway failed to load. Please check your connection and try again.');
        return;
      }

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'E-Vote School Parliament System',
        description: `${data.plan_name} Plan Subscription`,
        order_id: data.order_id,
        prefill: {
          name: details.contact_person,
          email: details.contact_email,
          contact: details.contact_phone
        },
        theme: { color: '#6366f1' },
        handler: async (response: any) => {
          try {
            const verifyRes = await axiosInstance.post('/register/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan_id: selectedPlan.id,
              ...details
            });
            setSuccess({ school_code: verifyRes.data.school_code, plan_name: verifyRes.data.plan_name });
          } catch {
            setError('Payment verified but account setup failed. Please contact support.');
          }
        },
        modal: { ondismiss: () => setLoading(false) }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ─── Success Screen ─── */
  if (success) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.6 }}>
          <Paper sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, textAlign: 'center', maxWidth: 500, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 0.6, delay: 0.2 }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: '#22c55e', mx: 'auto', mb: 3 }}>
                <CheckCircle2 size={40} />
              </Avatar>
            </motion.div>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff', mb: 1 }}>
              🎉 You're All Set!
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
              Your school account has been created. Login credentials have been sent to <strong style={{ color: '#a5b4fc' }}>{details.contact_email}</strong>
            </Typography>
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', mb: 3 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 1 }}>YOUR SCHOOL CODE</Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#a5b4fc', letterSpacing: 4 }}>
                {success.school_code}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Use this code to login at the portal</Typography>
            </Paper>
            <Chip label={success.plan_name + ' Plan'} sx={{ bgcolor: 'rgba(99,102,241,0.3)', color: '#a5b4fc', fontWeight: 700, mb: 3 }} />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="contained" onClick={() => navigate('/login')} sx={{ borderRadius: 3, fontWeight: 700, px: 4, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                Go to Login
              </Button>
              <Button variant="outlined" onClick={() => navigate('/')} sx={{ borderRadius: 3, fontWeight: 700, color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)' }}>
                Back to Home
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', py: { xs: 4, md: 6 } }}>
      {/* Header */}
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <Shield size={24} color="white" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff' }}>E-Vote</Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#fff', mb: 1 }}>
              Register Your School
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Set up your school parliament election system in minutes
            </Typography>
          </motion.div>
        </Box>

        {/* Stepper */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 4, background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.map(label => (
              <Step key={label}>
                <StepLabel sx={{
                  '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.5)', fontWeight: 600 },
                  '& .MuiStepLabel-label.Mui-active': { color: '#a5b4fc' },
                  '& .MuiStepLabel-label.Mui-completed': { color: '#22c55e' },
                  '& .MuiStepIcon-root': { color: 'rgba(255,255,255,0.15)' },
                  '& .MuiStepIcon-root.Mui-active': { color: '#6366f1' },
                  '& .MuiStepIcon-root.Mui-completed': { color: '#22c55e' }
                }}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeStep} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>

            {/* ─── STEP 1: School Details ─── */}
            {activeStep === 0 && (
              <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', mb: 3 }}>School Information</Typography>
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <TextField
                      label="School Name" fullWidth required
                      value={details.school_name}
                      onChange={e => setDetails({ ...details, school_name: e.target.value })}
                      InputProps={{ startAdornment: <InputAdornment position="start"><School size={18} color="#6366f1" /></InputAdornment> }}
                      sx={textFieldSx}
                      placeholder="e.g. St. Mary's Public School"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Contact Person" fullWidth required
                      value={details.contact_person}
                      onChange={e => setDetails({ ...details, contact_person: e.target.value })}
                      InputProps={{ startAdornment: <InputAdornment position="start"><User size={18} color="#6366f1" /></InputAdornment> }}
                      sx={textFieldSx}
                      placeholder="Principal / Admin name"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone Number" fullWidth required
                      value={details.contact_phone}
                      onChange={e => setDetails({ ...details, contact_phone: e.target.value })}
                      InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={18} color="#6366f1" /></InputAdornment> }}
                      sx={textFieldSx}
                      placeholder="+91 98765 43210"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Email Address" fullWidth required type="email"
                      value={details.contact_email}
                      onChange={e => setDetails({ ...details, contact_email: e.target.value })}
                      InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={18} color="#6366f1" /></InputAdornment> }}
                      sx={textFieldSx}
                      helperText="Your login credentials will be sent here"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Location / City" fullWidth
                      value={details.location}
                      onChange={e => setDetails({ ...details, location: e.target.value })}
                      InputProps={{ startAdornment: <InputAdornment position="start"><MapPin size={18} color="#6366f1" /></InputAdornment> }}
                      sx={textFieldSx}
                      placeholder="e.g. Chennai, Tamil Nadu"
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button onClick={() => navigate('/')} sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>← Back to Home</Button>
                  <Button
                    variant="contained" endIcon={<ArrowRight size={18} />}
                    disabled={!isStep1Valid()}
                    onClick={() => setActiveStep(1)}
                    sx={{ borderRadius: 3, fontWeight: 700, px: 4, py: 1.5, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', '&:disabled': { opacity: 0.4 } }}
                  >
                    Choose Plan
                  </Button>
                </Box>
              </Paper>
            )}

            {/* ─── STEP 2: Plan Selection ─── */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', mb: 1 }}>Choose Your Plan</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 3 }}>Select the package that fits your school's needs</Typography>

                {plansLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#6366f1' }} /></Box>
                ) : (
                  <Grid container spacing={2.5}>
                    {plans.map(plan => {
                      const isSelected = selectedPlan?.id === plan.id;
                      const isFree = parseFloat(String(plan.price)) === 0;
                      return (
                        <Grid item xs={12} sm={6} md={4} key={plan.id}>
                          <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                            <Card
                              onClick={() => setSelectedPlan(plan)}
                              sx={{
                                cursor: 'pointer', borderRadius: 3, height: '100%',
                                background: isSelected
                                  ? 'rgba(99,102,241,0.15)'
                                  : 'rgba(255,255,255,0.04)',
                                border: isSelected
                                  ? '2px solid #6366f1'
                                  : '1px solid rgba(255,255,255,0.08)',
                                transition: 'all 0.2s',
                                '&:hover': { borderColor: 'rgba(99,102,241,0.5)', background: 'rgba(99,102,241,0.08)' }
                              }}
                            >
                              <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                  <Box sx={{ p: 1.5, borderRadius: 2, background: getPlanGradient(plan.name), color: 'white' }}>
                                    {getPlanIcon(plan.name)}
                                  </Box>
                                  {isSelected && <Chip label="Selected" size="small" sx={{ bgcolor: '#6366f1', color: '#fff', fontWeight: 700 }} />}
                                  {isFree && !isSelected && <Chip label="Free" size="small" sx={{ bgcolor: 'rgba(34,197,94,0.2)', color: '#22c55e', fontWeight: 700 }} />}
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', mb: 0.5 }}>{plan.name}</Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 2, minHeight: 40 }}>{plan.description}</Typography>

                                <Typography variant="h4" sx={{ fontWeight: 900, color: isFree ? '#22c55e' : '#a5b4fc', mb: 2 }}>
                                  {isFree ? 'Free' : `₹${Number(plan.price).toLocaleString('en-IN')}`}
                                  {!isFree && <Typography component="span" variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', ml: 1 }}>/ plan</Typography>}
                                </Typography>

                                <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Package size={14} color="#6366f1" />
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                      Up to <strong style={{ color: '#fff' }}>{plan.max_voters.toLocaleString()}</strong> voters
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Zap size={14} color="#6366f1" />
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                      <strong style={{ color: '#fff' }}>{plan.max_elections}</strong> election{plan.max_elections !== 1 ? 's' : ''}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Clock size={14} color="#6366f1" />
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                      <strong style={{ color: '#fff' }}>
                                        {plan.duration_months >= 12
                                          ? `${Math.round(plan.duration_months / 12)} year${Math.round(plan.duration_months / 12) > 1 ? 's' : ''}`
                                          : `${plan.duration_months} months`}
                                      </strong> validity
                                    </Typography>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                  <Button startIcon={<ArrowLeft size={18} />} onClick={() => setActiveStep(0)} sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Back</Button>
                  <Button
                    variant="contained" endIcon={<ArrowRight size={18} />}
                    disabled={!selectedPlan}
                    onClick={() => setActiveStep(2)}
                    sx={{ borderRadius: 3, fontWeight: 700, px: 4, py: 1.5, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', '&:disabled': { opacity: 0.4 } }}
                  >
                    Review & Pay
                  </Button>
                </Box>
              </Box>
            )}

            {/* ─── STEP 3: Payment ─── */}
            {activeStep === 2 && selectedPlan && (
              <Grid container spacing={3}>
                {/* Summary */}
                <Grid item xs={12} md={5}>
                  <Paper sx={{ p: 3, borderRadius: 3, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', height: '100%' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', mb: 2.5 }}>Order Summary</Typography>

                    <Box sx={{ p: 2, borderRadius: 2, background: `linear-gradient(135deg, ${getPlanGradient(selectedPlan.name).split(' ')[3]}, ${getPlanGradient(selectedPlan.name).split(' ')[5]})`, mb: 2.5, position: 'relative', overflow: 'hidden' }}>
                      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: getPlanGradient(selectedPlan.name), opacity: 0.9 }} />
                      <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 }}>Plan</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff' }}>{selectedPlan.name}</Typography>
                      </Box>
                    </Box>

                    {[
                      { label: 'School', value: details.school_name },
                      { label: 'Contact', value: details.contact_person },
                      { label: 'Email', value: details.contact_email },
                      { label: 'Voters', value: `Up to ${selectedPlan.max_voters.toLocaleString()}` },
                      { label: 'Elections', value: selectedPlan.max_elections.toString() },
                      { label: 'Duration', value: selectedPlan.duration_months >= 12 ? `${Math.round(selectedPlan.duration_months / 12)} year(s)` : `${selectedPlan.duration_months} months` }
                    ].map(({ label, value }) => (
                      <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>{label}</Typography>
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, maxWidth: '55%', textAlign: 'right' }}>{value}</Typography>
                      </Box>
                    ))}

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ color: '#fff', fontWeight: 700 }}>Total</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: parseFloat(String(selectedPlan.price)) === 0 ? '#22c55e' : '#a5b4fc' }}>
                        {parseFloat(String(selectedPlan.price)) === 0 ? 'FREE' : `₹${Number(selectedPlan.price).toLocaleString('en-IN')}`}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                {/* Payment Action */}
                <Grid item xs={12} md={7}>
                  <Paper sx={{ p: 3, borderRadius: 3, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', mb: 1 }}>
                      {parseFloat(String(selectedPlan.price)) === 0 ? 'Activate Free Account' : 'Secure Payment'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 3 }}>
                      {parseFloat(String(selectedPlan.price)) === 0
                        ? 'Your free account will be activated instantly.'
                        : 'Powered by Razorpay. Your payment is 100% secure.'}
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

                    {parseFloat(String(selectedPlan.price)) !== 0 && (
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Shield size={16} color="#6366f1" />
                          <Typography variant="caption" sx={{ color: '#a5b4fc', fontWeight: 600 }}>SECURE CHECKOUT</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          256-bit SSL encrypted • Razorpay PCI-DSS compliant • UPI, Cards, Net Banking accepted
                        </Typography>
                      </Box>
                    )}

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading}
                      onClick={handlePayment}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : parseFloat(String(selectedPlan.price)) === 0 ? <CheckCircle2 size={20} /> : <CreditCard size={20} />}
                      sx={{
                        borderRadius: 3, fontWeight: 700, py: 2, fontSize: '1rem',
                        background: parseFloat(String(selectedPlan.price)) === 0
                          ? 'linear-gradient(135deg, #16a34a, #22c55e)'
                          : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                        '&:hover': { boxShadow: '0 12px 40px rgba(99,102,241,0.5)' }
                      }}
                    >
                      {loading ? 'Processing...' : parseFloat(String(selectedPlan.price)) === 0
                        ? 'Activate Free Account'
                        : `Pay ₹${Number(selectedPlan.price).toLocaleString('en-IN')} →`}
                    </Button>

                    <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: 'rgba(255,255,255,0.3)' }}>
                      By proceeding, you agree to our Terms of Service. Login credentials will be emailed to {details.contact_email}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <Button startIcon={<ArrowLeft size={18} />} onClick={() => setActiveStep(1)} sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Back to Plan Selection</Button>
                  </Box>
                </Grid>
              </Grid>
            )}
          </motion.div>
        </AnimatePresence>
      </Container>
    </Box>
  );
};

/* ─── Shared TextField styling ─────────────────────────────── */
const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    color: '#fff',
    bgcolor: 'rgba(255,255,255,0.04)',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
    '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.5)' },
    '&.Mui-focused fieldset': { borderColor: '#6366f1' }
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#a5b4fc' },
  '& .MuiFormHelperText-root': { color: 'rgba(255,255,255,0.4)' },
  '& .MuiInputAdornment-root': { color: 'rgba(255,255,255,0.4)' }
};

export default RegisterPage;
