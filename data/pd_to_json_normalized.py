import pandas as pd
import json

# Read both datasets
df_absolute = pd.read_csv("housing_timeseries.csv", parse_dates=["Last_Updated"])
df_normalized = pd.read_csv("housing_timeseries_normalized.csv", parse_dates=["Last_Updated"])

# Function to create data dictionary
def create_data_dict(df, value_column):
    data = {}
    combinations = df.groupby(['Building', 'Room_Type', 'Gender']).size().reset_index()[['Building', 'Room_Type', 'Gender']]
    
    for _, row in combinations.iterrows():
        building = row['Building']
        room_type = row['Room_Type']
        gender = row['Gender']
        
        key = f"{building}_{gender}_{room_type}"
        
        subset = df[(df['Building'] == building) & 
                    (df['Room_Type'] == room_type) & 
                    (df['Gender'] == gender)].copy()
        
        subset = subset.sort_values('Last_Updated')
        
        data[key] = [
            {
                'date': row['Last_Updated'].strftime('%Y-%m-%dT%H:%M:%S'),
                'value': float(row[value_column])
            }
            for _, row in subset.iterrows()
        ]
    
    return data

# Create both datasets
absolute_data = create_data_dict(df_absolute, 'Available_Bed_Spaces')
normalized_data = create_data_dict(df_normalized, 'Percent_Left')

# Combine into one JSON with both views
combined_data = {
    'absolute': absolute_data,
    'normalized': normalized_data
}

with open('housing_data.json', 'w') as f:
    json.dump(combined_data, f, indent=2)

print(f"Exported data with both absolute and normalized values")
