import { DealAnalysis } from '../types/deal';
import { formatCurrency, formatPercentage } from './formatters';

export const downloadDealReport = (analysis: DealAnalysis): void => {
  const reportContent = `
DEAL ANALYSIS REPORT
Generated on: ${new Date().toLocaleDateString()}

PROPERTY DETAILS
---------------
Address: ${analysis.propertyDetails.address}
Purchase Price: ${formatCurrency(analysis.propertyDetails.purchasePrice)}
After Repair Value: ${formatCurrency(analysis.propertyDetails.afterRepairValue)}
Rehab Costs: ${formatCurrency(analysis.propertyDetails.rehabCosts)}

FINANCING
---------
Down Payment: ${formatCurrency(analysis.financing.downPayment)}
Interest Rate: ${formatPercentage(analysis.financing.interestRate)}
Term: ${analysis.financing.termYears} years
Monthly Payment: ${formatCurrency(analysis.financing.monthlyPayment)}

EXPENSES
--------
Property Taxes: ${formatCurrency(analysis.expenses.propertyTaxes)}
Insurance: ${formatCurrency(analysis.expenses.insurance)}
Maintenance: ${formatCurrency(analysis.expenses.maintenance)}
Utilities: ${formatCurrency(analysis.expenses.utilities)}
Property Management: ${formatCurrency(analysis.expenses.propertyManagement)}

INCOME
------
Monthly Rent: ${formatCurrency(analysis.income.monthlyRent)}
Vacancy Rate: ${formatPercentage(analysis.income.vacancyRate)}
Other Income: ${formatCurrency(analysis.income.otherIncome)}

METRICS
-------
Monthly Cash Flow: ${formatCurrency(analysis.metrics.monthlyCashFlow)}
Annual Cash Flow: ${formatCurrency(analysis.metrics.annualCashFlow)}
Cap Rate: ${formatPercentage(analysis.metrics.capRate)}
ROI: ${formatPercentage(analysis.metrics.roi)}
Cash on Cash Return: ${formatPercentage(analysis.metrics.cashOnCashReturn)}

NOTES
-----
${analysis.notes}
`;

  const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `deal_analysis_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}; 