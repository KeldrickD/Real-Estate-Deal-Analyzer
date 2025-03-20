import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import { storageService, SavedDeal } from '../services/storage';

// Types for metric thresholds
interface MetricThresholds {
  cashOnCash: {
    good: number; // Above this is good
    warning: number; // Above this is warning, below is bad
  };
  capRate: {
    good: number;
    warning: number;
  };
  dscr: {
    good: number;
    warning: number;
  };
}

const defaultThresholds: MetricThresholds = {
  cashOnCash: {
    good: 12, // Above 12% is good
    warning: 8, // 8-12% is warning, below 8% is bad
  },
  capRate: {
    good: 8, // Above 8% is good
    warning: 5, // 5-8% is warning, below 5% is bad
  },
  dscr: {
    good: 1.5, // Above 1.5 is good
    warning: 1.2, // 1.2-1.5 is warning, below 1.2 is bad
  }
};

interface PortfolioOverviewProps {
  onViewDeal: (tabIndex: number, dealId: string) => void;
}

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ onViewDeal }) => {
  const [deals, setDeals] = useState<SavedDeal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<SavedDeal[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<string>('all');
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const [thresholds, setThresholds] = useState<MetricThresholds>(defaultThresholds);

  // Load all deals
  useEffect(() => {
    const allDeals = storageService.getAllDeals();
    setDeals(allDeals);
    setFilteredDeals(allDeals);
    
    // Calculate metrics for each deal
    const calculatedMetrics: Record<string, any> = {};
    
    allDeals.forEach(deal => {
      const metrics = calculateDealMetrics(deal);
      calculatedMetrics[deal.id] = metrics;
    });
    
    setMetrics(calculatedMetrics);
  }, []);

  // Filter and sort deals when search, filter, or sort changes
  useEffect(() => {
    let result = [...deals];
    
    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter(deal => deal.type === filterType);
    }
    
    // Apply search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(deal => 
        deal.name.toLowerCase().includes(lowerSearchTerm) ||
        deal.type.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      if (sortField === 'date') {
        comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      } 
      else if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      }
      else if (sortField === 'cashOnCash') {
        const aValue = metrics[a.id]?.cashOnCashReturn || 0;
        const bValue = metrics[b.id]?.cashOnCashReturn || 0;
        comparison = aValue - bValue;
      }
      else if (sortField === 'capRate') {
        const aValue = metrics[a.id]?.capRate || 0;
        const bValue = metrics[b.id]?.capRate || 0;
        comparison = aValue - bValue;
      }
      else if (sortField === 'noi') {
        const aValue = metrics[a.id]?.noi || 0;
        const bValue = metrics[b.id]?.noi || 0;
        comparison = aValue - bValue;
      }
      else if (sortField === 'dscr') {
        const aValue = metrics[a.id]?.dscr || 0;
        const bValue = metrics[b.id]?.dscr || 0;
        comparison = aValue - bValue;
      }
      else if (sortField === 'profitPotential') {
        const aValue = metrics[a.id]?.profitPotential || 0;
        const bValue = metrics[b.id]?.profitPotential || 0;
        comparison = aValue - bValue;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredDeals(result);
  }, [deals, searchTerm, sortField, sortDirection, filterType, metrics]);

  // Calculate metrics for each deal based on its type
  const calculateDealMetrics = (deal: SavedDeal) => {
    let capRate = 0;
    let noi = 0;
    let dscr = 0;
    let cashOnCashReturn = 0;
    let profitPotential = 0;
    
    // Extract common metrics that are already calculated
    if (deal.results) {
      if (deal.results.cashFlow) {
        if (typeof deal.results.cashFlow === 'object') {
          cashOnCashReturn = deal.results.cashFlow.cashOnCashReturn || 0;
        }
      }
      
      if (deal.type === 'wholesale') {
        profitPotential = deal.results.profitPotential || deal.results.potentialProfit || 0;
      }
      
      if (deal.type === 'apartment' || deal.type === 'creative') {
        noi = deal.results.netOperatingIncome || 0;
        if (deal.results.marketValue && noi > 0) {
          capRate = (noi / deal.results.marketValue) * 100;
        }
        
        if (noi > 0 && deal.results.totalDebtService && deal.results.totalDebtService > 0) {
          dscr = noi / deal.results.totalDebtService;
        }
      }
      
      if (deal.type === 'mortgage') {
        if (deal.inputs?.purchasePrice && deal.results?.monthlyPayment) {
          const estimatedIncome = deal.inputs.purchasePrice * 0.01; // Estimate monthly income as 1% of purchase price
          const monthlyPayment = deal.results.monthlyPayment;
          dscr = estimatedIncome / monthlyPayment;
        }
      }
    }
    
    return {
      capRate,
      noi,
      dscr,
      cashOnCashReturn,
      profitPotential
    };
  };

  // Helper to get status color based on metric value
  const getStatusColor = (metric: string, value: number): string => {
    if (!value && value !== 0) return 'default';
    
    if (metric === 'cashOnCash') {
      if (value >= thresholds.cashOnCash.good) return 'success';
      if (value >= thresholds.cashOnCash.warning) return 'warning';
      return 'error';
    }
    
    if (metric === 'capRate') {
      if (value >= thresholds.capRate.good) return 'success';
      if (value >= thresholds.capRate.warning) return 'warning';
      return 'error';
    }
    
    if (metric === 'dscr') {
      if (value >= thresholds.dscr.good) return 'success';
      if (value >= thresholds.dscr.warning) return 'warning';
      return 'error';
    }
    
    if (metric === 'profitPotential') {
      if (value > 10000) return 'success';
      if (value > 5000) return 'warning';
      return 'error';
    }
    
    return 'default';
  };

  // Helper to format currency
  const formatCurrency = (value: number) => {
    if (!value && value !== 0) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Helper to format percentage
  const formatPercentage = (value: number) => {
    if (!value && value !== 0) return 'N/A';
    
    return value.toFixed(2) + '%';
  };

  // Helper to format ratio
  const formatRatio = (value: number) => {
    if (!value && value !== 0) return 'N/A';
    
    return value.toFixed(2);
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle sort field change
  const handleSortFieldChange = (event: SelectChangeEvent) => {
    setSortField(event.target.value);
  };

  // Handle sort direction change
  const handleSortDirectionToggle = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Handle filter type change
  const handleFilterTypeChange = (event: SelectChangeEvent) => {
    setFilterType(event.target.value);
  };

  // Navigate to deal detail view
  const handleViewDeal = (deal: SavedDeal) => {
    let tabIndex = 1; // Default to wholesale
    
    switch (deal.type) {
      case 'wholesale':
        tabIndex = 1;
        break;
      case 'creative':
        tabIndex = 2;
        break;
      case 'mortgage':
        tabIndex = 3;
        break;
      case 'apartment':
        tabIndex = 4;
        break;
    }
    
    onViewDeal(tabIndex, deal.id);
  };

  // Get icon for the deal health
  const getDealHealthIcon = (deal: SavedDeal) => {
    const dealMetrics = metrics[deal.id];
    if (!dealMetrics) return null;
    
    let status = 'neutral';
    
    // Determine status based on the primary metrics for the deal type
    if (deal.type === 'wholesale' && dealMetrics.profitPotential) {
      status = getStatusColor('profitPotential', dealMetrics.profitPotential);
    }
    else if (dealMetrics.cashOnCashReturn) {
      status = getStatusColor('cashOnCash', dealMetrics.cashOnCashReturn);
    }
    else if (dealMetrics.capRate) {
      status = getStatusColor('capRate', dealMetrics.capRate);
    }
    else if (dealMetrics.dscr) {
      status = getStatusColor('dscr', dealMetrics.dscr);
    }
    
    if (status === 'success') {
      return <CheckCircleIcon color="success" />;
    } else if (status === 'warning') {
      return <WarningIcon color="warning" />;
    } else if (status === 'error') {
      return <WarningIcon color="error" />;
    }
    
    return <InfoIcon color="info" />;
  };

  // Get color for deal type badge
  const getDealTypeColor = (type: string) => {
    switch (type) {
      case 'wholesale': return '#2e7d32';
      case 'creative': return '#1976d2';
      case 'mortgage': return '#9c27b0';
      case 'apartment': return '#ed6c02';
      default: return '#757575';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        Portfolio Overview
      </Typography>
      
      <Typography variant="body1" paragraph>
        View and analyze all your properties at a glance with key performance metrics.
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Properties
              </Typography>
              <Typography variant="h4">
                {filteredDeals.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg. Cash-on-Cash Return
              </Typography>
              <Typography variant="h4">
                {formatPercentage(
                  filteredDeals.reduce((sum, deal) => {
                    const coc = metrics[deal.id]?.cashOnCashReturn || 0;
                    return sum + coc;
                  }, 0) / (filteredDeals.length || 1)
                )}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(
                  (filteredDeals.reduce((sum, deal) => {
                    const coc = metrics[deal.id]?.cashOnCashReturn || 0;
                    return sum + coc;
                  }, 0) / (filteredDeals.length || 1)) / 20 * 100, 
                  100
                )} 
                color="success" 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg. Cap Rate
              </Typography>
              <Typography variant="h4">
                {formatPercentage(
                  filteredDeals.reduce((sum, deal) => {
                    const capRate = metrics[deal.id]?.capRate || 0;
                    return sum + capRate;
                  }, 0) / (filteredDeals.length || 1)
                )}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(
                  (filteredDeals.reduce((sum, deal) => {
                    const capRate = metrics[deal.id]?.capRate || 0;
                    return sum + capRate;
                  }, 0) / (filteredDeals.length || 1)) / 12 * 100, 
                  100
                )} 
                color="success" 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg. DSCR
              </Typography>
              <Typography variant="h4">
                {formatRatio(
                  filteredDeals.reduce((sum, deal) => {
                    const dscr = metrics[deal.id]?.dscr || 0;
                    return sum + dscr;
                  }, 0) / (filteredDeals.length || 1)
                )}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(
                  (filteredDeals.reduce((sum, deal) => {
                    const dscr = metrics[deal.id]?.dscr || 0;
                    return sum + dscr;
                  }, 0) / (filteredDeals.length || 1)) / 2 * 100, 
                  100
                )} 
                color="success" 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Filters and Search */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search properties..."
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1 }} color="action" />
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="filter-type-label">Property Type</InputLabel>
              <Select
                labelId="filter-type-label"
                value={filterType}
                label="Property Type"
                onChange={handleFilterTypeChange}
                startAdornment={<FilterListIcon sx={{ mr: 1 }} color="action" />}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="wholesale">Wholesale</MenuItem>
                <MenuItem value="creative">Creative Finance</MenuItem>
                <MenuItem value="mortgage">Mortgage</MenuItem>
                <MenuItem value="apartment">Apartment</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-by-label">Sort By</InputLabel>
              <Select
                labelId="sort-by-label"
                value={sortField}
                label="Sort By"
                onChange={handleSortFieldChange}
                startAdornment={<SortIcon sx={{ mr: 1 }} color="action" />}
              >
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="cashOnCash">Cash-on-Cash Return</MenuItem>
                <MenuItem value="capRate">Cap Rate</MenuItem>
                <MenuItem value="noi">NOI</MenuItem>
                <MenuItem value="dscr">DSCR</MenuItem>
                <MenuItem value="profitPotential">Profit Potential</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Button 
              variant="outlined" 
              onClick={handleSortDirectionToggle}
              startIcon={sortDirection === 'asc' ? 
                <SortIcon style={{ transform: 'rotate(180deg)' }} /> : 
                <SortIcon />
              }
              fullWidth
            >
              {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Properties Table */}
      <TableContainer component={Paper}>
        <Table aria-label="portfolio properties table">
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Potential Profit</TableCell>
              <TableCell>Cash-on-Cash</TableCell>
              <TableCell>Cap Rate</TableCell>
              <TableCell>NOI</TableCell>
              <TableCell>DSCR</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDeals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body1" py={3}>
                    No properties found. Start creating deals to see them here.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredDeals.map((deal) => {
                const dealMetrics = metrics[deal.id] || {};
                
                return (
                  <TableRow 
                    key={deal.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      cursor: 'pointer'
                    }}
                    onClick={() => handleViewDeal(deal)}
                  >
                    <TableCell>
                      <Tooltip title="Deal Health Indicator">
                        {getDealHealthIcon(deal)}
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {deal.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Added: {new Date(deal.date).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={deal.type} 
                        size="small" 
                        sx={{ bgcolor: getDealTypeColor(deal.type), color: 'white' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        color={getStatusColor('profitPotential', dealMetrics.profitPotential)}
                      >
                        {formatCurrency(dealMetrics.profitPotential)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        color={getStatusColor('cashOnCash', dealMetrics.cashOnCashReturn)}
                      >
                        {formatPercentage(dealMetrics.cashOnCashReturn)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        color={getStatusColor('capRate', dealMetrics.capRate)}
                      >
                        {formatPercentage(dealMetrics.capRate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(dealMetrics.noi)}
                    </TableCell>
                    <TableCell>
                      <Typography 
                        color={getStatusColor('dscr', dealMetrics.dscr)}
                      >
                        {formatRatio(dealMetrics.dscr)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDeal(deal);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Key for color coding */}
      <Paper elevation={1} sx={{ p: 2, mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Metrics Thresholds
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center" mb={1}>
              <CheckCircleIcon color="success" sx={{ mr: 1 }} fontSize="small" />
              <Typography variant="body2">
                Cash-on-Cash: &gt;{thresholds.cashOnCash.good}%
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              <WarningIcon color="warning" sx={{ mr: 1 }} fontSize="small" />
              <Typography variant="body2">
                Cash-on-Cash: {thresholds.cashOnCash.warning}-{thresholds.cashOnCash.good}%
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <WarningIcon color="error" sx={{ mr: 1 }} fontSize="small" />
              <Typography variant="body2">
                Cash-on-Cash: &lt;{thresholds.cashOnCash.warning}%
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center" mb={1}>
              <CheckCircleIcon color="success" sx={{ mr: 1 }} fontSize="small" />
              <Typography variant="body2">
                Cap Rate: &gt;{thresholds.capRate.good}%
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              <WarningIcon color="warning" sx={{ mr: 1 }} fontSize="small" />
              <Typography variant="body2">
                Cap Rate: {thresholds.capRate.warning}-{thresholds.capRate.good}%
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <WarningIcon color="error" sx={{ mr: 1 }} fontSize="small" />
              <Typography variant="body2">
                Cap Rate: &lt;{thresholds.capRate.warning}%
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center" mb={1}>
              <CheckCircleIcon color="success" sx={{ mr: 1 }} fontSize="small" />
              <Typography variant="body2">
                DSCR: &gt;{thresholds.dscr.good}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              <WarningIcon color="warning" sx={{ mr: 1 }} fontSize="small" />
              <Typography variant="body2">
                DSCR: {thresholds.dscr.warning}-{thresholds.dscr.good}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <WarningIcon color="error" sx={{ mr: 1 }} fontSize="small" />
              <Typography variant="body2">
                DSCR: &lt;{thresholds.dscr.warning}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default PortfolioOverview; 