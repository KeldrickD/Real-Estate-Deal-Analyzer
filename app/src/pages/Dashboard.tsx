import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Tab,
  Tabs,
  Card,
  CardContent,
  Button,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  BarChart,
  Bar,
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
import SaveIcon from '@mui/icons-material/Save';
import ShareIcon from '@mui/icons-material/Share';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import { formatCurrency } from '../utils/formatters';
import { DealAnalysis } from '../types/deal';
import { saveDealAnalysis } from '../services/dealAnalysis';
import { downloadDealReport } from '../utils/reportGenerator';
import { generateDealAlternatives } from '../services/alternativeDeals';
import DealAlternatives from '../components/DealAlternatives';
import TaxCalculator from '../components/TaxCalculator';
import AutomatedDealAnalyzer from '../components/AutomatedDealAnalyzer';
import RentalAnalyzer from '../components/RentalAnalyzer';

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
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dealAnalysis, setDealAnalysis] = useState<DealAnalysis | null>(null);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [savedAnalyses, setSavedAnalyses] = useState<DealAnalysis[]>([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveAnalysis = async () => {
    if (dealAnalysis) {
      try {
        await saveDealAnalysis(dealAnalysis);
        setSavedAnalyses([...savedAnalyses, dealAnalysis]);
      } catch (error) {
        console.error('Error saving analysis:', error);
      }
    }
  };

  const handleDownloadReport = () => {
    if (dealAnalysis) {
      downloadDealReport(dealAnalysis);
    }
  };
  
  const handleSaveTaxAnalysis = (analysis: any) => {
    console.log('Tax analysis saved:', analysis);
  };
  
  const handleSaveDeal = (dealType: string, dealInputs: any, dealResults: any) => {
    console.log('Deal saved:', dealType, dealInputs, dealResults);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ width: '100%', mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Real Estate Deal Analyzer
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="dashboard tabs"
          >
            <Tab label="Automated Analysis" />
            <Tab label="Rental Analysis" />
            <Tab label="Tax Calculator" />
            <Tab label="Deal Alternatives" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <AutomatedDealAnalyzer />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <RentalAnalyzer />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <TaxCalculator 
            propertyValue={250000}
            purchaseDate={new Date()}
            propertyType="residential"
            onSaveTaxAnalysis={handleSaveTaxAnalysis}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <DealAlternatives 
            wholesaleInputs={{
              purchasePrice: "300000",
              repairCosts: "20000",
              arv: "250000",
              holdingCosts: "5000",
              closingCosts: "3000",
              wholesaleFee: "5000",
              dealName: "Sample Deal",
              squareFootage: "1500",
              propertyCondition: "medium",
              rehabItems: {
                kitchen: "5000",
                bathrooms: "3000",
                flooring: "2000",
                paint: "1000",
                hvac: "3000",
                roof: "5000",
                other: "1000"
              }
            }}
            wholesaleResults={{
              maxAllowableOffer: 230000,
              potentialProfit: 20000,
              investorProfit: 15000,
              roi: 25,
              preferredOffer: 220000,
              assignmentFee: 10000,
              minimumScore: 70,
              totalRehabCost: 20000,
              exitPercentage: 75,
              wholesalePrice: 240000,
              preferredExitPrice: 250000
            }}
            sellerAskingPrice={300000}
            onSaveDeal={handleSaveDeal}
          />
        </TabPanel>
      </Box>
    </Container>
  );
};

export default Dashboard; 