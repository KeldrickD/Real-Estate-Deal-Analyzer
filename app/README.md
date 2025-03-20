# Real Estate Deal Analyzer

A comprehensive web application for analyzing various real estate investment deals with advanced features for data visualization and comparison.

## Features

The application includes multiple calculators and analysis tools:

1. **Wholesale Deal Calculator**
   - Calculate maximum allowable offer (MAO) using the 70% rule
   - Estimate potential profits for wholesalers and investors
   - Visualize deal breakdown with interactive charts

2. **Multi-Family Analyzer**
   - Analyze income and expenses for multi-family properties
   - Calculate key metrics like cash flow, cap rate, and cash-on-cash return
   - Review debt service coverage ratio and 1% rule compliance

3. **Seller Finance Calculator**
   - Design seller financing deals with flexible terms
   - Generate amortization schedules with balloon payment options
   - Analyze cash flow and returns for both buyer and seller

4. **Creative Offer Calculator**
   - Subject-To: Take over existing financing while calculating equity capture
   - Lease Option: Design rent-to-own deals with customizable terms
   - Owner Financing: Create seller financing terms with complete deal analysis

5. **Deal Comparison Tool** 
   - Compare different investment scenarios side by side
   - Visual comparison charts to analyze investment metrics
   - Get automated recommendations based on ROI and cash flow

6. **Advanced Features**
   - Save and load your calculations
   - Data validation to prevent calculation errors
   - Responsive design for mobile and desktop use
   - Modern, intuitive user interface

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/real-estate-deal-analyzer.git
   cd real-estate-deal-analyzer/app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Technology Stack

- React with TypeScript for type-safe code
- Material UI for responsive, modern UI components
- Chart.js for interactive data visualization
- Local Storage for saving and loading calculations
- Form validation for data integrity

## Project Structure

The project is structured as follows:

- `src/components/` - Calculator components and UI elements
- `src/utils/` - Utility functions for validation and storage
- `src/types/` - TypeScript interfaces and type definitions
- `src/App.tsx` - Main application component with navigation
- `src/index.tsx` - Application entry point

## Development

### Adding New Features

To add a new calculator or feature:

1. Create a new component in the `src/components/` directory
2. Add relevant interfaces to `src/types/calculators.ts`
3. Add storage utilities for the new feature in `src/utils/localStorage.ts`
4. Update the main `App.tsx` to include your new component

## Deployment

To build the application for production:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory, ready for deployment.

## License

This project is licensed under the MIT License.

## Acknowledgments

- The calculators are based on common real estate investing formulas and strategies
- Inspired by Excel spreadsheets for real estate analysis
