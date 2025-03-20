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
  SelectChangeEvent,
  Switch,
  FormControlLabel,
  Tabs,
  Tab
} from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Interface for TabPanel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// TabPanel component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`strategy-tabpanel-${index}`}
      aria-labelledby={`strategy-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CreativeOfferCalculator: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  
  // Common inputs for all strategies
  const [commonInputs, setCommonInputs] = useState({
    purchasePrice: '',
    afterRepairValue: '',
    repairCosts: '',
    closingCosts: '',
    holdingCosts: '',
    sellingCosts: ''
  });

  // Subject-To specific inputs
  const [subjectToInputs, setSubjectToInputs] = useState({
    existingLoanBalance: '',
    existingInterestRate: '4.5',
    existingMonthlyPayment: '',
    remainingLoanTerm: '25'
  });

  // Lease Option specific inputs
  const [leaseOptionInputs, setLeaseOptionInputs] = useState({
    optionFee: '',
    leaseTerm: '24',
    monthlyRent: '',
    rentCredit: '20',
    optionPurchasePrice: ''
  });

  // Owner Financing specific inputs
  const [ownerFinanceInputs, setOwnerFinanceInputs] = useState({
    downPayment: '10',
    interestRate: '6',
    loanTerm: '15',
    balloonTerm: '5'
  });

  // Results for each strategy
  const [results, setResults] = useState({
    subjectTo: {
      initialInvestment: 0,
      monthlyCashFlow: 0,
      annualCashFlow: 0,
      equityCapture: 0,
      roi: 0,
      exitStrategyProfit: 0
    },
    leaseOption: {
      initialInvestment: 0,
      monthlyCashFlow: 0,
      annualCashFlow: 0,
      totalRentCollected: 0,
      totalRentCredits: 0,
      exitStrategyProfit: 0
    },
    ownerFinance: {
      loanAmount: 0,
      monthlyPayment: 0,
      totalInterest: 0,
      balloonAmount: 0,
      equityCapture: 0,
      roi: 0
    }
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCommonInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCommonInputs({
      ...commonInputs,
      [name]: value
    });
  };

  const handleSubjectToInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSubjectToInputs({
      ...subjectToInputs,
      [name]: value
    });
  };

  const handleLeaseOptionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLeaseOptionInputs({
      ...leaseOptionInputs,
      [name]: value
    });
  };

  const handleOwnerFinanceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOwnerFinanceInputs({
      ...ownerFinanceInputs,
      [name]: value
    });
  };

  const calculateSubjectToDeal = () => {
    // Convert inputs to numbers
    const purchasePrice = parseFloat(commonInputs.purchasePrice) || 0;
    const afterRepairValue = parseFloat(commonInputs.afterRepairValue) || 0;
    const repairCosts = parseFloat(commonInputs.repairCosts) || 0;
    const closingCosts = parseFloat(commonInputs.closingCosts) || 0;
    const holdingCosts = parseFloat(commonInputs.holdingCosts) || 0;
    const sellingCosts = parseFloat(commonInputs.sellingCosts) || 0;
    
    const existingLoanBalance = parseFloat(subjectToInputs.existingLoanBalance) || 0;
    const existingMonthlyPayment = parseFloat(subjectToInputs.existingMonthlyPayment) || 0;
    
    // Calculate initial investment (repairs + closing costs)
    const initialInvestment = repairCosts + closingCosts;
    
    // Calculate monthly cash flow (assume a rental)
    const estimatedRent = afterRepairValue * 0.008; // Estimated monthly rent (0.8% of ARV rule of thumb)
    const monthlyCashFlow = estimatedRent - existingMonthlyPayment - (holdingCosts / 12);
    const annualCashFlow = monthlyCashFlow * 12;
    
    // Calculate equity capture
    const equityCapture = afterRepairValue - existingLoanBalance - repairCosts;
    
    // Calculate ROI
    const roi = initialInvestment > 0 ? (annualCashFlow / initialInvestment) * 100 : 0;
    
    // Calculate exit strategy profit (sell after repairs)
    const exitStrategyProfit = afterRepairValue - existingLoanBalance - repairCosts - sellingCosts;
    
    setResults({
      ...results,
      subjectTo: {
        initialInvestment,
        monthlyCashFlow,
        annualCashFlow,
        equityCapture,
        roi,
        exitStrategyProfit
      }
    });
  };

  const calculateLeaseOptionDeal = () => {
    // Convert inputs to numbers
    const purchasePrice = parseFloat(commonInputs.purchasePrice) || 0;
    const afterRepairValue = parseFloat(commonInputs.afterRepairValue) || 0;
    const repairCosts = parseFloat(commonInputs.repairCosts) || 0;
    const closingCosts = parseFloat(commonInputs.closingCosts) || 0;
    const holdingCosts = parseFloat(commonInputs.holdingCosts) || 0;
    const sellingCosts = parseFloat(commonInputs.sellingCosts) || 0;
    
    const optionFee = parseFloat(leaseOptionInputs.optionFee) || 0;
    const leaseTerm = parseInt(leaseOptionInputs.leaseTerm) || 0;
    const monthlyRent = parseFloat(leaseOptionInputs.monthlyRent) || 0;
    const rentCreditPercent = parseFloat(leaseOptionInputs.rentCredit) / 100 || 0;
    const optionPurchasePrice = parseFloat(leaseOptionInputs.optionPurchasePrice) || afterRepairValue;
    
    // Calculate initial investment
    const initialInvestment = optionFee + repairCosts;
    
    // Calculate monthly and annual cash flow
    const monthlyCashFlow = monthlyRent - (holdingCosts / 12);
    const annualCashFlow = monthlyCashFlow * 12;
    
    // Calculate total over the lease term
    const leaseTermInMonths = leaseTerm || 24; // Default to 24 months if not provided
    const totalRentCollected = monthlyRent * leaseTermInMonths;
    const monthlyRentCredit = monthlyRent * rentCreditPercent;
    const totalRentCredits = monthlyRentCredit * leaseTermInMonths;
    
    // Calculate exit strategy profit (assume tenant exercises option)
    const exitStrategyProfit = optionPurchasePrice - purchasePrice - totalRentCredits - sellingCosts;
    
    setResults({
      ...results,
      leaseOption: {
        initialInvestment,
        monthlyCashFlow,
        annualCashFlow,
        totalRentCollected,
        totalRentCredits,
        exitStrategyProfit
      }
    });
  };

  const calculateOwnerFinanceDeal = () => {
    // Convert inputs to numbers
    const purchasePrice = parseFloat(commonInputs.purchasePrice) || 0;
    const afterRepairValue = parseFloat(commonInputs.afterRepairValue) || 0;
    const repairCosts = parseFloat(commonInputs.repairCosts) || 0;
    const closingCosts = parseFloat(commonInputs.closingCosts) || 0;
    const holdingCosts = parseFloat(commonInputs.holdingCosts) || 0;
    const sellingCosts = parseFloat(commonInputs.sellingCosts) || 0;
    
    const downPaymentPercent = parseFloat(ownerFinanceInputs.downPayment) / 100 || 0;
    const interestRate = parseFloat(ownerFinanceInputs.interestRate) / 100 || 0;
    const loanTerm = parseInt(ownerFinanceInputs.loanTerm) || 0;
    const balloonTerm = parseInt(ownerFinanceInputs.balloonTerm) || 0;
    
    // Calculate loan amount and down payment
    const downPaymentAmount = purchasePrice * downPaymentPercent;
    const loanAmount = purchasePrice - downPaymentAmount;
    
    // Calculate monthly payment
    const monthlyInterestRate = interestRate / 12;
    const numberOfPayments = loanTerm * 12;
    
    let monthlyPayment = 0;
    if (loanAmount > 0 && interestRate > 0) {
      monthlyPayment = loanAmount * 
        (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    }
    
    // Calculate balloon payment
    let balloonAmount = 0;
    let totalInterest = 0;
    
    if (balloonTerm > 0 && balloonTerm < loanTerm) {
      let balance = loanAmount;
      const balloonPaymentNumber = balloonTerm * 12;
      
      for (let i = 1; i <= balloonPaymentNumber; i++) {
        const interestPayment = balance * monthlyInterestRate;
        const principalPayment = monthlyPayment - interestPayment;
        
        balance -= principalPayment;
        totalInterest += interestPayment;
      }
      
      balloonAmount = balance;
    } else {
      // Calculate total interest paid over the full term
      totalInterest = (monthlyPayment * numberOfPayments) - loanAmount;
    }
    
    // Calculate equity capture (assuming you're selling with owner financing)
    const equityCapture = afterRepairValue - purchasePrice - repairCosts;
    
    // Calculate ROI (return from interest)
    const interestROI = downPaymentAmount > 0 ? (totalInterest / downPaymentAmount) * 100 : 0;
    
    setResults({
      ...results,
      ownerFinance: {
        loanAmount,
        monthlyPayment,
        totalInterest,
        balloonAmount,
        equityCapture,
        roi: interestROI
      }
    });
  };

  const calculateDeal = () => {
    if (tabValue === 0) {
      calculateSubjectToDeal();
    } else if (tabValue === 1) {
      calculateLeaseOptionDeal();
    } else if (tabValue === 2) {
      calculateOwnerFinanceDeal();
    }
  };

  // Prepare chart data for Subject-To
  const subjectToChartData = {
    labels: ['Existing Loan Balance', 'Equity Capture', 'Repair Costs'],
    datasets: [
      {
        data: [
          parseFloat(subjectToInputs.existingLoanBalance) || 0,
          results.subjectTo.equityCapture,
          parseFloat(commonInputs.repairCosts) || 0
        ],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56'
        ]
      }
    ]
  };

  // Prepare chart data for Lease Option
  const leaseOptionChartData = {
    labels: ['Option Fee', 'Total Rent', 'Rent Credits', 'Exit Profit'],
    datasets: [
      {
        data: [
          parseFloat(leaseOptionInputs.optionFee) || 0,
          results.leaseOption.totalRentCollected,
          results.leaseOption.totalRentCredits,
          results.leaseOption.exitStrategyProfit
        ],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0'
        ]
      }
    ]
  };

  // Prepare chart data for Owner Finance
  const ownerFinanceChartData = {
    labels: ['Down Payment', 'Loan Amount', 'Total Interest', 'Balloon Payment'],
    datasets: [
      {
        data: [
          parseFloat(commonInputs.purchasePrice) * (parseFloat(ownerFinanceInputs.downPayment) / 100) || 0,
          results.ownerFinance.loanAmount,
          results.ownerFinance.totalInterest,
          results.ownerFinance.balloonAmount
        ],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0'
        ]
      }
    ]
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Creative Offer Calculator
      </Typography>
      <Typography variant="body1" paragraph>
        Analyze creative financing strategies including Subject-To, Lease Options, and Owner Financing.
      </Typography>

      <Paper elevation={3}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Subject-To" />
          <Tab label="Lease Option" />
          <Tab label="Owner Financing" />
        </Tabs>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Box p={2}>
              <Typography variant="subtitle1" gutterBottom>
                Property Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Purchase Price ($)"
                    name="purchasePrice"
                    type="number"
                    value={commonInputs.purchasePrice}
                    onChange={handleCommonInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="After Repair Value - ARV ($)"
                    name="afterRepairValue"
                    type="number"
                    value={commonInputs.afterRepairValue}
                    onChange={handleCommonInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Repair Costs ($)"
                    name="repairCosts"
                    type="number"
                    value={commonInputs.repairCosts}
                    onChange={handleCommonInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Closing Costs ($)"
                    name="closingCosts"
                    type="number"
                    value={commonInputs.closingCosts}
                    onChange={handleCommonInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Holding Costs ($/year)"
                    name="holdingCosts"
                    type="number"
                    value={commonInputs.holdingCosts}
                    onChange={handleCommonInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Selling Costs ($)"
                    name="sellingCosts"
                    type="number"
                    value={commonInputs.sellingCosts}
                    onChange={handleCommonInputChange}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <TabPanel value={tabValue} index={0}>
              <Typography variant="subtitle1" gutterBottom>
                Subject-To Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Existing Loan Balance ($)"
                    name="existingLoanBalance"
                    type="number"
                    value={subjectToInputs.existingLoanBalance}
                    onChange={handleSubjectToInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Existing Interest Rate (%)"
                    name="existingInterestRate"
                    type="number"
                    value={subjectToInputs.existingInterestRate}
                    onChange={handleSubjectToInputChange}
                    variant="outlined"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Existing Monthly Payment ($)"
                    name="existingMonthlyPayment"
                    type="number"
                    value={subjectToInputs.existingMonthlyPayment}
                    onChange={handleSubjectToInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Remaining Loan Term (years)"
                    name="remainingLoanTerm"
                    type="number"
                    value={subjectToInputs.remainingLoanTerm}
                    onChange={handleSubjectToInputChange}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="subtitle1" gutterBottom>
                Lease Option Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Option Fee ($)"
                    name="optionFee"
                    type="number"
                    value={leaseOptionInputs.optionFee}
                    onChange={handleLeaseOptionInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Lease Term (months)"
                    name="leaseTerm"
                    type="number"
                    value={leaseOptionInputs.leaseTerm}
                    onChange={handleLeaseOptionInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Monthly Rent ($)"
                    name="monthlyRent"
                    type="number"
                    value={leaseOptionInputs.monthlyRent}
                    onChange={handleLeaseOptionInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Rent Credit (%)"
                    name="rentCredit"
                    type="number"
                    value={leaseOptionInputs.rentCredit}
                    onChange={handleLeaseOptionInputChange}
                    variant="outlined"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Option Purchase Price ($)"
                    name="optionPurchasePrice"
                    type="number"
                    value={leaseOptionInputs.optionPurchasePrice}
                    onChange={handleLeaseOptionInputChange}
                    variant="outlined"
                    placeholder={commonInputs.afterRepairValue || "Same as ARV if left blank"}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="subtitle1" gutterBottom>
                Owner Financing Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Down Payment (%)"
                    name="downPayment"
                    type="number"
                    value={ownerFinanceInputs.downPayment}
                    onChange={handleOwnerFinanceInputChange}
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
                    value={ownerFinanceInputs.interestRate}
                    onChange={handleOwnerFinanceInputChange}
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
                    value={ownerFinanceInputs.loanTerm}
                    onChange={handleOwnerFinanceInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Balloon Term (years, 0 for none)"
                    name="balloonTerm"
                    type="number"
                    value={ownerFinanceInputs.balloonTerm}
                    onChange={handleOwnerFinanceInputChange}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </TabPanel>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" p={2}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={calculateDeal}
                size="large"
              >
                Calculate Deal
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Deal Analysis
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TabPanel value={tabValue} index={0}>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>Initial Investment</TableCell>
                            <TableCell align="right">${results.subjectTo.initialInvestment.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Monthly Cash Flow</TableCell>
                            <TableCell align="right">${results.subjectTo.monthlyCashFlow.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Annual Cash Flow</TableCell>
                            <TableCell align="right">${results.subjectTo.annualCashFlow.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Equity Capture</TableCell>
                            <TableCell align="right">${results.subjectTo.equityCapture.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Cash-on-Cash ROI</TableCell>
                            <TableCell align="right">{results.subjectTo.roi.toFixed(2)}%</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Exit Strategy Profit</TableCell>
                            <TableCell align="right">${results.subjectTo.exitStrategyProfit.toFixed(2)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </TabPanel>

                  <TabPanel value={tabValue} index={1}>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>Initial Investment</TableCell>
                            <TableCell align="right">${results.leaseOption.initialInvestment.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Monthly Cash Flow</TableCell>
                            <TableCell align="right">${results.leaseOption.monthlyCashFlow.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Annual Cash Flow</TableCell>
                            <TableCell align="right">${results.leaseOption.annualCashFlow.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Total Rent Collected</TableCell>
                            <TableCell align="right">${results.leaseOption.totalRentCollected.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Total Rent Credits</TableCell>
                            <TableCell align="right">${results.leaseOption.totalRentCredits.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Exit Strategy Profit</TableCell>
                            <TableCell align="right">${results.leaseOption.exitStrategyProfit.toFixed(2)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </TabPanel>

                  <TabPanel value={tabValue} index={2}>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>Loan Amount</TableCell>
                            <TableCell align="right">${results.ownerFinance.loanAmount.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Monthly Payment</TableCell>
                            <TableCell align="right">${results.ownerFinance.monthlyPayment.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Total Interest</TableCell>
                            <TableCell align="right">${results.ownerFinance.totalInterest.toFixed(2)}</TableCell>
                          </TableRow>
                          {parseFloat(ownerFinanceInputs.balloonTerm) > 0 && (
                            <TableRow>
                              <TableCell>Balloon Payment</TableCell>
                              <TableCell align="right">${results.ownerFinance.balloonAmount.toFixed(2)}</TableCell>
                            </TableRow>
                          )}
                          <TableRow>
                            <TableCell>Equity Capture</TableCell>
                            <TableCell align="right">${results.ownerFinance.equityCapture.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Interest ROI</TableCell>
                            <TableCell align="right">{results.ownerFinance.roi.toFixed(2)}%</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </TabPanel>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box height={300}>
                    <TabPanel value={tabValue} index={0}>
                      <Typography variant="subtitle1" gutterBottom>
                        Subject-To Deal Breakdown
                      </Typography>
                      <Pie data={subjectToChartData} options={{ maintainAspectRatio: false }} />
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                      <Typography variant="subtitle1" gutterBottom>
                        Lease Option Deal Breakdown
                      </Typography>
                      <Pie data={leaseOptionChartData} options={{ maintainAspectRatio: false }} />
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
                      <Typography variant="subtitle1" gutterBottom>
                        Owner Financing Deal Breakdown
                      </Typography>
                      <Pie data={ownerFinanceChartData} options={{ maintainAspectRatio: false }} />
                    </TabPanel>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CreativeOfferCalculator; 