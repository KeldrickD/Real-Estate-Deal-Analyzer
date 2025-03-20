import React, { useState } from 'react';
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
  InputAdornment
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { storageService } from '../services/storage';
import SaveIcon from '@mui/icons-material/Save';
import { TextFieldProps } from '@mui/material/TextField';

import {
  calculateMonthlyPayment,
  generateAmortizationSchedule,
  calculateBalloonBalance,
  calculateCashFlow,
  formatAmortizationSchedule,
  AmortizationRow
} from '../utils/financialCalculations';
import { formatCurrency } from '../utils/validation';

interface MortgageInputs {
  loanAmount: string;
  interestRate: string;
  termYears: string;
  downPayment: string;
  firstPaymentDate: string;
  rentalRevenue: string;
  operatingExpenses: {
    taxes: string;
    insurance: string;
    maintenance: string;
    utilities: string;
    other: string;
  };
  closingCosts: string;
}

const MortgageAnalyzer: React.FC = () => {
  // State for form inputs
  const [inputs, setInputs] = useState<MortgageInputs>({
    loanAmount: '',
    interestRate: '',
    termYears: '30',
    downPayment: '',
    firstPaymentDate: new Date().toISOString().split('T')[0],
    rentalRevenue: '',
    operatingExpenses: {
      taxes: '',
      insurance: '',
      maintenance: '',
      utilities: '',
      other: ''
    },
    closingCosts: ''
  });

  // State for results
  const [results, setResults] = useState<{
    monthlyPayment: number;
    balloonBalances: {
      year5: number;
      year6: number;
      year9: number;
      year10: number;
    };
    cashFlow: {
      monthlyCashFlow: number;
      annualCashFlow: number;
      cashOnCashReturn: number;
    };
    amortizationSchedule: AmortizationRow[];
  } | null>(null);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('operatingExpenses.')) {
      const expenseType = name.split('.')[1];
      setInputs(prev => ({
        ...prev,
        operatingExpenses: {
          ...prev.operatingExpenses,
          [expenseType]: value
        }
      }));
    } else {
      setInputs(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Calculate total operating expenses
  const calculateTotalOperatingExpenses = (expenses: MortgageInputs['operatingExpenses']): number => {
    return Object.values(expenses).reduce((total, expense) => {
      return total + (parseFloat(expense) || 0);
    }, 0);
  };

  // Calculate the deal
  const calculateDeal = () => {
    // Parse inputs
    const loanAmount = parseFloat(inputs.loanAmount) || 0;
    const interestRate = parseFloat(inputs.interestRate) || 0;
    const termYears = parseFloat(inputs.termYears) || 30;
    const downPayment = parseFloat(inputs.downPayment) || 0;
    const rentalRevenue = parseFloat(inputs.rentalRevenue) || 0;
    const totalOperatingExpenses = calculateTotalOperatingExpenses(inputs.operatingExpenses);
    const closingCosts = parseFloat(inputs.closingCosts) || 0;

    // Calculate monthly payment
    const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, termYears);

    // Generate amortization schedule
    const amortizationSchedule = generateAmortizationSchedule(
      loanAmount,
      interestRate,
      termYears,
      new Date(inputs.firstPaymentDate)
    );

    // Calculate balloon balances at specified years
    const balloonBalances = {
      year5: calculateBalloonBalance(loanAmount, interestRate, termYears, 5),
      year6: calculateBalloonBalance(loanAmount, interestRate, termYears, 6),
      year9: calculateBalloonBalance(loanAmount, interestRate, termYears, 9),
      year10: calculateBalloonBalance(loanAmount, interestRate, termYears, 10)
    };

    // Calculate cash flow
    const cashFlow = calculateCashFlow(
      rentalRevenue,
      totalOperatingExpenses,
      monthlyPayment,
      downPayment + closingCosts
    );

    setResults({
      monthlyPayment,
      balloonBalances,
      cashFlow,
      amortizationSchedule
    });
  };

  const handleSaveDeal = () => {
    if (!results) return;

    storageService.saveDeal({
      type: 'mortgage',
      name: `Mortgage - ${formatCurrency(results.monthlyPayment)}/mo`,
      inputs: {
        loanAmount: inputs.loanAmount,
        interestRate: inputs.interestRate,
        termYears: inputs.termYears,
        downPayment: inputs.downPayment,
        firstPaymentDate: inputs.firstPaymentDate,
        rentalRevenue: inputs.rentalRevenue,
        operatingExpenses: inputs.operatingExpenses,
        closingCosts: inputs.closingCosts
      },
      results: {
        monthlyPayment: results.monthlyPayment,
        balloonBalances: results.balloonBalances,
        cashFlow: results.cashFlow
      }
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" gutterBottom>
          Mortgage & Cash Flow Analyzer
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
        Analyze mortgage amortization schedules and evaluate cash flow for rental properties.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Mortgage Details
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Loan Amount ($)"
                    name="loanAmount"
                    type="number"
                    value={inputs.loanAmount}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Total loan amount">
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
                    label="Interest Rate (%)"
                    name="interestRate"
                    type="number"
                    value={inputs.interestRate}
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
                    label="Term (Years)"
                    name="termYears"
                    type="number"
                    value={inputs.termYears}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Down Payment ($)"
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
                <Grid item xs={12}>
                  <TextField
                    label="First Payment Date"
                    type="date"
                    fullWidth
                    value={inputs.firstPaymentDate}
                    onChange={(e) => setInputs(prev => ({ ...prev, firstPaymentDate: e.target.value }))}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Income & Expenses
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Monthly Rental Revenue ($)"
                    name="rentalRevenue"
                    type="number"
                    value={inputs.rentalRevenue}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Operating Expenses
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Property Taxes ($)"
                        name="operatingExpenses.taxes"
                        type="number"
                        value={inputs.operatingExpenses.taxes}
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
                        label="Insurance ($)"
                        name="operatingExpenses.insurance"
                        type="number"
                        value={inputs.operatingExpenses.insurance}
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
                        label="Maintenance ($)"
                        name="operatingExpenses.maintenance"
                        type="number"
                        value={inputs.operatingExpenses.maintenance}
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
                        label="Utilities ($)"
                        name="operatingExpenses.utilities"
                        type="number"
                        value={inputs.operatingExpenses.utilities}
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
                        label="Other Expenses ($)"
                        name="operatingExpenses.other"
                        type="number"
                        value={inputs.operatingExpenses.other}
                        onChange={handleInputChange}
                        variant="outlined"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Closing Costs ($)"
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
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          {results && (
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
                            Monthly Payment
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="primary">
                            {formatCurrency(results.monthlyPayment)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body1">
                            Balloon Balance (5 years)
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="primary">
                            {formatCurrency(results.balloonBalances.year5)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body1">
                            Balloon Balance (6 years)
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="primary">
                            {formatCurrency(results.balloonBalances.year6)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body1">
                            Balloon Balance (9 years)
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="primary">
                            {formatCurrency(results.balloonBalances.year9)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body1">
                            Balloon Balance (10 years)
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="primary">
                            {formatCurrency(results.balloonBalances.year10)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body1">
                            Monthly Cash Flow
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color={results.cashFlow.monthlyCashFlow < 0 ? "error" : "primary"}>
                            {formatCurrency(results.cashFlow.monthlyCashFlow)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body1">
                            Annual Cash Flow
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color={results.cashFlow.annualCashFlow < 0 ? "error" : "primary"}>
                            {formatCurrency(results.cashFlow.annualCashFlow)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body1">
                            Cash-on-Cash Return
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color={results.cashFlow.cashOnCashReturn < 13 ? "warning" : "primary"}>
                            {results.cashFlow.cashOnCashReturn.toFixed(2)}%
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Amortization Schedule
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell align="right">Payment</TableCell>
                          <TableCell align="right">Principal</TableCell>
                          <TableCell align="right">Interest</TableCell>
                          <TableCell align="right">Balance</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formatAmortizationSchedule(results.amortizationSchedule).map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.paymentDate}</TableCell>
                            <TableCell align="right">{row.payment}</TableCell>
                            <TableCell align="right">{row.principal}</TableCell>
                            <TableCell align="right">{row.interest}</TableCell>
                            <TableCell align="right">{row.balance}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default MortgageAnalyzer; 