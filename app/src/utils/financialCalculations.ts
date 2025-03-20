import { formatCurrency } from './validation';

// Mortgage payment calculation (P&I)
export const calculateMonthlyPayment = (
  loanAmount: number,
  annualInterestRate: number,
  termYears: number
): number => {
  const monthlyRate = annualInterestRate / 12 / 100;
  const numberOfPayments = termYears * 12;
  
  if (monthlyRate === 0) {
    return loanAmount / numberOfPayments;
  }
  
  return (
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
};

// Interest-only payment calculation
export const calculateInterestOnlyPayment = (
  loanAmount: number,
  annualInterestRate: number
): number => {
  return (loanAmount * annualInterestRate) / 12 / 100;
};

// Generate amortization schedule
export interface AmortizationRow {
  paymentNumber: number;
  paymentDate: Date;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export const generateAmortizationSchedule = (
  loanAmount: number,
  annualInterestRate: number,
  termYears: number,
  startDate: Date,
  isInterestOnly: boolean = false
): AmortizationRow[] => {
  const monthlyRate = annualInterestRate / 12 / 100;
  const numberOfPayments = termYears * 12;
  const monthlyPayment = isInterestOnly
    ? calculateInterestOnlyPayment(loanAmount, annualInterestRate)
    : calculateMonthlyPayment(loanAmount, annualInterestRate, termYears);
  
  const schedule: AmortizationRow[] = [];
  let balance = loanAmount;
  
  for (let i = 1; i <= numberOfPayments; i++) {
    const interest = balance * monthlyRate;
    const principal = isInterestOnly ? 0 : monthlyPayment - interest;
    balance = isInterestOnly ? loanAmount : balance - principal;
    
    schedule.push({
      paymentNumber: i,
      paymentDate: new Date(startDate.getFullYear(), startDate.getMonth() + i - 1, startDate.getDate()),
      payment: monthlyPayment,
      principal,
      interest,
      balance
    });
  }
  
  return schedule;
};

// Calculate balloon balance at specific year
export const calculateBalloonBalance = (
  loanAmount: number,
  annualInterestRate: number,
  termYears: number,
  balloonYear: number,
  isInterestOnly: boolean = false
): number => {
  const schedule = generateAmortizationSchedule(
    loanAmount,
    annualInterestRate,
    termYears,
    new Date(),
    isInterestOnly
  );
  
  const balloonPayment = balloonYear * 12;
  return schedule[balloonPayment - 1]?.balance || loanAmount;
};

// Calculate cash flow
export interface CashFlowMetrics {
  monthlyCashFlow: number;
  annualCashFlow: number;
  cashOnCashReturn: number;
}

export const calculateCashFlow = (
  rentalRevenue: number,
  operatingExpenses: number,
  monthlyPayment: number,
  totalCashInvested: number
): CashFlowMetrics => {
  const monthlyCashFlow = rentalRevenue - operatingExpenses - monthlyPayment;
  const annualCashFlow = monthlyCashFlow * 12;
  const cashOnCashReturn = (annualCashFlow / totalCashInvested) * 100;
  
  return {
    monthlyCashFlow,
    annualCashFlow,
    cashOnCashReturn
  };
};

// Format amortization schedule for display
export const formatAmortizationSchedule = (schedule: AmortizationRow[]) => {
  return schedule.map(row => ({
    ...row,
    paymentDate: row.paymentDate.toLocaleDateString(),
    payment: formatCurrency(row.payment),
    principal: formatCurrency(row.principal),
    interest: formatCurrency(row.interest),
    balance: formatCurrency(row.balance)
  }));
};

// Criteria checks for creative financing deals
export interface DealCriteria {
  meetsMinimumCashFlow: boolean;
  meetsMaximumOfferPrice: boolean;
  meetsMinimumCashOnCash: boolean;
  meetsMaximumDownPayment: boolean;
  meetsMaximumInterestRate: boolean;
  meetsMinimumBalloon: boolean;
}

export const checkDealCriteria = (
  monthlyCashFlow: number,
  purchasePrice: number,
  cashOnCashReturn: number,
  downPayment: number,
  interestRate: number,
  balloonYears: number
): DealCriteria => {
  return {
    meetsMinimumCashFlow: monthlyCashFlow >= 200,
    meetsMaximumOfferPrice: purchasePrice <= 500000,
    meetsMinimumCashOnCash: cashOnCashReturn >= 13,
    meetsMaximumDownPayment: (downPayment / purchasePrice) <= 0.15,
    meetsMaximumInterestRate: interestRate <= 4,
    meetsMinimumBalloon: balloonYears >= 5
  };
};

// Calculate seller profit
export const calculateSellerProfit = (
  listedPrice: number,
  offerPrice: number
): { amount: number; percentage: number } => {
  const amount = listedPrice - offerPrice;
  const percentage = (amount / listedPrice) * 100;
  
  return {
    amount,
    percentage
  };
}; 