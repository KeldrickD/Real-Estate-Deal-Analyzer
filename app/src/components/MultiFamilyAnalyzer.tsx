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
  TableHead,
  TableRow,
  InputAdornment,
  Divider
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MultiFamilyAnalyzer: React.FC = () => {
  const [inputs, setInputs] = useState({
    purchasePrice: '',
    numberOfUnits: '',
    averageRent: '',
    otherIncome: '',
    vacancyRate: '5',
    propertyManagement: '10',
    repairsAndMaintenance: '5',
    propertyTax: '',
    insurance: '',
    utilities: '',
    downPayment: '20',
    interestRate: '4.5',
    loanTerm: '30',
    closingCosts: '',
    annualAppreciation: '3',
    capitalExpenditures: '5'
  });

  const [results, setResults] = useState({
    monthlyGrossIncome: 0,
    annualGrossIncome: 0,
    monthlyExpenses: 0,
    annualExpenses: 0,
    monthlyNetOperatingIncome: 0,
    annualNetOperatingIncome: 0,
    monthlyMortgagePayment: 0,
    annualMortgagePayment: 0,
    monthlyCashFlow: 0,
    annualCashFlow: 0,
    cashOnCashReturn: 0,
    capRate: 0,
    totalInvestment: 0,
    onePercentRule: false,
    grossRentMultiplier: 0,
    debtServiceCoverageRatio: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value
    });
  };

  const calculateDeal = () => {
    // Convert string inputs to numbers
    const purchasePrice = parseFloat(inputs.purchasePrice) || 0;
    const numberOfUnits = parseInt(inputs.numberOfUnits) || 0;
    const averageRent = parseFloat(inputs.averageRent) || 0;
    const otherIncome = parseFloat(inputs.otherIncome) || 0;
    const vacancyRate = parseFloat(inputs.vacancyRate) / 100 || 0;
    const propertyManagement = parseFloat(inputs.propertyManagement) / 100 || 0;
    const repairsAndMaintenance = parseFloat(inputs.repairsAndMaintenance) / 100 || 0;
    const propertyTax = parseFloat(inputs.propertyTax) || 0;
    const insurance = parseFloat(inputs.insurance) || 0;
    const utilities = parseFloat(inputs.utilities) || 0;
    const downPayment = parseFloat(inputs.downPayment) / 100 || 0;
    const interestRate = parseFloat(inputs.interestRate) / 100 || 0;
    const loanTerm = parseInt(inputs.loanTerm) || 30;
    const closingCosts = parseFloat(inputs.closingCosts) || 0;
    const annualAppreciation = parseFloat(inputs.annualAppreciation) / 100 || 0;
    const capitalExpenditures = parseFloat(inputs.capitalExpenditures) / 100 || 0;

    // Income calculations
    const monthlyGrossIncome = (numberOfUnits * averageRent) + otherIncome;
    const annualGrossIncome = monthlyGrossIncome * 12;
    const effectiveGrossIncome = annualGrossIncome * (1 - vacancyRate);

    // Expense calculations
    const propertyManagementExpense = effectiveGrossIncome * propertyManagement;
    const repairsExpense = effectiveGrossIncome * repairsAndMaintenance;
    const capExExpense = effectiveGrossIncome * capitalExpenditures;
    const totalAnnualExpenses = propertyManagementExpense + repairsExpense + propertyTax + insurance + utilities + capExExpense;
    const monthlyExpenses = totalAnnualExpenses / 12;

    // NOI - Net Operating Income
    const annualNetOperatingIncome = effectiveGrossIncome - totalAnnualExpenses;
    const monthlyNetOperatingIncome = annualNetOperatingIncome / 12;

    // Loan and cash flow calculations
    const loanAmount = purchasePrice * (1 - downPayment);
    const monthlyInterestRate = interestRate / 12;
    const numberOfPayments = loanTerm * 12;
    
    // Calculate monthly mortgage payment using the formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
    // Where: P = payment, L = loan amount, c = monthly interest rate, n = number of payments
    let monthlyMortgagePayment = 0;
    if (loanAmount > 0 && interestRate > 0) {
      monthlyMortgagePayment = loanAmount * 
        (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    }
    
    const annualMortgagePayment = monthlyMortgagePayment * 12;
    const monthlyCashFlow = monthlyNetOperatingIncome - monthlyMortgagePayment;
    const annualCashFlow = monthlyCashFlow * 12;

    // Return metrics
    const totalInvestment = (purchasePrice * downPayment) + closingCosts;
    const cashOnCashReturn = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;
    const capRate = purchasePrice > 0 ? (annualNetOperatingIncome / purchasePrice) * 100 : 0;
    
    // Additional metrics
    const onePercentRule = (monthlyGrossIncome / purchasePrice) >= 0.01;
    const grossRentMultiplier = annualGrossIncome > 0 ? purchasePrice / annualGrossIncome : 0;
    const debtServiceCoverageRatio = annualMortgagePayment > 0 ? annualNetOperatingIncome / annualMortgagePayment : 0;

    setResults({
      monthlyGrossIncome,
      annualGrossIncome,
      monthlyExpenses,
      annualExpenses: totalAnnualExpenses,
      monthlyNetOperatingIncome,
      annualNetOperatingIncome,
      monthlyMortgagePayment,
      annualMortgagePayment,
      monthlyCashFlow,
      annualCashFlow,
      cashOnCashReturn,
      capRate,
      totalInvestment,
      onePercentRule,
      grossRentMultiplier,
      debtServiceCoverageRatio
    });
  };

  // Prepare chart data for income vs expenses
  const cashFlowChartData = {
    labels: ['Monthly Cash Flow Breakdown'],
    datasets: [
      {
        label: 'Gross Income',
        data: [results.monthlyGrossIncome],
        backgroundColor: '#4CAF50',
      },
      {
        label: 'Expenses',
        data: [results.monthlyExpenses],
        backgroundColor: '#F44336',
      },
      {
        label: 'Mortgage',
        data: [results.monthlyMortgagePayment],
        backgroundColor: '#2196F3',
      },
      {
        label: 'Net Cash Flow',
        data: [results.monthlyCashFlow],
        backgroundColor: '#FFC107',
      }
    ]
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Multi-Family Property Analyzer
      </Typography>
      <Typography variant="body1" paragraph>
        Analyze the financial performance of multi-family investment properties.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Property Details
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
                    label="Average Rent per Unit ($)"
                    name="averageRent"
                    type="number"
                    value={inputs.averageRent}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Other Monthly Income ($)"
                    name="otherIncome"
                    type="number"
                    value={inputs.otherIncome}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom mt={2}>
                    Expenses
                  </Typography>
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
                    label="Repairs & Maintenance (%)"
                    name="repairsAndMaintenance"
                    type="number"
                    value={inputs.repairsAndMaintenance}
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
                    label="Capital Expenditures (%)"
                    name="capitalExpenditures"
                    type="number"
                    value={inputs.capitalExpenditures}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Property Tax ($/year)"
                    name="propertyTax"
                    type="number"
                    value={inputs.propertyTax}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
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
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Utilities ($/year)"
                    name="utilities"
                    type="number"
                    value={inputs.utilities}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom mt={2}>
                    Financing
                  </Typography>
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
                    label="Closing Costs ($)"
                    name="closingCosts"
                    type="number"
                    value={inputs.closingCosts}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    onClick={calculateDeal}
                  >
                    Analyze Property
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
                Financial Analysis
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Metric</TableCell>
                          <TableCell align="right">Monthly</TableCell>
                          <TableCell align="right">Annual</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Gross Income</TableCell>
                          <TableCell align="right">${results.monthlyGrossIncome.toFixed(2)}</TableCell>
                          <TableCell align="right">${results.annualGrossIncome.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Expenses</TableCell>
                          <TableCell align="right">${results.monthlyExpenses.toFixed(2)}</TableCell>
                          <TableCell align="right">${results.annualExpenses.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Net Operating Income (NOI)</TableCell>
                          <TableCell align="right">${results.monthlyNetOperatingIncome.toFixed(2)}</TableCell>
                          <TableCell align="right">${results.annualNetOperatingIncome.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Mortgage Payment</TableCell>
                          <TableCell align="right">${results.monthlyMortgagePayment.toFixed(2)}</TableCell>
                          <TableCell align="right">${results.annualMortgagePayment.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Cash Flow</strong></TableCell>
                          <TableCell align="right"><strong>${results.monthlyCashFlow.toFixed(2)}</strong></TableCell>
                          <TableCell align="right"><strong>${results.annualCashFlow.toFixed(2)}</strong></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Return Metrics
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Total Investment</TableCell>
                          <TableCell align="right">${results.totalInvestment.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Cash-on-Cash Return</TableCell>
                          <TableCell align="right">{results.cashOnCashReturn.toFixed(2)}%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Cap Rate</TableCell>
                          <TableCell align="right">{results.capRate.toFixed(2)}%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>1% Rule</TableCell>
                          <TableCell align="right">{results.onePercentRule ? 'Pass' : 'Fail'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Gross Rent Multiplier</TableCell>
                          <TableCell align="right">{results.grossRentMultiplier.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Debt Service Coverage Ratio</TableCell>
                          <TableCell align="right">{results.debtServiceCoverageRatio.toFixed(2)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12}>
                  <Box mt={2} height={250}>
                    <Typography variant="subtitle1" gutterBottom>
                      Monthly Cash Flow Breakdown
                    </Typography>
                    <Bar 
                      data={cashFlowChartData} 
                      options={{ 
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top' as const,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MultiFamilyAnalyzer; 