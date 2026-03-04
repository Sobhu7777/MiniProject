import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from src.data_utils import load_thunderstorm_data, save_model

class ThunderstormModel:
    def __init__(self):
        self.model = None
        self.feature_cols = [
            "2m_temperature", "2m_dewpoint_temperature", "surface_pressure",
            "10m_wind_speed", "total_precipitation", "cape"
        ]

    def train(self, df):
        X = df[self.feature_cols]
        y = df["thunderstorm"]
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        self.model = RandomForestClassifier(
            n_estimators=300, max_depth=12, min_samples_leaf=3,
            class_weight={0:1, 1:2}, random_state=42
        )
        self.model.fit(X_train, y_train)
        
        return self.model.score(X_test, y_test)

    def predict(self, features_row, threshold=0.4):
        if self.model is None:
            raise ValueError("Model not trained")
            
        features_df = pd.DataFrame([features_row])
        prob = self.model.predict_proba(features_df)[0][1]
        label = 1 if prob >= threshold else 0
        return round(float(prob), 3), label

    def save(self):
        save_model(self.model, "thunder.pkl")

    def load(self, model):
        self.model = model
