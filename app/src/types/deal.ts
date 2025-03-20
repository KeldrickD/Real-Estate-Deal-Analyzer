export interface DealAnalysis {
  id: string;
  timestamp: Date;
  propertyDetails: {
    address: string;
    purchasePrice: number;
    afterRepairValue: number;
    rehabCosts: number;
  };
  financing: {
    downPayment: number;
    interestRate: number;
    termYears: number;
    monthlyPayment: number;
  };
  expenses: {
    propertyTaxes: number;
    insurance: number;
    maintenance: number;
    utilities: number;
    propertyManagement: number;
  };
  income: {
    monthlyRent: number;
    vacancyRate: number;
    otherIncome: number;
  };
  metrics: {
    monthlyCashFlow: number;
    annualCashFlow: number;
    capRate: number;
    roi: number;
    cashOnCashReturn: number;
  };
  notes: string;
} 