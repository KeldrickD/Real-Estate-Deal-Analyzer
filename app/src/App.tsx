import React, { useState } from 'react';
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
  IconButton
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import './App.css';

// Import the working WholesaleCalculator component
import WholesaleCalculator from './components/WholesaleCalculator';
import CreativeFinancingEvaluator from './components/CreativeFinancingEvaluator';
import MortgageAnalyzer from './components/MortgageAnalyzer';
import DealComparison from './components/DealComparison';
import ApartmentAnalysis from './components/ApartmentAnalysis';

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

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Green color for real estate
    },
    secondary: {
      main: '#1976d2', // Blue
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
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
});

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
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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
            >
              <HomeIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Real Estate Deal Analyzer
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="xl">
          <Box sx={{ width: '100%', py: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="calculator tabs"
                variant="fullWidth"
              >
                <Tab label="Wholesale Calculator" />
                <Tab label="Creative Financing" />
                <Tab label="Mortgage Analyzer" />
                <Tab label="Apartment Analysis" />
                <Tab label="Deal Comparison" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <WholesaleCalculator />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <CreativeFinancingEvaluator />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <MortgageAnalyzer />
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <ApartmentAnalysis />
            </TabPanel>
            <TabPanel value={tabValue} index={4}>
              <DealComparison />
            </TabPanel>
          </Box>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
