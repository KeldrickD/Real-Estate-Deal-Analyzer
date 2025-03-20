import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  InputAdornment,
  Card,
  CardContent,
  Rating,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextareaAutosize
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import DownloadIcon from '@mui/icons-material/Download';
import FeedbackIcon from '@mui/icons-material/Feedback';
import { storageService } from '../services/storage';
import {
  calculateMonthlyPayment,
  calculateInterestOnlyPayment,
  calculateCashFlow
} from '../utils/financialCalculations';
import { 
  downloadSellerFinancingContract, 
  downloadLeaseOptionContract, 
  downloadSubjectToContract 
} from '../utils/contractTemplates';
import { saveAlternativeFeedback, getAverageRating } from '../services/feedback';

interface WholesaleInputs {
  purchasePrice: string;
  repairCosts: string;
  arv: string;
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
  roi: number;
  preferredOffer: number;
  assignmentFee: number;
  minimumScore: number;
  totalRehabCost: number;
  exitPercentage: number;
  wholesalePrice: number;
  preferredExitPrice: number;
}

interface SellerFinancingOption {
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  termYears: number;
  balloonYears: number;
  monthlyPayment: number;
  totalInterest: number;
  balloonPayment: number;
}

interface LeaseOptionAlternative {
  optionFee: number;
  monthlyRent: number;
  optionTerm: number;
  purchasePrice: number;
  potentialEquityGain: number;
  monthlyRentCredit: number;
  totalRentCredits: number;
}

interface SubjectToAlternative {
  existingLoanBalance: number;
  existingInterestRate: number;
  remainingTerm: number;
  monthlyPayment: number;
  equityAtTakeover: number;
  sellerCashout: number;
}

interface DealAlternativesProps {
  wholesaleInputs: WholesaleInputs;
  wholesaleResults: WholesaleResults;
  sellerAskingPrice: number;
  onSaveDeal: (dealType: string, dealInputs: any, dealResults: any) => void;
}

const DealAlternatives: React.FC<DealAlternativesProps> = ({
  wholesaleInputs,
  wholesaleResults,
  sellerAskingPrice,
  onSaveDeal
}) => {
  const [sellerFinancingOption, setSellerFinancingOption] = useState<SellerFinancingOption>({
    downPayment: 0,
    loanAmount: 0,
    interestRate: 6,
    termYears: 30,
    balloonYears: 7,
    monthlyPayment: 0,
    totalInterest: 0,
    balloonPayment: 0
  });

  const [leaseOption, setLeaseOption] = useState<LeaseOptionAlternative>({
    optionFee: 0,
    monthlyRent: 0,
    optionTerm: 3,
    purchasePrice: 0,
    potentialEquityGain: 0,
    monthlyRentCredit: 0,
    totalRentCredits: 0
  });

  const [subjectToOption, setSubjectToOption] = useState<SubjectToAlternative>({
    existingLoanBalance: sellerAskingPrice * 0.7, // Assuming 70% LTV
    existingInterestRate: 4.5,
    remainingTerm: 25,
    monthlyPayment: 0,
    equityAtTakeover: 0,
    sellerCashout: 0
  });

  const [activeTab, setActiveTab] = useState('sellerFinancing');
  const [customDownPayment, setCustomDownPayment] = useState('');
  const [customInterestRate, setCustomInterestRate] = useState('');
  const [customBalloonYears, setCustomBalloonYears] = useState('');
  const [customOptionFee, setCustomOptionFee] = useState('');
  const [customMonthlyRent, setCustomMonthlyRent] = useState('');
  const [customOptionTerm, setCustomOptionTerm] = useState('');
  const [customExistingLoanBalance, setCustomExistingLoanBalance] = useState('');
  const [customSellerCashout, setCustomSellerCashout] = useState('');
  
  // Price gap between MAO and asking price
  const priceGap = sellerAskingPrice - wholesaleResults.maxAllowableOffer;

  // New state for feedback and contract templates
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackStrategy, setFeedbackStrategy] = useState<'sellerFinancing' | 'leaseOption' | 'subjectTo'>('sellerFinancing');
  const [feedbackRating, setFeedbackRating] = useState<number | null>(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [contractType, setContractType] = useState<'sellerFinancing' | 'leaseOption' | 'subjectTo'>('sellerFinancing');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [buyerName, setBuyerName] = useState('');
  
  // Average ratings
  const [averageRatings, setAverageRatings] = useState({
    sellerFinancing: 0,
    leaseOption: 0,
    subjectTo: 0
  });
  
  // Initialize alternatives on load
  useEffect(() => {
    calculateSellerFinancingOption();
    calculateLeaseOption();
    calculateSubjectToOption();
  }, [wholesaleInputs, wholesaleResults, sellerAskingPrice]);

  // Load average ratings on component mount
  useEffect(() => {
    setAverageRatings({
      sellerFinancing: getAverageRating('sellerFinancing'),
      leaseOption: getAverageRating('leaseOption'),
      subjectTo: getAverageRating('subjectTo')
    });
  }, []);

  const calculateSellerFinancingOption = () => {
    // Calculate 10% down payment (adjust as needed)
    const downPayment = Math.round(sellerAskingPrice * 0.1);
    const loanAmount = sellerAskingPrice - downPayment;
    const interestRate = parseFloat(customInterestRate) || 6;
    const termYears = 30;
    const balloonYears = parseFloat(customBalloonYears) || 7;
    
    // Calculate monthly payment
    const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, termYears);
    
    // Calculate total interest over loan term
    let balance = loanAmount;
    let totalInterest = 0;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = termYears * 12;
    
    for (let i = 1; i <= balloonYears * 12; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      totalInterest += interestPayment;
      balance -= principalPayment;
    }
    
    // Balloon payment is the remaining balance
    const balloonPayment = balance;
    
    setSellerFinancingOption({
      downPayment: parseFloat(customDownPayment) || downPayment,
      loanAmount,
      interestRate,
      termYears,
      balloonYears,
      monthlyPayment,
      totalInterest,
      balloonPayment
    });
  };

  const calculateLeaseOption = () => {
    const optionFee = parseFloat(customOptionFee) || Math.round(sellerAskingPrice * 0.03); // 3% option fee
    const monthlyRent = parseFloat(customMonthlyRent) || Math.round(sellerAskingPrice * 0.008); // 0.8% of asking price
    const optionTerm = parseFloat(customOptionTerm) || 3; // years
    const purchasePrice = sellerAskingPrice; // Same as asking price, could adjust with negotiation
    const arv = parseFloat(wholesaleInputs.arv) || 0;
    const potentialEquityGain = arv - purchasePrice;
    const monthlyRentCredit = monthlyRent * 0.25; // 25% of rent goes toward purchase
    const totalRentCredits = monthlyRentCredit * optionTerm * 12;
    
    setLeaseOption({
      optionFee,
      monthlyRent,
      optionTerm,
      purchasePrice,
      potentialEquityGain,
      monthlyRentCredit,
      totalRentCredits
    });
  };

  const calculateSubjectToOption = () => {
    const existingLoanBalance = parseFloat(customExistingLoanBalance) || sellerAskingPrice * 0.7; // Assuming 70% LTV
    const sellerCashout = parseFloat(customSellerCashout) || sellerAskingPrice * 0.05; // 5% cash to seller
    const existingInterestRate = 4.5;
    const remainingTerm = 25;
    
    // Calculate monthly payment
    const monthlyPayment = calculateMonthlyPayment(existingLoanBalance, existingInterestRate, remainingTerm);
    
    // Calculate equity at takeover
    const equityAtTakeover = sellerAskingPrice - existingLoanBalance - sellerCashout;
    
    setSubjectToOption({
      existingLoanBalance,
      existingInterestRate,
      remainingTerm,
      monthlyPayment,
      equityAtTakeover,
      sellerCashout
    });
  };

  // Handle form input changes
  const handleCustomInputChange = (field: string, value: string) => {
    switch (field) {
      case 'downPayment':
        setCustomDownPayment(value);
        break;
      case 'interestRate':
        setCustomInterestRate(value);
        break;
      case 'balloonYears':
        setCustomBalloonYears(value);
        break;
      case 'optionFee':
        setCustomOptionFee(value);
        break;
      case 'monthlyRent':
        setCustomMonthlyRent(value);
        break;
      case 'optionTerm':
        setCustomOptionTerm(value);
        break;
      case 'existingLoanBalance':
        setCustomExistingLoanBalance(value);
        break;
      case 'sellerCashout':
        setCustomSellerCashout(value);
        break;
    }
  };

  const recalculateAlternative = () => {
    switch (activeTab) {
      case 'sellerFinancing':
        calculateSellerFinancingOption();
        break;
      case 'leaseOption':
        calculateLeaseOption();
        break;
      case 'subjectTo':
        calculateSubjectToOption();
        break;
    }
  };

  const handleSaveDeal = (alternativeType: string) => {
    switch (alternativeType) {
      case 'sellerFinancing':
        onSaveDeal('creative', {
          purchasePrice: sellerAskingPrice.toString(),
          listedPrice: sellerAskingPrice.toString(),
          downPayment: sellerFinancingOption.downPayment.toString(),
          interestRate: sellerFinancingOption.interestRate.toString(),
          termYears: sellerFinancingOption.termYears.toString(),
          balloonYears: sellerFinancingOption.balloonYears.toString(),
          firstPaymentDate: new Date().toISOString().split('T')[0],
          rentalRevenue: '0',
          operatingExpenses: '0',
          buyerEntryFee: '0',
          closingCosts: '0',
          isInterestOnly: false
        }, {
          monthlyPayment: sellerFinancingOption.monthlyPayment,
          balloonBalance: sellerFinancingOption.balloonPayment,
          sellerProfit: { 
            amount: priceGap,
            percentage: (priceGap / wholesaleResults.maxAllowableOffer) * 100
          },
          cashFlow: {
            monthlyCashFlow: 0,
            annualCashFlow: 0,
            cashOnCashReturn: 0
          },
          criteria: {
            meetsMinimumCashFlow: true,
            meetsMaximumOfferPrice: false,
            meetsMinimumCashOnCash: true,
            meetsMaximumDownPayment: true,
            meetsMaximumInterestRate: true,
            meetsMinimumBalloon: true
          }
        });
        break;
      case 'leaseOption':
        onSaveDeal('advanced', {
          propertyValue: parseFloat(wholesaleInputs.arv),
          optionFee: leaseOption.optionFee,
          optionPeriod: leaseOption.optionTerm * 12,
          monthlyRent: leaseOption.monthlyRent,
          purchasePrice: leaseOption.purchasePrice,
          downPayment: leaseOption.optionFee,
          interestRate: 5,
          loanTerm: 30
        }, {
          monthlyPayment: leaseOption.monthlyRent - leaseOption.monthlyRentCredit,
          totalOptionPayments: leaseOption.monthlyRent * leaseOption.optionTerm * 12,
          potentialProfit: leaseOption.potentialEquityGain,
          roi: (leaseOption.potentialEquityGain / leaseOption.optionFee) * 100,
          totalInvestment: leaseOption.optionFee
        });
        break;
      case 'subjectTo':
        onSaveDeal('creative', {
          purchasePrice: sellerAskingPrice.toString(),
          listedPrice: sellerAskingPrice.toString(),
          downPayment: subjectToOption.sellerCashout.toString(),
          interestRate: subjectToOption.existingInterestRate.toString(),
          termYears: subjectToOption.remainingTerm.toString(),
          balloonYears: '0',
          firstPaymentDate: new Date().toISOString().split('T')[0],
          rentalRevenue: '0',
          operatingExpenses: '0',
          buyerEntryFee: '0',
          closingCosts: '0',
          isInterestOnly: false
        }, {
          monthlyPayment: subjectToOption.monthlyPayment,
          balloonBalance: 0,
          sellerProfit: { 
            amount: subjectToOption.sellerCashout,
            percentage: (subjectToOption.sellerCashout / sellerAskingPrice) * 100
          },
          cashFlow: {
            monthlyCashFlow: 0,
            annualCashFlow: 0,
            cashOnCashReturn: 0
          },
          criteria: {
            meetsMinimumCashFlow: true,
            meetsMaximumOfferPrice: false,
            meetsMinimumCashOnCash: true,
            meetsMaximumDownPayment: true,
            meetsMaximumInterestRate: false,
            meetsMinimumBalloon: true
          }
        });
        break;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const isProfitable = () => {
    return priceGap > 0 && priceGap / sellerAskingPrice < 0.3;
  };

  // Handle opening the feedback dialog
  const handleOpenFeedbackDialog = (strategy: 'sellerFinancing' | 'leaseOption' | 'subjectTo') => {
    setFeedbackStrategy(strategy);
    setFeedbackRating(0);
    setFeedbackComment('');
    setFeedbackDialogOpen(true);
  };

  // Handle submitting feedback
  const handleSubmitFeedback = () => {
    if (feedbackRating) {
      saveAlternativeFeedback(feedbackStrategy, feedbackRating, feedbackComment);
      
      // Update average ratings
      setAverageRatings({
        ...averageRatings,
        [feedbackStrategy]: getAverageRating(feedbackStrategy)
      });
      
      setFeedbackDialogOpen(false);
      setSnackbarMessage('Thank you for your feedback!');
      setSnackbarOpen(true);
    }
  };

  // Handle opening the contract template dialog
  const handleOpenContractDialog = (type: 'sellerFinancing' | 'leaseOption' | 'subjectTo') => {
    setContractType(type);
    setPropertyAddress('');
    setSellerName('');
    setBuyerName('');
    setContractDialogOpen(true);
  };

  // Handle downloading contract templates
  const handleDownloadContract = () => {
    switch (contractType) {
      case 'sellerFinancing':
        downloadSellerFinancingContract(
          sellerName,
          buyerName,
          propertyAddress,
          sellerAskingPrice,
          sellerFinancingOption.downPayment,
          sellerFinancingOption.interestRate,
          sellerFinancingOption.termYears,
          sellerFinancingOption.balloonYears
        );
        break;
      case 'leaseOption':
        downloadLeaseOptionContract(
          sellerName,
          buyerName,
          propertyAddress,
          leaseOption.optionFee,
          leaseOption.monthlyRent,
          leaseOption.purchasePrice,
          leaseOption.optionTerm,
          25 // rent credit percentage
        );
        break;
      case 'subjectTo':
        downloadSubjectToContract(
          sellerName,
          buyerName,
          propertyAddress,
          sellerAskingPrice,
          subjectToOption.existingLoanBalance,
          subjectToOption.sellerCashout,
          `Original Loan: ${subjectToOption.existingInterestRate}% interest rate, ${subjectToOption.remainingTerm} years remaining.`
        );
        break;
    }
    
    setContractDialogOpen(false);
    setSnackbarMessage('Contract template downloaded successfully!');
    setSnackbarOpen(true);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Creative Financing Alternatives
      </Typography>
      
      <Alert 
        severity={isProfitable() ? "warning" : "error"} 
        sx={{ mb: 3 }}
      >
        Wholesale deal not feasible. {formatCurrency(priceGap)} gap between MAO ({formatCurrency(wholesaleResults.maxAllowableOffer)}) and 
        asking price ({formatCurrency(sellerAskingPrice)}). Consider these alternatives:
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card 
            raised={activeTab === 'sellerFinancing'}
            sx={{ 
              height: '100%', 
              cursor: 'pointer',
              borderColor: activeTab === 'sellerFinancing' ? 'primary.main' : 'transparent',
              borderWidth: 2,
              borderStyle: 'solid'
            }}
            onClick={() => setActiveTab('sellerFinancing')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Seller Financing</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Instead of paying all cash, offer to make payments over time with interest.
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2">
                <strong>Down Payment:</strong> {formatCurrency(sellerFinancingOption.downPayment)}
              </Typography>
              <Typography variant="body2">
                <strong>Monthly Payment:</strong> {formatCurrency(sellerFinancingOption.monthlyPayment)}
              </Typography>
              <Typography variant="body2">
                <strong>Balloon Payment:</strong> {formatCurrency(sellerFinancingOption.balloonPayment)} (after {sellerFinancingOption.balloonYears} years)
              </Typography>
              {averageRatings.sellerFinancing > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>User Rating:</Typography>
                  <Rating value={averageRatings.sellerFinancing} readOnly size="small" precision={0.5} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card 
            raised={activeTab === 'leaseOption'}
            sx={{ 
              height: '100%', 
              cursor: 'pointer',
              borderColor: activeTab === 'leaseOption' ? 'primary.main' : 'transparent',
              borderWidth: 2,
              borderStyle: 'solid'
            }}
            onClick={() => setActiveTab('leaseOption')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HomeWorkIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Lease Option</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Lease the property with an option to buy it later at a pre-set price.
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2">
                <strong>Option Fee:</strong> {formatCurrency(leaseOption.optionFee)}
              </Typography>
              <Typography variant="body2">
                <strong>Monthly Rent:</strong> {formatCurrency(leaseOption.monthlyRent)}
              </Typography>
              <Typography variant="body2">
                <strong>Purchase Price:</strong> {formatCurrency(leaseOption.purchasePrice)} (after {leaseOption.optionTerm} years)
              </Typography>
              {averageRatings.leaseOption > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>User Rating:</Typography>
                  <Rating value={averageRatings.leaseOption} readOnly size="small" precision={0.5} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card 
            raised={activeTab === 'subjectTo'}
            sx={{ 
              height: '100%', 
              cursor: 'pointer',
              borderColor: activeTab === 'subjectTo' ? 'primary.main' : 'transparent',
              borderWidth: 2,
              borderStyle: 'solid'
            }}
            onClick={() => setActiveTab('subjectTo')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CompareArrowsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Subject-To</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Take over the existing mortgage payments while giving the seller some cash.
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2">
                <strong>Existing Loan:</strong> {formatCurrency(subjectToOption.existingLoanBalance)}
              </Typography>
              <Typography variant="body2">
                <strong>Cash to Seller:</strong> {formatCurrency(subjectToOption.sellerCashout)}
              </Typography>
              <Typography variant="body2">
                <strong>Monthly Payment:</strong> {formatCurrency(subjectToOption.monthlyPayment)}
              </Typography>
              {averageRatings.subjectTo > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>User Rating:</Typography>
                  <Rating value={averageRatings.subjectTo} readOnly size="small" precision={0.5} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            {activeTab === 'sellerFinancing' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Seller Financing Details
                </Typography>
                <Typography variant="body2" paragraph>
                  With seller financing, the seller acts as the bank. You make a down payment and monthly 
                  payments directly to the seller, often with a balloon payment due after a set period.
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Down Payment ($)"
                      value={customDownPayment || sellerFinancingOption.downPayment}
                      onChange={(e) => handleCustomInputChange('downPayment', e.target.value)}
                      variant="outlined"
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Interest Rate (%)"
                      value={customInterestRate || sellerFinancingOption.interestRate}
                      onChange={(e) => handleCustomInputChange('interestRate', e.target.value)}
                      variant="outlined"
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Balloon Term (years)"
                      value={customBalloonYears || sellerFinancingOption.balloonYears}
                      onChange={(e) => handleCustomInputChange('balloonYears', e.target.value)}
                      variant="outlined"
                      type="number"
                    />
                  </Grid>
                </Grid>
                
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={recalculateAlternative}
                >
                  Calculate
                </Button>
                
                <TableContainer sx={{ mt: 3 }}>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>Purchase Price</TableCell>
                        <TableCell align="right">{formatCurrency(sellerAskingPrice)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Down Payment</TableCell>
                        <TableCell align="right">{formatCurrency(sellerFinancingOption.downPayment)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Loan Amount</TableCell>
                        <TableCell align="right">{formatCurrency(sellerFinancingOption.loanAmount)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Interest Rate</TableCell>
                        <TableCell align="right">{sellerFinancingOption.interestRate}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Term</TableCell>
                        <TableCell align="right">{sellerFinancingOption.termYears} years</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Monthly Payment</TableCell>
                        <TableCell align="right">{formatCurrency(sellerFinancingOption.monthlyPayment)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Balloon Due</TableCell>
                        <TableCell align="right">{formatCurrency(sellerFinancingOption.balloonPayment)} after {sellerFinancingOption.balloonYears} years</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Interest Paid</TableCell>
                        <TableCell align="right">{formatCurrency(sellerFinancingOption.totalInterest)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Why It Works:</strong>
                  </Typography>
                  <Typography variant="body2" paragraph>
                    The seller gets their asking price of {formatCurrency(sellerAskingPrice)} (more than your MAO of {formatCurrency(wholesaleResults.maxAllowableOffer)}), 
                    while you only need {formatCurrency(sellerFinancingOption.downPayment)} up front. You have time to rehab and either 
                    refinance or sell the property before the balloon payment is due.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="secondary"
                      onClick={() => handleSaveDeal('sellerFinancing')}
                    >
                      Save As Creative Financing Deal
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleOpenContractDialog('sellerFinancing')}
                    >
                      Download Contract Template
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<FeedbackIcon />}
                      onClick={() => handleOpenFeedbackDialog('sellerFinancing')}
                    >
                      Rate This Strategy
                    </Button>
                  </Box>
                </Box>
              </>
            )}
            
            {activeTab === 'leaseOption' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Lease Option Details
                </Typography>
                <Typography variant="body2" paragraph>
                  A lease option gives you the right to lease the property now and the option to buy it later at a 
                  predetermined price. This gives you control with minimal upfront cash.
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Option Fee ($)"
                      value={customOptionFee || leaseOption.optionFee}
                      onChange={(e) => handleCustomInputChange('optionFee', e.target.value)}
                      variant="outlined"
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Monthly Rent ($)"
                      value={customMonthlyRent || leaseOption.monthlyRent}
                      onChange={(e) => handleCustomInputChange('monthlyRent', e.target.value)}
                      variant="outlined"
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Option Term (years)"
                      value={customOptionTerm || leaseOption.optionTerm}
                      onChange={(e) => handleCustomInputChange('optionTerm', e.target.value)}
                      variant="outlined"
                      type="number"
                    />
                  </Grid>
                </Grid>
                
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={recalculateAlternative}
                >
                  Calculate
                </Button>
                
                <TableContainer sx={{ mt: 3 }}>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>Option Fee</TableCell>
                        <TableCell align="right">{formatCurrency(leaseOption.optionFee)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Monthly Rent</TableCell>
                        <TableCell align="right">{formatCurrency(leaseOption.monthlyRent)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Option Term</TableCell>
                        <TableCell align="right">{leaseOption.optionTerm} years</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Purchase Price</TableCell>
                        <TableCell align="right">{formatCurrency(leaseOption.purchasePrice)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Monthly Rent Credit</TableCell>
                        <TableCell align="right">{formatCurrency(leaseOption.monthlyRentCredit)} (25% of rent)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Rent Credits</TableCell>
                        <TableCell align="right">{formatCurrency(leaseOption.totalRentCredits)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>ARV</TableCell>
                        <TableCell align="right">{formatCurrency(parseFloat(wholesaleInputs.arv) || 0)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Potential Equity Gain</TableCell>
                        <TableCell align="right">{formatCurrency(leaseOption.potentialEquityGain)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Why It Works:</strong>
                  </Typography>
                  <Typography variant="body2" paragraph>
                    You control the property with just {formatCurrency(leaseOption.optionFee)} down. The seller receives steady rental income 
                    of {formatCurrency(leaseOption.monthlyRent)} per month, plus their asking price when you exercise your option. 
                    You can make improvements during the lease to increase the value.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="secondary"
                      onClick={() => handleSaveDeal('leaseOption')}
                    >
                      Save As Lease Option Deal
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleOpenContractDialog('leaseOption')}
                    >
                      Download Contract Template
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<FeedbackIcon />}
                      onClick={() => handleOpenFeedbackDialog('leaseOption')}
                    >
                      Rate This Strategy
                    </Button>
                  </Box>
                </Box>
              </>
            )}
            
            {activeTab === 'subjectTo' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Subject-To Details
                </Typography>
                <Typography variant="body2" paragraph>
                  In a subject-to deal, you take over the seller's existing mortgage payments without formally assuming the loan. 
                  The loan stays in the seller's name, but you own the property and make the payments.
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Existing Loan Balance ($)"
                      value={customExistingLoanBalance || subjectToOption.existingLoanBalance}
                      onChange={(e) => handleCustomInputChange('existingLoanBalance', e.target.value)}
                      variant="outlined"
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Cash to Seller ($)"
                      value={customSellerCashout || subjectToOption.sellerCashout}
                      onChange={(e) => handleCustomInputChange('sellerCashout', e.target.value)}
                      variant="outlined"
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
                
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={recalculateAlternative}
                >
                  Calculate
                </Button>
                
                <TableContainer sx={{ mt: 3 }}>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>Property Value</TableCell>
                        <TableCell align="right">{formatCurrency(sellerAskingPrice)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Existing Loan Balance</TableCell>
                        <TableCell align="right">{formatCurrency(subjectToOption.existingLoanBalance)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Cash to Seller</TableCell>
                        <TableCell align="right">{formatCurrency(subjectToOption.sellerCashout)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Interest Rate</TableCell>
                        <TableCell align="right">{subjectToOption.existingInterestRate}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Remaining Term</TableCell>
                        <TableCell align="right">{subjectToOption.remainingTerm} years</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Monthly Payment</TableCell>
                        <TableCell align="right">{formatCurrency(subjectToOption.monthlyPayment)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Equity at Takeover</TableCell>
                        <TableCell align="right">{formatCurrency(subjectToOption.equityAtTakeover)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total to Seller</TableCell>
                        <TableCell align="right">{formatCurrency(subjectToOption.existingLoanBalance + subjectToOption.sellerCashout)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Why It Works:</strong>
                  </Typography>
                  <Typography variant="body2" paragraph>
                    The seller gets immediate debt relief plus {formatCurrency(subjectToOption.sellerCashout)} in cash. 
                    You take over a property with {formatCurrency(subjectToOption.equityAtTakeover)} in instant equity 
                    with a low monthly payment of {formatCurrency(subjectToOption.monthlyPayment)}. This works especially 
                    well for motivated sellers who need to move quickly.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="secondary"
                      onClick={() => handleSaveDeal('subjectTo')}
                    >
                      Save As Subject-To Deal
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleOpenContractDialog('subjectTo')}
                    >
                      Download Contract Template
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<FeedbackIcon />}
                      onClick={() => handleOpenFeedbackDialog('subjectTo')}
                    >
                      Rate This Strategy
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onClose={() => setFeedbackDialogOpen(false)}>
        <DialogTitle>
          Rate This Strategy
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Your feedback helps us improve our suggestions for future deals.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="body1" sx={{ mr: 2 }}>Rating:</Typography>
            <Rating
              value={feedbackRating}
              onChange={(event, newValue) => {
                setFeedbackRating(newValue);
              }}
              size="large"
            />
          </Box>
          <Typography variant="body1" sx={{ mb: 1 }}>Comments (optional):</Typography>
          <TextareaAutosize
            minRows={4}
            style={{ width: '100%', padding: 8, borderRadius: 4, borderColor: '#ccc' }}
            value={feedbackComment}
            onChange={(e) => setFeedbackComment(e.target.value)}
            placeholder="What did you like or dislike about this strategy?"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitFeedback} 
            variant="contained"
            disabled={!feedbackRating}
          >
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contract Template Dialog */}
      <Dialog open={contractDialogOpen} onClose={() => setContractDialogOpen(false)}>
        <DialogTitle>
          Download Contract Template
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter the details below to customize your contract template. All fields are optional.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Property Address"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Seller Name"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Buyer Name"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                margin="normal"
              />
            </Grid>
          </Grid>
          <Alert severity="info" sx={{ mt: 2 }}>
            This is a template only. Always consult with a real estate attorney before using any real estate contract.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContractDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDownloadContract} 
            variant="contained"
            startIcon={<DownloadIcon />}
          >
            Download Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default DealAlternatives; 