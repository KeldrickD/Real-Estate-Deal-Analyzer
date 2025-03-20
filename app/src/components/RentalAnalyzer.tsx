import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface RentalInputs {
  // Common inputs
  purchasePrice: number;
  downPayment: number;
  interestRate: number;
  termYears: number;
  rehabCosts: number;
  propertyTaxes: number;
  insurance: number;
  maintenance: number;
  utilities: number;
  
  // Long-term rental specific
  monthlyRent: number;
  vacancyRate: number;
  propertyManagement: number;
  
  // Short-term rental specific
  nightlyRate: number;
  occupancyRate: number;
  cleaningFee: number;
  platformFee: number;
  seasonalAdjustment: number;
}

interface RentalAnalysis {
  // Common metrics
  monthlyMortgage: number;
  totalMonthlyExpenses: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  capRate: number;
  roi: number;
  grossRentMultiplier: number;
  cashOnCashReturn: number;
  
  // Long-term specific
  vacancyRate: number;
  
  // Short-term specific
  breakEvenOccupancy: number;
  annualRevenue: number;
  averageDailyRate: number;
  seasonalRevenue: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`rental-tabpanel-${index}`}
      aria-labelledby={`rental-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const RentalAnalyzer: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [inputs, setInputs] = useState<RentalInputs>({
    purchasePrice: 300000,
    downPayment: 20,
    interestRate: 6.5,
    termYears: 30,
    rehabCosts: 20000,
    propertyTaxes: 3000,
    insurance: 1200,
    maintenance: 200,
    utilities: 150,
    monthlyRent: 2000,
    vacancyRate: 5,
    propertyManagement: 8,
    nightlyRate: 150,
    occupancyRate: 75,
    cleaningFee: 50,
    platformFee: 15,
    seasonalAdjustment: 10
  });

  const [analysis, setAnalysis] = useState<RentalAnalysis>({
    monthlyMortgage: 0,
    totalMonthlyExpenses: 0,
    monthlyCashFlow: 0,
    annualCashFlow: 0,
    capRate: 0,
    roi: 0,
    grossRentMultiplier: 0,
    cashOnCashReturn: 0,
    vacancyRate: 0,
    breakEvenOccupancy: 0,
    annualRevenue: 0,
    averageDailyRate: 0,
    seasonalRevenue: 0
  });

  const [marketData, setMarketData] = useState({
    averageLongTermRent: 2000,
    averageShortTermRate: 150,
    marketOccupancyRate: 75,
    marketVacancyRate: 5
  });

  const [recommendation, setRecommendation] = useState<{
    strategy: 'long-term' | 'short-term' | 'mixed';
    reasoning: string[];
    risks: string[];
  }>({
    strategy: 'long-term',
    reasoning: [],
    risks: []
  });

  // Calculate monthly mortgage payment
  const calculateMortgage = (principal: number, rate: number, years: number) => {
    const monthlyRate = rate / 12 / 100;
    const numberOfPayments = years * 12;
    return (
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    );
  };

  // Calculate long-term rental metrics
  const calculateLongTermMetrics = (): RentalAnalysis => {
    const downPaymentAmount = (inputs.purchasePrice * inputs.downPayment) / 100;
    const loanAmount = inputs.purchasePrice - downPaymentAmount;
    const monthlyMortgage = calculateMortgage(
      loanAmount,
      inputs.interestRate,
      inputs.termYears
    );

    const monthlyExpenses =
      monthlyMortgage +
      inputs.propertyTaxes / 12 +
      inputs.insurance / 12 +
      inputs.maintenance +
      inputs.utilities +
      (inputs.monthlyRent * inputs.propertyManagement) / 100;

    const effectiveGrossIncome = inputs.monthlyRent * (1 - inputs.vacancyRate / 100);
    const monthlyCashFlow = effectiveGrossIncome - monthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    const capRate = (annualCashFlow / inputs.purchasePrice) * 100;
    const roi = (annualCashFlow / downPaymentAmount) * 100;
    const grossRentMultiplier = inputs.purchasePrice / (inputs.monthlyRent * 12);
    const cashOnCashReturn = (annualCashFlow / downPaymentAmount) * 100;

    return {
      monthlyMortgage,
      totalMonthlyExpenses: monthlyExpenses,
      monthlyCashFlow,
      annualCashFlow,
      capRate,
      roi,
      grossRentMultiplier,
      cashOnCashReturn,
      vacancyRate: inputs.vacancyRate,
      breakEvenOccupancy: 0,
      annualRevenue: 0,
      averageDailyRate: 0,
      seasonalRevenue: 0
    };
  };

  // Calculate short-term rental metrics
  const calculateShortTermMetrics = (): RentalAnalysis => {
    const downPaymentAmount = (inputs.purchasePrice * inputs.downPayment) / 100;
    const loanAmount = inputs.purchasePrice - downPaymentAmount;
    const monthlyMortgage = calculateMortgage(
      loanAmount,
      inputs.interestRate,
      inputs.termYears
    );

    const monthlyExpenses =
      monthlyMortgage +
      inputs.propertyTaxes / 12 +
      inputs.insurance / 12 +
      inputs.maintenance +
      inputs.utilities;

    const nightsPerMonth = 30 * (inputs.occupancyRate / 100);
    const monthlyRevenue =
      nightsPerMonth * inputs.nightlyRate * (1 + inputs.seasonalAdjustment / 100);
    const platformFees = (monthlyRevenue * inputs.platformFee) / 100;
    const cleaningFees = nightsPerMonth * inputs.cleaningFee;
    const effectiveMonthlyRevenue = monthlyRevenue - platformFees - cleaningFees;
    const monthlyCashFlow = effectiveMonthlyRevenue - monthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    const capRate = (annualCashFlow / inputs.purchasePrice) * 100;
    const roi = (annualCashFlow / downPaymentAmount) * 100;

    // Calculate break-even occupancy
    const fixedCosts = monthlyExpenses;
    const revenuePerNight =
      inputs.nightlyRate * (1 - inputs.platformFee / 100) - inputs.cleaningFee;
    const breakEvenNights = fixedCosts / revenuePerNight;
    const breakEvenOccupancy = (breakEvenNights / 30) * 100;

    return {
      monthlyMortgage,
      totalMonthlyExpenses: monthlyExpenses,
      monthlyCashFlow,
      annualCashFlow,
      capRate,
      roi,
      grossRentMultiplier: 0,
      cashOnCashReturn: 0,
      vacancyRate: 0,
      breakEvenOccupancy,
      annualRevenue: monthlyRevenue * 12,
      averageDailyRate: inputs.nightlyRate * (1 + inputs.seasonalAdjustment / 100),
      seasonalRevenue: monthlyRevenue * 12
    };
  };

  // Generate rental strategy recommendation
  const generateRecommendation = () => {
    const longTermMetrics = calculateLongTermMetrics();
    const shortTermMetrics = calculateShortTermMetrics();
    
    const reasoning: string[] = [];
    const risks: string[] = [];
    let strategy: 'long-term' | 'short-term' | 'mixed' = 'long-term';

    // Compare metrics
    if (shortTermMetrics.annualCashFlow > longTermMetrics.annualCashFlow * 1.2) {
      reasoning.push('Short-term rental shows significantly higher annual cash flow');
      strategy = 'short-term';
    } else if (longTermMetrics.annualCashFlow > shortTermMetrics.annualCashFlow * 1.2) {
      reasoning.push('Long-term rental shows significantly higher annual cash flow');
      strategy = 'long-term';
    } else {
      reasoning.push('Both strategies show similar cash flow potential');
      strategy = 'mixed';
    }

    // Analyze risks
    if (shortTermMetrics.breakEvenOccupancy > 70) {
      risks.push('High break-even occupancy rate for short-term rental');
    }
    if (longTermMetrics.vacancyRate > 5) {
      risks.push('High vacancy rate for long-term rental');
    }
    if (inputs.seasonalAdjustment > 20) {
      risks.push('Significant seasonal variations in short-term rental income');
    }

    setRecommendation({ strategy, reasoning, risks });
  };

  useEffect(() => {
    if (tabValue === 0) {
      setAnalysis(calculateLongTermMetrics());
    } else if (tabValue === 1) {
      setAnalysis(calculateShortTermMetrics());
    }
    generateRecommendation();
  }, [inputs, tabValue]);

  const handleInputChange = (field: keyof RentalInputs) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(event.target.value) || 0;
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleSliderChange = (field: keyof RentalInputs) => (
    event: Event,
    value: number | number[]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value as number }));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Rental Property Analyzer
      </Typography>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Strategy Recommendation
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Chip
            label={recommendation.strategy.toUpperCase()}
            color={
              recommendation.strategy === 'long-term'
                ? 'primary'
                : recommendation.strategy === 'short-term'
                ? 'secondary'
                : 'default'
            }
            sx={{ mr: 2 }}
          />
          <Typography variant="body1">
            Recommended Strategy: {recommendation.strategy.replace('-', ' ')}
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Key Benefits:
            </Typography>
            <ul>
              {recommendation.reasoning.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Potential Risks:
            </Typography>
            <ul>
              {recommendation.risks.map((risk, index) => (
                <li key={index}>{risk}</li>
              ))}
            </ul>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          aria-label="rental analysis tabs"
        >
          <Tab label="Long-Term Rental" />
          <Tab label="Short-Term Rental" />
          <Tab label="Strategy Comparison" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Property Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Purchase Price"
                      type="number"
                      value={inputs.purchasePrice}
                      onChange={handleInputChange('purchasePrice')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Down Payment (%)"
                      type="number"
                      value={inputs.downPayment}
                      onChange={handleInputChange('downPayment')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Interest Rate (%)"
                      type="number"
                      value={inputs.interestRate}
                      onChange={handleInputChange('interestRate')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Term (Years)"
                      type="number"
                      value={inputs.termYears}
                      onChange={handleInputChange('termYears')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Rehab Costs"
                      type="number"
                      value={inputs.rehabCosts}
                      onChange={handleInputChange('rehabCosts')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Rental Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Monthly Rent"
                      type="number"
                      value={inputs.monthlyRent}
                      onChange={handleInputChange('monthlyRent')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Vacancy Rate (%)"
                      type="number"
                      value={inputs.vacancyRate}
                      onChange={handleInputChange('vacancyRate')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Property Management (%)"
                      type="number"
                      value={inputs.propertyManagement}
                      onChange={handleInputChange('propertyManagement')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Expenses
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Property Taxes"
                      type="number"
                      value={inputs.propertyTaxes}
                      onChange={handleInputChange('propertyTaxes')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Insurance"
                      type="number"
                      value={inputs.insurance}
                      onChange={handleInputChange('insurance')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Maintenance"
                      type="number"
                      value={inputs.maintenance}
                      onChange={handleInputChange('maintenance')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Utilities"
                      type="number"
                      value={inputs.utilities}
                      onChange={handleInputChange('utilities')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Analysis Results
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Monthly Mortgage</TableCell>
                        <TableCell align="right">
                          ${analysis.monthlyMortgage.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Monthly Expenses</TableCell>
                        <TableCell align="right">
                          ${analysis.totalMonthlyExpenses.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Monthly Cash Flow</TableCell>
                        <TableCell align="right">
                          ${analysis.monthlyCashFlow.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Annual Cash Flow</TableCell>
                        <TableCell align="right">
                          ${analysis.annualCashFlow.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Cap Rate</TableCell>
                        <TableCell align="right">
                          {analysis.capRate.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>ROI</TableCell>
                        <TableCell align="right">
                          {analysis.roi.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Gross Rent Multiplier</TableCell>
                        <TableCell align="right">
                          {analysis.grossRentMultiplier.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Cash on Cash Return</TableCell>
                        <TableCell align="right">
                          {analysis.cashOnCashReturn.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Property Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Purchase Price"
                      type="number"
                      value={inputs.purchasePrice}
                      onChange={handleInputChange('purchasePrice')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Down Payment (%)"
                      type="number"
                      value={inputs.downPayment}
                      onChange={handleInputChange('downPayment')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Interest Rate (%)"
                      type="number"
                      value={inputs.interestRate}
                      onChange={handleInputChange('interestRate')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Term (Years)"
                      type="number"
                      value={inputs.termYears}
                      onChange={handleInputChange('termYears')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Rehab Costs"
                      type="number"
                      value={inputs.rehabCosts}
                      onChange={handleInputChange('rehabCosts')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Short-Term Rental Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nightly Rate"
                      type="number"
                      value={inputs.nightlyRate}
                      onChange={handleInputChange('nightlyRate')}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography gutterBottom>Occupancy Rate</Typography>
                    <Slider
                      value={inputs.occupancyRate}
                      onChange={handleSliderChange('occupancyRate')}
                      min={0}
                      max={100}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Cleaning Fee"
                      type="number"
                      value={inputs.cleaningFee}
                      onChange={handleInputChange('cleaningFee')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Platform Fee (%)"
                      type="number"
                      value={inputs.platformFee}
                      onChange={handleInputChange('platformFee')}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography gutterBottom>Seasonal Adjustment (%)</Typography>
                    <Slider
                      value={inputs.seasonalAdjustment}
                      onChange={handleSliderChange('seasonalAdjustment')}
                      min={-50}
                      max={50}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Expenses
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Property Taxes"
                      type="number"
                      value={inputs.propertyTaxes}
                      onChange={handleInputChange('propertyTaxes')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Insurance"
                      type="number"
                      value={inputs.insurance}
                      onChange={handleInputChange('insurance')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Maintenance"
                      type="number"
                      value={inputs.maintenance}
                      onChange={handleInputChange('maintenance')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Utilities"
                      type="number"
                      value={inputs.utilities}
                      onChange={handleInputChange('utilities')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Analysis Results
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Monthly Mortgage</TableCell>
                        <TableCell align="right">
                          ${analysis.monthlyMortgage.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Monthly Expenses</TableCell>
                        <TableCell align="right">
                          ${analysis.totalMonthlyExpenses.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Monthly Cash Flow</TableCell>
                        <TableCell align="right">
                          ${analysis.monthlyCashFlow.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Annual Cash Flow</TableCell>
                        <TableCell align="right">
                          ${analysis.annualCashFlow.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Cap Rate</TableCell>
                        <TableCell align="right">
                          {analysis.capRate.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>ROI</TableCell>
                        <TableCell align="right">
                          {analysis.roi.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Break-Even Occupancy</TableCell>
                        <TableCell align="right">
                          {analysis.breakEvenOccupancy.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Annual Revenue</TableCell>
                        <TableCell align="right">
                          ${analysis.annualRevenue.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Average Daily Rate</TableCell>
                        <TableCell align="right">
                          ${analysis.averageDailyRate.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Strategy Comparison
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Long-Term Rental
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>Monthly Cash Flow</TableCell>
                            <TableCell align="right">
                              ${calculateLongTermMetrics().monthlyCashFlow.toFixed(2)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Annual Cash Flow</TableCell>
                            <TableCell align="right">
                              ${calculateLongTermMetrics().annualCashFlow.toFixed(2)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Cap Rate</TableCell>
                            <TableCell align="right">
                              {calculateLongTermMetrics().capRate.toFixed(2)}%
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>ROI</TableCell>
                            <TableCell align="right">
                              {calculateLongTermMetrics().roi.toFixed(2)}%
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Short-Term Rental
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>Monthly Cash Flow</TableCell>
                            <TableCell align="right">
                              ${calculateShortTermMetrics().monthlyCashFlow.toFixed(2)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Annual Cash Flow</TableCell>
                            <TableCell align="right">
                              ${calculateShortTermMetrics().annualCashFlow.toFixed(2)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Cap Rate</TableCell>
                            <TableCell align="right">
                              {calculateShortTermMetrics().capRate.toFixed(2)}%
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>ROI</TableCell>
                            <TableCell align="right">
                              {calculateShortTermMetrics().roi.toFixed(2)}%
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cash Flow Projection
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        {
                          month: 'Jan',
                          longTerm: calculateLongTermMetrics().monthlyCashFlow,
                          shortTerm: calculateShortTermMetrics().monthlyCashFlow
                        },
                        {
                          month: 'Feb',
                          longTerm: calculateLongTermMetrics().monthlyCashFlow,
                          shortTerm: calculateShortTermMetrics().monthlyCashFlow * 1.1
                        },
                        {
                          month: 'Mar',
                          longTerm: calculateLongTermMetrics().monthlyCashFlow,
                          shortTerm: calculateShortTermMetrics().monthlyCashFlow * 1.2
                        },
                        {
                          month: 'Apr',
                          longTerm: calculateLongTermMetrics().monthlyCashFlow,
                          shortTerm: calculateShortTermMetrics().monthlyCashFlow * 1.3
                        },
                        {
                          month: 'May',
                          longTerm: calculateLongTermMetrics().monthlyCashFlow,
                          shortTerm: calculateShortTermMetrics().monthlyCashFlow * 1.4
                        },
                        {
                          month: 'Jun',
                          longTerm: calculateLongTermMetrics().monthlyCashFlow,
                          shortTerm: calculateShortTermMetrics().monthlyCashFlow * 1.5
                        },
                        {
                          month: 'Jul',
                          longTerm: calculateLongTermMetrics().monthlyCashFlow,
                          shortTerm: calculateShortTermMetrics().monthlyCashFlow * 1.5
                        },
                        {
                          month: 'Aug',
                          longTerm: calculateLongTermMetrics().monthlyCashFlow,
                          shortTerm: calculateShortTermMetrics().monthlyCashFlow * 1.4
                        },
                        {
                          month: 'Sep',
                          longTerm: calculateLongTermMetrics().monthlyCashFlow,
                          shortTerm: calculateShortTermMetrics().monthlyCashFlow * 1.3
                        },
                        {
                          month: 'Oct',
                          longTerm: calculateLongTermMetrics().monthlyCashFlow,
                          shortTerm: calculateShortTermMetrics().monthlyCashFlow * 1.2
                        },
                        {
                          month: 'Nov',
                          longTerm: calculateLongTermMetrics().monthlyCashFlow,
                          shortTerm: calculateShortTermMetrics().monthlyCashFlow * 1.1
                        },
                        {
                          month: 'Dec',
                          longTerm: calculateLongTermMetrics().monthlyCashFlow,
                          shortTerm: calculateShortTermMetrics().monthlyCashFlow
                        }
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="longTerm"
                        stroke="#8884d8"
                        name="Long-Term"
                      />
                      <Line
                        type="monotone"
                        dataKey="shortTerm"
                        stroke="#82ca9d"
                        name="Short-Term"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default RentalAnalyzer; 