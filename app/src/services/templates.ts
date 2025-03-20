import { SavedDeal } from './storage';

export interface DealTemplate {
  id: string;
  name: string;
  type: 'wholesale' | 'creative' | 'mortgage' | 'apartment';
  description: string;
  inputs: Record<string, any>;
}

const dealTemplates: DealTemplate[] = [
  {
    id: 'standard-wholesale',
    name: 'Standard Wholesale Deal',
    type: 'wholesale',
    description: 'A typical wholesale deal with ARV, repair costs, and target profit margin.',
    inputs: {
      purchasePrice: 150000,
      repairCosts: 25000,
      holdingCosts: 5000,
      targetProfitMargin: 20,
      rehabItems: [
        { description: 'Kitchen Remodel', cost: 10000 },
        { description: 'Bathroom Updates', cost: 5000 },
        { description: 'Flooring', cost: 5000 },
        { description: 'Paint', cost: 5000 }
      ]
    }
  },
  {
    id: 'seller-finance',
    name: 'Seller Finance Deal',
    type: 'creative',
    description: 'A seller finance deal with down payment, interest rate, and rental revenue.',
    inputs: {
      purchasePrice: 200000,
      downPayment: 20000,
      interestRate: 6,
      loanTerm: 30,
      monthlyRent: 1800,
      operatingExpenses: 500,
      vacancyRate: 5
    }
  },
  {
    id: 'rental-mortgage',
    name: 'Rental Property Mortgage',
    type: 'mortgage',
    description: 'A standard rental property mortgage with operating expenses and rental income.',
    inputs: {
      loanAmount: 180000,
      interestRate: 4.5,
      loanTerm: 30,
      monthlyRent: 2000,
      operatingExpenses: 600,
      vacancyRate: 5,
      propertyTax: 2400,
      insurance: 1200
    }
  }
];

export const templatesService = {
  getTemplates: (): DealTemplate[] => {
    return dealTemplates;
  },

  getTemplateById: (id: string): DealTemplate | undefined => {
    return dealTemplates.find(template => template.id === id);
  },

  getTemplatesByType: (type: DealTemplate['type']): DealTemplate[] => {
    return dealTemplates.filter(template => template.type === type);
  },

  applyTemplate: (templateId: string): Omit<SavedDeal, 'id' | 'date'> => {
    const template = templatesService.getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    return {
      type: template.type,
      name: template.name,
      inputs: template.inputs,
      results: {
        cashFlow: {
          monthlyCashFlow: 0,
          annualCashFlow: 0,
          cashOnCashReturn: 0
        },
        monthlyPayment: 0,
        totalInvestment: 0,
        totalReturn: 0
      }
    };
  }
}; 