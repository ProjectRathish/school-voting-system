import React from 'react';
import { Box, Typography, Button, Paper, alpha } from '@mui/material';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 4
        }}>
          <Paper sx={{
            p: 6, borderRadius: 4, textAlign: 'center',
            maxWidth: 500, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
          }}>
            <Box sx={{
              width: 80, height: 80, borderRadius: '50%',
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 3
            }}>
              <AlertTriangle size={40} color="#ef5350" />
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
              Something went wrong
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              An unexpected error occurred. Please try refreshing the page.
            </Typography>

            {this.state.error && (
              <Box sx={{
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.05),
                borderRadius: 2, p: 2, mb: 4, textAlign: 'left'
              }}>
                <Typography variant="caption" sx={{
                  fontFamily: 'monospace', color: 'error.main',
                  display: 'block', wordBreak: 'break-word'
                }}>
                  {this.state.error.message}
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              size="large"
              startIcon={<RefreshCw size={18} />}
              onClick={this.handleReset}
              sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 700 }}
            >
              Reload Application
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
