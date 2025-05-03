# SEC Filings Sankey Diagram Visualizer

> **⚠️ DEVELOPMENT STATUS:** This project is currently in early development stages and has a long way to go. Many features are experimental, and significant changes should be expected.

## Overview

The SEC Filings Sankey Diagram Visualizer is a modern web application designed to transform complex financial data from SEC EDGAR filings into intuitive, interactive Sankey diagrams. This tool helps investors, analysts, and financial enthusiasts visualize the flow of resources through a company's financial statements.

![Sankey Diagram Example](https://placeholder-for-screenshot.png)

## Purpose

Financial statements can be difficult to interpret, especially for those without a strong financial background. This project aims to:

- Make financial data from public companies more accessible and understandable
- Provide interactive visualization of the relationships between financial items
- Enable quick comparison and analysis of company finances across different periods and filing types
- Democratize access to financial insights through intuitive visual representations

## Core Features

### Current Features

- **SEC EDGAR API Integration**: Fetch real-time financial data from the SEC's EDGAR database
- **Company Search**: Find public companies by ticker symbol
- **Multiple Statement Types**: View Balance Sheet, Income Statement, and Cash Flow visualizations
- **Interactive Sankey Diagrams**: Explore the flow of resources with interactive hover effects and tooltips
- **Filing Type Selection**: Choose between 10-K (Annual) and 10-Q (Quarterly) filings
- **Period Selection**: For quarterly reports, select specific quarters (Q1-Q4) or view all periods
- **Unit Conversion**: Toggle between raw values, thousands (K), millions (M), and billions (B) for easier reading
- **Dark/Light Mode**: Interface adapts to user preference with optimized color schemes
- **Tabular Data View**: Switch between diagram and table views of the same data
- **Raw JSON View**: Access the underlying data for more technical users

### Planned Features

- Historical data comparison
- Peer company comparison
- Export capabilities (PNG, PDF, CSV)
- More detailed ratio analysis
- Custom diagram creation
- User accounts for saving preferences and favorite companies
- Mobile-optimized views
- Additional financial statement types and metrics

## Technology Stack

- **Frontend**: React with TypeScript
- **UI Framework**: Material UI (MUI)
- **Visualization**: Nivo for Sankey diagrams
- **State Management**: Custom store with React hooks
- **Data Fetching**: Async/await pattern with fetch API
- **Styling**: MUI theming system with responsive design
- **Build System**: Next.js

## Installation

This project requires Node.js (v16+) and npm/yarn.

```bash
# Clone the repository
git clone https://github.com/yourusername/sec-filings-sankey.git
cd sec-filings-sankey

# Install dependencies
npm install
# or
yarn install

# Start the development server
npm run dev
# or
yarn dev
```

## Usage

1. **Search for a Company**: Enter a company ticker symbol (e.g., AAPL, MSFT, GOOGL) in the search bar
2. **Select Filing Type**: Choose between 10-K (Annual) or 10-Q (Quarterly) reports
3. **Load Financial Data**: Click the "Load Data" button to fetch and process the financial information
4. **Explore the Visualization**: 
   - Hover over nodes and links to see detailed information
   - Switch between different statement types (Income, Balance Sheet, Cash Flow)
   - Toggle between chart, table, and raw data views
   - Adjust units for easier reading of large numbers

## Development Roadmap

- [x] Basic visualization of financial statements
- [x] Company search functionality
- [x] Support for different filing types
- [x] Dark/light mode
- [x] Unit conversion for large numbers
- [ ] Historical comparisons
- [ ] Performance optimization for large datasets
- [ ] Mobile responsiveness improvements
- [ ] User accounts and saved preferences
- [ ] Advanced filtering and custom diagram options
- [ ] Export and sharing capabilities

## Contributing

This project is currently in early development, but contributions are welcome. If you're interested in contributing:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Data Sources

This application uses the SEC's EDGAR API to fetch financial data. All data is publicly available through the SEC's website. Please be aware of the SEC's [fair access](https://www.sec.gov/developer) rules when using this application.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- SEC EDGAR Database for providing open access to financial data
- Nivo.rocks for their excellent data visualization components
- Material-UI team for the comprehensive UI framework

---

**Disclaimer**: This application is for educational and research purposes only. It is not intended to provide investment advice. Always consult with a qualified professional before making investment decisions.
