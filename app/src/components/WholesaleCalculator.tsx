import React, { useState, useEffect } from 'react';
import {
  TextField,
  Grid,
  Typography,
  Paper,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Alert,
  Snackbar,
  InputAdornment,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField as MuiTextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider
} from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DealAlternatives from './DealAlternatives';

// Import validation utilities
import { 
  isValidPositiveNumber, 
  formatCurrency 
} from '../utils/validation';

// Import local storage utilities
import {
  saveWholesaleDeal,
  loadWholesaleDeal,
  getAllWholesaleDeals,
  deleteWholesaleDeal
} from '../utils/localStorage';

// Import storage service
import { storageService } from '../services/storage';

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip, Legend);

// Define interfaces for props and state
interface SavedDeal {
  key: string;
  data: {
    inputs: WholesaleInputs;
    results: WholesaleResults;
  };
}

interface WholesaleInputs {
  purchasePrice: string;
  repairCosts: string;
  arv: string; // After Repair Value
  holdingCosts: string;
  closingCosts: string;
  wholesaleFee: string;
  dealName: string;
  squareFootage: string;
  propertyCondition: 'easy' | 'medium' | 'bad';
  rehabItems: {
    kitchen: string;
    bathrooms: string;
    flooring: string;
    paint: string;
    hvac: string;
    roof: string;
    other: string;
  };
}

interface WholesaleResults {
  maxAllowableOffer: number;
  potentialProfit: number;
  investorProfit: number;
  roi: number; // Return on Investment
  preferredOffer: number;
  assignmentFee: number;
  minimumScore: number;
  totalRehabCost: number;
  exitPercentage: number;
  wholesalePrice: number;
  preferredExitPrice: number;
}

// Constants for ARV-based exit percentages
const ARV_EXIT_PERCENTAGES = {
  UNDER_150K: 0.60,
  UNDER_200K: 0.65,
  UNDER_300K: 0.70,
  UNDER_400K: 0.75,
  OVER_400K: 0.80
};

// Constants for quick repair cost estimates based on square footage and condition
const QUICK_REPAIR_COSTS = {
  easy: {
    under_1500: 25000,
    under_2000: 35000,
    under_2500: 45000,
    over_2500: 55000
  },
  medium: {
    under_1500: 40000,
    under_2000: 55000,
    under_2500: 70000,
    over_2500: 85000
  },
  bad: {
    under_1500: 60000,
    under_2000: 80000,
    under_2500: 100000,
    over_2500: 120000
  }
};

interface WholesaleCalculatorProps {
  selectedDealId?: string | null;
}

const WholesaleCalculator: React.FC<WholesaleCalculatorProps> = ({ selectedDealId }) => {
  // State for form inputs
  const [inputs, setInputs] = useState<WholesaleInputs>({
    purchasePrice: '',
    repairCosts: '',
    arv: '', // After Repair Value
    holdingCosts: '',
    closingCosts: '',
    wholesaleFee: '',
    dealName: '',
    squareFootage: '',
    propertyCondition: 'medium',
    rehabItems: {
      kitchen: '',
      bathrooms: '',
      flooring: '',
      paint: '',
      hvac: '',
      roof: '',
      other: ''
    }
  });

  // State for calculated results
  const [results, setResults] = useState<WholesaleResults>({
    maxAllowableOffer: 0,
    potentialProfit: 0,
    investorProfit: 0,
    roi: 0,
    preferredOffer: 0,
    assignmentFee: 0,
    minimumScore: 0,
    totalRehabCost: 0,
    exitPercentage: 0,
    wholesalePrice: 0,
    preferredExitPrice: 0
  });

  // State for validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  
  // State for save/load dialogs
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [sellerAskingPrice, setSellerAskingPrice] = useState<number>(0);
  
  // Load saved deals on component mount
  useEffect(() => {
    const deals = getAllWholesaleDeals();
    setSavedDeals(deals);
  }, []);

  useEffect(() => {
    if (selectedDealId) {
      const savedDeal = getAllWholesaleDeals().find(deal => deal.key === selectedDealId);
      if (savedDeal) {
        setInputs(savedDeal.data.inputs);
        setResults(savedDeal.data.results);
      }
    }
  }, [selectedDealId]);

  // Handle input changes with validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setInputs({
      ...inputs,
      [name]: value
    });

    // If it's the seller's asking price field, update that state too
    if (name === 'sellerAskingPrice') {
      setSellerAskingPrice(parseFloat(value) || 0);
    }
  };

  // Validate all inputs before calculation
  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate required numeric fields
    if (!isValidPositiveNumber(inputs.arv)) {
      newErrors.arv = 'Please enter a valid positive number for ARV';
    }
    
    // Only require repair costs if neither square footage nor itemized costs are provided
    const hasSquareFootage = isValidPositiveNumber(inputs.squareFootage);
    const hasItemizedCosts = Object.values(inputs.rehabItems).some(item => isValidPositiveNumber(item));
    
    if (!hasSquareFootage && !hasItemizedCosts && !isValidPositiveNumber(inputs.repairCosts)) {
      newErrors.repairCosts = 'Please provide either repair costs, square footage, or itemized rehab breakdown';
    }
    
    // These fields are optional but should be valid if provided
    if (inputs.purchasePrice && !isValidPositiveNumber(inputs.purchasePrice)) {
      newErrors.purchasePrice = 'Please enter a valid positive number';
    }
    
    if (inputs.holdingCosts && !isValidPositiveNumber(inputs.holdingCosts)) {
      newErrors.holdingCosts = 'Please enter a valid positive number';
    }
    
    if (inputs.closingCosts && !isValidPositiveNumber(inputs.closingCosts)) {
      newErrors.closingCosts = 'Please enter a valid positive number';
    }
    
    if (inputs.wholesaleFee && !isValidPositiveNumber(inputs.wholesaleFee)) {
      newErrors.wholesaleFee = 'Please enter a valid positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to get exit percentage based on ARV
  const getExitPercentage = (arv: number): number => {
    if (arv < 150000) return ARV_EXIT_PERCENTAGES.UNDER_150K;
    if (arv < 200000) return ARV_EXIT_PERCENTAGES.UNDER_200K;
    if (arv < 300000) return ARV_EXIT_PERCENTAGES.UNDER_300K;
    if (arv < 400000) return ARV_EXIT_PERCENTAGES.UNDER_400K;
    return ARV_EXIT_PERCENTAGES.OVER_400K;
  };

  // Helper function to calculate quick repair costs based on square footage and condition
  const calculateQuickRepairCosts = (sqft: number, condition: 'easy' | 'medium' | 'bad'): number => {
    const costs = QUICK_REPAIR_COSTS[condition];
    if (sqft < 1500) return costs.under_1500;
    if (sqft < 2000) return costs.under_2000;
    if (sqft < 2500) return costs.under_2500;
    return costs.over_2500;
  };

  // Helper function to calculate total rehab costs from itemized breakdown
  const calculateTotalRehabCost = (items: WholesaleInputs['rehabItems']): number => {
    return Object.values(items).reduce((total, cost) => {
      return total + (parseFloat(cost) || 0);
    }, 0);
  };

  // Calculate the deal
  const calculateDeal = () => {
    if (!validateInputs()) {
      setNotification({
        open: true,
        message: 'Please correct the errors before calculating',
        severity: 'error'
      });
      return;
    }
    
    const purchasePrice = parseFloat(inputs.purchasePrice) || 0;
    const arv = parseFloat(inputs.arv) || 0;
    const holdingCosts = parseFloat(inputs.holdingCosts) || 0;
    const closingCosts = parseFloat(inputs.closingCosts) || 0;
    const wholesaleFee = parseFloat(inputs.wholesaleFee) || 0;
    const squareFootage = parseFloat(inputs.squareFootage) || 0;
    const manualRepairCosts = parseFloat(inputs.repairCosts) || 0;

    // Calculate exit percentage based on ARV (for display and exit price)
    const exitPercentage = getExitPercentage(arv);
    
    // Calculate the preferred exit price based on ARV and exit percentage
    const preferredExitPrice = arv * exitPercentage;

    // Determine repair costs - prioritize in this order:
    // 1. Square footage based estimate (if provided)
    // 2. Itemized breakdown total (if any items provided)
    // 3. Manual repair costs input
    let totalRehabCost = 0;
    if (squareFootage > 0) {
      totalRehabCost = calculateQuickRepairCosts(squareFootage, inputs.propertyCondition);
    } else {
      const itemizedTotal = calculateTotalRehabCost(inputs.rehabItems);
      totalRehabCost = itemizedTotal > 0 ? itemizedTotal : manualRepairCosts;
    }

    // Calculate assignment fee (5-10% of ARV or user input, whichever is greater)
    const assignmentFee = wholesaleFee > 0 ? wholesaleFee : Math.min(Math.max(arv * 0.05, 3000), arv * 0.10);
    
    // Fixed percentages as specified:
    // Preferred offer = (ARV * 66%) - rehab
    const preferredOffer = (arv * 0.66) - totalRehabCost;
    
    // Maximum offer = (ARV * 83%) - rehab
    const maxAllowableOffer = (arv * 0.83) - totalRehabCost;
    
    // Calculate wholesale price (what you sell the contract for)
    const wholesalePrice = preferredOffer + assignmentFee;
    
    // Calculate investor profit
    // Investor Profit = ARV - Wholesale Price - Rehab Costs - Holding Costs - Closing Costs
    const investorProfit = arv - wholesalePrice - totalRehabCost - holdingCosts - closingCosts;
    
    // Calculate potential profit for wholesaler (your profit)
    // Wholesaler Profit = Assignment Fee
    const potentialProfit = assignmentFee;
    
    // Calculate ROI for investor
    // ROI = (Investor Profit / (Wholesale Price + Rehab Costs + Holding Costs + Closing Costs)) * 100
    const totalInvestment = wholesalePrice + totalRehabCost + holdingCosts + closingCosts;
    const roi = totalInvestment > 0 ? (investorProfit / totalInvestment) * 100 : 0;
    
    // Calculate minimum score (should be ≥ 15%)
    // Minimum Score = (Investor Profit / ARV) * 100
    const minimumScore = arv > 0 ? (investorProfit / arv) * 100 : 0;

    setResults({
      maxAllowableOffer,
      potentialProfit,
      investorProfit,
      roi,
      preferredOffer,
      assignmentFee,
      minimumScore,
      totalRehabCost,
      exitPercentage: exitPercentage * 100,
      wholesalePrice,
      preferredExitPrice
    });
    
    setNotification({
      open: true,
      message: 'Deal calculated successfully!',
      severity: 'success'
    });

    // Check if wholesale is feasible by comparing MAO with seller's asking price
    if (sellerAskingPrice > 0 && sellerAskingPrice > maxAllowableOffer) {
      setShowAlternatives(true);
    } else {
      setShowAlternatives(false);
    }
  };
  
  // Save deal to localStorage
  const handleSave = () => {
    if (!inputs.dealName) {
      setNotification({
        open: true,
        message: 'Please enter a name for this deal',
        severity: 'warning'
      });
      return;
    }
    
    const dealKey = inputs.dealName.replace(/\s+/g, '_').toLowerCase();
    saveWholesaleDeal(dealKey, { inputs, results });
    
    // Refresh saved deals list
    setSavedDeals(getAllWholesaleDeals());
    setSaveDialogOpen(false);
    
    setNotification({
      open: true,
      message: `Deal "${inputs.dealName}" saved successfully!`,
      severity: 'success'
    });
  };
  
  // Load deal from localStorage
  const handleLoad = (deal: SavedDeal) => {
    setInputs(deal.data.inputs);
    setResults(deal.data.results);
    setLoadDialogOpen(false);
    
    setNotification({
      open: true,
      message: `Deal "${deal.data.inputs.dealName}" loaded successfully!`,
      severity: 'info'
    });
  };
  
  // Delete saved deal
  const handleDelete = (key: string, dealName: string) => {
    deleteWholesaleDeal(key);
    setSavedDeals(getAllWholesaleDeals());
    
    setNotification({
      open: true,
      message: `Deal "${dealName}" deleted successfully!`,
      severity: 'info'
    });
  };

  // Save alternative deal
  const handleSaveAlternativeDeal = (dealType: string, dealInputs: any, dealResults: any) => {
    const deal = storageService.saveDeal({
      type: dealType as "creative" | "advanced" | "wholesale" | "mortgage" | "apartment",
      name: `Alternative - ${dealInputs.purchasePrice ? formatCurrency(parseFloat(dealInputs.purchasePrice)) : 'Deal'}`,
      inputs: dealInputs,
      results: dealResults
    });

    // Show success message
    setNotification({
      open: true,
      message: `Alternative ${dealType} deal saved successfully!`,
      severity: 'success'
    });
  };

  // Prepare chart data
  const chartData = {
    labels: [
      'Purchase Price/Wholesale Price',
      'Total Rehab Cost',
      'Holding Costs',
      'Closing Costs',
      'Assignment Fee',
      'Investor Profit'
    ],
    datasets: [
      {
        data: [
          results.preferredOffer > 0 ? results.preferredOffer : (parseFloat(inputs.purchasePrice) || 0),
          results.totalRehabCost,
          parseFloat(inputs.holdingCosts) || 0,
          parseFloat(inputs.closingCosts) || 0,
          results.assignmentFee,
          results.investorProfit > 0 ? results.investorProfit : 0
        ],
        backgroundColor: [
          '#FF6384', // Red
          '#36A2EB', // Blue
          '#FFCE56', // Yellow
          '#4BC0C0', // Teal
          '#9966FF', // Purple
          '#4CAF50'  // Green
        ]
      }
    ]
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Wholesale Deal Calculator
      </Typography>
      <Typography variant="body1" paragraph>
        Calculate your wholesale deals using variable exit percentages based on property ARV ranges.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2}>
            <Box p={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Property Details
                </Typography>
                <Box>
                  <Tooltip title="Save this deal">
                    <IconButton 
                      color="primary" 
                      onClick={() => setSaveDialogOpen(true)}
                      size="small"
                    >
                      <SaveIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Load saved deal">
                    <IconButton 
                      color="secondary" 
                      onClick={() => setLoadDialogOpen(true)}
                      size="small"
                    >
                      <FolderOpenIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Deal Name"
                    name="dealName"
                    value={inputs.dealName}
                    onChange={handleInputChange}
                    variant="outlined"
                    placeholder="E.g., 123 Main St Wholesale"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="After Repair Value (ARV) ($)"
                    name="arv"
                    type="number"
                    value={inputs.arv}
                    onChange={handleInputChange}
                    variant="outlined"
                    error={!!errors.arv}
                    helperText={errors.arv}
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="The estimated value of the property after all repairs are completed">
                            <InfoIcon fontSize="small" color="action" />
                          </Tooltip>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Quick Repair Estimate
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Square Footage"
                        name="squareFootage"
                        type="number"
                        value={inputs.squareFootage}
                        onChange={handleInputChange}
                        variant="outlined"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title="Enter square footage for a quick repair estimate">
                                <InfoIcon fontSize="small" color="action" />
                              </Tooltip>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>Property Condition</InputLabel>
                        <Select
                          value={inputs.propertyCondition}
                          onChange={(e) => setInputs({...inputs, propertyCondition: e.target.value as 'easy' | 'medium' | 'bad'})}
                          label="Property Condition"
                        >
                          <MenuItem value="easy">Easy Fix</MenuItem>
                          <MenuItem value="medium">Needs Work</MenuItem>
                          <MenuItem value="bad">Wow, This is BAD</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  {inputs.squareFootage && isValidPositiveNumber(inputs.squareFootage) && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Estimated repair cost based on {inputs.squareFootage} sqft ({inputs.propertyCondition} condition): 
                      {formatCurrency(calculateQuickRepairCosts(parseFloat(inputs.squareFootage), inputs.propertyCondition))}
                    </Alert>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Detailed Rehab Budget
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Kitchen ($)"
                        name="kitchen"
                        type="number"
                        value={inputs.rehabItems.kitchen}
                        onChange={(e) => setInputs({
                          ...inputs,
                          rehabItems: {...inputs.rehabItems, kitchen: e.target.value}
                        })}
                        variant="outlined"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Bathrooms ($)"
                        name="bathrooms"
                        type="number"
                        value={inputs.rehabItems.bathrooms}
                        onChange={(e) => setInputs({
                          ...inputs,
                          rehabItems: {...inputs.rehabItems, bathrooms: e.target.value}
                        })}
                        variant="outlined"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Flooring ($)"
                        name="flooring"
                        type="number"
                        value={inputs.rehabItems.flooring}
                        onChange={(e) => setInputs({
                          ...inputs,
                          rehabItems: {...inputs.rehabItems, flooring: e.target.value}
                        })}
                        variant="outlined"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Paint ($)"
                        name="paint"
                        type="number"
                        value={inputs.rehabItems.paint}
                        onChange={(e) => setInputs({
                          ...inputs,
                          rehabItems: {...inputs.rehabItems, paint: e.target.value}
                        })}
                        variant="outlined"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="HVAC ($)"
                        name="hvac"
                        type="number"
                        value={inputs.rehabItems.hvac}
                        onChange={(e) => setInputs({
                          ...inputs,
                          rehabItems: {...inputs.rehabItems, hvac: e.target.value}
                        })}
                        variant="outlined"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Roof ($)"
                        name="roof"
                        type="number"
                        value={inputs.rehabItems.roof}
                        onChange={(e) => setInputs({
                          ...inputs,
                          rehabItems: {...inputs.rehabItems, roof: e.target.value}
                        })}
                        variant="outlined"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Other Repairs ($)"
                        name="other"
                        type="number"
                        value={inputs.rehabItems.other}
                        onChange={(e) => setInputs({
                          ...inputs,
                          rehabItems: {...inputs.rehabItems, other: e.target.value}
                        })}
                        variant="outlined"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                      />
                    </Grid>
                  </Grid>
                  {calculateTotalRehabCost(inputs.rehabItems) > 0 && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Total from itemized budget: {formatCurrency(calculateTotalRehabCost(inputs.rehabItems))}
                    </Alert>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Alternative: Simple Entry
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Purchase Price ($)"
                        name="purchasePrice"
                        type="number"
                        value={inputs.purchasePrice}
                        onChange={handleInputChange}
                        variant="outlined"
                        error={!!errors.purchasePrice}
                        helperText={errors.purchasePrice || "Actual purchase amount (for comparison only)"}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title="The actual price you plan to pay. This does not affect MAO or Preferred Offer calculations.">
                                <InfoIcon fontSize="small" color="action" />
                              </Tooltip>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Repair Costs (simple) ($)"
                        name="repairCosts"
                        type="number"
                        value={inputs.repairCosts}
                        onChange={handleInputChange}
                        variant="outlined"
                        error={!!errors.repairCosts}
                        helperText={errors.repairCosts || "Only used if no square footage or itemized repairs provided"}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title="Fallback repair cost estimate if detailed breakdowns not provided">
                                <InfoIcon fontSize="small" color="action" />
                              </Tooltip>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Additional Costs
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Holding Costs ($)"
                        name="holdingCosts"
                        type="number"
                        value={inputs.holdingCosts}
                        onChange={handleInputChange}
                        variant="outlined"
                        error={!!errors.holdingCosts}
                        helperText={errors.holdingCosts}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title="Costs incurred while holding the property (taxes, utilities, etc.)">
                                <InfoIcon fontSize="small" color="action" />
                              </Tooltip>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Closing Costs ($)"
                        name="closingCosts"
                        type="number"
                        value={inputs.closingCosts}
                        onChange={handleInputChange}
                        variant="outlined"
                        error={!!errors.closingCosts}
                        helperText={errors.closingCosts}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Wholesale Fee / Assignment Fee ($)"
                        name="wholesaleFee"
                        type="number"
                        value={inputs.wholesaleFee}
                        onChange={handleInputChange}
                        variant="outlined"
                        error={!!errors.wholesaleFee}
                        helperText={errors.wholesaleFee || "Your fee for assigning the contract (5-10% of ARV if left blank)"}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title="Your fee for wholesaling this property (5-10% of ARV if left blank)">
                                <InfoIcon fontSize="small" color="action" />
                              </Tooltip>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Seller's Asking Price ($)"
                    name="sellerAskingPrice"
                    type="number"
                    value={sellerAskingPrice || ''}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="The price the seller is asking for the property">
                            <InfoIcon fontSize="small" color="action" />
                          </Tooltip>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    onClick={calculateDeal}
                    size="large"
                  >
                    Calculate Deal
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Deal Analysis
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body1">
                          Exit Percentage
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Based on ARV range (60-80%)
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" color="primary">
                          {results.exitPercentage.toFixed(1)}%
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body1">
                          Preferred Exit Price
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ARV × {(results.exitPercentage/100).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" color="primary">
                          {formatCurrency(results.preferredExitPrice)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body1" fontWeight="bold">
                          Preferred Offer to Seller
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          (ARV × 66%) - Rehab Costs
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" fontWeight="bold" color={results.preferredOffer < 0 ? "error" : "primary"}>
                          {formatCurrency(results.preferredOffer)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body1">
                          Maximum Allowable Offer (MAO)
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          (ARV × 83%) - Rehab Costs
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" color={results.maxAllowableOffer < 0 ? "error" : "primary"}>
                          {formatCurrency(results.maxAllowableOffer)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body1">
                          Assignment Fee
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Your wholesale profit
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" color="primary">
                          {formatCurrency(results.assignmentFee)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body1" fontWeight="bold">
                          Wholesale Price to Buyer
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Preferred offer + assignment fee
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {formatCurrency(results.wholesalePrice)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body1">
                          Total Rehab Cost
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Estimated repair costs
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" color="primary">
                          {formatCurrency(results.totalRehabCost)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body1">
                          Your Profit (Wholesale)
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Assignment fee (what you earn)
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" color={results.potentialProfit < 0 ? "error" : "primary"}>
                          {formatCurrency(results.potentialProfit)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body1">
                          Investor's Potential Profit
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ARV - Wholesale Price - Rehab - Holding - Closing
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" color={results.investorProfit < 0 ? "error" : "primary"}>
                          {formatCurrency(results.investorProfit)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body1">
                          Investor's ROI
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Return on investment for the end buyer
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" color={results.roi < 15 ? "warning" : "primary"}>
                          {results.roi.toFixed(2)}%
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body1">
                          Minimum Score
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Investor profit as percentage of ARV (target ≥ 15%)
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" color={results.minimumScore < 15 ? "warning" : "primary"}>
                          {results.minimumScore.toFixed(2)}%
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Box mt={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Deal Breakdown
                </Typography>
                <Box height={300}>
                  <Doughnut data={chartData} options={{ maintainAspectRatio: false }} />
                </Box>
                
                {results.maxAllowableOffer < 0 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    The Maximum Allowable Offer is negative, which suggests this deal may not be viable for wholesaling.
                  </Alert>
                )}
                
                {results.investorProfit < 0 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    The Investor's Potential Profit is negative, which makes this deal unattractive to potential buyers.
                  </Alert>
                )}
                
                {results.roi < 15 && results.roi > 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    The Investor's ROI is below 15%, which may be lower than what many investors target for fix-and-flip deals.
                  </Alert>
                )}

                {results.minimumScore < 15 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    The Minimum Score is below 15%, which indicates this deal may not provide sufficient profit margin for the investor.
                  </Alert>
                )}

                {results.preferredOffer < 0 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    The Preferred Offer is negative, which suggests this deal may need to be restructured or renegotiated.
                  </Alert>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Deal</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Deal Name"
            fullWidth
            variant="outlined"
            value={inputs.dealName}
            onChange={(e) => setInputs({...inputs, dealName: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Load Dialog */}
      <Dialog 
        open={loadDialogOpen} 
        onClose={() => setLoadDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Load Saved Deal</DialogTitle>
        <DialogContent>
          {savedDeals.length === 0 ? (
            <Typography>No saved deals found.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableBody>
                  {savedDeals.map((deal) => (
                    <TableRow key={deal.key} hover>
                      <TableCell>{deal.data.inputs.dealName}</TableCell>
                      <TableCell>{formatCurrency(deal.data.results.maxAllowableOffer)}</TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={() => handleLoad(deal)}
                        >
                          Load
                        </Button>
                        <Button 
                          size="small" 
                          color="error" 
                          onClick={() => handleDelete(deal.key, deal.data.inputs.dealName)}
                          sx={{ ml: 1 }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoadDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Show the Deal Alternatives component if the wholesale deal is not feasible */}
      {results && showAlternatives && (
        <Box mt={4}>
          <Divider sx={{ mb: 4 }} />
          <DealAlternatives
            wholesaleInputs={inputs}
            wholesaleResults={results}
            sellerAskingPrice={sellerAskingPrice}
            onSaveDeal={handleSaveAlternativeDeal}
          />
        </Box>
      )}
    </Box>
  );
};

export default WholesaleCalculator; 