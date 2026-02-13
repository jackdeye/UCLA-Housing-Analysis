# UCLA Housing Rush Analysis

An interactive data visualization and analysis project tracking how 17,500 UCLA housing beds disappeared in just two weeks during the 2025 enrollment period.

## Overview

Starting at 9 AM on February 18, 2025, UCLA opened its housing portal for the upcoming academic year. Within seven hours that first day, over 3,000 bed spaces disappeared. By the time the dust settled two weeks later, more than 70% of UCLA's 17,514 available housing spots had been claimed.

This project provides:
- **Interactive web visualization** of housing availability over time
- **Statistical analysis** of factors driving housing demand
- **Data processing scripts** for analyzing housing trends

## Live Visualization

The interactive visualization can be hosted on GitHub Pages. After setting up (see instructions below), your site will be available at:

**https://[YOUR_USERNAME].github.io/box_data/**

*(Replace [YOUR_USERNAME] with your GitHub username)*

## Project Structure

```
box_data/
├── docs/                          # GitHub Pages website (final_draft)
│   ├── index.html                 # Main visualization page
│   ├── housing_data.json          # Processed housing data
│   ├── main.js                    # Application orchestration
│   ├── chart.js                   # D3.js chart rendering
│   ├── filters.js                 # Filter management
│   ├── config.js                  # Configuration constants
│   └── styles.css                 # Styling
├── data/                          # Raw and processed data files
│   ├── housing_timeseries.csv     # Time series data
│   ├── housing_timeseries_normalized.csv
│   └── downloaded_file_*.csv      # Hourly scraped data
├── correlation_testing/           # Statistical analysis scripts
│   ├── correlation_script.py      # Correlation analysis
│   ├── geo_dist.py                # Geographic distance calculations
│   └── multivariable_regression.py
├── figures/                       # Generated visualization images
├── query.py                       # Example data query script
├── stacked_plot.py                # Velocity chart generation
├── race_chart.py                  # Race chart visualization
└── requirements.txt               # Python dependencies
```

## Setup Instructions

### Prerequisites

- Python 3.7+
- pip (Python package manager)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/[YOUR_USERNAME]/box_data.git
   cd box_data
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

### Running the Analysis Scripts

#### Example: Query Housing Data
```bash
python query.py
```

This script demonstrates how to query the housing timeseries data for specific buildings, genders, and room types.

#### Generate Velocity Charts
```bash
python stacked_plot.py
```

Generates velocity charts showing how quickly different housing options filled up.

#### Run Correlation Analysis
```bash
cd correlation_testing
python correlation_script.py
```

Analyzes correlations between geographic distance and housing fill rates.

### Setting Up GitHub Pages

**Important:** Before enabling GitHub Pages, you need to copy the housing data JSON file to the docs folder.

1. **Copy the housing data JSON file:**
   ```bash
   python copy_json.py
   ```
   
   This will copy `final_draft/housing_data.json` to `docs/housing_data.json`. 
   
   Alternatively, you can manually copy the file:
   ```bash
   cp final_draft/housing_data.json docs/housing_data.json
   ```
   (On Windows: `copy final_draft\housing_data.json docs\housing_data.json`)

2. **Commit and push the docs folder to GitHub:**
   ```bash
   git add docs/
   git commit -m "Add GitHub Pages website"
   git push
   ```

3. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click on "Settings" (top menu)
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "Deploy from a branch"
   - Choose "main" (or "master") branch and `/docs` folder
   - Click "Save"
   - Your site will be available at `https://[YOUR_USERNAME].github.io/box_data/` within a few minutes

### Viewing the Interactive Visualization Locally

1. **First, ensure the JSON file is in the docs folder:**
   ```bash
   python copy_json.py
   ```

2. Navigate to the `docs/` directory:
   ```bash
   cd docs
   ```

3. Start a local web server (Python 3):
   ```bash
   python -m http.server 8000
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

   *(Note: A local server is required due to CORS restrictions when loading JSON files)*

## Data Collection

The data was collected by:
- Scraping UCLA's housing availability spreadsheet every hour during the enrollment period (February 18 - March 4, 2025)
- Manually labeling building locations on Google Earth for geographic analysis
- Collecting amenity data from the UCLA housing website

## Key Findings

- **Critical Threshold**: Housing crossed the 50% capacity mark between 11 AM and noon on February 20—just two days after applications opened
- **University Apartments**: 10 of 12 apartment complexes reached 80% capacity within the first week, with 7 filling completely
- **Location Matters**: For university apartments, distance from campus showed a moderate positive correlation (0.56) with fill speed—closer apartments filled faster
- **Fastest to Fill**: Landfair Vista Apartments reached 80% capacity by 11 AM on Day 1 and were completely filled by 3 PM

## Methodology

- **Data Collection**: Hourly scraping of UCLA housing portal during enrollment period
- **Analysis Period**: February 18 to March 4, 2025
- **Total Bed Spaces Tracked**: 17,514 across 14 on-campus housing locations and 12 university apartment complexes
- **Normalization**: Availability data normalized to percentage remaining for fair comparison between facilities of different sizes
- **Statistical Analysis**: Spearman correlation used to analyze relationships between geographic distance and fill rates

## Technologies Used

- **Python**: Data processing and analysis (pandas, matplotlib, seaborn, statsmodels)
- **JavaScript**: Interactive visualization (D3.js v7)
- **HTML/CSS**: Web interface
- **GitHub Pages**: Web hosting

## Contributing

This is a research project, but suggestions and improvements are welcome! Please feel free to:
- Report bugs or issues
- Suggest enhancements to the visualization
- Share additional analysis or insights

## License

This project is provided as-is for educational and research purposes.

## Acknowledgments

- Data collected from UCLA Housing portal
- Geographic data manually labeled using Google Earth
- Visualization built with D3.js

---

*Data analysis and visualization | February-March 2025*

