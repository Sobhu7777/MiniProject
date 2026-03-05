import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from src.data_utils import load_landslide_data, save_model, risk_level

class LandslideModel:
    def __init__(self):
        self.model = None
        self.le = LabelEncoder()
        self.feature_cols = ["month", "rainfall_mm", "elevation_m", "slope_deg", "soil_type"]

    def train(self, df):
        X = df[self.feature_cols].copy()
        y = df["landslide"]
        
        X["soil_type"] = self.le.fit_transform(X["soil_type"])
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X_train, y_train)
        
        return self.model.score(X_test, y_test)

    def predict_raw(self, features_dict):
        if self.model is None:
            raise ValueError("Model not trained")
            
        features = pd.DataFrame([features_dict])
        if "soil_type" in features.columns:
            features = features.copy()
            features["soil_type"] = self.le.transform(features["soil_type"])
            
        prob = self.model.predict_proba(features)[0][1]
        
        return {
            "probability": round(float(prob), 3),
            "level": risk_level(prob)
        }

    def predict(self, place, month, df):
        if self.model is None:
            raise ValueError("Model not trained")
            
        data = df[(df["place"] == place) & (df["month"] == month)]
        if data.empty:
            return None

        numeric_cols = ["rainfall_mm", "elevation_m", "slope_deg"]
        means = data[numeric_cols].mean()
        
        features = pd.DataFrame([{
            "month": month,
            "rainfall_mm": means["rainfall_mm"],
            "elevation_m": means["elevation_m"],
            "slope_deg": means["slope_deg"],
            "soil_type": data["soil_type"].iloc[0] # Using first available soil type for that place
        }])
        
        features["soil_type"] = self.le.transform(features["soil_type"])
        prob = self.model.predict_proba(features)[0][1]
        
        return {
            "probability": round(float(prob), 2),
            "level": risk_level(prob)
        }

    def save(self):
        save_model({"model": self.model, "le": self.le}, "landslide.pkl")

    def load(self, model_data):
        self.model = model_data["model"]
        self.le = model_data["le"]
