import { DealAnalysis } from '../types/deal';

export interface AlternativeDeal {
  id: string;
  strategy: 'seller-financing' | 'lease-option' | 'subject-to';
  description: string;
  benefits: string[];
  risks: string[];
  estimatedTerms: {
    downPayment: number;
    interestRate: number;
    termYears: number;
    monthlyPayment: number;
  };
  requirements: string[];
  marketData: {
    averagePrice: number;
    averageRent: number;
    marketTrend: 'up' | 'down' | 'stable';
  };
}

export const generateDealAlternatives = async (
  analysis: DealAnalysis
): Promise<AlternativeDeal[]> => {
  // This is a mock implementation. In a real application, this would use
  // market data and more sophisticated algorithms to generate alternatives.
  const alternatives: AlternativeDeal[] = [
    {
      id: '1',
      strategy: 'seller-financing',
      description: 'Seller financing with 10% down payment and 6% interest rate',
      benefits: [
        'Lower down payment requirement',
        'Flexible terms',
        'No bank approval needed'
      ],
      risks: [
        'Seller may have existing mortgage',
        'Due-on-sale clause risk',
        'Higher interest rate than traditional financing'
      ],
      estimatedTerms: {
        downPayment: analysis.propertyDetails.purchasePrice * 0.1,
        interestRate: 6,
        termYears: 30,
        monthlyPayment: calculateMonthlyPayment(
          analysis.propertyDetails.purchasePrice * 0.9,
          6,
          30
        )
      },
      requirements: [
        'Seller must own property free and clear or have significant equity',
        'Property must be in good condition',
        'Seller must be willing to carry financing'
      ],
      marketData: {
        averagePrice: analysis.propertyDetails.purchasePrice,
        averageRent: analysis.income.monthlyRent,
        marketTrend: 'up'
      }
    },
    {
      id: '2',
      strategy: 'lease-option',
      description: 'Lease with option to purchase after 3 years',
      benefits: [
        'No large down payment required',
        'Time to improve credit',
        'Locked-in purchase price'
      ],
      risks: [
        'Option fee is non-refundable',
        'May lose option if lease terms are violated',
        'Property value may decrease'
      ],
      estimatedTerms: {
        downPayment: analysis.propertyDetails.purchasePrice * 0.05,
        interestRate: 6.5,
        termYears: 30,
        monthlyPayment: calculateMonthlyPayment(
          analysis.propertyDetails.purchasePrice * 0.95,
          6.5,
          30
        )
      },
      requirements: [
        'Option fee (typically 1-5% of purchase price)',
        'Monthly rent payment',
        'Maintenance responsibilities'
      ],
      marketData: {
        averagePrice: analysis.propertyDetails.purchasePrice,
        averageRent: analysis.income.monthlyRent,
        marketTrend: 'up'
      }
    },
    {
      id: '3',
      strategy: 'subject-to',
      description: 'Take over existing mortgage payments',
      benefits: [
        'No new financing needed',
        'Lower closing costs',
        'Quick closing possible'
      ],
      risks: [
        'Due-on-sale clause risk',
        'Seller mortgage remains in their name',
        'Lender may call the loan'
      ],
      estimatedTerms: {
        downPayment: analysis.propertyDetails.purchasePrice * 0.05,
        interestRate: analysis.financing.interestRate,
        termYears: analysis.financing.termYears,
        monthlyPayment: analysis.financing.monthlyPayment
      },
      requirements: [
        'Existing mortgage must be assumable',
        'Seller must be current on payments',
        'Property must be in good condition'
      ],
      marketData: {
        averagePrice: analysis.propertyDetails.purchasePrice,
        averageRent: analysis.income.monthlyRent,
        marketTrend: 'up'
      }
    }
  ];

  return alternatives;
};

const calculateMonthlyPayment = (
  principal: number,
  annualRate: number,
  years: number
): number => {
  const monthlyRate = annualRate / 12 / 100;
  const numberOfPayments = years * 12;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
}; 