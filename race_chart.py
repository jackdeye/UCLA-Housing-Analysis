import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# 1. Load the Data
file_path = 'housing_timeseries_condensed.csv'
df = pd.read_csv(file_path)

# 2. Preprocessing
# Convert the timestamp column to datetime objects
df['Last_Updated'] = pd.to_datetime(df['Last_Updated'])

# 3. Calculate "Total Capacity" and "Current Fill"
# We first group by Building and Time to get the total available spots at every snapshot
# (Summing across all Room Types and Genders for that building)
building_time_series = df.groupby(['Building', 'Last_Updated'])['Available_Bed_Spaces'].sum().reset_index()

# Find the MAXIMUM spots ever seen for each building. 
# We assume this max value (likely at the start date) is the Total Capacity.
building_capacities = building_time_series.groupby('Building')['Available_Bed_Spaces'].max().reset_index()
building_capacities.rename(columns={'Available_Bed_Spaces': 'Total_Capacity'}, inplace=True)

# Merge the capacity data back into the time series
merged_df = pd.merge(building_time_series, building_capacities, on='Building')

# Calculate the Cumulative Percentage Filled
# Formula: 100% - (Current Available / Total Capacity * 100)
merged_df['Pct_Filled'] = 100 * (1 - (merged_df['Available_Bed_Spaces'] / merged_df['Total_Capacity']))

# -------------------------------------------------------
# OPTIONAL FILTERING
# If you want to declutter the chart, uncomment these lines to only show University Apartments
# ua_buildings = [
#     'Gayley Court Apartments', 'Gayley Heights', 'Glenrock Apartments', 
#     'Glenrock West Apartments', 'Laurel', 'Landfair Apartments', 
#     'Levering Terrace Apartments', 'Landfair Vista Apartments', 'Palo Verde', 
#     'Tipuana', 'Westwood Chateau Apartments', 'Westwood Palms Apartments'
# ]
# merged_df = merged_df[merged_df['Building'].isin(ua_buildings)]
# -------------------------------------------------------

# 4. Plotting the "Race Chart"
plt.figure(figsize=(14, 8))

# We use a lineplot where X is time, Y is % Full, and Hue is Building
sns.lineplot(
    data=merged_df, 
    x='Last_Updated', 
    y='Pct_Filled', 
    hue='Building', 
    linewidth=2.5,
    palette='tab20' # A distinct color palette for many buildings
)

plt.title("The Race to 100%: Which Buildings Filled Fastest?", fontsize=16, pad=20)
plt.xlabel("Date and Time", fontsize=12)
plt.ylabel("Percentage Filled (%)", fontsize=12)
plt.ylim(0, 105) # Fixed Y-axis from 0 to 100%
plt.grid(True, linestyle='--', alpha=0.5)
plt.legend(bbox_to_anchor=(1.01, 1), loc='upper left', title='Building')
plt.tight_layout()

# Save the plot
plt.savefig('housing_race_chart.png', dpi=300)
plt.show()
