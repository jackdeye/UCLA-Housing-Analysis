import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

def analyze_ua_age_impact():
    # 1. Load Fill Data
    try:
        df_fill = pd.read_csv('time_to_80p_filled_UA.csv')
    except FileNotFoundError:
        print("Error: Could not find 'time_to_80p_filled_UA.csv'")
        return

    # 2. Load Build Year Data (Manually created from your text)
    # Ensure this CSV exists with columns: Location, Built
    df_build = pd.read_csv('renovation_build_years_UA.csv')

    # 3. Merge
    df_master = pd.merge(df_build, df_fill, on='Location', how='left')

    # 4. Process Timestamps for Ranking
    df_master['Timestamp'] = pd.to_datetime(df_master['Time'])
    max_date = df_master['Timestamp'].max()
    # Handle unfilled: Penalty is Max + 1 Day
    penalty_date = max_date + pd.Timedelta(days=1) if pd.notna(max_date) else pd.Timestamp.now()
    df_master['Rankable_Time'] = df_master['Timestamp'].fillna(penalty_date)

    # 5. Calculate Rank (1 = Fastest, Higher = Slower)
    df_master['Fill_Rank'] = df_master['Rankable_Time'].rank(method='average', ascending=True)

    # 6. Run Spearman Correlation
    # Test: Does Newer (Higher Year) mean Faster (Lower Rank)?
    # On-Campus result was -0.64 (Strong Negative).
    # UA result might be Positive (Newer = Slower) if location dominates.
    corr_age = df_master[['Fill_Rank', 'Built']].corr(method='spearman').iloc[0, 1]

    # 7. Output Results
    print("--- UA Build Year Analysis ---")
    print(df_master[['Location', 'Built', 'Time', 'Fill_Rank']].sort_values('Fill_Rank'))
    print("\n" + "="*40)
    print(f"Spearman Correlation (Build Year vs. Speed): {corr_age:.4f}")
    
    if corr_age > 0.3:
        print(">> CONCLUSION: Newer apartments filled SLOWER (Likely due to distance).")
    elif corr_age < -0.3:
        print(">> CONCLUSION: Newer apartments filled FASTER (Luxury wins).")
    else:
        print(">> CONCLUSION: Age didn't matter much.")



def analyze_renovation_impact():
    # 1. Load the Fill Time Data
    # Assumes 'Location' and 'Time' columns exist
    try:
        df_fill = pd.read_csv('time_to_80p_filled_on_campus.csv')
    except FileNotFoundError:
        print("Error: Could not find 'time_to_80p_filled_on_campus.csv'")
        return

    # 2. Load the Renovation Data
    # (I've included the logic to read your specific format)
    df_build = pd.read_csv('renovation_build_years.csv')

    # 3. Calculate "Effective Year"
    # Logic: If renovated, use Renovation Year. If not, use Built Year.
    df_build['Renovated'] = df_build['Renovated'].fillna(df_build['Built'])
    df_build['Effective_Year'] = df_build['Renovated'].astype(int)

    # 4. Merge Data
    df_master = pd.merge(df_build, df_fill, on='Location', how='left')

    # 5. Process Fill Times (Handle "Did Not Fill")
    # Convert string time to datetime
    df_master['Timestamp'] = pd.to_datetime(df_master['Time'])
    
    # Create a penalty date for unfilled dorms (Max Date + 1 Day)
    max_date = df_master['Timestamp'].max()
    penalty_date = max_date + pd.Timedelta(days=1) if pd.notna(max_date) else pd.Timestamp.now()
    
    # Create a sortable time column
    df_master['Rankable_Time'] = df_master['Timestamp'].fillna(penalty_date)

    # 6. Calculate Rank
    # Rank 1 = Filled First (Fastest), Rank 14 = Filled Last/Never
    df_master['Fill_Rank'] = df_master['Rankable_Time'].rank(method='average', ascending=True)

    # 7. Run Spearman Correlation
    # We correlate "Effective Year" vs "Fill Rank"
    # Negative Correlation = As Year increases (Newer), Rank decreases (1st place) -> GOOD
    corr_year = df_master[['Fill_Rank', 'Effective_Year']].corr(method='spearman').iloc[0, 1]

    # 8. Output Results
    print("--- Renovation Impact Analysis ---")
    print(df_master[['Location', 'Effective_Year', 'Time', 'Fill_Rank']].sort_values('Fill_Rank'))
    print("\n" + "="*40)
    print(f"Spearman Correlation (Year vs. Speed): {corr_year:.4f}")
    
    if corr_year < -0.5:
        print(">> CONCLUSION: Strong preference for NEW/RENOVATED buildings.")
    elif corr_year > 0.5:
        print(">> CONCLUSION: Strange preference for OLDER buildings.")
    else:
        print(">> CONCLUSION: Age is not the primary factor.")

    # 9. Visualization (Optional)
    plt.figure(figsize=(10, 6))
    sns.regplot(data=df_master, x='Effective_Year', y='Fill_Rank', scatter_kws={'s':100})
    
    # Label the points
    for i in range(df_master.shape[0]):
        plt.text(
            df_master.Effective_Year.iloc[i]+0.5, 
            df_master.Fill_Rank.iloc[i], 
            df_master.Location.iloc[i], 
            fontsize=9
        )
        
    plt.title(f"Do Students Prefer Newer Dorms?\nCorrelation: {corr_year:.2f}", fontsize=14)
    plt.xlabel("Effective Year (Built or Renovated)", fontsize=12)
    plt.ylabel("Fill Rank (Lower is Faster)", fontsize=12)
    plt.gca().invert_yaxis() # Put "Rank 1" (Fastest) at the top
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.show()


import pandas as pd

def analyze_build_year_impact():
    # Load data
    df_fill = pd.read_csv('time_to_80p_filled_on_campus.csv')
    df_build = pd.read_csv('renovation_build_years.csv')

    # KEY CHANGE: We ignore 'Renovated' and only look at 'Built'
    df_master = pd.merge(df_build, df_fill, on='Location', how='left')

    # Process timestamps and ranks (same as before)
    df_master['Timestamp'] = pd.to_datetime(df_master['Time'])
    max_date = df_master['Timestamp'].max()
    penalty_date = max_date + pd.Timedelta(days=1) if pd.notna(max_date) else pd.Timestamp.now()
    df_master['Rankable_Time'] = df_master['Timestamp'].fillna(penalty_date)
    df_master['Fill_Rank'] = df_master['Rankable_Time'].rank(method='average', ascending=True)

    # Correlation: Build Year vs Rank
    # We expect a strong Negative correlation (Newer Year = Lower/Better Rank)
    corr_build = df_master[['Fill_Rank', 'Built']].corr(method='spearman').iloc[0, 1]

    print(f"Spearman Correlation (Original Build Year vs. Speed): {corr_build:.4f}")


if __name__ == "__main__":
    #analyze_renovation_impact()
    #analyze_build_year_impact()
    analyze_ua_age_impact()
