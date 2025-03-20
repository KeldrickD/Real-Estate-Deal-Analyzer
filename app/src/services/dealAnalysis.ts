import { DealAnalysis } from '../types/deal';

const STORAGE_KEY = 'deal_analyses';

export const saveDealAnalysis = async (analysis: DealAnalysis): Promise<void> => {
  try {
    const existingAnalyses = await getSavedAnalyses();
    const updatedAnalyses = [...existingAnalyses, analysis];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAnalyses));
  } catch (error) {
    console.error('Error saving deal analysis:', error);
    throw error;
  }
};

export const getSavedAnalyses = async (): Promise<DealAnalysis[]> => {
  try {
    const savedAnalyses = localStorage.getItem(STORAGE_KEY);
    if (!savedAnalyses) {
      return [];
    }
    return JSON.parse(savedAnalyses).map((analysis: any) => ({
      ...analysis,
      timestamp: new Date(analysis.timestamp)
    }));
  } catch (error) {
    console.error('Error retrieving saved analyses:', error);
    return [];
  }
};

export const deleteDealAnalysis = async (id: string): Promise<void> => {
  try {
    const existingAnalyses = await getSavedAnalyses();
    const updatedAnalyses = existingAnalyses.filter(analysis => analysis.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAnalyses));
  } catch (error) {
    console.error('Error deleting deal analysis:', error);
    throw error;
  }
}; 