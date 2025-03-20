/**
 * Validation utility functions for real estate calculators
 */

/**
 * Validates if a string is a valid number and within specified range
 */
export const isValidNumber = (
  value: string, 
  min: number = Number.MIN_SAFE_INTEGER, 
  max: number = Number.MAX_SAFE_INTEGER
): boolean => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  return num >= min && num <= max;
};

/**
 * Validates if a string is a valid percentage (0-100)
 */
export const isValidPercentage = (value: string): boolean => {
  return isValidNumber(value, 0, 100);
};

/**
 * Validates if a string is a valid interest rate (0-100)
 */
export const isValidInterestRate = (value: string): boolean => {
  return isValidNumber(value, 0, 100);
};

/**
 * Validates if a string is a valid positive number
 */
export const isValidPositiveNumber = (value: string): boolean => {
  return isValidNumber(value, 0);
};

/**
 * Validates if a string is a valid integer
 */
export const isValidInteger = (value: string): boolean => {
  const num = parseFloat(value);
  return !isNaN(num) && Number.isInteger(num);
};

/**
 * Validates if a string is a valid positive integer
 */
export const isValidPositiveInteger = (value: string): boolean => {
  return isValidInteger(value) && parseFloat(value) >= 0;
};

/**
 * Helper to safely parse a number, with fallback to default
 */
export const safeParseFloat = (value: string, defaultValue: number = 0): number => {
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Helper to safely parse an integer, with fallback to default
 */
export const safeParseInt = (value: string, defaultValue: number = 0): number => {
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Format a number as currency
 * @param value - The number to format
 * @param maximumFractionDigits - Maximum fraction digits to show (default: 0)
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, maximumFractionDigits: number = 0): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits
  }).format(value);
};

/**
 * Format percentage for display
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
}; 