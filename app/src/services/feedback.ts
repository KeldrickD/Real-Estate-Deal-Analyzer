interface AlternativeFeedback {
  id: string;
  strategy: 'sellerFinancing' | 'leaseOption' | 'subjectTo';
  rating: number; // 1-5 star rating
  comment?: string;
  timestamp: string;
}

const FEEDBACK_STORAGE_KEY = 'real_estate_alternative_feedback';

/**
 * Save feedback for an alternative deal suggestion
 * @param strategy - The strategy type
 * @param rating - Rating from 1-5
 * @param comment - Optional comment
 * @returns The saved feedback object
 */
export const saveAlternativeFeedback = (
  strategy: 'sellerFinancing' | 'leaseOption' | 'subjectTo',
  rating: number,
  comment?: string
): AlternativeFeedback => {
  const feedback: AlternativeFeedback = {
    id: Date.now().toString(),
    strategy,
    rating,
    comment,
    timestamp: new Date().toISOString()
  };
  
  // Get existing feedback
  const existingFeedback = getAllFeedback();
  
  // Add new feedback
  const updatedFeedback = [...existingFeedback, feedback];
  
  // Save to local storage
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updatedFeedback));
  
  return feedback;
};

/**
 * Get all saved feedback
 * @returns Array of feedback objects
 */
export const getAllFeedback = (): AlternativeFeedback[] => {
  const feedbackJson = localStorage.getItem(FEEDBACK_STORAGE_KEY);
  return feedbackJson ? JSON.parse(feedbackJson) : [];
};

/**
 * Get average rating for a specific strategy
 * @param strategy - The strategy type
 * @returns Average rating (1-5) or 0 if no ratings
 */
export const getAverageRating = (strategy: 'sellerFinancing' | 'leaseOption' | 'subjectTo'): number => {
  const allFeedback = getAllFeedback();
  const strategyFeedback = allFeedback.filter(feedback => feedback.strategy === strategy);
  
  if (strategyFeedback.length === 0) {
    return 0;
  }
  
  const sum = strategyFeedback.reduce((total, feedback) => total + feedback.rating, 0);
  return sum / strategyFeedback.length;
};

/**
 * Delete feedback by ID
 * @param id - The feedback ID to delete
 * @returns True if deleted successfully, false otherwise
 */
export const deleteFeedback = (id: string): boolean => {
  const allFeedback = getAllFeedback();
  const updatedFeedback = allFeedback.filter(feedback => feedback.id !== id);
  
  if (updatedFeedback.length === allFeedback.length) {
    return false;
  }
  
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updatedFeedback));
  return true;
}; 