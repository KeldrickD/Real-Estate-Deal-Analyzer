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
import DevelopmentProjectAnalyzer from '../components/DevelopmentProjectAnalyzer';
import ProjectManagementDashboard from '../components/ProjectManagementDashboard';
import OfferPriceNegotiator from '../components/OfferPriceNegotiator';

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

function a11yProps(index: number) {
  return {
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
}

const defaultWholesaleInputs = {
  purchasePrice: "0",
  repairCosts: "0",
  arv: "0",
  holdingCosts: "0",
  closingCosts: "0",
  wholesaleFee: "0",
  dealName: "",
  squareFootage: "0",
  propertyCondition: "medium" as "easy" | "medium" | "bad",
  rehabItems: {
    kitchen: "0",
    bathrooms: "0",
    flooring: "0",
    paint: "0",
    hvac: "0",
    roof: "0",
    other: "0"
  }
};

const defaultWholesaleResults = {
  maxAllowableOffer: 0,
  potentialProfit: 0,
  investorProfit: 0,
  roi: 0,
  preferredOffer: 0,
  assignmentFee: 0,
  minimumScore: 0,
  totalRehabCost: 0,
  exitPercentage: 0,
  wholesalePrice: 0,
  preferredExitPrice: 0
};

const Dashboard: React.FC = () => {
  const [value, setValue] = useState(0);
  const [dealAnalysis, setDealAnalysis] = useState<DealAnalysis | null>(null);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [savedAnalyses, setSavedAnalyses] = useState<DealAnalysis[]>([]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
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

  const tabs = [
    { label: 'Automated Deal Analysis', component: <AutomatedDealAnalyzer /> },
    { label: 'Rental Analysis', component: <RentalAnalyzer /> },
    { label: 'Offer Price Negotiator', component: <OfferPriceNegotiator /> },
    { 
      label: 'Tax Calculator', 
      component: <TaxCalculator 
        propertyValue={0}
        purchaseDate={new Date()}
        propertyType="residential"
        onSaveTaxAnalysis={(analysis) => console.log('Tax analysis saved:', analysis)}
      /> 
    },
    { 
      label: 'Deal Alternatives', 
      component: <DealAlternatives 
        wholesaleInputs={defaultWholesaleInputs}
        wholesaleResults={defaultWholesaleResults}
        sellerAskingPrice={0}
        onSaveDeal={(deal) => console.log('Deal saved:', deal)}
      /> 
    }
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ width: '100%', mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Real Estate Deal Analyzer
        </Typography>

        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="dashboard tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Deal Analysis" {...a11yProps(0)} />
            <Tab label="Development Projects" {...a11yProps(1)} />
            <Tab label="Project Management" {...a11yProps(2)} />
            <Tab label="Tax Calculator" {...a11yProps(3)} />
            <Tab label="Deal Alternatives" {...a11yProps(4)} />
            <Tab label="Offer Price Negotiator" {...a11yProps(5)} />
          </Tabs>

          <TabPanel value={value} index={0}>
            <AutomatedDealAnalyzer />
          </TabPanel>

          <TabPanel value={value} index={1}>
            <DevelopmentProjectAnalyzer />
          </TabPanel>

          <TabPanel value={value} index={2}>
            <ProjectManagementDashboard />
          </TabPanel>

          <TabPanel value={value} index={3}>
            <TaxCalculator 
              propertyValue={250000}
              purchaseDate={new Date()}
              propertyType="residential"
              onSaveTaxAnalysis={handleSaveTaxAnalysis}
            />
          </TabPanel>

          <TabPanel value={value} index={4}>
            <DealAlternatives 
              wholesaleInputs={defaultWholesaleInputs}
              wholesaleResults={defaultWholesaleResults}
              sellerAskingPrice={300000}
              onSaveDeal={handleSaveDeal}
            />
          </TabPanel>

          <TabPanel value={value} index={5}>
            <OfferPriceNegotiator />
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard; 