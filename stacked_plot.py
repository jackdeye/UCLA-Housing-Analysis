import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

sns.set_theme(style="whitegrid")

def load_and_prep_data(filepath):
    print(f"Loading data from {filepath}...")
    df = pd.read_csv(filepath)
    df['Last_Updated'] = pd.to_datetime(df['Last_Updated'])
    df = df.sort_values('Last_Updated')
    return df

def create_velocity_chart(df, category_col, output_filename, title):
    print(f"Processing velocity data for: {category_col}...")
    
    # 1. Pivot the data
    df_pivot = df.pivot_table(
        index='Last_Updated', 
        columns=category_col, 
        values='Available_Bed_Spaces', 
        aggfunc='sum'
    )
    
    df_pivot = df_pivot.ffill().fillna(0)
    
    # 2. Calculate Cumulative Filled Spots
    capacity = df_pivot.max()
    df_cumulative = capacity - df_pivot
    
    # 3. Calculate Velocity
    df_velocity = df_cumulative.diff().fillna(0).clip(lower=0)
    
    # **NEW: Normalize to percentages (0-100%)**
    # Divide each row by its sum and multiply by 100
    df_velocity_pct = df_velocity.div(df_velocity.sum(axis=1), axis=0) * 100
    # Handle any division by zero (when sum is 0)
    df_velocity_pct = df_velocity_pct.fillna(0)
    
    # 4. Create a sequential index for smooth plotting
    original_timestamps = df_velocity_pct.index
    df_velocity_plot = df_velocity_pct.copy()
    df_velocity_plot.index = range(len(df_velocity_plot))
    
    # 5. Plotting
    fig, ax = plt.subplots(figsize=(14, 8))
    
    df_velocity_plot.plot.area(ax=ax, colormap='tab20', alpha=0.8, stacked=True)
    
    # 6. Create readable x-axis labels
    tick_positions = []
    tick_labels = []
    
    current_date = None
    for i, ts in enumerate(original_timestamps):
        date = ts.date()
        if date != current_date:
            tick_positions.append(i)
            tick_labels.append(ts.strftime('%m-%d'))
            current_date = date
    
    ax.set_xticks(tick_positions)
    ax.set_xticklabels(tick_labels, rotation=45, ha='right')
    
    # **NEW: Set y-axis to 0-100%**
    ax.set_ylim(0, 100)
    ax.set_ylabel('Percentage of New Signups (%)', fontsize=12)
    
    ax.set_title(title, fontsize=16)
    ax.set_xlabel('Date', fontsize=12)
    ax.legend(title=category_col, bbox_to_anchor=(1.01, 1), loc='upper left')
    
    plt.tight_layout()
   
    os.makedirs("figures", exist_ok=True)
    save_path = os.path.join("figures", output_filename)

    print(f"Saving plot to {output_filename}...")
    plt.savefig(save_path, dpi=300)
    plt.close()

if __name__ == "__main__":
    file_path = 'housing_timeseries_condensed.csv'
    
    try:
        df = load_and_prep_data(file_path)
        


        on_campus_building_df = df[df['Building'].isin([
            'De Neve Plaza',
            'De Neve Residence Hall',
            'Dykstra Hall',
            'Hedrick Hall',
            'Hitch Suites',
            'Olympic / Centennial',
            'Rieber Hall',
            'Rieber Terrace',
            'Rieber Vista',
            'Saxon Suites',
            'Sproul Landing / Cove',
            'Hedrick Summit',
            'Sproul Hall',
            'Sunset Village'
        ])]

        ua_building_df = df[df['Building'].isin([
            'Gayley Court Apartments',
            'Gayley Heights',
            'Glenrock Apartments',
            'Glenrock West Apartments',
            'Laurel',
            'Landfair Apartments',
            'Levering Terrace Apartments',
            'Landfair Vista Apartments',
            'Palo Verde',
            'Tipuana',
            'Westwood Chateau Apartments',
            'Westwood Palms Apartments'
        ])]
        ua_room_type_df = df[df['Room_Type'].isin([
            '2 Bd/4 Person',
            '1 Bd/3 Person',
            '2 Bd/5 Person-Double',
            '2 Bd/5 Person-Triple',
            '2 Bd/6 Person',
            '2 Bd/7 Person-Quad',
            '2 Bd/7 Person-Triple',
            '3 Bd/8 Person-Double',
            '3 Bd/8 Person-Triple',
            '4 Bd/10 Person-Double',
            '4 Bd/10 Person-Triple',
            '2 Bd/3 Person-Double',
            '2 Bd/8 Person',
            '2 Bd+Loft/5 Person-Double',
            '2 Bd+Loft/6 Person',
            '3 Bd+Loft/9 Person-Double',
            '3 Bd+Loft/9 Person-Triple',
            '3 Bd/6 Person'
        ])]

        on_campus_room_type_df = df[df['Room_Type'].isin([
            'Deluxe Triple',
            'Classic Triple',
            'Plaza Triple/Private Bath',
            'Suite Triple/Shared Bath',
            'Plaza Triple/Shared Bath'
        ])]


        create_velocity_chart(
            on_campus_building_df, 
            category_col='Building', 
            output_filename='oc_housing_velocity_by_building.png',
            title='Signup Rate: Percentage of New Spots Filled Per Hour By Building (On Campus)'
        )
        
        create_velocity_chart(
            ua_building_df, 
            category_col='Building', 
            output_filename='ua_housing_velocity_by_building.png',
            title='Signup Rate: Percentage of New Spots Filled Per Hour By Building (University Appartments)'
        )
        create_velocity_chart(
            on_campus_room_type_df, 
            category_col='Room_Type', 
            output_filename='oc_housing_velocity_by_room_type.png',
            title='Signup Rate: Percentage of New Spots Filled Per Hour By Room Type (On Campus)'
        )
        
        create_velocity_chart(
            ua_room_type_df,
            category_col='Room_Type', 
            output_filename='ua_housing_velocity_by_room_type.png',
            title='Signup Rate: Percentage of New Spots Filled Per Hour By Room Type (University Appartments)'
        )
        
        print("Done! Check your folder for the 'velocity' images.")
        
    except FileNotFoundError:
        print(f"Error: Could not find '{file_path}'.")
    except Exception as e:
        print(f"Error: {e}")
