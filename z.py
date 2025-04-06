from searoute import searoute
import folium

# Coordinates for Port of Shanghai and Port of Rotterdam
shanghai = (121.4737, 31.2304)
rotterdam = (4.4777, 51.9244)

# Get route
result = searoute(shanghai, rotterdam)

# Extract [lon, lat] and convert to (lat, lon)
coord_list = result["geometry"]["coordinates"]
latlon_path = [(lat, lon) for lon, lat in coord_list]

# Create map centered in the middle of the path
mid = latlon_path[len(latlon_path)//2]
m = folium.Map(location=mid, zoom_start=3)

# Draw route
folium.PolyLine(latlon_path, color="blue", weight=3).add_to(m)

# Mark start and end
folium.Marker(latlon_path[0], popup="Shanghai", icon=folium.Icon(color='green')).add_to(m)
folium.Marker(latlon_path[-1], popup="Rotterdam", icon=folium.Icon(color='red')).add_to(m)

# Save to file
m.save("searoute_map.html")
