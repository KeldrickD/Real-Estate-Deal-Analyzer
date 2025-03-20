import React, { useState } from 'react';
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
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SellerFinanceCalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    purchasePrice: '',
    downPayment: '10',
    interestRate: '6',
    loanTerm: '15',
    balloonPayment: '0',
    balloonTerm: '5',
    monthlyRent: '',
    vacancyRate: '5',
    propertyManagement: '10',
    propertyTaxes: '',
    insurance: '',
    maintenance: '5',
    annualAppreciation: '3',
    sellerConcessions: '0',
    paymentFrequency: 'monthly'
  });

  const [results, setResults] = useState({
    loanAmount: 0,
    monthlyPayment: 0,
    totalPayments: 0,
    totalInterest: 0,
    balloonAmount: 0,
    amortizationSchedule: [] as any[],
    monthlyCashFlow: 0,
    annualCashFlow: 0,
    cashOnCash: 0,
    equityAfterBalloon: 0,
    roi: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value
    });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value
    });
  };

  const calculateAmortizationSchedule = (
    loanAmount: number,
    annualInterestRate: number,
    loanTermYears: number,
    balloonTermYears: number,
    paymentFrequency: string
  ) => {
    // Convert annual values to per-payment values
    let periodsPerYear = 12; // default monthly
    if (paymentFrequency === 'quarterly') periodsPerYear = 4;
    else if (paymentFrequency === 'annually') periodsPerYear = 1;
    
    const totalPayments = loanTermYears * periodsPerYear;
    const periodicInterestRate = annualInterestRate / 100 / periodsPerYear;
    const balloonPaymentPeriod = balloonTermYears * periodsPerYear;
    
    // Calculate monthly payment using the formula: M = P[r(1+r)^n]/[(1+r)^n-1]
    const monthlyPayment = loanAmount * 
      (periodicInterestRate * Math.pow(1 + periodicInterestRate, totalPayments)) / 
      (Math.pow(1 + periodicInterestRate, totalPayments) - 1);
      
    let balance = loanAmount;
    let totalInterest = 0;
    const schedule = [];
    
    // Generate full amortization schedule
    for (let period = 1; period <= totalPayments; period++) {
      const interestPayment = balance * periodicInterestRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      totalInterest += interestPayment;
      
      schedule.push({
        period,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: balance > 0 ? balance : 0,
        totalInterest
      });
      
      // If this is the balloon payment period, update the balance
      if (period === balloonPaymentPeriod && balloonPaymentPeriod > 0 && balloonPaymentPeriod < totalPayments) {
        break;
      }
    }
    
    return {
      monthlyPayment,
      totalPayments,
      totalInterest,
      balloonAmount: balloonPaymentPeriod > 0 ? schedule[balloonPaymentPeriod - 1].balance : 0,
      schedule
    };
  };

  const calculateDeal = () => {
    // Convert inputs to numbers
    const purchasePrice = parseFloat(inputs.purchasePrice) || 0;
    const downPaymentPercent = parseFloat(inputs.downPayment) / 100;
    const annualInterestRate = parseFloat(inputs.interestRate) || 0;
    const loanTermYears = parseInt(inputs.loanTerm) || 0;
    const balloonTermYears = parseInt(inputs.balloonTerm) || 0;
    const monthlyRent = parseFloat(inputs.monthlyRent) || 0;
    const vacancyRate = parseFloat(inputs.vacancyRate) / 100 || 0;
    const propertyManagement = parseFloat(inputs.propertyManagement) / 100 || 0;
    const propertyTaxes = parseFloat(inputs.propertyTaxes) || 0;
    const insurance = parseFloat(inputs.insurance) || 0;
    const maintenance = parseFloat(inputs.maintenance) / 100 || 0;
    const sellerConcessions = parseFloat(inputs.sellerConcessions) || 0;
    const annualAppreciation = parseFloat(inputs.annualAppreciation) / 100 || 0;
    
    // Calculate loan amount
    const downPaymentAmount = purchasePrice * downPaymentPercent;
    const loanAmount = purchasePrice - downPaymentAmount - sellerConcessions;
    
    // Calculate amortization schedule
    const {
      monthlyPayment,
      totalPayments,
      totalInterest,
      balloonAmount,
      schedule
    } = calculateAmortizationSchedule(
      loanAmount,
      annualInterestRate,
      loanTermYears,
      balloonTermYears,
      inputs.paymentFrequency
    );
    
    // Calculate cash flow
    const effectiveGrossIncome = monthlyRent * 12 * (1 - vacancyRate);
    const annualExpenses = 
      (effectiveGrossIncome * propertyManagement) + 
      (effectiveGrossIncome * maintenance) + 
      propertyTaxes + 
      insurance;
    
    const annualDebtService = monthlyPayment * 12;
    const annualCashFlow = effectiveGrossIncome - annualExpenses - annualDebtService;
    const monthlyCashFlow = annualCashFlow / 12;
    
    // Calculate returns
    const totalInvestment = downPaymentAmount + sellerConcessions;
    const cashOnCash = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;
    
    // Calculate property value at balloon
    const propertyValueAtBalloon = purchasePrice * Math.pow(1 + annualAppreciation, balloonTermYears);
    const equityAfterBalloon = propertyValueAtBalloon - balloonAmount;
    
    // Calculate total ROI
    const totalCashFlow = annualCashFlow * balloonTermYears;
    const equityGain = equityAfterBalloon - totalInvestment;
    const totalReturn = totalCashFlow + equityGain;
    const roi = totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0;
    
    // Update results
    setResults({
      loanAmount,
      monthlyPayment,
      totalPayments,
      totalInterest,
      balloonAmount,
      amortizationSchedule: schedule,
      monthlyCashFlow,
      annualCashFlow,
      cashOnCash,
      equityAfterBalloon,
      roi
    });
  };

  // Prepare chart data for loan balance over time
  const chartData = {
    labels: results.amortizationSchedule.map(item => item.period),
    datasets: [
      {
        label: 'Loan Balance',
        data: results.amortizationSchedule.map(item => item.balance),
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        fill: true,
      },
      {
        label: 'Cumulative Interest',
        data: results.amortizationSchedule.map(item => item.totalInterest),
        borderColor: '#dc004e',
        backgroundColor: 'rgba(220, 0, 78, 0.1)',
        fill: true,
      }
    ]
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Seller Finance Calculator
      </Typography>
      <Typography variant="body1" paragraph>
        Calculate seller financing terms and analyze the deal from both buyer and seller perspectives.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Financing Details
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
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Down Payment (%)"
                    name="downPayment"
                    type="number"
                    value={inputs.downPayment}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
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
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Loan Term (years)"
                    name="loanTerm"
                    type="number"
                    value={inputs.loanTerm}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Balloon Term (years, 0 for none)"
                    name="balloonTerm"
                    type="number"
                    value={inputs.balloonTerm}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Payment Frequency</InputLabel>
                    <Select
                      name="paymentFrequency"
                      value={inputs.paymentFrequency}
                      onChange={handleSelectChange}
                      label="Payment Frequency"
                    >
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="quarterly">Quarterly</MenuItem>
                      <MenuItem value="annually">Annually</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Seller Concessions ($)"
                    name="sellerConcessions"
                    type="number"
                    value={inputs.sellerConcessions}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom mt={2}>
                    Property Details
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Monthly Rent ($)"
                    name="monthlyRent"
                    type="number"
                    value={inputs.monthlyRent}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Vacancy Rate (%)"
                    name="vacancyRate"
                    type="number"
                    value={inputs.vacancyRate}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Property Management (%)"
                    name="propertyManagement"
                    type="number"
                    value={inputs.propertyManagement}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Maintenance (%)"
                    name="maintenance"
                    type="number"
                    value={inputs.maintenance}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Property Taxes ($/year)"
                    name="propertyTaxes"
                    type="number"
                    value={inputs.propertyTaxes}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Insurance ($/year)"
                    name="insurance"
                    type="number"
                    value={inputs.insurance}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Annual Appreciation (%)"
                    name="annualAppreciation"
                    type="number"
                    value={inputs.annualAppreciation}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    onClick={calculateDeal}
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
                Financing Analysis
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Down Payment</TableCell>
                      <TableCell align="right">
                        ${((parseFloat(inputs.purchasePrice) || 0) * (parseFloat(inputs.downPayment) / 100 || 0)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Loan Amount</TableCell>
                      <TableCell align="right">${results.loanAmount.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Monthly Payment</TableCell>
                      <TableCell align="right">${results.monthlyPayment.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Payments</TableCell>
                      <TableCell align="right">{results.totalPayments}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Interest</TableCell>
                      <TableCell align="right">${results.totalInterest.toFixed(2)}</TableCell>
                    </TableRow>
                    {parseInt(inputs.balloonTerm) > 0 && (
                      <TableRow>
                        <TableCell>Balloon Payment (at year {inputs.balloonTerm})</TableCell>
                        <TableCell align="right">${results.balloonAmount.toFixed(2)}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="subtitle1" gutterBottom mt={3}>
                Cash Flow Analysis
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Monthly Cash Flow</TableCell>
                      <TableCell align="right">${results.monthlyCashFlow.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Annual Cash Flow</TableCell>
                      <TableCell align="right">${results.annualCashFlow.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Cash-on-Cash Return</TableCell>
                      <TableCell align="right">{results.cashOnCash.toFixed(2)}%</TableCell>
                    </TableRow>
                    {parseInt(inputs.balloonTerm) > 0 && (
                      <>
                        <TableRow>
                          <TableCell>Equity After Balloon Period</TableCell>
                          <TableCell align="right">${results.equityAfterBalloon.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Total ROI (after balloon period)</TableCell>
                          <TableCell align="right">{results.roi.toFixed(2)}%</TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {results.amortizationSchedule.length > 0 && (
                <Box mt={3} height={250}>
                  <Typography variant="subtitle1" gutterBottom>
                    Loan Balance & Interest
                  </Typography>
                  <Line 
                    data={chartData} 
                    options={{ 
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Amount ($)'
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Payment Period'
                          }
                        }
                      }
                    }}
                  />
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SellerFinanceCalculator; 