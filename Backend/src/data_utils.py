import pandas as pd
import joblib
import os

def load_landslide_data(filepath="landslide.csv"):
    df = pd.read_csv(filepath)
    df["place"] = df["place"].str.strip().str.title()
    df.drop(df[df["place"] == "Idukki"].index, inplace=True)
    return df

def load_flood_data(filepath="flood.csv"):
    df = pd.read_csv(filepath)
    df["place"] = df["place"].str.strip().str.title()
    return df

def load_thunderstorm_data(filepath="thunderstorm.csv"):
    df = pd.read_csv(filepath)
    return df

def load_windstorm_data(filepath="windstorm.csv"):
    df = pd.read_csv(filepath)
    df.rename(columns={
        "Month": "month",
        "Place": "place"
    }, inplace=True)
    return df

def save_model(model, filename, directory="models"):
    if not os.path.exists(directory):
        os.makedirs(directory)
    joblib.dump(model, os.path.join(directory, filename))

def load_model(filename, directory="models"):
    return joblib.load(os.path.join(directory, filename))

place_coordinates = {
    "Munnar": (10.0889, 77.0595),
    "Wayanad": (11.6854, 76.1320),
    "Coorg": (12.4244, 75.7382),
    "Nilgiris": (11.4102, 76.6950),
    "Darjeeling": (27.0360, 88.2627),
    "Gangtok": (27.3389, 88.6065),
    "Shillong": (25.5788, 91.8933),
    "Guwahati": (26.1445, 91.7362),
    "Srinagar": (34.0837, 74.7973),
    "Chamoli": (30.4042, 79.3319),
    "Pithoragarh": (29.5820, 80.2182),
    "Manali": (32.2432, 77.1892),
    "Shimla": (31.1048, 77.1734),
    "Mussoorie": (30.4598, 78.0644),
    "Thiruvananthapuram": (8.5241, 76.9366),
    "Mumbai": (19.0760, 72.8777),
    "Chennai": (13.0827, 80.2707),
    "Kochi": (9.9312, 76.2673),
    "Kolkata": (22.5726, 88.3639),
    "Varanasi": (25.3176, 82.9739),
    "Panaji": (15.4909, 73.8278),
    "Udaipur": (24.5854, 73.7125),
    "Patna": (25.5941, 85.1376),
    "Visakhapatnam": (17.6868, 83.2185),
    "Ranchi": (23.3441, 85.3096),
    "Bhubaneswar": (20.2961, 85.8245),
    "Puri": (19.8135, 85.8312),
    "Kedarnath": (30.7352, 79.0669),
}

def get_historical_daily_baseline(df, place, month):
    data = df[
        (df["place"] == place) &
        (df["month"] == month)
    ]
    historical_month_mean = data["rainfall_mm"].mean()
    historical_daily_baseline = historical_month_mean / 30
    if historical_daily_baseline == 0 or pd.isna(historical_daily_baseline):
        historical_daily_baseline = 0.1
    return historical_daily_baseline

def risk_level(prob):
    if prob <= 0.35:
        return "LOW"
    elif prob <= 0.60:
        return "MODERATE"
    else:
        return "HIGH"
