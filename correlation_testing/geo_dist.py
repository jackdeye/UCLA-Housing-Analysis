import geopandas as gpd
import pandas as pd
from shapely.geometry import Point, Polygon

import fiona
fiona.drvsupport.supported_drivers['KML'] = 'rw'
fiona.drvsupport.supported_drivers['LIBKML'] = 'rw'
kml_file = "housing+dining+ucla.kml" 

gdf = gpd.read_file(kml_file, driver='KML')
campus_polygon = gdf[gdf.geom_type == 'Polygon'].copy()
housing_points = gdf[gdf.geom_type == 'Point'].copy()

# Error check: Ensure you actually found the polygon
if len(campus_polygon) == 0:
    print("Error: No Polygon found. Did you save the campus border in a separate folder?")
else:
    campus_shape = campus_polygon.geometry.iloc[0]
    # 4. Reproject to Meters (EPSG:32611 is standard for Los Angeles)
    housing_points = housing_points.to_crs(epsg=32611)
    campus_polygon = campus_polygon.to_crs(epsg=32611)
    campus_shape_meters = campus_polygon.geometry.iloc[0]

    # 5. Calculate Distances
    # The .distance method finds the shortest Euclidean distance to the polygon boundary
    housing_points['dist_to_campus_m'] = housing_points.geometry.distance(campus_shape_meters.centroid)

    # Convert to minutes walking (approx 80 meters per minute)
    housing_points['walk_time_min'] = housing_points['dist_to_campus_m'] / 80

    print(housing_points[['Name', 'dist_to_campus_m', 'walk_time_min']].sort_values('dist_to_campus_m'))

    # Optional: Export to CSV for your analysis
    housing_points[['Name', 'dist_to_campus_m', 'walk_time_min']].to_csv("housing_distance_analysis_centroid.csv")
