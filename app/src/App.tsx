import React, { useState, useMemo, useEffect } from 'react';
import { 
  CssBaseline, 
  ThemeProvider, 
  createTheme, 
  Container, 
  Box, 
  Typography, 
  AppBar, 
  Toolbar, 
  Tabs, 
  Tab, 
  Paper,
  useMediaQuery,
  IconButton,
  Switch,
  FormControlLabel
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import './App.css';

// Import components
import WholesaleCalculator from './components/WholesaleCalculator';
import CreativeFinancingEvaluator from './components/CreativeFinancingEvaluator';
import MortgageAnalyzer from './components/MortgageAnalyzer';
import DealComparison from './components/DealComparison';
import ApartmentAnalysis from './components/ApartmentAnalysis';
import Dashboard from './components/Dashboard';
import AdvancedFinancing from './components/AdvancedFinancing';
import { storageService } from './services/storage';

// Component placeholders for components that will be fixed next
const MultiFamilyAnalyzer = () => (
  <Box p={3}>
    <Typography variant="h5">Multi-Family Analyzer</Typography>
    <Typography variant="body1">This component is being fixed. Please check back soon.</Typography>
  </Box>
);

const SellerFinanceCalculator = () => (
  <Box p={3}>
    <Typography variant="h5">Seller Finance Calculator</Typography>
    <Typography variant="body1">This component is being fixed. Please check back soon.</Typography>
  </Box>
);

const CreativeOfferCalculator = () => (
  <Box p={3}>
    <Typography variant="h5">Creative Offer Calculator</Typography>
    <Typography variant="body1">This component is being fixed. Please check back soon.</Typography>
  </Box>
);

// Interface for TabPanel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// TabPanel component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`calculator-tabpanel-${index}`}
      aria-labelledby={`calculator-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const isMobile = useMediaQuery('(max-width:600px)');
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // Initialize theme based on localStorage or system preference
  useEffect(() => {
    const savedTheme = storageService.getThemePreference();
    if (savedTheme) {
      setMode(savedTheme);
    } else {
      setMode(prefersDarkMode ? 'dark' : 'light');
    }
  }, [prefersDarkMode]);

  // Toggle theme function
  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      storageService.saveThemePreference(newMode);
      return newMode;
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSelectedDealId(null);
  };

  const handleViewDeal = (tabIndex: number, dealId: string) => {
    setActiveTab(tabIndex);
    setSelectedDealId(dealId);
  };

  // Create theme based on current mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'dark' ? '#4caf50' : '#2e7d32',
          },
          secondary: {
            main: mode === 'dark' ? '#42a5f5' : '#1976d2',
          },
          background: {
            default: mode === 'dark' ? '#121212' : '#f5f5f5',
            paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
          },
        },
        typography: {
          h5: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 600,
          },
          button: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
              },
            },
          },
          MuiTab: {
            styleOverrides: {
              root: {
                fontWeight: 600,
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <IconButton 
              edge="start" 
              color="inherit" 
              aria-label="home"
              sx={{ mr: 2 }}
              onClick={() => setActiveTab(0)}
            >
              <HomeIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Real Estate Deal Analyzer
            </Typography>
            <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="xl">
          <Box sx={{ width: '100%', py: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="calculator tabs"
                variant={isMobile ? "scrollable" : "fullWidth"}
                scrollButtons={isMobile ? "auto" : undefined}
              >
                <Tab label="Dashboard" />
                <Tab label="Wholesale" />
                <Tab label="Creative Financing" />
                <Tab label="Mortgage" />
                <Tab label="Apartment" />
                <Tab label="Deal Comparison" />
                <Tab label="Advanced Financing" />
              </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
              <Dashboard onNavigate={setActiveTab} />
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              <WholesaleCalculator selectedDealId={selectedDealId} />
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
              <CreativeFinancingEvaluator selectedDealId={selectedDealId} />
            </TabPanel>
            <TabPanel value={activeTab} index={3}>
              <MortgageAnalyzer />
            </TabPanel>
            <TabPanel value={activeTab} index={4}>
              <ApartmentAnalysis />
            </TabPanel>
            <TabPanel value={activeTab} index={5}>
              <DealComparison />
            </TabPanel>
            <TabPanel value={activeTab} index={6}>
              <AdvancedFinancing />
            </TabPanel>
          </Box>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
