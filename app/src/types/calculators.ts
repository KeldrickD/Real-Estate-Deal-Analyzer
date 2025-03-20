/**
 * Common interface definitions for real estate calculators
 */

// Wholesale Calculator Interfaces
export interface WholesaleInputs {
  purchasePrice: string;
  repairCosts: string;
  arv: string;
  holdingCosts: string;
  closingCosts: string;
  wholesaleFee: string;
}

export interface WholesaleResults {
  maxAllowableOffer: number;
  potentialProfit: number;
  investorProfit: number;
  roi: number;
}

// Multi-Family Analyzer Interfaces
export interface MultiFamilyInputs {
  purchasePrice: string;
  numberOfUnits: string;
  averageRent: string;
  otherIncome: string;
  vacancyRate: string;
  propertyManagement: string;
  repairsAndMaintenance: string;
  propertyTax: string;
  insurance: string;
  utilities: string;
  downPayment: string;
  interestRate: string;
  loanTerm: string;
  closingCosts: string;
  annualAppreciation: string;
  capitalExpenditures: string;
}

export interface MultiFamilyResults {
  monthlyGrossIncome: number;
  annualGrossIncome: number;
  monthlyExpenses: number;
  annualExpenses: number;
  monthlyNetOperatingIncome: number;
  annualNetOperatingIncome: number;
  monthlyMortgagePayment: number;
  annualMortgagePayment: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  cashOnCashReturn: number;
  capRate: number;
  totalInvestment: number;
  onePercentRule: boolean;
  grossRentMultiplier: number;
  debtServiceCoverageRatio: number;
}

// Seller Finance Calculator Interfaces
export interface SellerFinanceInputs {
  purchasePrice: string;
  downPayment: string;
  interestRate: string;
  loanTerm: string;
  balloonPayment: string;
  balloonTerm: string;
  monthlyRent: string;
  vacancyRate: string;
  propertyManagement: string;
  propertyTaxes: string;
  insurance: string;
  maintenance: string;
  annualAppreciation: string;
  sellerConcessions: string;
  paymentFrequency: string;
}

export interface AmortizationItem {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  totalInterest: number;
}

export interface SellerFinanceResults {
  loanAmount: number;
  monthlyPayment: number;
  totalPayments: number;
  totalInterest: number;
  balloonAmount: number;
  amortizationSchedule: AmortizationItem[];
  monthlyCashFlow: number;
  annualCashFlow: number;
  cashOnCash: number;
  equityAfterBalloon: number;
  roi: number;
}

// Creative Offer Calculator Interfaces
export interface CommonCreativeInputs {
  purchasePrice: string;
  afterRepairValue: string;
  repairCosts: string;
  closingCosts: string;
  holdingCosts: string;
  sellingCosts: string;
}

export interface SubjectToInputs {
  existingLoanBalance: string;
  existingInterestRate: string;
  existingMonthlyPayment: string;
  remainingLoanTerm: string;
}

export interface SubjectToResults {
  initialInvestment: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  equityCapture: number;
  roi: number;
  exitStrategyProfit: number;
}

export interface LeaseOptionInputs {
  optionFee: string;
  leaseTerm: string;
  monthlyRent: string;
  rentCredit: string;
  optionPurchasePrice: string;
}

export interface LeaseOptionResults {
  initialInvestment: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  totalRentCollected: number;
  totalRentCredits: number;
  exitStrategyProfit: number;
}

export interface OwnerFinanceInputs {
  downPayment: string;
  interestRate: string;
  loanTerm: string;
  balloonTerm: string;
}

export interface OwnerFinanceResults {
  loanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  balloonAmount: number;
  equityCapture: number;
  roi: number;
}

export interface CreativeOfferResults {
  subjectTo: SubjectToResults;
  leaseOption: LeaseOptionResults;
  ownerFinance: OwnerFinanceResults;
} 