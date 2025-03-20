export interface MarketData {
  averageLongTermRent: number;
  averageShortTermRate: number;
  marketOccupancyRate: number;
  marketVacancyRate: number;
  rentTrend: 'up' | 'down' | 'stable';
  occupancyTrend: 'up' | 'down' | 'stable';
  historicalData: {
    date: string;
    longTermRent: number;
    shortTermRate: number;
    occupancyRate: number;
    vacancyRate: number;
  }[];
}

// Mock data for demonstration. In a real application, this would fetch from an API
export const fetchMarketData = async (location: string): Promise<MarketData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    averageLongTermRent: 2500,
    averageShortTermRate: 180,
    marketOccupancyRate: 85,
    marketVacancyRate: 5,
    rentTrend: 'up',
    occupancyTrend: 'stable',
    historicalData: [
      { date: '2023-01', longTermRent: 2300, shortTermRate: 160, occupancyRate: 82, vacancyRate: 6 },
      { date: '2023-02', longTermRent: 2350, shortTermRate: 165, occupancyRate: 83, vacancyRate: 5 },
      { date: '2023-03', longTermRent: 2400, shortTermRate: 170, occupancyRate: 84, vacancyRate: 5 },
      { date: '2023-04', longTermRent: 2450, shortTermRate: 175, occupancyRate: 85, vacancyRate: 5 },
      { date: '2023-05', longTermRent: 2500, shortTermRate: 180, occupancyRate: 85, vacancyRate: 5 }
    ]
  };
}; 