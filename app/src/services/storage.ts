import { formatCurrency } from '../utils/validation';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export interface SavedDeal {
  id: string;
  type: 'wholesale' | 'creative' | 'mortgage' | 'apartment' | 'advanced';
  name: string;
  date: string;
  inputs: any;
  results: any;
}

const STORAGE_KEY = 'real_estate_deals';
const THEME_KEY = 'real_estate_theme';

export const storageService = {
  saveDeal: (deal: Omit<SavedDeal, 'id' | 'date'>) => {
    const savedDeals = storageService.getAllDeals();
    const newDeal: SavedDeal = {
      ...deal,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    };
    savedDeals.push(newDeal);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDeals));
    return newDeal;
  },

  updateDeal: (updatedDeal: SavedDeal) => {
    const deals = storageService.getAllDeals();
    const index = deals.findIndex(deal => deal.id === updatedDeal.id);
    if (index !== -1) {
      deals[index] = updatedDeal;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
      return true;
    }
    return false;
  },

  getAllDeals: (): SavedDeal[] => {
    const deals = localStorage.getItem(STORAGE_KEY);
    return deals ? JSON.parse(deals) : [];
  },

  getDealsByType: (type: SavedDeal['type']): SavedDeal[] => {
    return storageService.getAllDeals().filter(deal => deal.type === type);
  },

  deleteDeal: (id: string) => {
    const deals = storageService.getAllDeals();
    const filteredDeals = deals.filter(deal => deal.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDeals));
  },

  saveThemePreference: (mode: 'light' | 'dark') => {
    localStorage.setItem(THEME_KEY, mode);
  },

  getThemePreference: (): 'light' | 'dark' | null => {
    const theme = localStorage.getItem(THEME_KEY);
    return theme as 'light' | 'dark' | null;
  },

  exportDeals: (deals: SavedDeal[], format: 'csv' | 'pdf' | 'excel' = 'csv') => {
    switch (format) {
      case 'csv':
        exportToCSV(deals);
        break;
      case 'pdf':
        exportToPDF(deals);
        break;
      case 'excel':
        exportToExcel(deals);
        break;
    }
  },

  getDeal: (id: string): SavedDeal | null => {
    const deals = storageService.getAllDeals();
    return deals.find(deal => deal.id === id) || null;
  }
};

function exportToCSV(deals: SavedDeal[]) {
  const csv = deals.map(deal => {
    const inputs = Object.entries(deal.inputs)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    const results = Object.entries(deal.results)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    
    return [
      deal.id,
      deal.type,
      deal.name,
      deal.date,
      inputs,
      results
    ].join(',');
  }).join('\n');

  downloadFile(csv, 'text/csv', `real_estate_deals_${new Date().toISOString().split('T')[0]}.csv`);
}

function exportToPDF(deals: SavedDeal[]) {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text('Real Estate Deal Analysis', 14, 15);
  doc.setFontSize(12);
  
  // Add deals table
  const tableData = deals.map(deal => [
    deal.name,
    deal.type,
    new Date(deal.date).toLocaleDateString(),
    formatCurrency(deal.results.cashFlow.monthlyCashFlow),
    `${deal.results.cashFlow.cashOnCashReturn.toFixed(2)}%`
  ]);

  (doc as any).autoTable({
    head: [['Deal Name', 'Type', 'Date', 'Monthly Cash Flow', 'Cash-on-Cash Return']],
    body: tableData,
    startY: 25,
    theme: 'grid'
  });

  // Add deal details
  deals.forEach((deal, index) => {
    const startY = 25 + (index + 1) * 30;
    doc.setFontSize(10);
    doc.text(`Deal Details for ${deal.name}:`, 14, startY);
    doc.text(`Purchase Price: ${formatCurrency(deal.inputs.purchasePrice)}`, 14, startY + 5);
    doc.text(`Monthly Payment: ${formatCurrency(deal.results.monthlyPayment)}`, 14, startY + 10);
    doc.text(`Annual Cash Flow: ${formatCurrency(deal.results.cashFlow.annualCashFlow)}`, 14, startY + 15);
  });

  doc.save(`real_estate_deals_${new Date().toISOString().split('T')[0]}.pdf`);
}

function exportToExcel(deals: SavedDeal[]) {
  const workbook = XLSX.utils.book_new();
  
  // Create deals summary sheet
  const summaryData = deals.map(deal => ({
    'Deal Name': deal.name,
    'Type': deal.type,
    'Date': new Date(deal.date).toLocaleDateString(),
    'Monthly Cash Flow': deal.results.cashFlow.monthlyCashFlow,
    'Cash-on-Cash Return': deal.results.cashFlow.cashOnCashReturn,
    'Annual Cash Flow': deal.results.cashFlow.annualCashFlow,
    'Monthly Payment': deal.results.monthlyPayment
  }));
  
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Create detailed inputs sheet
  const inputsData = deals.map(deal => ({
    'Deal Name': deal.name,
    ...deal.inputs
  }));
  
  const inputsSheet = XLSX.utils.json_to_sheet(inputsData);
  XLSX.utils.book_append_sheet(workbook, inputsSheet, 'Inputs');

  // Create detailed results sheet
  const resultsData = deals.map(deal => ({
    'Deal Name': deal.name,
    ...deal.results
  }));
  
  const resultsSheet = XLSX.utils.json_to_sheet(resultsData);
  XLSX.utils.book_append_sheet(workbook, resultsSheet, 'Results');

  // Save the workbook
  XLSX.writeFile(workbook, `real_estate_deals_${new Date().toISOString().split('T')[0]}.xlsx`);
}

function downloadFile(content: string, type: string, filename: string) {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
} 