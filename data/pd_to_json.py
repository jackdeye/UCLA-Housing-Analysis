import pandas as pd
import json

# Read your data
df = pd.read_csv("housing_timeseries.csv", parse_dates=["Last_Updated"])
df["Last_Updated"] = pd.to_datetime(df["Last_Updated"], errors="coerce")
# Create a dictionary to store all combinations
data = {}

# Get all unique combinations
combinations = df.groupby(['Building', 'Room_Type', 'Gender']).size().reset_index()[['Building', 'Room_Type', 'Gender']]

for _, row in combinations.iterrows():
    building = row['Building']
    room_type = row['Room_Type']
    gender = row['Gender']
    
    # Create a key for this combination
    key = f"{building}_{gender}_{room_type}"
    
    # Filter data for this combination
    subset = df[(df['Building'] == building) & 
                (df['Room_Type'] == room_type) & 
                (df['Gender'] == gender)].copy()
    
    # Sort by date
    subset = subset.sort_values('Last_Updated')
    
    # Convert to list of dicts
    data[key] = [
        {
            'date': row['Last_Updated'].strftime('%Y-%m-%dT%H:%M:%S'),
            'available': int(row['Available_Bed_Spaces'])
        }
        for _, row in subset.iterrows()
    ]

with open('housing_data.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"Exported {len(data)} combinations to housing_data.json")
print("\nFirst few keys:")
for i, key in enumerate(list(data.keys())[:5]):
    print(f"  {key}")

