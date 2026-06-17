import { Box, Typography, Button, useTheme, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileQuestion, Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
      p: 4
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{ textAlign: 'center' }}
      >
        {/* Big 404 */}
        <Typography
          sx={{
            fontSize: { xs: '8rem', md: '12rem' },
            fontWeight: 900,
            lineHeight: 1,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            userSelect: 'none'
          }}
        >
          404
        </Typography>

        <Box sx={{
          width: 80, height: 80, borderRadius: '50%',
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: 3
        }}>
          <FileQuestion size={40} color={theme.palette.primary.main} />
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Page Not Found
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<Home />}
          onClick={() => navigate('/')}
          sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 700 }}
        >
          Go Home
        </Button>
      </motion.div>
    </Box>
  );
};

export default NotFound;
