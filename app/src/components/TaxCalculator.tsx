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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  InputAdornment,
  Card,
  CardContent,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import { 
  DatePicker, 
  LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { differenceInYears, addYears, format } from 'date-fns';

interface TaxCalculatorProps {
  propertyValue: number;
  purchaseDate: Date;
  propertyType: 'residential' | 'commercial' | 'land';
  onSaveTaxAnalysis: (analysis: TaxAnalysis) => void;
}

interface TaxAnalysis {
  purchaseDate: Date;
  propertyValue: number;
  propertyType: 'residential' | 'commercial' | 'land';
  depreciationSchedule: DepreciationEntry[];
  capitalGains: CapitalGainsCalculation;
  taxSavings: TaxSavingsCalculation;
}

interface DepreciationEntry {
  year: number;
  basis: number;
  depreciation: number;
  remainingBasis: number;
}

interface CapitalGainsCalculation {
  purchasePrice: number;
  estimatedSalePrice: number;
  holdingPeriod: number;
  capitalGains: number;
  depreciationRecapture: number;
  totalTax: number;
  longTermRate: number;
  shortTermRate: number;
}

interface TaxSavingsCalculation {
  annualDepreciation: number;
  annualTaxSavings: number;
  totalTaxSavings: number;
  marginalTaxRate: number;
}

const TaxCalculator: React.FC<TaxCalculatorProps> = ({
  propertyValue,
  purchaseDate,
  propertyType,
  onSaveTaxAnalysis
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [estimatedSalePrice, setEstimatedSalePrice] = useState(propertyValue);
  const [estimatedSaleDate, setEstimatedSaleDate] = useState(addYears(new Date(), 5));
  const [marginalTaxRate, setMarginalTaxRate] = useState(22);
  const [depreciationSchedule, setDepreciationSchedule] = useState<DepreciationEntry[]>([]);
  const [capitalGains, setCapitalGains] = useState<CapitalGainsCalculation>({
    purchasePrice: propertyValue,
    estimatedSalePrice: propertyValue,
    holdingPeriod: 5,
    capitalGains: 0,
    depreciationRecapture: 0,
    totalTax: 0,
    longTermRate: 15,
    shortTermRate: 22
  });
  const [taxSavings, setTaxSavings] = useState<TaxSavingsCalculation>({
    annualDepreciation: 0,
    annualTaxSavings: 0,
    totalTaxSavings: 0,
    marginalTaxRate: 22
  });

  // Calculate depreciation schedule
  const calculateDepreciation = () => {
    const schedule: DepreciationEntry[] = [];
    let remainingBasis = propertyValue;
    const years = propertyType === 'residential' ? 27.5 : 39;
    const annualDepreciation = propertyValue / years;

    for (let year = 1; year <= years; year++) {
      const depreciation = annualDepreciation;
      remainingBasis -= depreciation;
      
      schedule.push({
        year,
        basis: remainingBasis + depreciation,
        depreciation,
        remainingBasis: Math.max(0, remainingBasis)
      });
    }

    setDepreciationSchedule(schedule);
    return annualDepreciation;
  };

  // Calculate capital gains
  const calculateCapitalGains = () => {
    const holdingPeriod = differenceInYears(estimatedSaleDate, purchaseDate);
    const isLongTerm = holdingPeriod >= 1;
    const taxRate = isLongTerm ? capitalGains.longTermRate : capitalGains.shortTermRate;
    
    // Calculate depreciation recapture (25% rate)
    const totalDepreciation = depreciationSchedule
      .slice(0, holdingPeriod)
      .reduce((sum, entry) => sum + entry.depreciation, 0);
    
    const depreciationRecapture = totalDepreciation * 0.25;
    
    // Calculate capital gains
    const capitalGainsAmount = estimatedSalePrice - propertyValue + totalDepreciation;
    const capitalGainsTax = capitalGainsAmount * (taxRate / 100);
    
    const totalTax = depreciationRecapture + capitalGainsTax;

    setCapitalGains({
      ...capitalGains,
      purchasePrice: propertyValue,
      estimatedSalePrice,
      holdingPeriod,
      capitalGains: capitalGainsAmount,
      depreciationRecapture,
      totalTax
    });
  };

  // Calculate tax savings from depreciation
  const calculateTaxSavings = () => {
    const annualDepreciation = calculateDepreciation();
    const annualTaxSavings = annualDepreciation * (marginalTaxRate / 100);
    const holdingPeriod = differenceInYears(estimatedSaleDate, purchaseDate);
    const totalTaxSavings = annualTaxSavings * holdingPeriod;

    setTaxSavings({
      annualDepreciation,
      annualTaxSavings,
      totalTaxSavings,
      marginalTaxRate
    });
  };

  // Update calculations when inputs change
  useEffect(() => {
    calculateDepreciation();
    calculateCapitalGains();
    calculateTaxSavings();
  }, [propertyValue, estimatedSalePrice, estimatedSaleDate, marginalTaxRate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handleSaveAnalysis = () => {
    const analysis: TaxAnalysis = {
      purchaseDate,
      propertyValue,
      propertyType,
      depreciationSchedule,
      capitalGains,
      taxSavings
    };
    onSaveTaxAnalysis(analysis);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Tax & Depreciation Analysis
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Property Details
              </Typography>
              <Typography variant="body2">
                <strong>Purchase Price:</strong> {formatCurrency(propertyValue)}
              </Typography>
              <Typography variant="body2">
                <strong>Purchase Date:</strong> {format(purchaseDate, 'MM/dd/yyyy')}
              </Typography>
              <Typography variant="body2">
                <strong>Property Type:</strong> {propertyType.charAt(0).toUpperCase() + propertyType.slice(1)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tax Assumptions
              </Typography>
              <TextField
                fullWidth
                label="Marginal Tax Rate (%)"
                value={marginalTaxRate}
                onChange={(e) => setMarginalTaxRate(Number(e.target.value))}
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Long-term Capital Gains Rate:</strong> {formatPercent(capitalGains.longTermRate)}
              </Typography>
              <Typography variant="body2">
                <strong>Short-term Capital Gains Rate:</strong> {formatPercent(capitalGains.shortTermRate)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sale Assumptions
              </Typography>
              <TextField
                fullWidth
                label="Estimated Sale Price"
                value={estimatedSalePrice}
                onChange={(e) => setEstimatedSalePrice(Number(e.target.value))}
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Estimated Sale Date"
                  value={estimatedSaleDate}
                  onChange={(newValue: Date | null) => newValue && setEstimatedSaleDate(newValue)}
                  sx={{ mt: 1, width: '100%' }}
                />
              </LocalizationProvider>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab label="Depreciation Schedule" />
              <Tab label="Capital Gains Analysis" />
              <Tab label="Tax Savings" />
            </Tabs>

            {activeTab === 0 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Year</TableCell>
                      <TableCell align="right">Basis</TableCell>
                      <TableCell align="right">Depreciation</TableCell>
                      <TableCell align="right">Remaining Basis</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {depreciationSchedule.map((entry) => (
                      <TableRow key={entry.year}>
                        <TableCell>{entry.year}</TableCell>
                        <TableCell align="right">{formatCurrency(entry.basis)}</TableCell>
                        <TableCell align="right">{formatCurrency(entry.depreciation)}</TableCell>
                        <TableCell align="right">{formatCurrency(entry.remainingBasis)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {activeTab === 1 && (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Capital Gains Summary
                    </Typography>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell>Purchase Price</TableCell>
                          <TableCell align="right">{formatCurrency(capitalGains.purchasePrice)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Estimated Sale Price</TableCell>
                          <TableCell align="right">{formatCurrency(capitalGains.estimatedSalePrice)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Holding Period</TableCell>
                          <TableCell align="right">{capitalGains.holdingPeriod} years</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Capital Gains</TableCell>
                          <TableCell align="right">{formatCurrency(capitalGains.capitalGains)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Depreciation Recapture</TableCell>
                          <TableCell align="right">{formatCurrency(capitalGains.depreciationRecapture)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Total Tax</TableCell>
                          <TableCell align="right">{formatCurrency(capitalGains.totalTax)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Tax Rate Analysis
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        {capitalGains.holdingPeriod >= 1 ? 'Long-term' : 'Short-term'} Capital Gains
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={capitalGains.holdingPeriod >= 1 ? 100 : 0} 
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    <Typography variant="body2">
                      Tax Rate: {formatPercent(capitalGains.holdingPeriod >= 1 ? 
                        capitalGains.longTermRate : capitalGains.shortTermRate)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Annual Tax Savings
                    </Typography>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell>Annual Depreciation</TableCell>
                          <TableCell align="right">{formatCurrency(taxSavings.annualDepreciation)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Marginal Tax Rate</TableCell>
                          <TableCell align="right">{formatPercent(taxSavings.marginalTaxRate)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Annual Tax Savings</TableCell>
                          <TableCell align="right">{formatCurrency(taxSavings.annualTaxSavings)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Total Tax Savings
                    </Typography>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {formatCurrency(taxSavings.totalTaxSavings)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Over {capitalGains.holdingPeriod} years
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveAnalysis}
            >
              Save Tax Analysis
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaxCalculator; 