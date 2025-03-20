import React, { useState, useEffect } from 'react';
import {
  Box, 
  Paper, 
  Typography, 
  Grid, 
  TextField, 
  Button, 
  Slider, 
  Divider,
  Card, 
  CardContent,
  Alert,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Collapse,
  Stack,
  FormControlLabel,
  Switch,
  LinearProgress,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

// Types for the deal analyzer
interface DealInputs {
  propertyAddress: string;
  purchasePrice: number;
  afterRepairValue: number;
  rehabCosts: number;
  holdingCosts: number;
  closingCosts: number;
  desiredProfit: number;
  desiredROI: number;
}

interface DealAnalysis {
  maximumAllowableOffer: number;
  potentialProfit: number;
  cashOnCashReturn: number;
  capRate: number;
  isViable: boolean;
  meetsCriteria: boolean;
  dealScore: number;
}

interface CreativeFinancingOption {
  strategy: string;
  downPayment: number;
  interestRate: number;
  term: number;
  monthlyPayment: number;
  totalCost: number;
  benefits: string[];
}

interface SensitivityScenario {
  name: string;
  arv: number;
  rehabCosts: number;
  profit: number;
  roi: number;
  isViable: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

const AutomatedDealAnalyzer: React.FC = () => {
  // Default values
  const defaultInputs: DealInputs = {
    propertyAddress: '',
    purchasePrice: 150000,
    afterRepairValue: 250000,
    rehabCosts: 35000,
    holdingCosts: 5000,
    closingCosts: 7500,
    desiredProfit: 25000,
    desiredROI: 15
  };

  // State
  const [inputs, setInputs] = useState<DealInputs>(defaultInputs);
  const [analysis, setAnalysis] = useState<DealAnalysis>({
    maximumAllowableOffer: 0,
    potentialProfit: 0,
    cashOnCashReturn: 0,
    capRate: 0,
    isViable: false,
    meetsCriteria: false,
    dealScore: 0
  });
  const [creativeOptions, setCreativeOptions] = useState<CreativeFinancingOption[]>([]);
  const [showCreativeOptions, setShowCreativeOptions] = useState(false);
  const [sensitivityAnalysis, setSensitivityAnalysis] = useState(false);
  const [rehabRange, setRehabRange] = useState<[number, number]>([inputs.rehabCosts * 0.8, inputs.rehabCosts * 1.2]);
  const [arvRange, setArvRange] = useState<[number, number]>([inputs.afterRepairValue * 0.9, inputs.afterRepairValue * 1.1]);
  const [sensitivityScenarios, setSensitivityScenarios] = useState<SensitivityScenario[]>([]);
  const [riskInsights, setRiskInsights] = useState<string[]>([]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: name === 'propertyAddress' ? value : Number(value)
    });
  };

  // Calculate deal metrics
  const calculateDealMetrics = () => {
    // Calculate Maximum Allowable Offer (MAO)
    const mao = 
      inputs.afterRepairValue - 
      inputs.rehabCosts - 
      inputs.holdingCosts - 
      inputs.closingCosts - 
      inputs.desiredProfit;

    // Calculate potential profit if purchased at asking price
    const potentialProfit = 
      inputs.afterRepairValue - 
      inputs.purchasePrice - 
      inputs.rehabCosts - 
      inputs.holdingCosts - 
      inputs.closingCosts;

    // Calculate cash-on-cash return
    const totalInvestment = 
      inputs.purchasePrice + 
      inputs.rehabCosts + 
      inputs.holdingCosts + 
      inputs.closingCosts;
    
    const cashOnCashReturn = (potentialProfit / totalInvestment) * 100;

    // Simplified cap rate calculation (assuming rental property)
    // In a real app, you'd need rental income data
    const estimatedAnnualRent = inputs.afterRepairValue * 0.08; // 8% of ARV as annual rent (simplified)
    const estimatedExpenses = estimatedAnnualRent * 0.4; // 40% for expenses (simplified)
    const netOperatingIncome = estimatedAnnualRent - estimatedExpenses;
    const capRate = (netOperatingIncome / totalInvestment) * 100;

    // Determine if deal is viable
    const isViable = mao >= inputs.purchasePrice;
    
    // Determine if deal meets investor's criteria
    const meetsCriteria = cashOnCashReturn >= inputs.desiredROI;

    // Calculate deal score (0-100)
    const profitScore = Math.min(100, (potentialProfit / inputs.desiredProfit) * 50);
    const roiScore = Math.min(50, (cashOnCashReturn / inputs.desiredROI) * 50);
    const dealScore = Math.min(100, profitScore + roiScore);

    return {
      maximumAllowableOffer: mao,
      potentialProfit,
      cashOnCashReturn,
      capRate,
      isViable,
      meetsCriteria,
      dealScore
    };
  };

  // Generate creative financing options
  const generateCreativeOptions = () => {
    const options: CreativeFinancingOption[] = [];
    const gap = inputs.purchasePrice - analysis.maximumAllowableOffer;

    // Only generate if there's a significant gap
    if (gap > 0) {
      // Option 1: Seller Financing
      const sellerOption: CreativeFinancingOption = {
        strategy: 'Seller Financing',
        downPayment: analysis.maximumAllowableOffer * 0.2,
        interestRate: 6,
        term: 5,
        monthlyPayment: 0,
        totalCost: 0,
        benefits: [
          'Lower upfront cash needed',
          'No bank qualifying required',
          'Potentially lower interest rates',
          'Flexible terms negotiable with seller'
        ]
      };

      // Calculate payment for seller financing
      const loanAmount = inputs.purchasePrice - sellerOption.downPayment;
      const monthlyRate = sellerOption.interestRate / 100 / 12;
      const numPayments = sellerOption.term * 12;
      sellerOption.monthlyPayment = 
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
        (Math.pow(1 + monthlyRate, numPayments) - 1);
      sellerOption.totalCost = sellerOption.monthlyPayment * numPayments + sellerOption.downPayment;

      options.push(sellerOption);

      // Option 2: Lease Option
      options.push({
        strategy: 'Lease Option',
        downPayment: analysis.maximumAllowableOffer * 0.1, // option fee
        interestRate: 0, // not applicable
        term: 3,
        monthlyPayment: inputs.afterRepairValue * 0.007, // 0.7% of ARV as monthly rent
        totalCost: (inputs.afterRepairValue * 0.007 * 36) + (analysis.maximumAllowableOffer * 0.1),
        benefits: [
          'Minimal upfront investment',
          'Time to arrange permanent financing',
          'Lock in purchase price today',
          'Generate cashflow while securing future equity'
        ]
      });

      // Option 3: Subject-To Existing Financing
      options.push({
        strategy: 'Subject-To',
        downPayment: 5000, // token down payment to seller
        interestRate: 4.5, // assumed existing mortgage rate
        term: 30 - 5, // assuming 5 years into a 30-year mortgage
        monthlyPayment: 650, // assumed existing mortgage payment
        totalCost: (650 * 12 * 25) + 5000, // simplified
        benefits: [
          'Take over existing financing',
          'No loan qualification needed',
          'Close quickly',
          'Usually lower interest rate than new loans'
        ]
      });
    }

    return options;
  };

  // Calculate sensitivity analysis
  const calculateSensitivityScenarios = () => {
    const scenarios: SensitivityScenario[] = [];
    const arvFactors = [0.8, 0.9, 1.0, 1.1, 1.2];
    const rehabFactors = [0.5, 0.75, 1.0, 1.25, 1.5];

    arvFactors.forEach(arvFactor => {
      rehabFactors.forEach(rehabFactor => {
        const arv = inputs.afterRepairValue * arvFactor;
        const rehabCosts = inputs.rehabCosts * rehabFactor;
        const totalCost = inputs.purchasePrice + rehabCosts + inputs.holdingCosts + inputs.closingCosts;
        const profit = arv - totalCost;
        const roi = (profit / totalCost) * 100;
        
        const riskLevel = roi >= inputs.desiredROI ? 'low' :
                         roi >= inputs.desiredROI * 0.7 ? 'medium' : 'high';

        scenarios.push({
          name: `ARV ${(arvFactor * 100).toFixed(0)}%, Rehab ${(rehabFactor * 100).toFixed(0)}%`,
          arv,
          rehabCosts,
          profit,
          roi,
          isViable: roi >= inputs.desiredROI * 0.7,
          riskLevel
        });
      });
    });

    setSensitivityScenarios(scenarios);

    // Calculate risk insights
    const insights: string[] = [];
    const viableScenarios = scenarios.filter(s => s.isViable);
    const totalScenarios = scenarios.length;
    const viabilityRate = (viableScenarios.length / totalScenarios) * 100;

    if (viabilityRate < 30) {
      insights.push('High risk: Less than 30% of scenarios are viable');
    } else if (viabilityRate < 50) {
      insights.push('Moderate risk: Less than 50% of scenarios are viable');
    }

    const arvSensitivity = scenarios.filter(s => s.arv < inputs.afterRepairValue).length / scenarios.length;
    if (arvSensitivity > 0.6) {
      insights.push('High ARV sensitivity: Deal is very sensitive to ARV variations');
    }

    const rehabSensitivity = scenarios.filter(s => s.rehabCosts > inputs.rehabCosts).length / scenarios.length;
    if (rehabSensitivity > 0.6) {
      insights.push('High rehab cost sensitivity: Deal is very sensitive to rehab cost variations');
    }

    setRiskInsights(insights);
  };

  // Update analysis when inputs change
  useEffect(() => {
    const newAnalysis = calculateDealMetrics();
    setAnalysis(newAnalysis);
    
    const options = generateCreativeOptions();
    setCreativeOptions(options);
    
    // Update sensitivity ranges when base values change
    setRehabRange([inputs.rehabCosts * 0.8, inputs.rehabCosts * 1.2]);
    setArvRange([inputs.afterRepairValue * 0.9, inputs.afterRepairValue * 1.1]);
    
    calculateSensitivityScenarios();
  }, [inputs]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format percentage
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Automated Deal Analysis
      </Typography>
      
      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Deal Inputs
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Property Address"
                  name="propertyAddress"
                  value={inputs.propertyAddress}
                  onChange={handleInputChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Purchase Price"
                  name="purchasePrice"
                  type="number"
                  value={inputs.purchasePrice}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="After Repair Value (ARV)"
                  name="afterRepairValue"
                  type="number"
                  value={inputs.afterRepairValue}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Rehab Costs"
                  name="rehabCosts"
                  type="number"
                  value={inputs.rehabCosts}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Holding Costs"
                  name="holdingCosts"
                  type="number"
                  value={inputs.holdingCosts}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Closing Costs"
                  name="closingCosts"
                  type="number"
                  value={inputs.closingCosts}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Desired Profit"
                  name="desiredProfit"
                  type="number"
                  value={inputs.desiredProfit}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography gutterBottom>
                  Desired ROI: {inputs.desiredROI}%
                </Typography>
                <Slider
                  value={inputs.desiredROI}
                  onChange={(_, newValue) => 
                    setInputs({ ...inputs, desiredROI: newValue as number })
                  }
                  min={5}
                  max={30}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Results Section */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Deal Analysis
            </Typography>
            
            {/* Deal Score */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                Deal Score: {analysis.dealScore.toFixed(0)}/100
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={analysis.dealScore} 
                color={analysis.dealScore >= 70 ? "success" : analysis.dealScore >= 40 ? "warning" : "error"}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            
            {/* Go/No-Go Recommendation */}
            <Box sx={{ mb: 2 }}>
              {analysis.meetsCriteria ? (
                <Alert 
                  severity="success"
                  icon={<CheckCircleIcon fontSize="inherit" />}
                >
                  ✅ GO: This deal meets your {inputs.desiredROI}% ROI goal with a projected return of {formatPercent(analysis.cashOnCashReturn)}.
                </Alert>
              ) : (
                <Alert 
                  severity="error"
                  icon={<CancelIcon fontSize="inherit" />}
                >
                  🛑 NO-GO: This deal does not meet your {inputs.desiredROI}% ROI goal with a projected return of only {formatPercent(analysis.cashOnCashReturn)}.
                </Alert>
              )}
            </Box>
            
            {/* MAO vs Asking Price */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Maximum Allowable Offer (MAO)
                    </Typography>
                    <Typography variant="h6" color={analysis.isViable ? "success.main" : "error.main"}>
                      {formatCurrency(analysis.maximumAllowableOffer)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Asking Price
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(inputs.purchasePrice)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Key Metrics */}
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Potential Profit
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        color={analysis.potentialProfit >= inputs.desiredProfit ? "success.main" : "error.main"}
                      >
                        {formatCurrency(analysis.potentialProfit)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Cash-on-Cash Return
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        color={analysis.cashOnCashReturn >= inputs.desiredROI ? "success.main" : "error.main"}
                      >
                        {formatPercent(analysis.cashOnCashReturn)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Cap Rate (Rental Scenario)
                    </TableCell>
                    <TableCell align="right">
                      {formatPercent(analysis.capRate)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Creative Financing Options */}
            {creativeOptions.length > 0 && !analysis.isViable && (
              <Box sx={{ mb: 2 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    mb: 1 
                  }}
                  onClick={() => setShowCreativeOptions(!showCreativeOptions)}
                >
                  <Typography variant="h6">
                    Creative Financing Options
                  </Typography>
                  <IconButton size="small">
                    {showCreativeOptions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
                
                <Collapse in={showCreativeOptions}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Traditional financing may not work for this deal. Consider these alternative approaches:
                  </Alert>
                  
                  <Grid container spacing={2}>
                    {creativeOptions.map((option, index) => (
                      <Grid item xs={12} md={4} key={index}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {option.strategy}
                            </Typography>
                            
                            <Typography variant="body2" gutterBottom>
                              Down Payment: {formatCurrency(option.downPayment)}
                            </Typography>
                            
                            {option.interestRate > 0 && (
                              <Typography variant="body2" gutterBottom>
                                Interest Rate: {option.interestRate}%
                              </Typography>
                            )}
                            
                            <Typography variant="body2" gutterBottom>
                              Term: {option.term} years
                            </Typography>
                            
                            <Typography variant="body2" gutterBottom>
                              Monthly Payment: {formatCurrency(option.monthlyPayment)}
                            </Typography>
                            
                            <Divider sx={{ my: 1 }} />
                            
                            <Typography variant="subtitle2" gutterBottom>
                              Benefits:
                            </Typography>
                            
                            <Box component="ul" sx={{ pl: 2, mt: 0 }}>
                              {option.benefits.map((benefit, i) => (
                                <Typography component="li" variant="body2" key={i}>
                                  {benefit}
                                </Typography>
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Collapse>
              </Box>
            )}
            
            {/* What-If Scenarios */}
            <Box>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  mb: 1 
                }}
                onClick={() => setSensitivityAnalysis(!sensitivityAnalysis)}
              >
                <Typography variant="h6">
                  What-If Scenarios
                </Typography>
                <IconButton size="small">
                  {sensitivityAnalysis ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              
              <Collapse in={sensitivityAnalysis}>
                <Grid container spacing={3}>
                  {/* ARV Sensitivity */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        ARV Sensitivity Analysis
                      </Typography>
                      
                      <Box sx={{ height: 300, mb: 2 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={sensitivityScenarios.filter(s => s.rehabCosts === inputs.rehabCosts)}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <RechartsTooltip 
                              formatter={(value: number, name: string) => [
                                name === 'profit' ? formatCurrency(value) : `${value.toFixed(1)}%`,
                                name === 'profit' ? 'Profit' : 'ROI'
                              ]}
                            />
                            <Legend />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="profit"
                              stroke="#8884d8"
                              name="Profit"
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="roi"
                              stroke="#82ca9d"
                              name="ROI"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>

                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>ARV</TableCell>
                              <TableCell align="right">Profit</TableCell>
                              <TableCell align="right">ROI</TableCell>
                              <TableCell align="center">Risk Level</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {sensitivityScenarios
                              .filter(s => s.rehabCosts === inputs.rehabCosts)
                              .map((scenario, index) => (
                                <TableRow key={index}>
                                  <TableCell>{formatCurrency(scenario.arv)}</TableCell>
                                  <TableCell align="right">{formatCurrency(scenario.profit)}</TableCell>
                                  <TableCell 
                                    align="right"
                                    sx={{ 
                                      color: scenario.roi >= inputs.desiredROI ? 'success.main' : 'error.main' 
                                    }}
                                  >
                                    {formatPercent(scenario.roi)}
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip 
                                      label={scenario.riskLevel.toUpperCase()} 
                                      size="small"
                                      color={
                                        scenario.riskLevel === 'low' ? 'success' :
                                        scenario.riskLevel === 'medium' ? 'warning' : 'error'
                                      }
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </Grid>

                  {/* Rehab Costs Sensitivity */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Rehab Costs Sensitivity Analysis
                      </Typography>
                      
                      <Box sx={{ height: 300, mb: 2 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={sensitivityScenarios.filter(s => s.arv === inputs.afterRepairValue)}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <RechartsTooltip 
                              formatter={(value: number, name: string) => [
                                name === 'profit' ? formatCurrency(value) : `${value.toFixed(1)}%`,
                                name === 'profit' ? 'Profit' : 'ROI'
                              ]}
                            />
                            <Legend />
                            <Bar
                              yAxisId="left"
                              dataKey="profit"
                              fill="#8884d8"
                              name="Profit"
                            />
                            <Bar
                              yAxisId="right"
                              dataKey="roi"
                              fill="#82ca9d"
                              name="ROI"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>

                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Rehab Costs</TableCell>
                              <TableCell align="right">Profit</TableCell>
                              <TableCell align="right">ROI</TableCell>
                              <TableCell align="center">Risk Level</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {sensitivityScenarios
                              .filter(s => s.arv === inputs.afterRepairValue)
                              .map((scenario, index) => (
                                <TableRow key={index}>
                                  <TableCell>{formatCurrency(scenario.rehabCosts)}</TableCell>
                                  <TableCell align="right">{formatCurrency(scenario.profit)}</TableCell>
                                  <TableCell 
                                    align="right"
                                    sx={{ 
                                      color: scenario.roi >= inputs.desiredROI ? 'success.main' : 'error.main' 
                                    }}
                                  >
                                    {formatPercent(scenario.roi)}
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip 
                                      label={scenario.riskLevel.toUpperCase()} 
                                      size="small"
                                      color={
                                        scenario.riskLevel === 'low' ? 'success' :
                                        scenario.riskLevel === 'medium' ? 'warning' : 'error'
                                      }
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </Grid>

                  {/* Risk Assessment Summary */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Risk Assessment Summary
                      </Typography>
                      
                      {riskInsights.length > 0 ? (
                        <Stack spacing={1}>
                          {riskInsights.map((insight, index) => (
                            <Alert key={index} severity="warning">
                              {insight}
                            </Alert>
                          ))}
                        </Stack>
                      ) : (
                        <Alert severity="success">
                          Deal shows good resilience to variations in key variables
                        </Alert>
                      )}

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          Deal Viability Rate: {((sensitivityScenarios.filter(s => s.isViable).length / sensitivityScenarios.length) * 100).toFixed(1)}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={(sensitivityScenarios.filter(s => s.isViable).length / sensitivityScenarios.length) * 100}
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Collapse>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AutomatedDealAnalyzer; 