export interface ExpenseTemplate {
  name: string;
  description: string;
  expenses: {
    propertyTaxes: number;
    insurance: number;
    maintenance: number;
    utilities: number;
    propertyManagement: number;
    cleaningFee?: number;
    platformFee?: number;
  };
}

export const longTermExpenseTemplates: ExpenseTemplate[] = [
  {
    name: 'Standard Single-Family',
    description: 'Typical expenses for a single-family home in a suburban area',
    expenses: {
      propertyTaxes: 3000,
      insurance: 1200,
      maintenance: 200,
      utilities: 150,
      propertyManagement: 8
    }
  },
  {
    name: 'Luxury Property',
    description: 'Higher-end property with premium amenities',
    expenses: {
      propertyTaxes: 6000,
      insurance: 2400,
      maintenance: 400,
      utilities: 300,
      propertyManagement: 10
    }
  },
  {
    name: 'Multi-Unit Property',
    description: 'Small multi-unit property (2-4 units)',
    expenses: {
      propertyTaxes: 5000,
      insurance: 2000,
      maintenance: 300,
      utilities: 250,
      propertyManagement: 8
    }
  }
];

export const shortTermExpenseTemplates: ExpenseTemplate[] = [
  {
    name: 'Standard Vacation Rental',
    description: 'Typical expenses for a vacation rental property',
    expenses: {
      propertyTaxes: 3000,
      insurance: 1800,
      maintenance: 300,
      utilities: 200,
      propertyManagement: 15,
      cleaningFee: 50,
      platformFee: 15
    }
  },
  {
    name: 'Luxury Vacation Home',
    description: 'High-end vacation property with premium amenities',
    expenses: {
      propertyTaxes: 6000,
      insurance: 3600,
      maintenance: 600,
      utilities: 400,
      propertyManagement: 20,
      cleaningFee: 100,
      platformFee: 15
    }
  },
  {
    name: 'Urban Short-Term Rental',
    description: 'City-center short-term rental property',
    expenses: {
      propertyTaxes: 4000,
      insurance: 2400,
      maintenance: 400,
      utilities: 250,
      propertyManagement: 15,
      cleaningFee: 75,
      platformFee: 15
    }
  }
]; 