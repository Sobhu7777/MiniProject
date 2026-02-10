
import requests
import pandas as pd
import numpy as np
from datetime import datetime

def fetch_weather_data():
    # Kolkata coordinates: 22°33' N, 88°30' E -> 22.55, 88.50
    # Fetching data for a broader range (2010-2023) to limit size but maximize chance of finding storms
    url = "https://archive-api.open-meteo.com/v1/archive"
    
    # Using a loop to fetch year by year if needed, but the API handles large ranges decenty.
    # Let's try 2010 to 2023.
    params = {
        "latitude": 22.55,
        "longitude": 88.50,
        "start_date": "2000-01-01",
        "end_date": "2026-01-01",
        "hourly": "temperature_2m,dewpoint_2m,surface_pressure,windspeed_10m,precipitation,cape,weathercode",
        "timezone": "Asia/Kolkata"
    }
    
    print(f"Fetching data for Kolkata ({params['start_date']} to {params['end_date']})...")
    response = requests.get(url, params=params)
    
    try:
        data = response.json()
    except Exception as e:
        print(f"Error parsing JSON: {e}")
        return

    if "error" in data:
        print("Error fetching data from API:", data)
        return

    # Process hourly data
    hourly = data['hourly']
    df = pd.DataFrame(hourly)
    df['time'] = pd.to_datetime(df['time'])
    
    # Handle CAPE
    # 1. Convert None to NaN
    df['cape'] = pd.to_numeric(df['cape'], errors='coerce')
    # 2. Interpolate missing values (nearest) as requested
    df['cape'] = df['cape'].interpolate(method='nearest').ffill().bfill()
    
    # Handle potentially missing CAPE if API returned all nulls
    if df['cape'].isnull().all():
        print("Warning: CAPE data is entirely missing from API response. Using zeros.")
        df['cape'] = 0.0

    # Extract date for aggregation
    df['date'] = df['time'].dt.date
    
    # Define aggregation operations
    # collapsed to daily
    daily_stats = df.groupby('date').agg({
        'temperature_2m': 'mean',          # Avg Temp
        'dewpoint_2m': 'mean',             # Avg Dew Point
        'surface_pressure': 'mean',        # Avg Pressure
        'windspeed_10m': 'max',            # Max Wind Speed
        'precipitation': 'sum',            # Total Precip
        'cape': 'max',                     # Max CAPE
        'weathercode': lambda x: list(x)   # List of hourly codes
    }).reset_index()
    
    # 1. Add "dd-mm-yyyy" column
    daily_stats['dd-mm-yyyy'] = pd.to_datetime(daily_stats['date']).dt.strftime('%d-%m-%Y')
    
    # Generate features
    daily_stats['month'] = pd.to_datetime(daily_stats['date']).dt.month
    daily_stats['day_of_year'] = pd.to_datetime(daily_stats['date']).dt.dayofyear
    
    # 3. Label Generation
    # WMO codes: 95, 96, 99. Also 91, 92 (Rain > moderate) might be useful if we want more positives, 
    # but strictly thunderstorms are 95+.
    # Adding a heuristic: If we have high CAPE + High Wind + Precipitation, it's likely a storm even if code missed it.
    
    def get_label(row):
        codes = row['weathercode']
        # Check explicit thunderstorm codes
        if any(c in [95, 96, 99] for c in codes):
            return 1
            
        # Heuristic fallback (e.g. Nor'westers)
        # CAPE > 1000 J/kg is significant instability
        # Wind > 25 km/h
        # Precip > 5 mm
        if (row['cape'] > 1000 and 
            row['windspeed_10m'] > 25 and 
            row['precipitation'] > 5):
            return 1
            
        return 0

    daily_stats['Label'] = daily_stats.apply(get_label, axis=1)
    
    # Select and Rename Columns
    # The user asked for "1) one additional column should be for the dd-mm-yyyy"
    # And "The cape column is empty so pick original values..."
    
    # Column order preference: Date first?
    cols = [
        'dd-mm-yyyy',
        'temperature_2m', 
        'dewpoint_2m', 
        'surface_pressure', 
        'windspeed_10m', 
        'precipitation', 
        'cape', 
        'month', 
        'day_of_year', 
        'Label'
    ]
    
    final_df = daily_stats[cols].copy()
    
    # Rename to match requirements
    final_df.columns = [
        'dd-mm-yyyy',
        '2m_temperature',
        '2m_dewpoint_temperature',
        'surface_pressure',
        '10m_wind_speed',
        'total_precipitation',
        'convective_available_potential_energy',
        'month',
        'day_of_year',
        'Label'
    ]
    
    # Formatting
    final_df = final_df.round(2)
    
    output_path = r"d:\New Desktop\MiniProject\Backend\Dataset\kolkata_thunderstorm_data.csv"
    final_df.to_csv(output_path, index=False)
    
    print(f"Dataset created at {output_path}")
    print(f"Total Daily Records: {len(final_df)}")
    print(f"Thunderstorm Events (Label=1): {final_df['Label'].sum()}")
    print("Source: Open-Meteo Historical Weather API")

if __name__ == "__main__":
    fetch_weather_data()
