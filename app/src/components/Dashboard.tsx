import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CardMedia,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { storageService } from '../services/storage';
import PortfolioOverview from './PortfolioOverview';

const featuresList = [
  {
    title: "Wholesale Calculator",
    description: "Analyze fix & flip deals with ARV calculations, repair estimates, and profit analysis",
    icon: <HomeWorkIcon fontSize="large" color="primary" />,
    tabIndex: 0
  },
  {
    title: "Creative Financing",
    description: "Evaluate owner financing, subject-to, and lease option deals with detailed payment schedules",
    icon: <AttachMoneyIcon fontSize="large" color="primary" />,
    tabIndex: 1
  },
  {
    title: "Mortgage Analyzer",
    description: "Compare mortgage options with amortization schedules and interest calculations",
    icon: <AccountBalanceIcon fontSize="large" color="primary" />,
    tabIndex: 2
  },
  {
    title: "Apartment Analysis",
    description: "Evaluate multi-family properties with comprehensive financial metrics and market analysis",
    icon: <ApartmentIcon fontSize="large" color="primary" />,
    tabIndex: 3
  },
  {
    title: "Deal Comparison",
    description: "Compare different deals side by side with visual charts and key metrics",
    icon: <CompareArrowsIcon fontSize="large" color="primary" />,
    tabIndex: 4
  }
];

interface DashboardProps {
  onNavigate: (tabIndex: number) => void;
}

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
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
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

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [recentDeals, setRecentDeals] = useState<any[]>([]);
  const [statsData, setStatsData] = useState({
    totalDeals: 0,
    wholesaleDeals: 0,
    creativeDeals: 0,
    mortgageDeals: 0,
    apartmentDeals: 0,
    averageCashFlow: 0
  });
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const allDeals = storageService.getAllDeals();
    
    // Get recent deals (up to 5)
    const recent = allDeals.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 5);
    
    setRecentDeals(recent);
    
    // Calculate stats
    const wholesaleDeals = allDeals.filter(deal => deal.type === 'wholesale');
    const creativeDeals = allDeals.filter(deal => deal.type === 'creative');
    const mortgageDeals = allDeals.filter(deal => deal.type === 'mortgage');
    const apartmentDeals = allDeals.filter(deal => deal.type === 'apartment');
    
    // Calculate average cash flow from all deals with cash flow data
    const dealsWithCashFlow = allDeals.filter(deal => deal.results && deal.results.cashFlow);
    const totalCashFlow = dealsWithCashFlow.reduce((sum, deal) => {
      const cashFlow = typeof deal.results.cashFlow === 'object' 
        ? deal.results.cashFlow.annualCashFlow
        : deal.results.cashFlow;
      return sum + (parseFloat(cashFlow) || 0);
    }, 0);
    
    const averageCashFlow = dealsWithCashFlow.length > 0 
      ? totalCashFlow / dealsWithCashFlow.length 
      : 0;
    
    setStatsData({
      totalDeals: allDeals.length,
      wholesaleDeals: wholesaleDeals.length,
      creativeDeals: creativeDeals.length,
      mortgageDeals: mortgageDeals.length,
      apartmentDeals: apartmentDeals.length,
      averageCashFlow
    });
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'wholesale': return '#2e7d32';
      case 'creative': return '#1976d2';
      case 'mortgage': return '#9c27b0';
      case 'apartment': return '#ed6c02';
      default: return '#757575';
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewDeal = (tabIndex: number, dealId: string) => {
    // Navigate to the specific calculator tab
    onNavigate(tabIndex);
    
    // The specific view for the deal will need to be implemented in each calculator component
    // We could potentially store the selected deal ID in localStorage to be picked up by the calculator
    localStorage.setItem('selected_deal_id', dealId);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Real Estate Deal Analyzer
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 2 }}>
          Your comprehensive tool for analyzing and comparing real estate investment opportunities
        </Typography>
        <Divider sx={{ mb: 4 }} />
      </Box>

      {/* Dashboard Tabs */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="dashboard tabs"
            centered
          >
            <Tab label="Dashboard Overview" />
            <Tab label="Portfolio Analysis" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }} className="Dashboard-stats">
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Total Deals
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {statsData.totalDeals}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Average Cash Flow
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(statsData.averageCashFlow)}/yr
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Deal Breakdown
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Chip 
                    label={`Wholesale: ${statsData.wholesaleDeals}`} 
                    size="small" 
                    sx={{ bgcolor: getTypeColor('wholesale'), color: 'white' }}
                  />
                  <Chip 
                    label={`Creative: ${statsData.creativeDeals}`} 
                    size="small" 
                    sx={{ bgcolor: getTypeColor('creative'), color: 'white' }}
                  />
                  <Chip 
                    label={`Mortgage: ${statsData.mortgageDeals}`} 
                    size="small" 
                    sx={{ bgcolor: getTypeColor('mortgage'), color: 'white' }}
                  />
                  <Chip 
                    label={`Apartment: ${statsData.apartmentDeals}`} 
                    size="small" 
                    sx={{ bgcolor: getTypeColor('apartment'), color: 'white' }}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Features */}
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Calculators & Tools
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }} className="Dashboard-features">
            {featuresList.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {feature.icon}
                      <Typography variant="h6" component="h2" sx={{ ml: 1 }}>
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => onNavigate(feature.tabIndex)}
                    >
                      Open Calculator
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Recent Deals */}
          {recentDeals.length > 0 && (
            <>
              <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                Recent Deals
              </Typography>
              <Grid container spacing={3} className="Dashboard-deals">
                {recentDeals.map((deal, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index} style={{ "--index": index } as React.CSSProperties}>
                    <Paper elevation={2} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: getTypeColor(deal.type), 
                            width: 32, 
                            height: 32, 
                            mr: 1
                          }}
                        >
                          {deal.type.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="subtitle1" noWrap sx={{ maxWidth: '70%' }}>
                          {deal.name}
                        </Typography>
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary" display="block">
                        Created: {new Date(deal.date).toLocaleDateString()}
                      </Typography>
                      
                      {deal.results && deal.results.cashFlow && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            <strong>Cash Flow:</strong> {formatCurrency(
                              typeof deal.results.cashFlow === 'object' 
                                ? deal.results.cashFlow.annualCashFlow / 12 
                                : deal.results.cashFlow / 12
                            )}/mo
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <PortfolioOverview onViewDeal={handleViewDeal} />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default Dashboard; 