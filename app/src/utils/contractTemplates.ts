import * as FileSaver from 'file-saver';

/**
 * Generate and download a seller financing contract template
 * @param sellerName - Seller name
 * @param buyerName - Buyer name
 * @param propertyAddress - Property address
 * @param purchasePrice - Purchase price
 * @param downPayment - Down payment
 * @param interestRate - Interest rate
 * @param termYears - Term in years
 * @param balloonYears - Balloon payment due in years
 */
export const downloadSellerFinancingContract = (
  sellerName: string = '[SELLER NAME]',
  buyerName: string = '[BUYER NAME]',
  propertyAddress: string = '[PROPERTY ADDRESS]',
  purchasePrice: number = 0,
  downPayment: number = 0,
  interestRate: number = 0,
  termYears: number = 30,
  balloonYears: number = 7
) => {
  const today = new Date().toLocaleDateString();
  
  const contractText = `
SELLER FINANCING AGREEMENT

THIS SELLER FINANCING AGREEMENT ("Agreement") is made and entered into on ${today}, by and between ${sellerName} ("Seller") and ${buyerName} ("Buyer").

PROPERTY: ${propertyAddress}

PURCHASE PRICE: $${purchasePrice.toLocaleString()}

TERMS:
1. Down Payment: $${downPayment.toLocaleString()}
2. Financed Amount: $${(purchasePrice - downPayment).toLocaleString()}
3. Interest Rate: ${interestRate}% per annum
4. Term: ${termYears} years
${balloonYears ? `5. Balloon Payment: Due after ${balloonYears} years` : ''}

[Additional standard contract language would be included here]

SELLER:
____________________
${sellerName}

BUYER:
____________________
${buyerName}
`;

  const blob = new Blob([contractText], { type: 'text/plain;charset=utf-8' });
  FileSaver.saveAs(blob, 'Seller_Financing_Contract_Template.txt');
};

/**
 * Generate and download a lease option contract template
 * @param landlordName - Landlord name
 * @param tenantName - Tenant name
 * @param propertyAddress - Property address
 * @param optionFee - Option fee
 * @param monthlyRent - Monthly rent
 * @param purchasePrice - Purchase price
 * @param optionTerm - Option term in years
 * @param rentCredit - Monthly rent credit percentage
 */
export const downloadLeaseOptionContract = (
  landlordName: string = '[LANDLORD NAME]',
  tenantName: string = '[TENANT NAME]',
  propertyAddress: string = '[PROPERTY ADDRESS]',
  optionFee: number = 0,
  monthlyRent: number = 0,
  purchasePrice: number = 0,
  optionTerm: number = 3,
  rentCredit: number = 25
) => {
  const today = new Date().toLocaleDateString();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + optionTerm);
  const optionEndDate = endDate.toLocaleDateString();
  
  const contractText = `
LEASE WITH OPTION TO PURCHASE AGREEMENT

This Lease with Option to Purchase Agreement (the "Agreement") is made and entered into on ${today} by and between ${landlordName} ("Landlord") and ${tenantName} ("Tenant") for the property located at ${propertyAddress} (the "Property").

1. LEASE TERMS
   a. Term: This lease shall begin on ${today} and continue for a period of ${optionTerm} years, ending on ${optionEndDate}.
   b. Rent: Tenant agrees to pay $${monthlyRent.toLocaleString()} per month, due on the 1st day of each month.
   c. Late Fee: A late fee of $50 will be charged if rent is not received by the 5th day of the month.
   d. Security Deposit: Tenant shall pay a security deposit of $${monthlyRent.toLocaleString()}.

2. OPTION TO PURCHASE
   a. Option Fee: Tenant shall pay a non-refundable option fee of $${optionFee.toLocaleString()} upon execution of this Agreement.
   b. Purchase Price: If Tenant exercises the option to purchase, the purchase price shall be $${purchasePrice.toLocaleString()}.
   c. Option Period: Tenant may exercise the option to purchase at any time during the lease term, but no later than ${optionEndDate}.
   d. Rent Credit: ${rentCredit}% of each monthly rent payment ($${(monthlyRent * rentCredit / 100).toLocaleString()} per month) shall be credited toward the purchase price if Tenant exercises the option to purchase.

3. EXERCISE OF OPTION
   a. To exercise the option, Tenant must provide written notice to Landlord of intent to purchase.
   b. Closing shall occur within 60 days after Tenant exercises the option.
   c. If Tenant fails to exercise the option during the option period, all rights to purchase the Property shall expire, and all option fees and rent credits shall be retained by Landlord.

4. MAINTENANCE AND REPAIRS
   a. Tenant shall maintain the Property in good condition and is responsible for minor repairs (under $300).
   b. Landlord is responsible for major repairs and structural issues.
   c. Tenant may make improvements to the Property with Landlord's prior written consent.

5. DEFAULT
   a. If Tenant defaults on any terms of this Agreement, the option to purchase shall terminate.
   b. In the event of default, Landlord retains all rights and remedies available under landlord-tenant law.

6. GOVERNING LAW
   This Agreement shall be governed by the laws of the state where the Property is located.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

________________________
Landlord: ${landlordName}

________________________
Tenant: ${tenantName}
`;

  const blob = new Blob([contractText], { type: 'text/plain;charset=utf-8' });
  FileSaver.saveAs(blob, 'Lease_Option_Contract_Template.txt');
};

/**
 * Generate and download a subject-to contract template
 * @param sellerName - Seller name
 * @param buyerName - Buyer name
 * @param propertyAddress - Property address
 * @param purchasePrice - Purchase price
 * @param existingLoanBalance - Existing loan balance
 * @param sellerCashout - Cash to seller
 * @param loanDetails - Loan details
 */
export const downloadSubjectToContract = (
  sellerName: string = '[SELLER NAME]',
  buyerName: string = '[BUYER NAME]',
  propertyAddress: string = '[PROPERTY ADDRESS]',
  purchasePrice: number = 0,
  existingLoanBalance: number = 0,
  sellerCashout: number = 0,
  loanDetails: string = '[LOAN DETAILS]'
) => {
  const today = new Date().toLocaleDateString();
  
  const contractText = `
SUBJECT-TO PURCHASE AGREEMENT

This Subject-To Purchase Agreement (the "Agreement") is made and entered into on ${today} by and between ${sellerName} ("Seller") and ${buyerName} ("Buyer") for the purchase of real property located at ${propertyAddress} (the "Property").

1. PURCHASE PRICE AND TERMS
   a. The total purchase price for the Property is $${purchasePrice.toLocaleString()}.
   b. Existing Loan: Buyer shall take title to the Property subject to the existing mortgage loan with an approximate current balance of $${existingLoanBalance.toLocaleString()}.
   c. Cash to Seller: Buyer shall pay Seller $${sellerCashout.toLocaleString()} at closing.

2. EXISTING LOAN DETAILS
   ${loanDetails}
   
3. LOAN PAYMENTS
   a. Buyer agrees to make all payments on the existing loan in a timely manner.
   b. Buyer acknowledges that the loan will remain in Seller's name, and any default may affect Seller's credit.
   c. Buyer shall provide proof of payment to Seller monthly.

4. TRANSFER OF TITLE
   a. Seller shall deliver a Warranty Deed to Buyer at closing.
   b. Buyer acknowledges that taking title "subject to" the existing loan does not release Seller from liability on the loan.

5. DUE-ON-SALE CLAUSE
   a. Buyer acknowledges that the existing loan may contain a due-on-sale clause that gives the lender the right to call the loan due upon transfer of title.
   b. Buyer accepts all risks associated with the lender potentially exercising its rights under the due-on-sale clause.

6. INSURANCE AND TAXES
   a. Buyer shall maintain hazard insurance on the Property with adequate coverage.
   b. Buyer shall be responsible for payment of all property taxes.

7. INDEMNIFICATION
   a. Buyer shall indemnify and hold Seller harmless from any claims, damages, or liabilities arising from Buyer's ownership of the Property.
   b. In the event the lender calls the loan due, Buyer shall promptly refinance the Property or pay off the loan.

8. DEFAULT
   a. If Buyer fails to make any loan payment or property tax payment when due, Seller shall have the right to cure the default and seek reimbursement from Buyer.
   b. In the event of Buyer's default, Seller may retake possession of the Property and terminate this Agreement.

9. CLOSING
   a. Closing shall take place on or before ______________.
   b. Buyer shall pay all closing costs.

10. GOVERNING LAW
    This Agreement shall be governed by the laws of the state where the Property is located.

IMPORTANT LEGAL NOTICE: This transaction involves complex legal issues. Both parties are advised to consult with a real estate attorney before signing.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

________________________
Seller: ${sellerName}

________________________
Buyer: ${buyerName}
`;

  const blob = new Blob([contractText], { type: 'text/plain;charset=utf-8' });
  FileSaver.saveAs(blob, 'Subject_To_Contract_Template.txt');
}; 