import pandas as pd 
import glob 

files = glob.glob("downloaded_file_*.csv") 
df_list = [] 

for i, f in enumerate(files): 
    if i == 0: 
        temp = pd.read_csv(f)  # Read with header
    else: 
        temp = pd.read_csv(f, header=None, names=df_list[0].columns)  # Skip header, use first file's columns
    df_list.append(temp) 

combined = pd.concat(df_list, ignore_index=True) 
combined.to_csv("housing_timeseries.csv", index=False)
