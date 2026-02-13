#!/usr/bin/env python3
"""Generate JSON data for interactive density vs distance scatter plot"""
import pandas as pd
import json
from datetime import datetime

# Load all the data files
df_amenities = pd.read_csv('../analysis/amenities_UA.csv')
df_dist = pd.read_csv('../analysis/dist_UA_to_class_centroid.csv')
df_time = pd.read_csv('../analysis/time_to_80p_filled_UA.csv')
df_years = pd.read_csv('../analysis/renovation_build_years_UA.csv')
df_size = pd.read_csv('../analysis/average_room_size.csv')

# Clean location names
df_time['Location'] = df_time['Location'].str.strip()
df_dist['Location'] = df_dist['Location'].str.strip()
df_years['Location'] = df_years['Location'].str.strip()
df_size['Location'] = df_size['Location'].str.strip()
df_amenities['Location'] = df_amenities['Location'].str.strip()

# Rename Time column in df_dist to avoid conflict (df_dist has numeric time, df_time has datetime)
df_dist = df_dist.rename(columns={'Time': 'Time_numeric'})

# Merge all data
df = df_time.merge(df_dist, on='Location') \
            .merge(df_years, on='Location') \
            .merge(df_size, on='Location') \
            .merge(df_amenities, on='Location')

# Calculate hours to 80% fill using the Time column from df_time
df['Filled_Time'] = pd.to_datetime(df['Time'])
start_time = pd.to_datetime("2025-02-18 09:00:00")
df['Hours_to_80_Percent'] = (df['Filled_Time'] - start_time).dt.total_seconds() / 3600

# Calculate building age
current_year = datetime.now().year
df['Building_Age'] = current_year - df['Built']

# Prepare data for JSON
scatter_data = []
for _, row in df.iterrows():
    scatter_data.append({
        'location': row['Location'],
        'distance': float(row['Distance']),
        'density': float(row['Avg_Ppl_per_Room']),
        'hours_to_80': float(row['Hours_to_80_Percent']),
        'building_age': int(row['Building_Age']),
        'built_year': int(row['Built']),
        'parking': bool(row['Parking']),
        'ac': bool(row['AC']),
        'exercise_room': bool(row['Exercise_Room']),
        'fireplace': bool(row['Fireplace'])
    })

# Save to JSON
output_path = '../docs/scatter_data.json'
with open(output_path, 'w') as f:
    json.dump(scatter_data, f, indent=2)

print(f"Generated scatter plot data with {len(scatter_data)} locations")
print(f"Saved to {output_path}")

