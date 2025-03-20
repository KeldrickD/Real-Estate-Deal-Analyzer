/**
 * Local Storage utilities for saving and loading calculator data
 */

// Prefixes for localStorage keys
const WHOLESALE_PREFIX = 'wholesale_deal_';
const MULTIFAMILY_PREFIX = 'multifamily_deal_';
const SELLERFINANCE_PREFIX = 'sellerfinance_deal_';
const CREATIVEOFFER_PREFIX = 'creativeoffer_deal_';
const SCENARIO_PREFIX = 'scenario_';

// Generic save function
export const saveToLocalStorage = <T>(
  prefix: string,
  key: string,
  data: T
): void => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(`${prefix}${key}`, serializedData);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Generic load function
export const loadFromLocalStorage = <T>(
  prefix: string,
  key: string,
  defaultValue: T
): T => {
  try {
    const serializedData = localStorage.getItem(`${prefix}${key}`);
    if (serializedData === null) {
      return defaultValue;
    }
    return JSON.parse(serializedData) as T;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

// Get all saved items with a specific prefix
export const getAllSavedItems = (prefix: string): { key: string; data: any }[] => {
  const items: { key: string; data: any }[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      const shortKey = key.replace(prefix, '');
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        items.push({ key: shortKey, data });
      } catch (error) {
        console.error(`Error parsing item with key ${key}:`, error);
      }
    }
  }
  
  return items;
};

// Delete a saved item
export const deleteSavedItem = (prefix: string, key: string): void => {
  localStorage.removeItem(`${prefix}${key}`);
};

// Wholesale calculator specific functions
export const saveWholesaleDeal = <T>(key: string, data: T): void => {
  saveToLocalStorage(WHOLESALE_PREFIX, key, data);
};

export const loadWholesaleDeal = <T>(key: string, defaultValue: T): T => {
  return loadFromLocalStorage(WHOLESALE_PREFIX, key, defaultValue);
};

export const getAllWholesaleDeals = (): { key: string; data: any }[] => {
  return getAllSavedItems(WHOLESALE_PREFIX);
};

export const deleteWholesaleDeal = (key: string): void => {
  deleteSavedItem(WHOLESALE_PREFIX, key);
};

// Multi-family calculator specific functions
export const saveMultiFamilyDeal = <T>(key: string, data: T): void => {
  saveToLocalStorage(MULTIFAMILY_PREFIX, key, data);
};

export const loadMultiFamilyDeal = <T>(key: string, defaultValue: T): T => {
  return loadFromLocalStorage(MULTIFAMILY_PREFIX, key, defaultValue);
};

export const getAllMultiFamilyDeals = (): { key: string; data: any }[] => {
  return getAllSavedItems(MULTIFAMILY_PREFIX);
};

export const deleteMultiFamilyDeal = (key: string): void => {
  deleteSavedItem(MULTIFAMILY_PREFIX, key);
};

// Seller finance calculator specific functions
export const saveSellerFinanceDeal = <T>(key: string, data: T): void => {
  saveToLocalStorage(SELLERFINANCE_PREFIX, key, data);
};

export const loadSellerFinanceDeal = <T>(key: string, defaultValue: T): T => {
  return loadFromLocalStorage(SELLERFINANCE_PREFIX, key, defaultValue);
};

export const getAllSellerFinanceDeals = (): { key: string; data: any }[] => {
  return getAllSavedItems(SELLERFINANCE_PREFIX);
};

export const deleteSellerFinanceDeal = (key: string): void => {
  deleteSavedItem(SELLERFINANCE_PREFIX, key);
};

// Creative offer calculator specific functions
export const saveCreativeOfferDeal = <T>(key: string, data: T): void => {
  saveToLocalStorage(CREATIVEOFFER_PREFIX, key, data);
};

export const loadCreativeOfferDeal = <T>(key: string, defaultValue: T): T => {
  return loadFromLocalStorage(CREATIVEOFFER_PREFIX, key, defaultValue);
};

export const getAllCreativeOfferDeals = (): { key: string; data: any }[] => {
  return getAllSavedItems(CREATIVEOFFER_PREFIX);
};

export const deleteCreativeOfferDeal = (key: string): void => {
  deleteSavedItem(CREATIVEOFFER_PREFIX, key);
};

// Comparison scenarios specific functions
export const saveScenario = <T>(key: string, data: T): void => {
  saveToLocalStorage(SCENARIO_PREFIX, key, data);
};

export const loadScenario = <T>(key: string, defaultValue: T): T => {
  return loadFromLocalStorage(SCENARIO_PREFIX, key, defaultValue);
};

export const getAllScenarios = (): { key: string; data: any }[] => {
  return getAllSavedItems(SCENARIO_PREFIX);
};

export const deleteScenario = (key: string): void => {
  deleteSavedItem(SCENARIO_PREFIX, key);
}; 