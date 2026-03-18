import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Paper,
  Stack,
  alpha
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  ChevronLeft, 
  LogOut, 
  LayoutDashboard,
  School,
  Vote,
  Users,
  Monitor,
  BarChart3,
  HelpCircle,
  UserSquare2,
  BookOpen,
  Award,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import ThemeToggle from '../common/ThemeToggle';

const drawerWidth = 280;

interface NavItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
}

const navItems: NavItem[] = [
  // Super Admin
  { text: 'Dashboard', icon: <LayoutDashboard size={22} />, path: '/super-admin', roles: ['SUPER_ADMIN'] },
  { text: 'Schools', icon: <School size={22} />, path: '/super-admin/schools', roles: ['SUPER_ADMIN'] },
  { text: 'Enquiries', icon: <HelpCircle size={22} />, path: '/super-admin/enquiries', roles: ['SUPER_ADMIN'] },
  
  // School Admin
  { text: 'Dashboard', icon: <LayoutDashboard size={22} />, path: '/school-admin', roles: ['SCHOOL_ADMIN'] },
  { text: 'Elections', icon: <Vote size={22} />, path: '/school-admin/elections', roles: ['SCHOOL_ADMIN'] },
  { text: 'Classes & Sections', icon: <BookOpen size={22} />, path: '/school-admin/classes', roles: ['SCHOOL_ADMIN'] },
  { text: 'Posts', icon: <Award size={22} />, path: '/school-admin/posts', roles: ['SCHOOL_ADMIN'] },
  { text: 'Voters', icon: <Users size={22} />, path: '/school-admin/voters', roles: ['SCHOOL_ADMIN'] },
  { text: 'Candidates', icon: <UserSquare2 size={22} />, path: '/school-admin/candidates', roles: ['SCHOOL_ADMIN'] },
  { text: 'Infrastructure', icon: <Monitor size={22} />, path: '/school-admin/infrastructure', roles: ['SCHOOL_ADMIN'] },
  { text: 'Results', icon: <BarChart3 size={22} />, path: '/school-admin/results', roles: ['SCHOOL_ADMIN'] },
  { text: 'Profile', icon: <School size={22} />, path: '/school-admin/profile', roles: ['SCHOOL_ADMIN'] },
  
  // Booth Officer
  { text: 'Dashboard', icon: <LayoutDashboard size={22} />, path: '/booth-officer', roles: ['BOOTH_OFFICER'] },
];

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => setOpen(!open);
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || ''));

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ 
          width: 40, height: 40, borderRadius: 1.5, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
        }}>
          <Vote color="white" size={24} />
        </Box>
        <Typography variant="h6" noWrap sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px' }}>
          {user?.role === 'SUPER_ADMIN' ? 'E-Vote Platform' : (user?.school_name || 'E-Vote School')}
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle} sx={{ ml: 'auto' }}>
            <ChevronLeft />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ mx: 2, opacity: 0.5 }} />

      <List sx={{ flexGrow: 1, px: 2, py: 3 }}>
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 3,
                  py: 1.25,
                  transition: 'all 0.2s',
                  position: 'relative',
                  backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    color: theme.palette.primary.main,
                    '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
                  },
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: -8,
                      top: '20%',
                      height: '60%',
                      width: 4,
                      borderRadius: '0 4px 4px 0',
                      backgroundColor: theme.palette.primary.main,
                    }
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 42, 
                  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                  transition: 'color 0.2s'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.925rem'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2, mt: 'auto' }}>
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            borderRadius: 4, 
            backgroundColor: alpha(theme.palette.background.default, 0.5),
            borderColor: theme.palette.divider,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Avatar sx={{ width: 40, height: 40, bgcolor: theme.palette.secondary.main }}>
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
              {user?.username}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}>
              {user?.role?.replace('_', ' ')}
            </Typography>
          </Box>
          <IconButton onClick={handleLogout} size="small" sx={{ ml: 'auto', color: 'error.main' }}>
            <LogOut size={18} />
          </IconButton>
        </Paper>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(12px)',
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
          width: { md: `calc(100% - ${open ? drawerWidth : 0}px)` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: open ? 'none' : 'flex' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {filteredNavItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
              {user?.role !== 'SUPER_ADMIN' && user?.school_name && (
                <Typography component="span" variant="subtitle2" sx={{ ml: 2, color: 'text.secondary', fontWeight: 500, opacity: 0.8 }}>
                  — {user.school_name}
                </Typography>
              )}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1} alignItems="center">
            <ThemeToggle />
            <IconButton onClick={handleMenuOpen} size="small" sx={{ p: 0.5 }}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: '1rem', fontWeight: 700 }}>
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: { 
                  mt: 1.5, minWidth: 200, borderRadius: 3,
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                }
              }}
            >
              <MenuItem disabled sx={{ opacity: '1 !important', py: 1.5 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{user?.username}</Typography>
                  <Typography variant="caption" color="text.secondary">{user?.role}</Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
                <ListItemIcon><LogOut size={18} color={theme.palette.error.main} /></ListItemIcon>
                Sign Out
              </MenuItem>
            </Menu>
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={open}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          mt: 8,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
