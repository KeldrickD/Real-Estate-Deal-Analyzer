import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationOnIcon,
  Home as HomeIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';

interface ComparableProperty {
  id: string;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  salePrice: number;
  saleDate: Date;
  notes?: string;
}

interface NegotiationInput {
  propertyAddress: string;
  beds: number;
  baths: number;
  sqft: number;
  originalOffer: number;
  sellerCounter: number;
  comps: ComparableProperty[];
}

interface NegotiationResult {
  suggestedOffer: number;
  reasoning: string;
  confidence: number;
  keyPoints: string[];
}

const OfferPriceNegotiator: React.FC = () => {
  const [input, setInput] = useState<NegotiationInput>({
    propertyAddress: '',
    beds: 0,
    baths: 0,
    sqft: 0,
    originalOffer: 0,
    sellerCounter: 0,
    comps: []
  });

  const [result, setResult] = useState<NegotiationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [openCompDialog, setOpenCompDialog] = useState(false);
  const [newComp, setNewComp] = useState<ComparableProperty>({
    id: '',
    address: '',
    beds: 0,
    baths: 0,
    sqft: 0,
    salePrice: 0,
    saleDate: new Date(),
    notes: ''
  });

  const handleInputChange = (field: keyof NegotiationInput) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'number' 
      ? Number(event.target.value) 
      : event.target.value;
    setInput(prev => ({ ...prev, [field]: value }));
  };

  const handleCompChange = (field: keyof ComparableProperty) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'number' 
      ? Number(event.target.value) 
      : event.target.value;
    setNewComp(prev => ({ ...prev, [field]: value }));
  };

  const handleAddComp = () => {
    setInput(prev => ({
      ...prev,
      comps: [...prev.comps, { ...newComp, id: Date.now().toString() }]
    }));
    setNewComp({
      id: '',
      address: '',
      beds: 0,
      baths: 0,
      sqft: 0,
      salePrice: 0,
      saleDate: new Date(),
      notes: ''
    });
    setOpenCompDialog(false);
  };

  const handleRemoveComp = (id: string) => {
    setInput(prev => ({
      ...prev,
      comps: prev.comps.filter(comp => comp.id !== id)
    }));
  };

  const analyzeNegotiation = async () => {
    setLoading(true);
    try {
      // TODO: Integrate with AI API for analysis
      // For now, using mock data
      const mockResult: NegotiationResult = {
        suggestedOffer: Math.round((input.originalOffer + input.sellerCounter) / 2),
        reasoning: `Based on ${input.comps.length} comparable properties in the area, with an average sale price of $${Math.round(input.comps.reduce((acc, comp) => acc + comp.salePrice, 0) / input.comps.length).toLocaleString()}, I recommend offering $${Math.round((input.originalOffer + input.sellerCounter) / 2).toLocaleString()}. This represents a fair middle ground between your initial offer and the seller's counter, while staying within market value.`,
        confidence: 0.85,
        keyPoints: [
          `Average sale price in area: $${Math.round(input.comps.reduce((acc, comp) => acc + comp.salePrice, 0) / input.comps.length).toLocaleString()}`,
          `Price per sqft: $${Math.round(input.comps.reduce((acc, comp) => acc + (comp.salePrice / comp.sqft), 0) / input.comps.length).toLocaleString()}`,
          `Suggested offer represents ${Math.round(((input.originalOffer + input.sellerCounter) / 2 / input.sellerCounter) * 100)}% of seller's counter`
        ]
      };
      setResult(mockResult);
    } catch (error) {
      console.error('Error analyzing negotiation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Offer Price Negotiator
      </Typography>

      <Grid container spacing={3}>
        {/* Input Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Property Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Property Address"
                  value={input.propertyAddress}
                  onChange={handleInputChange('propertyAddress')}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Beds"
                  value={input.beds}
                  onChange={handleInputChange('beds')}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Baths"
                  value={input.baths}
                  onChange={handleInputChange('baths')}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Sqft"
                  value={input.sqft}
                  onChange={handleInputChange('sqft')}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Original Offer"
                  value={input.originalOffer}
                  onChange={handleInputChange('originalOffer')}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Seller Counter"
                  value={input.sellerCounter}
                  onChange={handleInputChange('sellerCounter')}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Comparable Properties */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Comparable Properties
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setOpenCompDialog(true)}
              >
                Add Comp
              </Button>
            </Box>
            <List>
              {input.comps.map((comp) => (
                <ListItem
                  key={comp.id}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleRemoveComp(comp.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={comp.address}
                    secondary={`${comp.beds} beds, ${comp.baths} baths, ${comp.sqft} sqft - Sold for $${comp.salePrice.toLocaleString()} on ${comp.saleDate.toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Analysis Button */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={analyzeNegotiation}
            disabled={loading || input.comps.length === 0}
            startIcon={loading ? <CircularProgress size={20} /> : <TrendingUpIcon />}
          >
            Analyze Negotiation
          </Button>
        </Grid>

        {/* Results */}
        {result && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Negotiation Analysis
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h4" color="primary" sx={{ mr: 2 }}>
                    ${result.suggestedOffer.toLocaleString()}
                  </Typography>
                  <Chip
                    label={`${Math.round(result.confidence * 100)}% Confidence`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body1" paragraph>
                  {result.reasoning}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Key Points
                </Typography>
                <List>
                  {result.keyPoints.map((point, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={point} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Add Comp Dialog */}
      <Dialog open={openCompDialog} onClose={() => setOpenCompDialog(false)}>
        <DialogTitle>Add Comparable Property</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={newComp.address}
                onChange={handleCompChange('address')}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                type="number"
                label="Beds"
                value={newComp.beds}
                onChange={handleCompChange('beds')}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                type="number"
                label="Baths"
                value={newComp.baths}
                onChange={handleCompChange('baths')}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                type="number"
                label="Sqft"
                value={newComp.sqft}
                onChange={handleCompChange('sqft')}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Sale Price"
                value={newComp.salePrice}
                onChange={handleCompChange('salePrice')}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="Sale Date"
                value={newComp.saleDate.toISOString().split('T')[0]}
                onChange={handleCompChange('saleDate')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={newComp.notes}
                onChange={handleCompChange('notes')}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCompDialog(false)}>Cancel</Button>
          <Button onClick={handleAddComp} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OfferPriceNegotiator; 