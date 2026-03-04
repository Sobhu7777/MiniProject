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

def risk_level(prob):
    if prob < 0.3:
        return "LOW"
    elif prob < 0.6:
        return "MODERATE"
    else:
        return "HIGH"
