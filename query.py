import pandas as pd
import pandasql as ps
import matplotlib.pyplot as plt

df = pd.read_csv("housing_timeseries.csv", parse_dates=["Last_Updated"])

# Run SQL directly
location = "Saxon Suites"
gender = "Male"
room_type = "Suite Triple/Shared Bath"
q = f"""
SELECT Available_Bed_Spaces, Last_Updated
FROM df
WHERE Building = '{location}' AND Gender = '{gender}' AND Room_Type = '{room_type}'
ORDER BY Last_Updated
"""

result = ps.sqldf(q, locals())
print(result)

plt.figure(figsize=(12, 6))
plt.plot(result['Last_Updated'], result['Available_Bed_Spaces'], marker='o', linestyle='-', markersize=3)

plt.xlabel('Date')
plt.ylabel('Available Bed Spaces')
plt.title(f'{location} - Available Bed Spaces Over Time\n({gender}, {room_type})')
plt.grid(True, alpha=0.3)
plt.xticks(rotation=45)
plt.tight_layout()

plt.show()
