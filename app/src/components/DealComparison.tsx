import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  BarElement
} from 'chart.js';
import { storageService, SavedDeal } from '../services/storage';
import { formatCurrency } from '../utils/validation';
import { templatesService, DealTemplate } from '../services/templates';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  BarElement
);

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
      id={`chart-tabpanel-${index}`}
      aria-labelledby={`chart-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const DealComparison: React.FC = () => {
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newDealName, setNewDealName] = useState('');
  const [editDeal, setEditDeal] = useState<SavedDeal | null>(null);
  const [chartTabValue, setChartTabValue] = useState(0);
  const [templates, setTemplates] = useState<DealTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  useEffect(() => {
    loadSavedDeals();
    setTemplates(templatesService.getTemplates());
  }, []);

  const loadSavedDeals = () => {
    const deals = storageService.getAllDeals();
    setSavedDeals(deals);
  };

  const handleDealSelect = (dealId: string) => {
    setSelectedDeals(prev => {
      if (prev.includes(dealId)) {
        return prev.filter(id => id !== dealId);
      }
      return [...prev, dealId];
    });
  };

  const handleDeleteDeal = (dealId: string) => {
    storageService.deleteDeal(dealId);
    loadSavedDeals();
  };

  const handleEditDeal = (deal: SavedDeal) => {
    setEditDeal(deal);
    setOpenDialog(true);
  };

  const handleSaveEdit = () => {
    if (editDeal) {
      storageService.updateDeal(editDeal);
      setOpenDialog(false);
      setEditDeal(null);
      loadSavedDeals();
    }
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    const dealsToExport = savedDeals.filter(deal => selectedDeals.includes(deal.id));
    storageService.exportDeals(dealsToExport, format);
  };

  const selectedDealsData = savedDeals.filter(deal => selectedDeals.includes(deal.id));

  // Cash Flow Chart Data
  const cashFlowChartData = {
    labels: selectedDealsData.map(deal => deal.name),
    datasets: [
      {
        label: 'Monthly Cash Flow',
        data: selectedDealsData.map(deal => deal.results.cashFlow.monthlyCashFlow),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Cash-on-Cash Return',
        data: selectedDealsData.map(deal => deal.results.cashFlow.cashOnCashReturn),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  // Deal Components Pie Chart Data
  const dealComponentsData = {
    labels: ['Purchase Price', 'Rehab Costs', 'Operating Expenses', 'Monthly Payment', 'Cash Flow'],
    datasets: selectedDealsData.map((deal, index) => ({
      label: deal.name,
      data: [
        deal.inputs.purchasePrice || 0,
        deal.inputs.repairCosts || 0,
        deal.inputs.operatingExpenses || 0,
        deal.results.monthlyPayment || 0,
        deal.results.cashFlow.monthlyCashFlow || 0
      ],
      backgroundColor: [
        `rgba(255, 99, 132, ${0.8 - index * 0.1})`,
        `rgba(54, 162, 235, ${0.8 - index * 0.1})`,
        `rgba(255, 206, 86, ${0.8 - index * 0.1})`,
        `rgba(75, 192, 192, ${0.8 - index * 0.1})`,
        `rgba(153, 102, 255, ${0.8 - index * 0.1})`
      ]
    }))
  };

  // Performance Metrics Bar Chart Data
  const performanceMetricsData = {
    labels: selectedDealsData.map(deal => deal.name),
    datasets: [
      {
        label: 'ROI',
        data: selectedDealsData.map(deal => deal.results.cashFlow.cashOnCashReturn),
        backgroundColor: 'rgba(75, 192, 192, 0.5)'
      },
      {
        label: 'Monthly Cash Flow',
        data: selectedDealsData.map(deal => deal.results.cashFlow.monthlyCashFlow),
        backgroundColor: 'rgba(255, 99, 132, 0.5)'
      },
      {
        label: 'Annual Cash Flow',
        data: selectedDealsData.map(deal => deal.results.cashFlow.annualCashFlow),
        backgroundColor: 'rgba(255, 206, 86, 0.5)'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Deal Comparison'
      }
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return;

    try {
      const templateData = templatesService.applyTemplate(selectedTemplate);
      storageService.saveDeal(templateData);
      loadSavedDeals();
    } catch (error) {
      console.error('Error applying template:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Deal Comparison
      </Typography>
      <Typography variant="body1" paragraph>
        Compare different deals side by side and analyze their performance metrics.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={2}>
            <Box p={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                  Saved Deals
                </Typography>
                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setTemplateDialogOpen(true)}
                    sx={{ mr: 2 }}
                  >
                    New from Template
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenDialog(true)}
                    sx={{ mr: 2 }}
                  >
                    Save Current Deal
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleExport('csv')}
                    sx={{ mr: 2 }}
                  >
                    Export CSV
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleExport('pdf')}
                    sx={{ mr: 2 }}
                  >
                    Export PDF
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleExport('excel')}
                  >
                    Export Excel
                  </Button>
                </Box>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Select</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Monthly Cash Flow</TableCell>
                      <TableCell>Cash-on-Cash Return</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {savedDeals.map(deal => (
                      <TableRow key={deal.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedDeals.includes(deal.id)}
                            onChange={() => handleDealSelect(deal.id)}
                          />
                        </TableCell>
                        <TableCell>{deal.name}</TableCell>
                        <TableCell>{deal.type}</TableCell>
                        <TableCell>{new Date(deal.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {formatCurrency(deal.results.cashFlow.monthlyCashFlow)}
                        </TableCell>
                        <TableCell>
                          {deal.results.cashFlow.cashOnCashReturn.toFixed(2)}%
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit Deal">
                            <IconButton
                              size="small"
                              onClick={() => handleEditDeal(deal)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Deal">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteDeal(deal.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </Grid>

        {selectedDeals.length > 0 && (
          <Grid item xs={12}>
            <Paper elevation={2}>
              <Box p={3}>
                <Typography variant="h6" gutterBottom>
                  Deal Analysis
                </Typography>
                
                <Tabs
                  value={chartTabValue}
                  onChange={(e, newValue) => setChartTabValue(newValue)}
                  sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
                >
                  <Tab label="Cash Flow" />
                  <Tab label="Deal Components" />
                  <Tab label="Performance Metrics" />
                </Tabs>

                <TabPanel value={chartTabValue} index={0}>
                  <Box height={400}>
                    <Line options={chartOptions} data={cashFlowChartData} />
                  </Box>
                </TabPanel>

                <TabPanel value={chartTabValue} index={1}>
                  <Box height={400}>
                    <Pie data={dealComponentsData} options={chartOptions} />
                  </Box>
                </TabPanel>

                <TabPanel value={chartTabValue} index={2}>
                  <Box height={400}>
                    <Bar data={performanceMetricsData} options={chartOptions} />
                  </Box>
                </TabPanel>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Template Selection Dialog */}
      <Dialog 
        open={templateDialogOpen} 
        onClose={() => setTemplateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Select Template</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {templates.map(template => (
              <Grid item xs={12} key={template.id}>
                <Paper 
                  elevation={selectedTemplate === template.id ? 3 : 1}
                  sx={{ 
                    p: 2, 
                    cursor: 'pointer',
                    border: selectedTemplate === template.id ? '2px solid primary.main' : 'none'
                  }}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <Typography variant="h6">{template.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {template.description}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Type: {template.type}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleApplyTemplate}
            color="primary"
            disabled={!selectedTemplate}
          >
            Apply Template
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {editDeal ? 'Edit Deal' : 'Save Current Deal'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Deal Name"
            fullWidth
            value={editDeal ? editDeal.name : newDealName}
            onChange={(e) => {
              if (editDeal) {
                setEditDeal({ ...editDeal, name: e.target.value });
              } else {
                setNewDealName(e.target.value);
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDialog(false);
            setEditDeal(null);
            setNewDealName('');
          }}>
            Cancel
          </Button>
          <Button
            onClick={editDeal ? handleSaveEdit : () => {
              // Save the current deal
              setOpenDialog(false);
              setNewDealName('');
            }}
            color="primary"
          >
            {editDeal ? 'Save Changes' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DealComparison; 