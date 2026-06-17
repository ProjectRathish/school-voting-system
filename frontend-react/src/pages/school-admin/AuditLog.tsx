import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Chip, TextField, MenuItem,
  Select, FormControl, InputLabel, Stack, CircularProgress, Alert,
  alpha, useTheme, Tooltip, IconButton
} from '@mui/material';
import { ClipboardList, RefreshCw, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';
import { format } from 'date-fns';

const ACTION_COLORS: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info'> = {
  CREATE_ELECTION: 'primary',
  DELETE_ELECTION: 'error',
  ELECTION_STATUS_ACTIVE: 'success',
  ELECTION_STATUS_CLOSED: 'warning',
  ELECTION_STATUS_PAUSED: 'warning',
  APPROVE_CANDIDATE: 'success',
  REJECT_CANDIDATE: 'error',
  ADD_VOTER: 'info',
  BULK_IMPORT_VOTERS: 'info',
};

const ACTION_LABELS: Record<string, string> = {
  CREATE_ELECTION: 'Created Election',
  DELETE_ELECTION: 'Deleted Election',
  ELECTION_STATUS_ACTIVE: 'Started Election',
  ELECTION_STATUS_CLOSED: 'Closed Election',
  ELECTION_STATUS_PAUSED: 'Paused Election',
  ELECTION_STATUS_DRAFT: 'Set to Draft',
  ELECTION_STATUS_CONFIGURING: 'Configuring Election',
  ELECTION_STATUS_READY: 'Election Ready',
  APPROVE_CANDIDATE: 'Approved Candidate',
  REJECT_CANDIDATE: 'Rejected Candidate',
  UPDATE_CANDIDATE_STATUS: 'Updated Candidate',
  ADD_VOTER: 'Added Voter',
  BULK_IMPORT_VOTERS: 'Bulk Imported Voters',
};

const AuditLog = () => {
  const theme = useTheme();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: page + 1, limit: rowsPerPage };
      if (actionFilter) params.action = actionFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await axiosInstance.get('/audit', { params });
      setLogs(res.data.logs);
      setTotal(res.data.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchActionTypes = async () => {
    try {
      const res = await axiosInstance.get('/audit/actions');
      setActionTypes(res.data);
    } catch (_) {}
  };

  useEffect(() => { fetchActionTypes(); }, []);
  useEffect(() => { fetchLogs(); }, [page, rowsPerPage, actionFilter, startDate, endDate]);

  return (
    <Box>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Box sx={{
            p: 1.5, borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: 'white', display: 'flex'
          }}>
            <ClipboardList size={24} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.5px' }}>
              Audit Log
            </Typography>
            <Typography color="text.secondary">
              Complete trail of all administrative actions
            </Typography>
          </Box>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchLogs} sx={{ ml: 'auto' }} disabled={loading}>
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </IconButton>
          </Tooltip>
        </Box>
      </motion.div>

      {/* Filters */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
            <Filter size={16} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Filters</Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Action Type</InputLabel>
            <Select
              value={actionFilter}
              label="Action Type"
              onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
            >
              <MenuItem value="">All Actions</MenuItem>
              {actionTypes.map(a => (
                <MenuItem key={a} value={a}>{ACTION_LABELS[a] || a}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            type="date"
            label="From"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            type="date"
            label="To"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </Paper>

      {/* Table */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Entity</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Performed By</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={36} />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <ClipboardList size={40} opacity={0.3} />
                    <Typography color="text.secondary" sx={{ mt: 1 }}>No audit logs found</Typography>
                  </TableCell>
                </TableRow>
              ) : logs.map((log) => (
                <TableRow
                  key={log.id}
                  hover
                  sx={{ '&:last-child td': { border: 0 } }}
                >
                  <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary', fontSize: '0.8rem' }}>
                    {format(new Date(log.created_at), 'dd MMM yyyy, hh:mm a')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ACTION_LABELS[log.action] || log.action}
                      color={ACTION_COLORS[log.action] || 'default'}
                      size="small"
                      sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell>
                    {log.entity_name && (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{log.entity_name}</Typography>
                        {log.entity_type && (
                          <Typography variant="caption" color="text.secondary">{log.entity_type}</Typography>
                        )}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{log.user_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{log.role?.replace('_', ' ')}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {log.details && (
                      <Typography variant="caption" color="text.secondary" sx={{
                        fontFamily: 'monospace',
                        bgcolor: alpha(theme.palette.text.primary, 0.05),
                        px: 1, py: 0.5, borderRadius: 1, display: 'inline-block',
                        maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Paper>
    </Box>
  );
};

export default AuditLog;
