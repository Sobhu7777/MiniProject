import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.calibration import CalibratedClassifierCV
from src.data_utils import load_flood_data, save_model, risk_level

class FloodModel:
    def __init__(self):
        self.model = None
        self.le_soil = LabelEncoder()
        self.feature_cols = [
            "month", "rainfall_mm", "rainfall_3day", "temperature_c",
            "humidity_percent", "elevation_m", "slope_deg", "soil_type"
        ]

    def train(self, df):
        X = df[self.feature_cols].copy()
        y = df["flood"]
        
        X["soil_type"] = self.le_soil.fit_transform(X["soil_type"])
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        base_rf = RandomForestClassifier(
            n_estimators=100, max_depth=10, min_samples_leaf=5, random_state=42
        )
        self.model = CalibratedClassifierCV(base_rf, method='sigmoid', cv=5)
        self.model.fit(X_train, y_train)
        
        return self.model.score(X_test, y_test)

    def predict(self, place, month, df_raw):
        if self.model is None:
            raise ValueError("Model not trained")
            
        data = df_raw[(df_raw["place"] == place) & (df_raw["month"] == month)]
        if data.empty:
            return None

        numeric_means = data[
            ["rainfall_mm", "rainfall_3day", "temperature_c",
             "humidity_percent", "elevation_m", "slope_deg"]
        ].mean()

        soil_mode = data["soil_type"].mode()[0]
        soil_encoded = self.le_soil.transform([soil_mode])[0]

        features = pd.DataFrame([{
            "month": month,
            "rainfall_mm": numeric_means["rainfall_mm"],
            "rainfall_3day": numeric_means["rainfall_3day"],
            "temperature_c": numeric_means["temperature_c"],
            "humidity_percent": numeric_means["humidity_percent"],
            "elevation_m": numeric_means["elevation_m"],
            "slope_deg": numeric_means["slope_deg"],
            "soil_type": soil_encoded
        }])

        prob = self.model.predict_proba(features)[0][1]
        
        return {
            "probability": round(float(prob), 3),
            "level": risk_level(prob)
        }

    def save(self):
        save_model({"model": self.model, "le_soil": self.le_soil}, "flood.pkl")

    def load(self, model_data):
        self.model = model_data["model"]
        self.le_soil = model_data["le_soil"]
