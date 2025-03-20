import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { storageService } from '../services/storage';
import { v4 as uuidv4 } from 'uuid';

interface LeaseOptionInputs {
  propertyValue: number;
  optionFee: number;
  optionPeriod: number;
  monthlyRent: number;
  purchasePrice: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
}

interface SyndicationInputs {
  propertyValue: number;
  totalUnits: number;
  averageRent: number;
  vacancyRate: number;
  operatingExpenses: number;
  managementFee: number;
  gpSplit: number;
  lpSplit: number;
  investmentAmount: number;
}

interface NovationInputs {
  originalLoanAmount: number;
  currentBalance: number;
  interestRate: number;
  remainingTerm: number;
  newInterestRate: number;
  newTerm: number;
  closingCosts: number;
}

const AdvancedFinancing: React.FC = () => {
  const [activeTab, setActiveTab] = useState('leaseOption');
  const [leaseOptionInputs, setLeaseOptionInputs] = useState<LeaseOptionInputs>({
    propertyValue: 0,
    optionFee: 0,
    optionPeriod: 12,
    monthlyRent: 0,
    purchasePrice: 0,
    downPayment: 0,
    interestRate: 0,
    loanTerm: 30
  });
  const [syndicationInputs, setSyndicationInputs] = useState<SyndicationInputs>({
    propertyValue: 0,
    totalUnits: 0,
    averageRent: 0,
    vacancyRate: 5,
    operatingExpenses: 0,
    managementFee: 3,
    gpSplit: 20,
    lpSplit: 80,
    investmentAmount: 0
  });
  const [novationInputs, setNovationInputs] = useState<NovationInputs>({
    originalLoanAmount: 0,
    currentBalance: 0,
    interestRate: 0,
    remainingTerm: 0,
    newInterestRate: 0,
    newTerm: 0,
    closingCosts: 0
  });
  const [results, setResults] = useState<any>(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('');

  const handleLeaseOptionInputChange = (field: keyof LeaseOptionInputs) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLeaseOptionInputs(prev => ({
      ...prev,
      [field]: parseFloat(event.target.value) || 0
    }));
  };

  const handleSyndicationInputChange = (field: keyof SyndicationInputs) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSyndicationInputs(prev => ({
      ...prev,
      [field]: parseFloat(event.target.value) || 0
    }));
  };

  const handleNovationInputChange = (field: keyof NovationInputs) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNovationInputs(prev => ({
      ...prev,
      [field]: parseFloat(event.target.value) || 0
    }));
  };

  const calculateLeaseOption = () => {
    const {
      propertyValue,
      optionFee,
      optionPeriod,
      monthlyRent,
      purchasePrice,
      downPayment,
      interestRate,
      loanTerm
    } = leaseOptionInputs;

    // Calculate monthly mortgage payment
    const loanAmount = purchasePrice - downPayment;
    const monthlyRate = interestRate / 12 / 100;
    const numberOfPayments = loanTerm * 12;
    const monthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    // Calculate total option period payments
    const totalOptionPayments = monthlyRent * optionPeriod;

    // Calculate potential profit
    const potentialProfit = propertyValue - purchasePrice;

    // Calculate ROI
    const totalInvestment = optionFee + downPayment;
    const roi = (potentialProfit / totalInvestment) * 100;

    setResults({
      monthlyPayment,
      totalOptionPayments,
      potentialProfit,
      roi,
      totalInvestment
    });
  };

  const calculateSyndication = () => {
    const {
      propertyValue,
      totalUnits,
      averageRent,
      vacancyRate,
      operatingExpenses,
      managementFee,
      gpSplit,
      lpSplit,
      investmentAmount
    } = syndicationInputs;

    // Calculate gross potential income
    const grossPotentialIncome = totalUnits * averageRent * 12;

    // Calculate vacancy loss
    const vacancyLoss = grossPotentialIncome * (vacancyRate / 100);

    // Calculate management fees
    const managementFees = grossPotentialIncome * (managementFee / 100);

    // Calculate net operating income
    const noi = grossPotentialIncome - vacancyLoss - operatingExpenses - managementFees;

    // Calculate cap rate
    const capRate = (noi / propertyValue) * 100;

    // Calculate investor's share of NOI
    const investorShare = noi * (lpSplit / 100);

    // Calculate cash on cash return
    const cashOnCashReturn = (investorShare / investmentAmount) * 100;

    setResults({
      grossPotentialIncome,
      vacancyLoss,
      managementFees,
      noi,
      capRate,
      investorShare,
      cashOnCashReturn
    });
  };

  const calculateNovation = () => {
    const {
      originalLoanAmount,
      currentBalance,
      interestRate,
      remainingTerm,
      newInterestRate,
      newTerm,
      closingCosts
    } = novationInputs;

    // Calculate current monthly payment
    const currentMonthlyRate = interestRate / 12 / 100;
    const currentMonthlyPayment = currentBalance * 
      (currentMonthlyRate * Math.pow(1 + currentMonthlyRate, remainingTerm)) / 
      (Math.pow(1 + currentMonthlyRate, remainingTerm) - 1);

    // Calculate new monthly payment
    const newMonthlyRate = newInterestRate / 12 / 100;
    const newMonthlyPayment = currentBalance * 
      (newMonthlyRate * Math.pow(1 + newMonthlyRate, newTerm)) / 
      (Math.pow(1 + newMonthlyRate, newTerm) - 1);

    // Calculate monthly savings
    const monthlySavings = currentMonthlyPayment - newMonthlyPayment;

    // Calculate total savings over new term
    const totalSavings = (monthlySavings * newTerm * 12) - closingCosts;

    // Calculate break-even point in months
    const breakEvenMonths = closingCosts / monthlySavings;

    setResults({
      currentMonthlyPayment,
      newMonthlyPayment,
      monthlySavings,
      totalSavings,
      breakEvenMonths
    });
  };

  const handleCalculate = () => {
    switch (activeTab) {
      case 'leaseOption':
        calculateLeaseOption();
        break;
      case 'syndication':
        calculateSyndication();
        break;
      case 'novation':
        calculateNovation();
        break;
    }
  };

  const handleSave = () => {
    const deal = {
      id: uuidv4(),
      type: "advanced" as "advanced" | "wholesale" | "creative" | "mortgage" | "apartment",
      name: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Deal`,
      date: new Date().toISOString(),
      inputs: {
        ...(activeTab === 'leaseOption' && leaseOptionInputs),
        ...(activeTab === 'syndication' && syndicationInputs),
        ...(activeTab === 'novation' && novationInputs)
      },
      results
    };

    storageService.saveDeal(deal);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return value.toFixed(2) + '%';
  };

  const getStrategyInfo = (strategy: string) => {
    switch (strategy) {
      case 'leaseOption':
        return {
          title: 'Lease Option',
          description: 'A lease option is a real estate agreement that gives a tenant the right to purchase the property at a predetermined price within a specified time period. The tenant pays an option fee upfront and monthly rent, with a portion potentially credited toward the purchase price.',
          benefits: [
            'Lower upfront costs compared to traditional purchase',
            'Time to improve credit or save for down payment',
            'Locked-in purchase price',
            'Potential rent credits toward purchase'
          ]
        };
      case 'syndication':
        return {
          title: 'Real Estate Syndication',
          description: 'Real estate syndication is a partnership between a sponsor (GP) and passive investors (LPs) to purchase and manage a property. The GP handles operations while LPs provide capital and receive a share of the profits.',
          benefits: [
            'Access to larger properties',
            'Passive investment opportunity',
            'Diversified risk',
            'Professional management'
          ]
        };
      case 'novation':
        return {
          title: 'Loan Novation',
          description: 'Loan novation is the process of replacing an existing loan with a new one, typically with better terms. This can be done through refinancing or assumption, where a new borrower takes over the existing loan.',
          benefits: [
            'Lower interest rates',
            'Better loan terms',
            'Reduced monthly payments',
            'Potential cash-out options'
          ]
        };
      default:
        return {
          title: '',
          description: '',
          benefits: []
        };
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Advanced Financing Strategies
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Strategy
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Strategy</InputLabel>
                <Select
                  value={activeTab}
                  label="Strategy"
                  onChange={(e) => setActiveTab(e.target.value)}
                >
                  <MenuItem value="leaseOption">Lease Option</MenuItem>
                  <MenuItem value="syndication">Syndication</MenuItem>
                  <MenuItem value="novation">Loan Novation</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="text"
                startIcon={<InfoIcon />}
                onClick={() => {
                  setSelectedStrategy(activeTab);
                  setInfoDialogOpen(true);
                }}
                sx={{ mt: 2 }}
              >
                Learn More
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            {activeTab === 'leaseOption' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Property Value"
                    type="number"
                    value={leaseOptionInputs.propertyValue}
                    onChange={handleLeaseOptionInputChange('propertyValue')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Option Fee"
                    type="number"
                    value={leaseOptionInputs.optionFee}
                    onChange={handleLeaseOptionInputChange('optionFee')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Option Period (months)"
                    type="number"
                    value={leaseOptionInputs.optionPeriod}
                    onChange={handleLeaseOptionInputChange('optionPeriod')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Monthly Rent"
                    type="number"
                    value={leaseOptionInputs.monthlyRent}
                    onChange={handleLeaseOptionInputChange('monthlyRent')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Purchase Price"
                    type="number"
                    value={leaseOptionInputs.purchasePrice}
                    onChange={handleLeaseOptionInputChange('purchasePrice')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Down Payment"
                    type="number"
                    value={leaseOptionInputs.downPayment}
                    onChange={handleLeaseOptionInputChange('downPayment')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Interest Rate (%)"
                    type="number"
                    value={leaseOptionInputs.interestRate}
                    onChange={handleLeaseOptionInputChange('interestRate')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Loan Term (years)"
                    type="number"
                    value={leaseOptionInputs.loanTerm}
                    onChange={handleLeaseOptionInputChange('loanTerm')}
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 'syndication' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Property Value"
                    type="number"
                    value={syndicationInputs.propertyValue}
                    onChange={handleSyndicationInputChange('propertyValue')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Total Units"
                    type="number"
                    value={syndicationInputs.totalUnits}
                    onChange={handleSyndicationInputChange('totalUnits')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Average Monthly Rent"
                    type="number"
                    value={syndicationInputs.averageRent}
                    onChange={handleSyndicationInputChange('averageRent')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Vacancy Rate (%)"
                    type="number"
                    value={syndicationInputs.vacancyRate}
                    onChange={handleSyndicationInputChange('vacancyRate')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Annual Operating Expenses"
                    type="number"
                    value={syndicationInputs.operatingExpenses}
                    onChange={handleSyndicationInputChange('operatingExpenses')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Management Fee (%)"
                    type="number"
                    value={syndicationInputs.managementFee}
                    onChange={handleSyndicationInputChange('managementFee')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="GP Split (%)"
                    type="number"
                    value={syndicationInputs.gpSplit}
                    onChange={handleSyndicationInputChange('gpSplit')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="LP Split (%)"
                    type="number"
                    value={syndicationInputs.lpSplit}
                    onChange={handleSyndicationInputChange('lpSplit')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Investment Amount"
                    type="number"
                    value={syndicationInputs.investmentAmount}
                    onChange={handleSyndicationInputChange('investmentAmount')}
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 'novation' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Original Loan Amount"
                    type="number"
                    value={novationInputs.originalLoanAmount}
                    onChange={handleNovationInputChange('originalLoanAmount')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Current Balance"
                    type="number"
                    value={novationInputs.currentBalance}
                    onChange={handleNovationInputChange('currentBalance')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Current Interest Rate (%)"
                    type="number"
                    value={novationInputs.interestRate}
                    onChange={handleNovationInputChange('interestRate')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Remaining Term (months)"
                    type="number"
                    value={novationInputs.remainingTerm}
                    onChange={handleNovationInputChange('remainingTerm')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="New Interest Rate (%)"
                    type="number"
                    value={novationInputs.newInterestRate}
                    onChange={handleNovationInputChange('newInterestRate')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="New Term (years)"
                    type="number"
                    value={novationInputs.newTerm}
                    onChange={handleNovationInputChange('newTerm')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Closing Costs"
                    type="number"
                    value={novationInputs.closingCosts}
                    onChange={handleNovationInputChange('closingCosts')}
                  />
                </Grid>
              </Grid>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleCalculate}
                fullWidth
              >
                Calculate
              </Button>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                fullWidth
              >
                Save Deal
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {results && (
        <Paper sx={{ mt: 3, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Results
          </Typography>
          
          {activeTab === 'leaseOption' && (
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Monthly Payment</TableCell>
                    <TableCell>{formatCurrency(results.monthlyPayment)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Option Period Payments</TableCell>
                    <TableCell>{formatCurrency(results.totalOptionPayments)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Potential Profit</TableCell>
                    <TableCell>{formatCurrency(results.potentialProfit)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>ROI</TableCell>
                    <TableCell>{formatPercentage(results.roi)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Investment</TableCell>
                    <TableCell>{formatCurrency(results.totalInvestment)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {activeTab === 'syndication' && (
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Gross Potential Income</TableCell>
                    <TableCell>{formatCurrency(results.grossPotentialIncome)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Vacancy Loss</TableCell>
                    <TableCell>{formatCurrency(results.vacancyLoss)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Management Fees</TableCell>
                    <TableCell>{formatCurrency(results.managementFees)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Net Operating Income</TableCell>
                    <TableCell>{formatCurrency(results.noi)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Cap Rate</TableCell>
                    <TableCell>{formatPercentage(results.capRate)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Investor's Share of NOI</TableCell>
                    <TableCell>{formatCurrency(results.investorShare)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Cash on Cash Return</TableCell>
                    <TableCell>{formatPercentage(results.cashOnCashReturn)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {activeTab === 'novation' && (
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Current Monthly Payment</TableCell>
                    <TableCell>{formatCurrency(results.currentMonthlyPayment)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>New Monthly Payment</TableCell>
                    <TableCell>{formatCurrency(results.newMonthlyPayment)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Monthly Savings</TableCell>
                    <TableCell>{formatCurrency(results.monthlySavings)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Savings</TableCell>
                    <TableCell>{formatCurrency(results.totalSavings)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Break-even Point (months)</TableCell>
                    <TableCell>{results.breakEvenMonths.toFixed(1)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      <Dialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {getStrategyInfo(selectedStrategy).title}
        </DialogTitle>
        <DialogContent>
          <Typography paragraph>
            {getStrategyInfo(selectedStrategy).description}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Key Benefits:
          </Typography>
          <List>
            {getStrategyInfo(selectedStrategy).benefits.map((benefit, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary={benefit} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedFinancing; 