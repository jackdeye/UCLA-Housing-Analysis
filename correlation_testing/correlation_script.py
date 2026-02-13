import pandas as pd
import numpy as np

def analyze_housing_correlations(fill_csv, dist_poly_csv, dist_cent_csv, category_name):
    # 1. Load Data
    # 'Time' is the column with "2025-02-21 11:00"
    df_fill = pd.read_csv(fill_csv)
    
    # Load distance files
    df_dist_poly = pd.read_csv(dist_poly_csv)[['Location', 'Distance']].rename(columns={'Distance': 'Dist_Edge'})
    df_dist_cent = pd.read_csv(dist_cent_csv)[['Location', 'Distance']].rename(columns={'Distance': 'Dist_Centroid'})

    # 2. Merge Distance Files (The "Universe" of Housing)
    df_master = pd.merge(df_dist_poly, df_dist_cent, on='Location', how='outer')

    # 3. Merge Fill Times (Left Join)
    df_master = pd.merge(df_master, df_fill, on='Location', how='left')

    # 4. Convert 'Time' to Datetime Objects
    # This ensures "Feb 21" is treated as a date, not text
    df_master['Timestamp'] = pd.to_datetime(df_master['Time'])

    # 5. Handle "Did Not Fill" (Tied for Last Logic)
    # We create a "Penalized Timestamp" for ranking
    max_date = df_master['Timestamp'].max()
    
    # If a dorm has no time (didn't fill), give it (Max Date + 1 Day)
    # This places it strictly after the last filled dorm.
    penalty_date = max_date + pd.Timedelta(days=1) if pd.notna(max_date) else pd.Timestamp.now()
    
    # Fill NaNs with this penalty date
    df_master['Rankable_Time'] = df_master['Timestamp'].fillna(penalty_date)

    # 6. Generate Ranks (Optional but good for debugging)
    # method='average' ensures all unfilled dorms get the same tied rank
    df_master['Fill_Rank'] = df_master['Rankable_Time'].rank(method='average', ascending=True)

    # 7. Calculate Spearman Correlation
    # We correlate the Timestamp Rank vs Distance
    # Positive Corr = Further Away -> Later Fill Time (Expected)
    # Negative Corr = Further Away -> Earlier Fill Time (Surprising)
    corr_edge = df_master[['Fill_Rank', 'Dist_Edge']].corr(method='spearman').iloc[0, 1]
    corr_cent = df_master[['Fill_Rank', 'Dist_Centroid']].corr(method='spearman').iloc[0, 1]

    # 8. Output Results
    print(f"--- Analysis: {category_name} ---")
    print(f"Total Locations: {len(df_master)}")
    print(f"Locations filled: {df_master['Time'].notna().sum()}")
    print(f"Spearman Correlation (Distance to Campus Edge): {corr_edge:.4f}")
    print(f"Spearman Correlation (Distance to Centroid):    {corr_cent:.4f}")
    
    # Insight Generator
    strongest = "Centroid" if abs(corr_cent) > abs(corr_edge) else "Edge"
    print(f">> Stronger Predictor: Distance to {strongest}")
    print("-" * 40)
    
    return df_master

# --- RUN THE ANALYSIS ---

# 1. Analyze On-Campus Housing
print("Processing On-Campus Data...")
try:
    df_on_campus = analyze_housing_correlations(
        'time_to_80p_filled_on_campus.csv',
        'dist_on_campus_to_class.csv',
        'dist_on_campus_to_class_centroid.csv',
        'On-Campus Housing'
    )
except Exception as e:
    print(f"Error on On-Campus: {e}")

# 2. Analyze University Apartments (UA)
print("\nProcessing University Apartments Data...")
try:
    df_ua = analyze_housing_correlations(
        'time_to_80p_filled_UA.csv',
        'dist_UA_to_class.csv',
        'dist_UA_to_class_centroid.csv',
        'University Apartments'
    )
except Exception as e:
    print(f"Error on UA: {e}")
