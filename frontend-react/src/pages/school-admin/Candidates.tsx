import { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, CircularProgress, IconButton,
  FormControl, InputLabel, Select, MenuItem, Avatar, Chip, Autocomplete, TextField, Tooltip, Grid, Snackbar, alpha
} from '@mui/material';
import { Plus, Trash2, User, Sparkles, Edit, Camera, Image, Download, Upload, Search, X } from 'lucide-react';
import { useElectionStore } from '../../store/electionStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import getCroppedImg from '../../utils/cropImage';
import Cropper from 'react-easy-crop';
import { Slider } from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { ELECTION_SYMBOLS } from '../../constants/symbols';
import * as LucideIcons from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import Webcam from 'react-webcam';

const filter = createFilterOptions({
  limit: 50, // Only show first 50 matches to keep typing smooth
});

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const getPostColor = (postName: string) => {
  const colors = [
    { bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe' }, // Indigo
    { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' }, // Purple
    { bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8' }, // Pink
    { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' }, // Rose
    { bg: '#fff7ed', text: '#c2410c', border: '#ffedd5' }, // Orange
    { bg: '#fefce8', text: '#a16207', border: '#fef08a' }, // Yellow
    { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' }, // Green
    { bg: '#ecfeff', text: '#0e7490', border: '#cffafe' }, // Cyan
    { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' }, // Blue
    { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' }, // Violet
  ];
  
  if (!postName) return colors[0];
  
  let hash = 0;
  for (let i = 0; i < postName.length; i++) {
    hash = postName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

const Candidates = () => {
  const { selectedElectionId, selectedElectionName, selectedElectionStatus } = useElectionStore();
  const [selectedPost, setSelectedPost] = useState('');
  const [open, setOpen] = useState(false);
  const [candidateForm, setCandidateForm] = useState({ voter_id: '', post_id: '', symbol_name: '' });
  const [editingCandidate, setEditingCandidate] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [symbol, setSymbol] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [symbolPreview, setSymbolPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const symbolInputRef = useRef<HTMLInputElement>(null);

  // Cropping state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [croppingFor, setCroppingFor] = useState<'photo' | 'symbol' | null>(null);

  // Symbol Library & Printing
  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);
  const [searchSymbol, setSearchSymbol] = useState('');
  const [selectedSymbolsForPrint, setSelectedSymbolsForPrint] = useState<string[]>([]);
  const [filterGender, setFilterGender] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const [cameraOpen, setCameraOpen] = useState(false);


  const { data: elections } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => (await axiosInstance.get('/elections/get-elections')).data
  });

  const { data: posts } = useQuery({
    queryKey: ['posts', selectedElectionId],
    enabled: !!selectedElectionId,
    queryFn: async () => (await axiosInstance.get(`/posts/get-posts?election_id=${selectedElectionId}`)).data
  });

  const { data: votersResp } = useQuery({
    queryKey: ['voters', selectedElectionId],
    enabled: !!selectedElectionId,
    queryFn: async () => (await axiosInstance.get(`/voters/get-voters?election_id=${selectedElectionId}&limit=10000`)).data
  });
  const voters = votersResp?.data || [];

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['candidates', selectedElectionId, selectedPost],
    enabled: !!selectedElectionId,
    queryFn: async () => {
      const params = new URLSearchParams({ election_id: selectedElectionId });
      if (selectedPost) params.append('post_id', selectedPost);
      return (await axiosInstance.get(`/candidates/get-candidates?${params}`)).data;
    }
  });

  const isConfiguring = selectedElectionStatus === 'CONFIGURING' || selectedElectionStatus === 'DRAFT';

  const addCandidateMutation = useMutation({
    mutationFn: (data: any) => {
      const formData = new FormData();
      formData.append('election_id', selectedElectionId || '');
      formData.append('voter_id', data.voter_id);
      formData.append('post_id', data.post_id);
      
      // Get admission_no for multer
      const voter = voters?.find((v: any) => v.id === data.voter_id);
      if (voter) {
        formData.append('admission_no', voter.admission_no);
      }
      formData.append('symbol_name', data.symbol_name || '');

      if (photo) formData.append('photo', photo, 'candidate_photo.jpg');
      if (symbol) formData.append('symbol', symbol, 'candidate_symbol.png');
      
      return axiosInstance.post('/candidates/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      setSuccess('Candidate registered!');
      setOpen(false);
      setCandidateForm({ voter_id: '', post_id: '', symbol_name: '' });
      setPhoto(null);
      setSymbol(null);
      setPhotoPreview(null);
      setSymbolPreview(null);
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['voters'] });
      queryClient.invalidateQueries({ queryKey: ['school-admin-stats'] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error registering candidate')
  });

  const deleteCandidateMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/candidates/${id}`),
    onSuccess: () => {
      setSuccess('Candidate removed!');
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['voters'] });
      queryClient.invalidateQueries({ queryKey: ['school-admin-stats'] });
    }
  });

  const updateCandidateMutation = useMutation({
    mutationFn: (data: any) => {
      const formData = new FormData();
      formData.append('election_id', selectedElectionId || '');
      if (data.post_id) formData.append('post_id', data.post_id);
      
      // MULTER NEEDS ADMISSION NO
      if (editingCandidate?.admission_no) {
        formData.append('admission_no', editingCandidate.admission_no);
      }

      if (photo) formData.append('photo', photo, 'candidate_photo.jpg');
      if (symbol) formData.append('symbol', symbol, 'candidate_symbol.png');
      formData.append('symbol_name', data.symbol_name || '');
      
      return axiosInstance.put(`/candidates/${editingCandidate.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      setSuccess('Candidate updated!');
      setEditOpen(false);
      setEditingCandidate(null);
      setPhoto(null);
      setSymbol(null);
      setPhotoPreview(null);
      setSymbolPreview(null);
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Error updating candidate')
  });

  const [admissionNo, setAdmissionNo] = useState('');
  const [foundVoter, setFoundVoter] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  // Validation effect for Found Voter eligibility
  useEffect(() => {
    if (foundVoter && candidateForm.post_id) {
      const post = posts?.find((p: any) => p.id === candidateForm.post_id);

      if (post) {
        // Check gender
        if (post.gender_rule !== 'ANY' && foundVoter.sex !== post.gender_rule) {
          setEligibilityError(`This post is reserved for ${post.gender_rule === 'M' ? 'Male' : 'Female'} candidates only.`);
        } 
        // Check block status
        else if (foundVoter.is_blocked) {
          setEligibilityError(`This student is currently blocked and cannot be registered as a candidate.`);
        }
        // Check class
        else {
          const voterClassId = Number(foundVoter.class_id);
          const eligibleClasses = Array.isArray(post.candidate_classes) 
            ? post.candidate_classes.map(Number) 
            : [];

          if (!eligibleClasses.includes(voterClassId)) {
            setEligibilityError(`Students from class ${foundVoter.class_name || voterClassId} are not eligible for this post.`);
          } else {
            setEligibilityError(null);
          }
        }
      }
    } else {
      setEligibilityError(null);
    }
  }, [foundVoter, candidateForm.post_id, posts]);

  const handleVoterVerification = async () => {
    if (!admissionNo || admissionNo.trim() === '') return;
    
    setVerifying(true);
    setEligibilityError(null);
    setFoundVoter(null);
    setCandidateForm(p => ({ ...p, voter_id: '' }));

    try {
      const res = await axiosInstance.get(`/voters/verify/${admissionNo}?election_id=${selectedElectionId}`);
      if (res.data.voter) {
        const v = res.data.voter;
        // The verify endpoint returns formatted voter data
        // Match it to what our eligibility check expects (sex, class_id etc)
        // Note: some fields might have different names in verify response
        setFoundVoter({
          ...v,
          // DB returns sex in verify endpoint? Let's assume it matches voters record.
          class_id: v.class_id || v.class_name, // fallback
        });
        setCandidateForm(p => ({ ...p, voter_id: v.id }));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Voter not found');
    } finally {
      setVerifying(false);
    }
  };

  // Photo handling with crop
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setCroppingFor('photo');
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setCroppingFor('symbol');
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImageToCrop(imageSrc);
      setCroppingFor('photo');
      setCropDialogOpen(true);
      setCameraOpen(false);
    }
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropConfirm = async () => {
    if (imageToCrop && croppedAreaPixels && croppingFor) {
      try {
        const outputType = croppingFor === 'photo' ? 'image/jpeg' : 'image/png';
        const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels, 0, outputType);
        
        const fileName = croppingFor === 'photo' ? 'photo.jpg' : 'symbol.png';
        const file = new File([croppedImage], fileName, { type: outputType });
        
        if (croppingFor === 'photo') {
          setPhoto(file);
          setPhotoPreview(URL.createObjectURL(file));
        } else {
          setSymbol(file);
          setSymbolPreview(URL.createObjectURL(file));
        }
        setCropDialogOpen(false);
      } catch (e) {
        console.error(e);
        setError('Error processing image. Please try a different photo.');
      }
    }
  };

  const handlePrintSymbols = async () => {
    const symbolsToPrint = selectedSymbolsForPrint.length > 0 
      ? ELECTION_SYMBOLS.filter(s => selectedSymbolsForPrint.includes(s.id))
      : ELECTION_SYMBOLS;

    if (symbolsToPrint.length === 0) {
      setError("Please select at least one symbol to print.");
      return;
    }

    // Capture symbols for the print window (Material Symbols Rounded)
    const symbolIcons: Record<string, string> = {};
    for (const s of symbolsToPrint) {
      symbolIcons[s.id] = `<span class="material-symbols-rounded" style="font-size: 80px; font-variation-settings: 'FILL' 1, 'wght' 700; color: #000;">${s.iconName}</span>`;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const style = `
      @page { size: A4; margin: 0; }
      body { margin: 0; padding: 10mm; font-family: 'Inter', sans-serif; }
      .page { position: relative; width: 190mm; height: 277mm; page-break-after: always; display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 0; border: 1px dashed #ccc; }
      .cell { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px dashed #ccc; padding: 20px; text-align: center; }
      .icon-container { width: 100px; height: 100px; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; }
      .symbol-name { font-weight: 800; font-size: 1.2rem; text-transform: uppercase; color: #1e1e28; }
      .cut-line { position: absolute; }
      .scissors { position: absolute; font-size: 14px; opacity: 0.5; color: #666; }
      .top { top: -10px; left: 50%; }
      .left { left: -10px; top: 50%; }
      @media print {
        button { display: none; }
      }
    `;

    let html = `<html><head><title>Election Symbols</title>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
    <style>${style}</style></head><body>`;
    
    // Chunk symbols into groups of 9
    for (let i = 0; i < symbolsToPrint.length; i += 9) {
      const pageSymbols = symbolsToPrint.slice(i, i + 9);
      html += `<div class="page">`;
      pageSymbols.forEach((s) => {
        html += `
          <div class="cell">
            <div class="scissors top">✂️</div>
            <div class="scissors left">✂️</div>
            <div class="icon-container" style="font-size: 80px;">
               ${symbolIcons[s.id]}
            </div>
            <div class="symbol-name">${s.name}</div>
            <div style="font-size: 0.7rem; color: #888; margin-top: 5px;">Ref: #${s.id}</div>
          </div>`;
      });
      html += `</div>`;
    }
    
    html += `</body><script>window.onload = () => { window.print(); window.close(); };</script></html>`;
    
    printWindow.document.write(html);
    printWindow.document.close();
  };
  
  const handlePrintCandidateList = () => {
    if (!candidates || candidates.length === 0) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const style = `
      @page { size: A4; margin: 10mm; }
      body { font-family: 'Inter', sans-serif; color: #1e1e28; margin: 0; padding: 20px; }
      h1 { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 10px; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 2px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th { background-color: #f8fafc; text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; font-size: 10px; color: #64748b; }
      td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
      .photo-img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
      .symbol-img { width: 40px; height: 40px; object-fit: contain; }
      .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 9px; text-transform: uppercase; }
      .tag-male { background: #e0f2fe; color: #0369a1; }
      .tag-female { background: #fdf2f8; color: #be185d; }
      .post-tag { background: #e0e7ff; color: #4338ca; }
      .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #94a3b8; padding: 10px; }
    `;

    let html = `<html><head><title>Candidate List - ${selectedElectionName}</title><style>${style}</style></head><body>`;
    html += `<h1>${selectedElectionName} - Candidate List</h1>`;
    html += `<table><thead><tr><th>Candidate</th><th>Adm No</th><th>Class</th><th>Post</th><th>Symbol</th><th>Symbol Name</th></tr></thead><tbody>`;

    candidates.forEach((c: any) => {
      html += `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${BASE_URL}${c.photo}" class="photo-img" />
              <div style="font-weight: 700;">${c.candidate_name}</div>
            </div>
          </td>
          <td style="font-family: monospace;">${c.admission_no}</td>
          <td>${c.class_name} ${c.division ? `(${c.division})` : ''}</td>
          <td><span class="tag post-tag">${c.post_name}</span></td>
          <td><img src="${BASE_URL}${c.symbol}" class="symbol-img" /></td>
          <td style="font-weight: 700;">${c.symbol_name}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    html += `<div class="footer">Generated on ${new Date().toLocaleString()} | School Voting System</div>`;
    html += `</body><script>window.onload = () => { window.print(); window.close(); };</script></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleSelectFromLibrary = async (symbol: any) => {
    // 1. Create a canvas to draw the Lucide icon
    const canvas = document.createElement('canvas');
    canvas.width = 1024; // High res
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw the Material Symbol as solid black clipart
    try {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#000000'; // Pure black
      // Use Material Symbols font and force solid fill
      ctx.font = '700 700px "Material Symbols Rounded"'; 
      
      // Center the icon
      ctx.fillText(symbol.iconName, canvas.width / 2, canvas.height / 2 + 50);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `${symbol.name}.png`, { type: 'image/png' });
          setSymbol(file);
          setSymbolPreview(URL.createObjectURL(file));
          setCandidateForm(p => ({ ...p, symbol_name: symbol.name }));
          setLibraryDialogOpen(false);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Error drawing symbol emoji:', err);
      setError('Could not process symbol image. Try uploading an image instead.');
    }
  };

  const toggleSymbolSelection = (id: string) => {
    setSelectedSymbolsForPrint(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDownloadPoster = async (c: any) => {
    const canvas = document.createElement('canvas');
    const scale = 2; // High DPI
    canvas.width = 1000 * scale;
    canvas.height = 1414 * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.scale(scale, scale);

    // 1. Background
    const gradient = ctx.createLinearGradient(0, 0, 0, 1414);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(1, '#4338ca');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1000, 1414);

    // 2. White Card Area
    ctx.fillStyle = 'white';
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(50, 50, 900, 1314, 40);
      ctx.fill();
    } else {
      ctx.fillRect(50, 50, 900, 1314);
    }

    // 3. Header Text
    ctx.fillStyle = '#1e1e28';
    ctx.textAlign = 'center';
    ctx.font = '800 40px Inter, system-ui, sans-serif';
    ctx.fillText('VOTE FOR', 500, 150);
    
    ctx.font = '900 80px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#6366f1';
    ctx.fillText(c.post_name.toUpperCase(), 500, 240);

    const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });

    try {
      const photoImg = await loadImage(`${BASE_URL}${c.photo}?v=${Date.now()}`);
      const symbolImg = await loadImage(`${BASE_URL}${c.symbol}?v=${Date.now()}`);
      
      // Draw Photo (Circular)
      ctx.save();
      ctx.beginPath();
      ctx.arc(500, 550, 200, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(photoImg, 300, 350, 400, 400);
      ctx.restore();
      
      // Border for Photo
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(500, 550, 205, 0, Math.PI * 2);
      ctx.stroke();

      // 5. Candidate Name
      ctx.fillStyle = '#1e1e28';
      ctx.font = '900 70px Inter, system-ui, sans-serif';
      ctx.fillText(c.candidate_name, 500, 850);

      // 6. Symbol Area
      ctx.fillStyle = '#f8fafc';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(350, 950, 300, 300, 20);
        ctx.fill();
      } else {
        ctx.fillRect(350, 950, 300, 300);
      }
      
      ctx.drawImage(symbolImg, 400, 980, 200, 200);
      
      ctx.fillStyle = '#6366f1';
      ctx.font = '700 50px Inter, system-ui, sans-serif';
      ctx.fillText(c.symbol_name || 'My Symbol', 500, 1220);

      // 7. Footer
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 25px Inter, system-ui, sans-serif';
      ctx.fillText(`${selectedElectionName} | School General Election`, 500, 1350);

      const link = document.createElement('a');
      link.download = `Poster_${c.candidate_name.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
      setError("Could not generate poster. Make sure images are loaded.");
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 4, flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-1.5px', mb: 0.5 }}>Candidate Management</Typography>
          <Typography variant="body2" color="text.secondary">Register and manage candidates for {selectedElectionName || 'the current election'}.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', md: 'auto' }, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button 
            variant="outlined" 
            startIcon={<Search size={20} />} 
            onClick={() => setLibraryDialogOpen(true)}
            sx={{ borderRadius: 2, height: 44, px: 3, fontWeight: 700 }}
          >
            Symbol Library
          </Button>
          {isConfiguring && (
            <Button 
              variant="contained" 
              startIcon={<Plus size={20} />} 
              onClick={() => { 
                setError(null); 
                setEligibilityError(null);
                setAdmissionNo('');
                setFoundVoter(null);
                setPhoto(null);
                setSymbol(null);
                setPhotoPreview(null);
                setSymbolPreview(null);
                setOpen(true); 
              }} 
              disabled={!selectedElectionId}
              sx={{ borderRadius: 2, height: 44, px: 3, fontWeight: 700 }}
            >
              Register Candidate
            </Button>
          )}
        </Box>
      </Box>

      {/* Camera Dialog */}
      <Dialog open={cameraOpen} onClose={() => setCameraOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Take Candidate Photo</DialogTitle>
        <DialogContent>
          <Box sx={{ position: 'relative', width: '100%', borderRadius: 2, overflow: 'hidden', bgcolor: 'black' }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user", width: 1280, height: 720 }}
              style={{ width: '100%', display: 'block' }}
            />
          </Box>
          <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center', color: 'text.secondary' }}>
            Position the candidate within the frame and click capture.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCameraOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Camera size={20} />} onClick={handleCapture}>
            Capture Photo
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%', borderRadius: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error && !open && !editOpen}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
          {error}
        </Alert>
      </Snackbar>


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
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
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

      {!isConfiguring && selectedElectionId && (
        <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>
           <strong>Configuration Locked:</strong> Adding or removing candidates is completely disabled because this election is no longer in Configuration Mode.
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 1.5, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search Name / Adm No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{ input: { startAdornment: <Search size={18} style={{ marginRight: 8, opacity: 0.5 }} /> } }}
            />
          </Grid>
          {selectedElectionId && (
            <>
              <Grid size={{ xs: 12, sm: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Post</InputLabel>
                  <Select value={selectedPost} label="Post" onChange={e => setSelectedPost(e.target.value)}>
                    <MenuItem value="">All Posts</MenuItem>
                    {posts?.map((p: any) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, sm: 1.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Gender</InputLabel>
                  <Select value={filterGender} label="Gender" onChange={e => setFilterGender(e.target.value)}>
                    <MenuItem value="">All Genders</MenuItem>
                    <MenuItem value="M">Male</MenuItem>
                    <MenuItem value="F">Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, sm: 1.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Class</InputLabel>
                  <Select value={filterClass} label="Class" onChange={e => setFilterClass(e.target.value)}>
                    <MenuItem value="">All Classes</MenuItem>
                    {Array.from(new Set(candidates?.map((c: any) => c.class_name))).map((cl: any) => (
                      <MenuItem key={cl} value={cl}>{cl}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <Button 
                  fullWidth
                  variant="outlined" 
                  startIcon={<Download size={18} />}
                  onClick={handlePrintCandidateList}
                  sx={{ borderRadius: 1.5, height: 40 }}
                >
                  Print List
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {selectedElectionId && (
        <TableContainer component={Paper} sx={{ borderRadius: 1, overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.08) }}>
                <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Candidate</TableCell>
                <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Admission No</TableCell>
                <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Class</TableCell>
                 <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Post</TableCell>
                <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Gender</TableCell>
                <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Symbol</TableCell>
                <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Symbol Name</TableCell>
                <TableCell align="right" sx={{ color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} align="center"><CircularProgress size={24} /></TableCell></TableRow>
              ) : candidates?.filter((c: any) => {
                  const matchSearch = searchTerm === '' || 
                    c.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.admission_no.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchGender = filterGender === '' || c.sex === filterGender;
                  const matchClass = filterClass === '' || c.class_name === filterClass;
                  return matchSearch && matchGender && matchClass;
                }).length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ color: 'text.secondary', py: 8 }}>
                  No candidates found matching the filters.
                </TableCell></TableRow>
              ) : candidates?.filter((c: any) => {
                  const matchSearch = searchTerm === '' || 
                    c.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.admission_no.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchGender = filterGender === '' || c.sex === filterGender;
                  const matchClass = filterClass === '' || c.class_name === filterClass;
                  return matchSearch && matchGender && matchClass;
                }).map((c: any) => {
                  const postColor = getPostColor(c.post_name);
                  return (
                    <TableRow key={c.id} sx={{ 
                      backgroundColor: alpha(postColor.bg, 0.5),
                      '&:hover': { backgroundColor: alpha(postColor.bg, 0.8) },
                      transition: 'background-color 0.2s'
                    }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            src={c.photo ? `${BASE_URL}${c.photo}?v=${new Date().getTime()}` : undefined} 
                            sx={{ 
                              width: 48, 
                              height: 48, 
                              bgcolor: postColor.text,
                              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                            }}
                          >
                            {c.candidate_name?.charAt(0) || <User size={20} />}
                          </Avatar>
                          <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{c.candidate_name}</Typography>
                          {c.is_blocked === 1 && (
                            <Chip label="DISQUALIFIED" size="small" color="error" variant="filled" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 900, ml: 1 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{c.admission_no}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{c.class_name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{c.division ? `Div ${c.division}` : 'No Div'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={c.post_name} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'white', 
                            color: postColor.text, 
                            fontWeight: 900,
                            border: '2px solid',
                            borderColor: postColor.text,
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            fontSize: '0.7rem'
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={c.sex === 'M' ? '♂ Male' : '♀ Female'} size="small"
                          color={c.sex === 'M' ? 'info' : 'secondary'} sx={{ fontWeight: 700 }} />
                      </TableCell>
                   <TableCell>
                    {c.symbol ? (
                      <Box sx={{ 
                        width: 50, 
                        height: 50, 
                        p: 0.5, 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        borderRadius: 2, 
                        bgcolor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <img 
                          src={`${BASE_URL}${c.symbol}?v=${new Date().getTime()}`} 
                          alt={c.symbol_name} 
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                        />
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">No Symbol</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: postColor.text, fontSize: '0.95rem' }}>{c.symbol_name || 'N/A'}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    {isConfiguring && (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="Edit Candidate">
                          <IconButton onClick={() => {
                            setEditingCandidate(c);
                             setCandidateForm({ 
                              voter_id: c.voter_id, 
                              post_id: c.post_id,
                              symbol_name: c.symbol_name || ''
                            });
                            setPhoto(null);
                            setSymbol(null);
                            setPhotoPreview(c.photo ? `${BASE_URL}${c.photo}?v=${new Date().getTime()}` : null);
                            setSymbolPreview(c.symbol ? `${BASE_URL}${c.symbol}?v=${new Date().getTime()}` : null);
                            setEditOpen(true);
                          }} color="primary" size="small">
                            <Edit size={18} />
                          </IconButton>
                        </Tooltip>
                         <Tooltip title="Download Campaign Poster">
                          <IconButton onClick={() => handleDownloadPoster(c)} color="secondary" size="small">
                            <Download size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove Candidate">
                          <IconButton onClick={() => deleteCandidateMutation.mutate(c.id)} color="error" size="small">
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Register Candidate Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Register Candidate</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}
          {eligibilityError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {eligibilityError}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {/* 1. Admission No Search (Focus Out to Verify) */}
            <Box>
              <TextField 
                autoFocus
                fullWidth
                label="Student Admission No"
                placeholder="Type Admission No and hit Enter or click away..."
                value={admissionNo}
                onChange={(e) => setAdmissionNo(e.target.value.toUpperCase())}
                onBlur={handleVoterVerification}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault(); // Prevent accidental form submission
                    handleVoterVerification();
                  }
                }}
                disabled={verifying}
                required
                InputProps={{
                  endAdornment: verifying ? <CircularProgress size={20} /> : null
                }}
              />
              
              {foundVoter && (
                <Paper variant="outlined" sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderStyle: 'dashed', borderColor: 'primary.main', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>{foundVoter.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                        Class: {foundVoter.class_name || foundVoter.class_id} {foundVoter.division ? `Div ${foundVoter.division}` : ''} | {foundVoter.sex === 'M' ? 'Male' : 'Female'}
                      </Typography>
                    </Box>
                    <Box>
                       {foundVoter.is_blocked ? (
                        <Chip label="BLOCKED STUDENT" size="small" color="error" />
                      ) : foundVoter.is_candidate ? (
                         <Chip label={`REGISTERED FOR: ${foundVoter.candidate_post_name}`} size="small" color="warning" />
                      ) : (
                         <Chip label="AVAILABLE" size="small" color="success" variant="outlined" />
                      )}
                    </Box>
                  </Box>
                </Paper>
              )}
            </Box>

            <FormControl fullWidth required disabled={!foundVoter}>
              <InputLabel>Target Post</InputLabel>
              <Select value={candidateForm.post_id} label="Target Post"
                onChange={e => setCandidateForm(p => ({ ...p, post_id: e.target.value }))}>
                {posts?.filter((p: any) => {
                  if (!foundVoter) return true;
                  // 1. Filter by gender
                  if (p.gender_rule !== 'ANY' && foundVoter.sex !== p.gender_rule) return false;
                  // 2. Filter by class eligibility
                  const eligibleClasses = Array.isArray(p.candidate_classes) ? p.candidate_classes.map(Number) : [];
                  if (!eligibleClasses.includes(Number(foundVoter.class_id))) return false;
                  return true;
                }).map((p: any) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
              {foundVoter && (posts?.filter((p: any) => {
                  if (p.gender_rule !== 'ANY' && foundVoter.sex !== p.gender_rule) return false;
                  const eligibleClasses = Array.isArray(p.candidate_classes) ? p.candidate_classes.map(Number) : [];
                  return eligibleClasses.includes(Number(foundVoter.class_id));
                }).length === 0) && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, fontWeight: 700 }}>
                    ⚠ No posts are eligible for this student's Class or Gender.
                  </Typography>
                )}
            </FormControl>

            {/* 3. Symbol Name */}
            <TextField
              fullWidth
              label="Symbol Name"
              placeholder="e.g., Pen, Book, Sun"
              value={candidateForm.symbol_name}
              onChange={e => setCandidateForm(p => ({ ...p, symbol_name: e.target.value }))}
              required
              disabled={!foundVoter}
            />

            <Grid container spacing={2}>
              {/* 1. Candidate Symbol First */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>SYMBOL</Typography>
                  <Button 
                    variant="text" 
                    size="small" 
                    startIcon={<Search size={14} />} 
                    onClick={() => setLibraryDialogOpen(true)}
                    sx={{ p: 0, minWidth: 0, textTransform: 'none', fontWeight: 800, '&:hover': { background: 'transparent', color: 'primary.main' } }}
                  >
                    Choose from Library
                  </Button>
                </Box>
                <input type="file" ref={symbolInputRef} hidden accept="image/*" onChange={handleSymbolChange} />
                <Box 
                  onClick={() => symbolInputRef.current?.click()}
                  sx={{ 
                    border: '2px dashed', 
                    borderColor: symbol ? 'success.main' : 'divider',
                    borderRadius: 3,
                    height: 120,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                  }}
                >
                  {symbolPreview ? (
                    <img src={symbolPreview} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} />
                  ) : (
                    <>
                      <Upload size={24} color="#bdbdbd" />
                      <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>PNG (Max 10MB)</Typography>
                    </>
                  )}
                </Box>
              </Grid>

              {/* 2. Candidate Photo Second */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, height: 26, justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>PHOTO</Typography>
                  <Button size="small" variant="text" startIcon={<Camera size={14} />} onClick={() => setCameraOpen(true)} sx={{ p: 0, minWidth: 0, fontWeight: 800 }}>
                    Take Photo
                  </Button>
                </Box>
                <input type="file" ref={photoInputRef} hidden accept="image/jpeg" onChange={handlePhotoChange} />
                <Box 
                  onClick={() => photoInputRef.current?.click()}
                  sx={{ 
                    border: '2px dashed', 
                    borderColor: photo ? 'success.main' : 'divider',
                    borderRadius: 3,
                    height: 120,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                  }}
                >
                  {photoPreview ? (
                    <img src={photoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <User size={24} color="#bdbdbd" />
                      <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>JPG (Max 10MB)</Typography>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
           <Button variant="contained" onClick={() => addCandidateMutation.mutate(candidateForm)}
            disabled={addCandidateMutation.isPending || !candidateForm.voter_id || !candidateForm.post_id || !candidateForm.symbol_name || !!eligibilityError || !photo || !symbol}>
            {addCandidateMutation.isPending ? <CircularProgress size={20} /> : 'Register'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Candidate Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Edit Candidate: {editingCandidate?.candidate_name}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Post</InputLabel>
              <Select 
                value={candidateForm.post_id} 
                label="Post"
                onChange={e => setCandidateForm(p => ({ ...p, post_id: e.target.value }))}
              >
                {posts?.map((p: any) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Symbol Name"
              placeholder="e.g., Pen, Book, Sun"
              value={candidateForm.symbol_name}
              onChange={e => setCandidateForm(p => ({ ...p, symbol_name: e.target.value }))}
              required
            />

            <Grid container spacing={4}>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, height: 26, justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>PHOTO</Typography>
                  <Button size="small" variant="text" startIcon={<Camera size={14} />} onClick={() => setCameraOpen(true)} sx={{ p: 0, minWidth: 0, fontWeight: 800 }}>
                    Take Photo
                  </Button>
                </Box>
                <input type="file" ref={photoInputRef} hidden accept="image/*" onChange={handlePhotoChange} />
                <Box 
                  onClick={() => photoInputRef.current?.click()}
                  sx={{ 
                    border: '2px dashed', 
                    borderColor: 'primary.main',
                    borderRadius: '50%',
                    width: 160,
                    height: 160,
                    mx: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    bgcolor: 'action.hover',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    '&:hover': { transform: 'scale(1.02)', borderColor: 'primary.dark', bgcolor: 'action.selected', boxShadow: '0 8px 30px rgba(99, 102, 241, 0.2)' }
                  }}
                >
                  {photoPreview ? (
                    <img src={photoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Candidate" />
                  ) : (
                    <>
                      <Camera size={28} color="#6366f1" />
                      <Typography variant="caption" sx={{ mt: 1, color: 'primary.main', fontWeight: 600 }}>Change Photo</Typography>
                    </>
                  )}
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>SYMBOL</Typography>
                  <Button 
                    variant="text" 
                    size="small" 
                    startIcon={<Search size={14} />} 
                    onClick={() => setLibraryDialogOpen(true)}
                    sx={{ p: 0, minWidth: 0, textTransform: 'none', fontWeight: 800, '&:hover': { background: 'transparent', color: 'primary.main' } }}
                  >
                    From Library
                  </Button>
                </Box>
                <input type="file" ref={symbolInputRef} hidden accept="image/*" onChange={handleSymbolChange} />
                <Box 
                  onClick={() => symbolInputRef.current?.click()}
                  sx={{ 
                    border: '2px dashed', 
                    borderColor: 'primary.main',
                    borderRadius: 4,
                    width: 160,
                    height: 160,
                    mx: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    bgcolor: 'action.hover',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    '&:hover': { transform: 'scale(1.02)', borderColor: 'primary.dark', bgcolor: 'action.selected', boxShadow: '0 8px 30px rgba(99, 102, 241, 0.2)' }
                  }}
                >
                  {symbolPreview ? (
                    <img src={symbolPreview} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '15px' }} alt="Symbol" />
                  ) : (
                    <>
                      <Image size={28} color="#6366f1" />
                      <Typography variant="caption" sx={{ mt: 1, color: 'primary.main', fontWeight: 600 }}>Change Symbol</Typography>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => updateCandidateMutation.mutate(candidateForm)}
            disabled={updateCandidateMutation.isPending}
          >
            {updateCandidateMutation.isPending ? <CircularProgress size={20} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Cropping Dialog */}
      <Dialog open={cropDialogOpen} onClose={() => setCropDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Crop {croppingFor === 'photo' ? 'Candidate Photo' : 'Candidate Symbol'}
        </DialogTitle>
        <DialogContent sx={{ position: 'relative', height: 400, bgcolor: '#f5f5f5', p: 0 }}>
          {imageToCrop && (
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              cropShape={croppingFor === 'photo' ? 'round' : 'rect'}
              showGrid={false}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, flexDirection: 'column', alignItems: 'stretch', gap: 2 }}>
          <Box sx={{ px: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Zoom</Typography>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(_e, newValue) => setZoom(newValue as number)}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => setCropDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCropConfirm} variant="contained" sx={{ px: 4 }}>
              Apply Crop
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Symbol Library Dialog */}
      <Dialog open={libraryDialogOpen} onClose={() => setLibraryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Election Symbol Library</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedSymbolsForPrint.length > 0 && (
              <Button 
                variant="text" 
                size="small" 
                onClick={() => setSelectedSymbolsForPrint([])}
                sx={{ mr: 1, fontWeight: 700 }}
              >
                Clear ({selectedSymbolsForPrint.length})
              </Button>
            )}
            <Button 
              variant="contained" 
              size="small" 
              startIcon={<Download size={16} />} 
              onClick={handlePrintSymbols} 
              sx={{ mr: 1, boxShadow: 0 }}
            >
              Print {selectedSymbolsForPrint.length > 0 ? `${selectedSymbolsForPrint.length} Selected` : 'Library'} (A4)
            </Button>
            <IconButton onClick={() => setLibraryDialogOpen(false)}><X size={20} /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ minHeight: '60vh' }}>
          <TextField 
            fullWidth 
            placeholder="Search symbols (e.g. star, pen, sun)..." 
            variant="outlined" 
            sx={{ mb: 3 }}
            slotProps={{ input: { startAdornment: <Search size={20} style={{ marginRight: 10, opacity: 0.5 }} /> } }}
            value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value)}
          />

          <Grid container spacing={2}>
            {ELECTION_SYMBOLS.filter(s => s.name.toLowerCase().includes(searchSymbol.toLowerCase())).map((symbol) => {
              const isSelected = selectedSymbolsForPrint.includes(symbol.id);
              return (
                <Grid item xs={4} sm={3} md={2} key={symbol.id}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      cursor: 'pointer', 
                      borderRadius: 2,
                      position: 'relative',
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      bgcolor: isSelected ? 'action.selected' : 'background.paper',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box 
                      onClick={() => handleSelectFromLibrary(symbol)}
                      sx={{ 
                        mb: 1, 
                        color: isSelected ? 'primary.main' : 'inherit',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <Box sx={{ 
                        width: 60, 
                        height: 60, 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        bgcolor: isSelected ? 'primary.light' : 'action.hover',
                        mb: 1.5,
                        border: '2px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          bgcolor: 'primary.light',
                          borderColor: 'primary.main'
                        }
                      }}>
                        <span className="material-symbols-rounded" style={{ 
                          fontSize: '3.5rem', 
                          color: '#000',
                          fontVariationSettings: "'FILL' 1, 'wght' 700",
                          // Fix for text ligatures bleeding out during load
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          wordWrap: 'normal'
                        }}>
                          {symbol.iconName}
                        </span>
                      </Box>
                      <Typography variant="caption" sx={{ 
                        fontWeight: 900, 
                        display: 'block', 
                        textTransform: 'uppercase', 
                        fontSize: '0.65rem',
                        color: isSelected ? 'primary.main' : 'text.primary',
                        lineHeight: 1.2
                      }}>
                        {symbol.name}
                      </Typography>
                    </Box>
                    
                    <Box 
                      onClick={(e) => { e.stopPropagation(); toggleSymbolSelection(symbol.id); }}
                      sx={{ 
                        position: 'absolute', 
                        top: 4, 
                        right: 4,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: '1px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? 'primary.main' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px'
                      }}
                    >
                      {isSelected ? '✓' : ''}
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Candidates;
