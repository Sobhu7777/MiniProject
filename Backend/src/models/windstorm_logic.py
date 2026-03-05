import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from src.data_utils import load_windstorm_data, save_model, risk_level

class WindstormModel:
    def __init__(self):
        self.model = None
        self.feature_cols = [
            "month", "WindSpeed_km_per_hr", "Temperature_C",
            "Humidity_percent", "WindSpeed_3day_cum"
        ]

    def train(self, df):
        X = df[self.feature_cols].copy()
        y = df["Wind_Disaster_Occurred"]
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        self.model = RandomForestClassifier(n_estimators=200, random_state=42)
        self.model.fit(X_train, y_train)
        
        return self.model.score(X_test, y_test)

    def predict_raw(self, features_dict):
        if self.model is None:
            raise ValueError("Model not trained")
            
        features = pd.DataFrame([features_dict])
        prob = self.model.predict_proba(features)[0][1]
        # Soften extreme confidence as per notebook
        prob = 0.85 * prob + 0.075
        
        return {
            "probability": round(float(prob), 3),
            "level": risk_level(prob)
        }

    def predict(self, place, month, df_wind):
        if self.model is None:
            raise ValueError("Model not trained")
            
        data = df_wind[(df_wind["place"] == place) & (df_wind["month"] == month)]
        if data.empty:
            return None

        numeric_cols = ["WindSpeed_km_per_hr", "Temperature_C", "Humidity_percent", "WindSpeed_3day_cum"]
        means = data[numeric_cols].mean()
        features = pd.DataFrame([{
            "month": month,
            "WindSpeed_km_per_hr": means["WindSpeed_km_per_hr"],
            "Temperature_C": means["Temperature_C"],
            "Humidity_percent": means["Humidity_percent"],
            "WindSpeed_3day_cum": means["WindSpeed_3day_cum"]
        }])

        prob = self.model.predict_proba(features)[0][1]
        # Soften extreme confidence as per notebook
        prob = 0.85 * prob + 0.075
        
        return {
            "probability": round(float(prob), 2),
            "level": risk_level(prob)
        }

    def save(self):
        save_model(self.model, "wind.pkl")

    def load(self, model):
        self.model = model
