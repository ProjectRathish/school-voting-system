import { useState } from 'react';
import {
  Box, Typography, Paper, Grid, Button, Chip, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download, Trophy, Users, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';

const COLORS = ['#3f51b5', '#f50057', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4'];

const Results = () => {
  const [selectedElection, setSelectedElection] = useState('');

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
  const isClosedElection = selectedElectionData?.status === 'CLOSED';

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
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Results & Analytics</Typography>
        {isClosedElection && (
          <Button variant="outlined" startIcon={<Download size={20} />} onClick={handleExport}>
            Export Excel
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select Election</InputLabel>
          <Select value={selectedElection} label="Select Election" onChange={e => setSelectedElection(e.target.value)}>
            {elections?.map((el: any) => (
              <MenuItem key={el.id} value={el.id}>
                {el.name} — <Chip label={el.status} size="small" sx={{ ml: 1 }} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {selectedElection && !isClosedElection && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Results are only available once the election is <b>CLOSED</b>. Current status: <b>{selectedElectionData?.status}</b>
        </Alert>
      )}

      {selectedElection && isClosedElection && (
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
                <Paper key={post.post_id} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    🏆 {post.post_name}
                  </Typography>

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
                                  <TableCell sx={{ fontWeight: idx === 0 ? 700 : 400 }}>
                                    {c.candidate_name}
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: 700 }}>{c.vote_count}</TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <LinearProgress variant="determinate" value={pct}
                                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }} />
                                      <Typography variant="caption">{pct.toFixed(0)}%</Typography>
                                    </Box>
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
                </Paper>
              ))}

              {/* Demographics charts */}
              {detailedResults?.demographics && (
                <Paper sx={{ p: 3 }}>
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
    </Box>
  );
};

export default Results;
