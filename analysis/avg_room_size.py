import pandas as pd

# --- CONFIGURATION ---
# Change this to 'time_to_80p_filled_on_campus.csv' to run the other dataset
fill_csv = 'time_to_80p_filled_UA.csv' 
density_csv = 'average_room_size.csv'

# --- LOAD AND MERGE ---
df_fill = pd.read_csv(fill_csv)
df_density = pd.read_csv(density_csv)[['Location', 'Avg_Ppl_per_Room']]

# Merge data on Location
df = pd.merge(df_fill, df_density, on='Location', how='inner')

# --- PREPROCESS TIME ---
df['Timestamp'] = pd.to_datetime(df['Time'])

# Handle locations that never filled (Assign them last place)
# We fill NaNs with a date 1 day after the latest actual fill time
penalty_date = df['Timestamp'].max() + pd.Timedelta(days=1)
if pd.isna(penalty_date): # Handle case where file is empty or all NaT
    penalty_date = pd.Timestamp.now()
    
df['Rankable_Time'] = df['Timestamp'].fillna(penalty_date)

# --- CALCULATE RANK ---
# Ascending=True means Early Time = Low Rank (1st place)
df['Fill_Rank'] = df['Rankable_Time'].rank(method='average', ascending=True)

# --- CALCULATE SPEARMAN CORRELATION ---
correlation = df['Avg_Ppl_per_Room'].rank().corr(df['Fill_Rank'])

# --- OUTPUT ---
print(f"Data Source: {fill_csv}")
print(f"Locations Analyzed: {len(df)}")
print(f"Spearman Correlation (Density vs. Fill Order): {correlation:.4f}")

print("-" * 30)
if correlation > 0:
    print("POSITIVE CORRELATION (+)")
    print("Interpretation: As density GOES UP, fill rank GOES UP (later).")
    print("Result: People are AVOIDING crowded rooms.")
elif correlation < 0:
    print("NEGATIVE CORRELATION (-)")
    print("Interpretation: As density GOES UP, fill rank GOES DOWN (earlier).")
    print("Result: People are CHOOSING crowded rooms (likely for cost/social reasons).")
else:
    print("NO CORRELATION")
