import pandas as pd

df = pd.read_csv("housing_timeseries.csv", parse_dates=["Last_Updated"])
df["Available_Bed_Spaces"] = pd.to_numeric(df["Available_Bed_Spaces"], errors="coerce")
group_cols = ["Building", "Building_Abbreviation", "Room_Type", "Gender"]
df["Max_Beds"] = df.groupby(group_cols)["Available_Bed_Spaces"].transform("max")

# Normalize: percentage left relative to max
df["Percent_Left"] = (df["Available_Bed_Spaces"] / df["Max_Beds"]) * 100
df["Percent_Left"] = df["Percent_Left"].fillna(0).round(1)

df.drop(columns=["Max_Beds"]).to_csv("housing_timeseries_normalized.csv", index=False)
