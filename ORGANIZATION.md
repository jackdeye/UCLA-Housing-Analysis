# Repository Organization

This document describes the organization structure of the repository.

## Directory Structure

- **`docs/`** - GitHub Pages website files (HTML, CSS, JavaScript)
- **`scripts/`** - All Python analysis and processing scripts
- **`data/`** - Data files
  - **`data/processed/`** - Processed and derived data files (CSV, JSON)
  - Raw scraped data files (CSV)
- **`analysis/`** - Statistical analysis scripts and intermediate data
- **`figures/`** - Generated visualization images (PNG)
- **`archive/`** - Old/draft files that are no longer actively used
- **`notes/`** - Documentation, notes, and findings

## File Organization

### Scripts (`scripts/`)
All Python scripts have been moved here and paths have been updated to work from this directory:
- `query.py` - Example data query script
- `stacked_plot.py` - Velocity chart generation
- `race_chart.py` - Race chart visualization
- `copy_json.py` - Utility to copy data for GitHub Pages
- `test.py`, `test2.py` - Test/exploratory scripts

### Data Files
- Raw scraped data: `data/downloaded_file_*.csv`
- Processed data: `data/processed/*.csv` and `data/processed/*.json`

### Analysis
- Statistical analysis scripts: `analysis/*.py`
- Analysis intermediate data: `analysis/*.csv`

## Running the Organization Script

To complete the file organization (move remaining files), run:

```bash
python organize_repo.py
```

This will:
1. Move processed CSV/JSON files to `data/processed/`
2. Move old visualizations to `archive/`
3. Rename `correlation_testing/` to `analysis/`
4. Move `final_draft/` to `archive/final_draft/`

## Notes

- Script paths have been updated to work from their new locations
- The `organize_repo.py` script is safe to run multiple times (it checks for existing files)
- Original files in root directory will be moved, not copied

