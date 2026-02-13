import pandas as pd
import statsmodels.api as sm
from datetime import datetime

df_amenities = pd.read_csv('amenities_UA.csv')
df_dist = pd.read_csv('dist_UA_to_class_centroid.csv')
df_time = pd.read_csv('time_to_80p_filled_UA.csv')
df_years = pd.read_csv('renovation_build_years_UA.csv')
df_size = pd.read_csv('average_room_size.csv')

df_time['Location'] = df_time['Location'].str.strip()
df_dist['Location'] = df_dist['Location'].str.strip()
df_years['Location'] = df_years['Location'].str.strip()
df_size['Location'] = df_size['Location'].str.strip()
df_amenities['Location'] = df_amenities['Location'].str.strip()

print(df_time['Location'])
print(df_dist['Location'])
print(df_years['Location'])
print(df_size['Location'])
print(df_amenities['Location'])


df = df_time.merge(df_dist, on='Location') \
            .merge(df_years, on='Location') \
            .merge(df_size, on='Location') \
            .merge(df_amenities, on='Location')


df['Filled_Time'] = pd.to_datetime(df['Time_x']) # Assuming Time_x is from df_time

start_time = df['Filled_Time'].min() 
print(start_time)
start_time = pd.to_datetime("2025-02-18 09:00:00")

df['Hours_to_80_Percent'] = (df['Filled_Time'] - start_time).dt.total_seconds() / 3600

current_year = datetime.now().year
df['Building_Age'] = current_year - df['Built']

Y = df['Hours_to_80_Percent']

# X = The predictors
X = df[[
    'Distance',          # From dist_UA...
    'Building_Age',      # From renovation...
    'Avg_Ppl_per_Room',  # From size (Proxy for Privacy: Lower = Better)
    'Parking',           # From amenities
    'AC',                # From amenities
    'Exercise_Room'      # From amenities
]]


# Define your list of potential predictors
predictors = ['Distance', 'Building_Age', 'Avg_Ppl_per_Room', 'Parking', 'AC', 'Exercise_Room']
results = []

# Loop through each predictor and run a simple 1-on-1 regression
for feature in predictors:
    X_simple = sm.add_constant(df[[feature]])
    model_simple = sm.OLS(Y, X_simple).fit()
    
    results.append({
        'Feature': feature,
        'R_Squared': model_simple.rsquared,
        'Coeff': model_simple.params[feature],
        'P_Value': model_simple.pvalues[feature]
    })

# Show the leaderboard
results_df = pd.DataFrame(results).sort_values(by='R_Squared', ascending=False)
print(results_df)

X_final = sm.add_constant(df[['Distance', 'Parking']])
model_final = sm.OLS(Y, X_final).fit()
print("\n--- Distance vs. Parking Model ---")
print(model_final.summary())

correlation = df[['Distance', 'Avg_Ppl_per_Room']].corr()
print("Correlation between Distance and Density:\n", correlation)


import matplotlib.pyplot as plt
import seaborn as sns

plt.figure(figsize=(10, 6))
sns.scatterplot(
    data=df,
    x='Distance',
    y='Avg_Ppl_per_Room',
    hue='Hours_to_80_Percent', # Color by how fast they filled
    palette='coolwarm',
    s=200
)

plt.title("Why Density 'Looked' Important: The Densest Rooms are Furthest Away", fontsize=14)
plt.xlabel("Distance to Centroid (min)", fontsize=12)
plt.ylabel("Average People per Room", fontsize=12)
plt.grid(True, linestyle='--', alpha=0.6)
# plt.savefig('density_vs_distance_check.png', dpi=300)
plt.show()
