import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Tooltip,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { storageService } from '../services/storage';
import { formatCurrency } from '../utils/validation';

interface UnitMix {
  id: string;
  numberOfUnits: string;
  beds: string;
  baths: string;
  currentRent: string;
}

interface OperatingExpense {
  id: string;
  category: string;
  amount: string;
}

interface Loan {
  id: string;
  type: 'hardMoney' | 'construction';
  amount: string;
  rate: string;
  term: string;
  payment: string;
}

interface ApartmentInputs {
  // Property Information
  address: string;
  propertyClass: 'A' | 'B' | 'C';
  areaClass: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  numberOfUnits: string;
  pricePerUnit: string;
  
  // Financial Data
  offer1Price: string;
  offer2Price: string;
  askingPrice: string;
  rehabCosts: string;
  
  // Current Loans
  current1stAmount: string;
  current1stRate: string;
  current1stPayment: string;
  current1stAssumable: boolean;
  current2ndAmount: string;
  current2ndRate: string;
  current2ndPayment: string;
  current2ndAssumable: boolean;
  
  // Unit Mix
  unitMix: UnitMix[];
  subsidizedUnits: string;
  
  // Income Analysis
  otherIncome: string;
  vacancyRate: string;
  operatingExpenses: OperatingExpense[];
  
  // Debt Service Analysis
  downPayment: string;
  closingCosts: string;
  rehabNeeded: string;
  loans: Loan[];
  
  // Market Analysis
  marketCapRate: string;
  
  // Additional Notes
  sellerQuestions: string;
  externalLinks: string;
}

interface ApartmentAnalysisProps {
  selectedDealId?: string | null;
}

const ApartmentAnalysis: React.FC<ApartmentAnalysisProps> = ({ selectedDealId }) => {
  // Initialize state
  const [inputs, setInputs] = useState<ApartmentInputs>({
    address: '',
    propertyClass: 'B',
    areaClass: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    numberOfUnits: '',
    pricePerUnit: '',
    offer1Price: '',
    offer2Price: '',
    askingPrice: '',
    rehabCosts: '',
    current1stAmount: '',
    current1stRate: '',
    current1stPayment: '',
    current1stAssumable: false,
    current2ndAmount: '',
    current2ndRate: '',
    current2ndPayment: '',
    current2ndAssumable: false,
    unitMix: [],
    subsidizedUnits: '',
    otherIncome: '',
    vacancyRate: '8',
    operatingExpenses: [],
    downPayment: '',
    closingCosts: '',
    rehabNeeded: '',
    loans: [],
    marketCapRate: '10',
    sellerQuestions: '',
    externalLinks: ''
  });

  const [results, setResults] = useState<{
    totalMonthlyIncome: number;
    totalGrossYearlyIncome: number;
    totalGrossScheduledIncome: number;
    vacancyLoss: number;
    effectiveGrossIncome: number;
    totalOperatingExpenses: number;
    netOperatingIncome: number;
    totalDebtService: number;
    cashFlow: number;
    cashOnCashReturn: number;
    marketValue: number;
    maximumAllowableOffer: number;
  } | null>(null);

  useEffect(() => {
    if (selectedDealId) {
      const savedDeal = storageService.getDeal(selectedDealId);
      if (savedDeal) {
        setInputs(savedDeal.inputs);
        setResults(savedDeal.results);
      }
    }
  }, [selectedDealId]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle unit mix changes
  const handleUnitMixChange = (id: string, field: keyof UnitMix, value: string) => {
    setInputs(prev => ({
      ...prev,
      unitMix: prev.unitMix.map(unit => 
        unit.id === id ? { ...unit, [field]: value } : unit
      )
    }));
  };

  // Add new unit mix
  const addUnitMix = () => {
    setInputs(prev => ({
      ...prev,
      unitMix: [
        ...prev.unitMix,
        {
          id: Date.now().toString(),
          numberOfUnits: '',
          beds: '',
          baths: '',
          currentRent: ''
        }
      ]
    }));
  };

  // Remove unit mix
  const removeUnitMix = (id: string) => {
    setInputs(prev => ({
      ...prev,
      unitMix: prev.unitMix.filter(unit => unit.id !== id)
    }));
  };

  // Handle operating expense changes
  const handleOperatingExpenseChange = (id: string, field: keyof OperatingExpense, value: string) => {
    setInputs(prev => ({
      ...prev,
      operatingExpenses: prev.operatingExpenses.map(expense => 
        expense.id === id ? { ...expense, [field]: value } : expense
      )
    }));
  };

  // Add new operating expense
  const addOperatingExpense = () => {
    setInputs(prev => ({
      ...prev,
      operatingExpenses: [
        ...prev.operatingExpenses,
        {
          id: Date.now().toString(),
          category: '',
          amount: ''
        }
      ]
    }));
  };

  // Remove operating expense
  const removeOperatingExpense = (id: string) => {
    setInputs(prev => ({
      ...prev,
      operatingExpenses: prev.operatingExpenses.filter(expense => expense.id !== id)
    }));
  };

  // Calculate the deal
  const calculateDeal = () => {
    // Calculate total monthly income from unit mix
    const totalMonthlyIncome = inputs.unitMix.reduce((total, unit) => {
      return total + (parseFloat(unit.currentRent) * parseFloat(unit.numberOfUnits) || 0);
    }, 0);

    // Calculate total gross yearly income
    const totalGrossYearlyIncome = totalMonthlyIncome * 12;

    // Calculate total gross scheduled income
    const totalGrossScheduledIncome = totalGrossYearlyIncome + (parseFloat(inputs.otherIncome) || 0);

    // Calculate vacancy loss
    const vacancyRate = parseFloat(inputs.vacancyRate) / 100;
    const vacancyLoss = totalGrossScheduledIncome * vacancyRate;

    // Calculate effective gross income
    const effectiveGrossIncome = totalGrossScheduledIncome - vacancyLoss;

    // Calculate total operating expenses
    const totalOperatingExpenses = inputs.operatingExpenses.reduce((total, expense) => {
      return total + (parseFloat(expense.amount) || 0);
    }, 0);

    // Calculate net operating income
    const netOperatingIncome = effectiveGrossIncome - totalOperatingExpenses;

    // Calculate total debt service
    const totalDebtService = inputs.loans.reduce((total, loan) => {
      return total + (parseFloat(loan.payment) * 12 || 0);
    }, 0);

    // Calculate cash flow
    const cashFlow = netOperatingIncome - totalDebtService;

    // Calculate total cash invested
    const totalCashInvested = 
      (parseFloat(inputs.downPayment) || 0) +
      (parseFloat(inputs.closingCosts) || 0) +
      (parseFloat(inputs.rehabNeeded) || 0);

    // Calculate cash on cash return
    const cashOnCashReturn = totalCashInvested > 0 ? (cashFlow / totalCashInvested) * 100 : 0;

    // Calculate market value
    const marketCapRate = parseFloat(inputs.marketCapRate) / 100;
    const marketValue = marketCapRate > 0 ? netOperatingIncome / marketCapRate : 0;

    // Calculate maximum allowable offer
    const maximumAllowableOffer = (marketValue * 0.7) - (parseFloat(inputs.rehabNeeded) || 0);

    setResults({
      totalMonthlyIncome,
      totalGrossYearlyIncome,
      totalGrossScheduledIncome,
      vacancyLoss,
      effectiveGrossIncome,
      totalOperatingExpenses,
      netOperatingIncome,
      totalDebtService,
      cashFlow,
      cashOnCashReturn,
      marketValue,
      maximumAllowableOffer
    });
  };

  const handleSaveDeal = () => {
    if (!results) return;

    storageService.saveDeal({
      type: 'apartment',
      name: `Apartment Analysis - ${inputs.address}`,
      inputs: {
        ...inputs,
        unitMix: inputs.unitMix.map(unit => ({
          ...unit,
          numberOfUnits: parseFloat(unit.numberOfUnits) || 0,
          currentRent: parseFloat(unit.currentRent) || 0
        })),
        operatingExpenses: inputs.operatingExpenses.map(expense => ({
          ...expense,
          amount: parseFloat(expense.amount) || 0
        }))
      },
      results: {
        ...results,
        cashFlow: {
          monthlyCashFlow: results.cashFlow / 12,
          annualCashFlow: results.cashFlow,
          cashOnCashReturn: results.cashOnCashReturn
        }
      }
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" gutterBottom>
          Apartment Analysis
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSaveDeal}
          disabled={!results}
        >
          Save Deal
        </Button>
      </Box>
      <Typography variant="body1" paragraph>
        Analyze multifamily properties with comprehensive financial metrics and market analysis.
      </Typography>

      <Grid container spacing={3}>
        {/* Property Information */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Property Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={inputs.address}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Property Class</InputLabel>
                    <Select
                      value={inputs.propertyClass}
                      label="Property Class"
                      onChange={(e) => setInputs(prev => ({ ...prev, propertyClass: e.target.value as 'A' | 'B' | 'C' }))}
                    >
                      <MenuItem value="A">Class A</MenuItem>
                      <MenuItem value="B">Class B</MenuItem>
                      <MenuItem value="C">Class C</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Area Class"
                    name="areaClass"
                    value={inputs.areaClass}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Owner Name"
                    name="ownerName"
                    value={inputs.ownerName}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Owner Phone"
                    name="ownerPhone"
                    value={inputs.ownerPhone}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Owner Email"
                    name="ownerEmail"
                    value={inputs.ownerEmail}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Number of Units"
                    name="numberOfUnits"
                    type="number"
                    value={inputs.numberOfUnits}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Price per Unit"
                    name="pricePerUnit"
                    type="number"
                    value={inputs.pricePerUnit}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Financial Data */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Financial Data
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Offer 1 Price"
                    name="offer1Price"
                    type="number"
                    value={inputs.offer1Price}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Offer 2 Price"
                    name="offer2Price"
                    type="number"
                    value={inputs.offer2Price}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Asking Price"
                    name="askingPrice"
                    type="number"
                    value={inputs.askingPrice}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Rehab Costs"
                    name="rehabCosts"
                    type="number"
                    value={inputs.rehabCosts}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Current Loans
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Current 1st Amount"
                    name="current1stAmount"
                    type="number"
                    value={inputs.current1stAmount}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Current 1st Rate (%)"
                    name="current1stRate"
                    type="number"
                    value={inputs.current1stRate}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Current 1st Payment"
                    name="current1stPayment"
                    type="number"
                    value={inputs.current1stPayment}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={inputs.current1stAssumable}
                        onChange={(e) => setInputs(prev => ({ ...prev, current1stAssumable: e.target.checked }))}
                      />
                    }
                    label="1st Assumable"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Current 2nd Amount"
                    name="current2ndAmount"
                    type="number"
                    value={inputs.current2ndAmount}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Current 2nd Rate (%)"
                    name="current2ndRate"
                    type="number"
                    value={inputs.current2ndRate}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Current 2nd Payment"
                    name="current2ndPayment"
                    type="number"
                    value={inputs.current2ndPayment}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={inputs.current2ndAssumable}
                        onChange={(e) => setInputs(prev => ({ ...prev, current2ndAssumable: e.target.checked }))}
                      />
                    }
                    label="2nd Assumable"
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Unit Mix */}
        <Grid item xs={12}>
          <Paper elevation={2}>
            <Box p={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Unit Mix
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addUnitMix}
                >
                  Add Unit Type
                </Button>
              </Box>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Number of Units</TableCell>
                      <TableCell>Beds</TableCell>
                      <TableCell>Baths</TableCell>
                      <TableCell>Current Rent/Mo</TableCell>
                      <TableCell>Total Monthly Rent</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inputs.unitMix.map(unit => (
                      <TableRow key={unit.id}>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={unit.numberOfUnits}
                            onChange={(e) => handleUnitMixChange(unit.id, 'numberOfUnits', e.target.value)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={unit.beds}
                            onChange={(e) => handleUnitMixChange(unit.id, 'beds', e.target.value)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={unit.baths}
                            onChange={(e) => handleUnitMixChange(unit.id, 'baths', e.target.value)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={unit.currentRent}
                            onChange={(e) => handleUnitMixChange(unit.id, 'currentRent', e.target.value)}
                            variant="outlined"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {formatCurrency(
                            (parseFloat(unit.numberOfUnits) || 0) * (parseFloat(unit.currentRent) || 0)
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => removeUnitMix(unit.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Grid item xs={12} sm={6} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Subsidized Units"
                  name="subsidizedUnits"
                  type="number"
                  value={inputs.subsidizedUnits}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Income Analysis */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Income Analysis
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Other Income"
                    name="otherIncome"
                    type="number"
                    value={inputs.otherIncome}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Vacancy Rate (%)"
                    name="vacancyRate"
                    type="number"
                    value={inputs.vacancyRate}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                  />
                </Grid>
              </Grid>

              <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={2}>
                <Typography variant="h6">
                  Operating Expenses
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addOperatingExpense}
                >
                  Add Expense
                </Button>
              </Box>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inputs.operatingExpenses.map(expense => (
                      <TableRow key={expense.id}>
                        <TableCell>
                          <TextField
                            size="small"
                            value={expense.category}
                            onChange={(e) => handleOperatingExpenseChange(expense.id, 'category', e.target.value)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={expense.amount}
                            onChange={(e) => handleOperatingExpenseChange(expense.id, 'amount', e.target.value)}
                            variant="outlined"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => removeOperatingExpense(expense.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Debt Service Analysis */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Debt Service Analysis
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Down Payment"
                    name="downPayment"
                    type="number"
                    value={inputs.downPayment}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
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
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Rehab Needed/Deferred Maintenance"
                    name="rehabNeeded"
                    type="number"
                    value={inputs.rehabNeeded}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                  />
                </Grid>
              </Grid>

              <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={2}>
                <Typography variant="h6">
                  Loans
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setInputs(prev => ({
                    ...prev,
                    loans: [
                      ...prev.loans,
                      {
                        id: Date.now().toString(),
                        type: 'hardMoney',
                        amount: '',
                        rate: '',
                        term: '',
                        payment: ''
                      }
                    ]
                  }))}
                >
                  Add Loan
                </Button>
              </Box>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Rate (%)</TableCell>
                      <TableCell>Term (Years)</TableCell>
                      <TableCell>Payment</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inputs.loans.map(loan => (
                      <TableRow key={loan.id}>
                        <TableCell>
                          <FormControl size="small">
                            <Select
                              value={loan.type}
                              onChange={(e) => setInputs(prev => ({
                                ...prev,
                                loans: prev.loans.map(l => 
                                  l.id === loan.id ? { ...l, type: e.target.value as 'hardMoney' | 'construction' } : l
                                )
                              }))}
                            >
                              <MenuItem value="hardMoney">Hard Money</MenuItem>
                              <MenuItem value="construction">Construction</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={loan.amount}
                            onChange={(e) => setInputs(prev => ({
                              ...prev,
                              loans: prev.loans.map(l => 
                                l.id === loan.id ? { ...l, amount: e.target.value } : l
                              )
                            }))}
                            variant="outlined"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={loan.rate}
                            onChange={(e) => setInputs(prev => ({
                              ...prev,
                              loans: prev.loans.map(l => 
                                l.id === loan.id ? { ...l, rate: e.target.value } : l
                              )
                            }))}
                            variant="outlined"
                            InputProps={{
                              endAdornment: <InputAdornment position="end">%</InputAdornment>
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={loan.term}
                            onChange={(e) => setInputs(prev => ({
                              ...prev,
                              loans: prev.loans.map(l => 
                                l.id === loan.id ? { ...l, term: e.target.value } : l
                              )
                            }))}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={loan.payment}
                            onChange={(e) => setInputs(prev => ({
                              ...prev,
                              loans: prev.loans.map(l => 
                                l.id === loan.id ? { ...l, payment: e.target.value } : l
                              )
                            }))}
                            variant="outlined"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => setInputs(prev => ({
                              ...prev,
                              loans: prev.loans.filter(l => l.id !== loan.id)
                            }))}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Market Analysis */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Market Analysis
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Market Cap Rate (%)"
                    name="marketCapRate"
                    type="number"
                    value={inputs.marketCapRate}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Additional Notes */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Additional Notes
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Questions for Seller"
                    name="sellerQuestions"
                    multiline
                    rows={4}
                    value={inputs.sellerQuestions}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="External Links"
                    name="externalLinks"
                    multiline
                    rows={2}
                    value={inputs.externalLinks}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Results */}
        {results && (
          <Grid item xs={12}>
            <Paper elevation={2}>
              <Box p={3}>
                <Typography variant="h6" gutterBottom>
                  Analysis Results
                </Typography>

                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body1">
                            Total Monthly Income
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="primary">
                            {formatCurrency(results.totalMonthlyIncome)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body1">
                            Total Gross Yearly Income
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="primary">
                            {formatCurrency(results.totalGrossYearlyIncome)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body1">
                            Total Gross Scheduled Income
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="primary">
                            {formatCurrency(results.totalGrossScheduledIncome)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body1">
                            Vacancy Loss
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="error">
                            {formatCurrency(results.vacancyLoss)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body1">
                            Effective Gross Income
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="primary">
                            {formatCurrency(results.effectiveGrossIncome)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body1">
                            Total Operating Expenses
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="error">
                            {formatCurrency(results.totalOperatingExpenses)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body1">
                            Net Operating Income
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="primary">
                            {formatCurrency(results.netOperatingIncome)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body1">
                            Total Debt Service
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="error">
                            {formatCurrency(results.totalDebtService)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body1">
                            Cash Flow
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color={results.cashFlow < 0 ? "error" : "primary"}>
                            {formatCurrency(results.cashFlow)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body1">
                            Cash on Cash Return
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color={results.cashOnCashReturn < 13 ? "warning" : "primary"}>
                            {results.cashOnCashReturn.toFixed(2)}%
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body1">
                            Market Value
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="primary">
                            {formatCurrency(results.marketValue)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body1">
                            Maximum Allowable Offer
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="primary">
                            {formatCurrency(results.maximumAllowableOffer)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Box mt={3}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={calculateDeal}
        >
          Calculate Analysis
        </Button>
      </Box>
    </Box>
  );
};

export default ApartmentAnalysis; 