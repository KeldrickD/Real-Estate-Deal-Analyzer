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
  FormControlLabel,
  Checkbox,
  Alert,
  Divider,
  Tooltip,
  IconButton,
  InputAdornment
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';
import { TextFieldProps } from '@mui/material/TextField';
import { storageService } from '../services/storage';

import {
  calculateMonthlyPayment,
  calculateInterestOnlyPayment,
  generateAmortizationSchedule,
  calculateBalloonBalance,
  calculateCashFlow,
  checkDealCriteria,
  calculateSellerProfit,
  formatAmortizationSchedule,
  AmortizationRow
} from '../utils/financialCalculations';
import { formatCurrency } from '../utils/validation';

interface CreativeFinancingInputs {
  purchasePrice: string;
  listedPrice: string;
  downPayment: string;
  interestRate: string;
  termYears: string;
  balloonYears: string;
  firstPaymentDate: string;
  rentalRevenue: string;
  operatingExpenses: string;
  buyerEntryFee: string;
  closingCosts: string;
  isInterestOnly: boolean;
}

interface CreativeFinancingEvaluatorProps {
  selectedDealId?: string | null;
}

const CreativeFinancingEvaluator: React.FC<CreativeFinancingEvaluatorProps> = ({ selectedDealId }) => {
  // State for form inputs
  const [inputs, setInputs] = useState<CreativeFinancingInputs>({
    purchasePrice: '',
    listedPrice: '',
    downPayment: '',
    interestRate: '',
    termYears: '30',
    balloonYears: '7',
    firstPaymentDate: new Date().toISOString().split('T')[0],
    rentalRevenue: '',
    operatingExpenses: '',
    buyerEntryFee: '',
    closingCosts: '',
    isInterestOnly: false
  });

  // State for results
  const [results, setResults] = useState<{
    monthlyPayment: number;
    balloonBalance: number;
    sellerProfit: { amount: number; percentage: number };
    cashFlow: {
      monthlyCashFlow: number;
      annualCashFlow: number;
      cashOnCashReturn: number;
    };
    criteria: {
      meetsMinimumCashFlow: boolean;
      meetsMaximumOfferPrice: boolean;
      meetsMinimumCashOnCash: boolean;
      meetsMaximumDownPayment: boolean;
      meetsMaximumInterestRate: boolean;
      meetsMinimumBalloon: boolean;
    };
    amortizationSchedule: AmortizationRow[];
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

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setInputs(prev => ({
      ...prev,
      isInterestOnly: checked
    }));
  };

  // Calculate the deal
  const calculateDeal = () => {
    // Parse inputs
    const purchasePrice = parseFloat(inputs.purchasePrice) || 0;
    const listedPrice = parseFloat(inputs.listedPrice) || 0;
    const downPayment = parseFloat(inputs.downPayment) || 0;
    const interestRate = parseFloat(inputs.interestRate) || 0;
    const termYears = parseFloat(inputs.termYears) || 30;
    const balloonYears = parseFloat(inputs.balloonYears) || 7;
    const rentalRevenue = parseFloat(inputs.rentalRevenue) || 0;
    const operatingExpenses = parseFloat(inputs.operatingExpenses) || 0;
    const buyerEntryFee = parseFloat(inputs.buyerEntryFee) || 0;
    const closingCosts = parseFloat(inputs.closingCosts) || 0;
    const loanAmount = purchasePrice - downPayment;

    // Calculate monthly payment
    const monthlyPayment = inputs.isInterestOnly
      ? calculateInterestOnlyPayment(loanAmount, interestRate)
      : calculateMonthlyPayment(loanAmount, interestRate, termYears);

    // Generate amortization schedule
    const amortizationSchedule = generateAmortizationSchedule(
      loanAmount,
      interestRate,
      termYears,
      new Date(inputs.firstPaymentDate),
      inputs.isInterestOnly
    );

    // Calculate balloon balance
    const balloonBalance = calculateBalloonBalance(
      loanAmount,
      interestRate,
      termYears,
      balloonYears,
      inputs.isInterestOnly
    );

    // Calculate seller profit
    const sellerProfit = calculateSellerProfit(listedPrice, purchasePrice);

    // Calculate cash flow
    const cashFlow = calculateCashFlow(
      rentalRevenue,
      operatingExpenses,
      monthlyPayment,
      downPayment + buyerEntryFee + closingCosts
    );

    // Check deal criteria
    const criteria = checkDealCriteria(
      cashFlow.monthlyCashFlow,
      purchasePrice,
      cashFlow.cashOnCashReturn,
      downPayment,
      interestRate,
      balloonYears
    );

    setResults({
      monthlyPayment,
      balloonBalance,
      sellerProfit,
      cashFlow,
      criteria,
      amortizationSchedule
    });
  };

  const handleSaveDeal = () => {
    if (!results) return;

    storageService.saveDeal({
      type: 'creative',
      name: `Creative Financing - ${formatCurrency(results.monthlyPayment)}/mo`,
      inputs: {
        purchasePrice: inputs.purchasePrice,
        listedPrice: inputs.listedPrice,
        downPayment: inputs.downPayment,
        interestRate: inputs.interestRate,
        termYears: inputs.termYears,
        balloonYears: inputs.balloonYears,
        firstPaymentDate: inputs.firstPaymentDate,
        rentalRevenue: inputs.rentalRevenue,
        operatingExpenses: inputs.operatingExpenses,
        buyerEntryFee: inputs.buyerEntryFee,
        closingCosts: inputs.closingCosts,
        isInterestOnly: inputs.isInterestOnly
      },
      results: {
        monthlyPayment: results.monthlyPayment,
        balloonBalance: results.balloonBalance,
        sellerProfit: results.sellerProfit,
        cashFlow: results.cashFlow,
        criteria: results.criteria
      }
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" gutterBottom>
          Creative Financing Evaluator
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
        Evaluate seller financing and subject-to deals with detailed payment schedules and cash flow analysis.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Deal Parameters
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
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="The price you're offering to pay">
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
                    label="Listed Price ($)"
                    name="listedPrice"
                    type="number"
                    value={inputs.listedPrice}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="The seller's asking price">
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
                    label="Down Payment ($)"
                    name="downPayment"
                    type="number"
                    value={inputs.downPayment}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Initial cash payment">
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
                    label="Balloon Due (Years)"
                    name="balloonYears"
                    type="number"
                    value={inputs.balloonYears}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="When the remaining balance is due">
                            <InfoIcon fontSize="small" color="action" />
                          </Tooltip>
                        </InputAdornment>
                      )
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
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={inputs.isInterestOnly}
                        onChange={handleCheckboxChange}
                      />
                    }
                    label="Interest Only"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Income & Expenses
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Monthly Operating Expenses ($)"
                    name="operatingExpenses"
                    type="number"
                    value={inputs.operatingExpenses}
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
                    label="Buyer Entry Fee ($)"
                    name="buyerEntryFee"
                    type="number"
                    value={inputs.buyerEntryFee}
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
                  Calculate Deal
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
                  Deal Analysis
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
                            Balloon Balance
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            After {inputs.balloonYears} years
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="primary">
                            {formatCurrency(results.balloonBalance)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body1">
                            Seller Profit
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="primary">
                            {formatCurrency(results.sellerProfit.amount)} ({results.sellerProfit.percentage.toFixed(1)}%)
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
                    Deal Criteria
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <Typography variant="body1">
                              Minimum Cash Flow ($200)
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color={results.criteria.meetsMinimumCashFlow ? "success" : "error"}>
                              {results.criteria.meetsMinimumCashFlow ? "✓" : "✗"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography variant="body1">
                              Maximum Offer Price ($500K)
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color={results.criteria.meetsMaximumOfferPrice ? "success" : "error"}>
                              {results.criteria.meetsMaximumOfferPrice ? "✓" : "✗"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography variant="body1">
                              Minimum Cash-on-Cash (13%)
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color={results.criteria.meetsMinimumCashOnCash ? "success" : "error"}>
                              {results.criteria.meetsMinimumCashOnCash ? "✓" : "✗"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography variant="body1">
                              Maximum Down Payment (15%)
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color={results.criteria.meetsMaximumDownPayment ? "success" : "error"}>
                              {results.criteria.meetsMaximumDownPayment ? "✓" : "✗"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography variant="body1">
                              Maximum Interest Rate (4%)
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color={results.criteria.meetsMaximumInterestRate ? "success" : "error"}>
                              {results.criteria.meetsMaximumInterestRate ? "✓" : "✗"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography variant="body1">
                              Minimum Balloon (5 years)
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color={results.criteria.meetsMinimumBalloon ? "success" : "error"}>
                              {results.criteria.meetsMinimumBalloon ? "✓" : "✗"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Payment Schedule
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

export default CreativeFinancingEvaluator; 