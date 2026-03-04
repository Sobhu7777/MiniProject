import os
from src.data_utils import load_model, load_landslide_data, load_flood_data, load_windstorm_data, load_thunderstorm_data, risk_level
from src.models.landslide_logic import LandslideModel
from src.models.flood_logic import FloodModel
from src.models.thunderstorm_logic import ThunderstormModel
from src.models.windstorm_logic import WindstormModel

class DisasterPredictor:
    def __init__(self, models_dir="models"):
        self.models_dir = models_dir
        self.landslide = LandslideModel()
        self.flood = FloodModel()
        self.thunderstorm = ThunderstormModel()
        self.windstorm = WindstormModel()
        
        self._load_all_models()
        self._load_reference_data()

    def _load_all_models(self):
        try:
            self.landslide.load(load_model("landslide.pkl", self.models_dir))
            self.flood.load(load_model("flood.pkl", self.models_dir))
            self.thunderstorm.load(load_model("thunder.pkl", self.models_dir))
            self.windstorm.load(load_model("wind.pkl", self.models_dir))
            print("All models loaded successfully.")
        except Exception as e:
            print(f"Error loading models: {e}")

    def _load_reference_data(self):
        # Load data for historical context (used in monthly predictions)
        self.ls_df = load_landslide_data(os.path.join(os.getcwd(), "landslide.csv"))
        self.fl_df = load_flood_data(os.path.join(os.getcwd(), "flood.csv"))
        self.wi_df = load_windstorm_data(os.path.join(os.getcwd(), "windstorm.csv"))
        self.ts_df = load_thunderstorm_data(os.path.join(os.getcwd(), "thunderstorm.csv"))

    def predict_all_monthly(self, place, month):
        # risks dict to match frontend expected keys
        risks = {}
        
        risks["landslide"] = self.landslide.predict(place, month, self.ls_df)
        risks["flood"] = self.flood.predict(place, month, self.fl_df)
        risks["windstorm"] = self.windstorm.predict(place, month, self.wi_df)
        risks["thunderstorm"] = self.predict_thunderstorm_monthly(place, month)
        
        # Filter out None results if any model doesn't have data for that place/month
        risks = {k: v for k, v in risks.items() if v is not None}
        
        if not risks:
            return None

        # Calculate cumulative
        avg_prob = sum(r["probability"] for r in risks.values()) / len(risks)
        risks["cumulative"] = {
            "probability": round(avg_prob, 3),
            "level": risk_level(avg_prob)
        }

        # Add safety precautions
        safety = self._get_safety_precautions(risks)
        
        return {
            "place": place,
            "month": month,
            "risks": risks,
            "safety": safety
        }

    def _get_safety_precautions(self, risks):
        precautions = {
            "landslide": {
                "LOW": ["Stay alert for unusual sounds that might indicate debris flow.", "Monitor local news for weather updates."],
                "MODERATE": ["Avoid steep slopes and drainage-way areas.", "Have an emergency kit ready.", "Be prepared to evacuate if necessary."],
                "HIGH": ["Evacuate immediately if advised by local authorities.", "Stay away from landslide-prone areas.", "Listen for any unusual sounds."]
            },
            "flood": {
                "LOW": ["Identify safe areas on higher ground.", "Keep an eye on water levels if near rivers."],
                "MODERATE": ["Move important items to higher floors.", "Avoid driving through flooded areas.", "Stay away from power lines."],
                "HIGH": ["Seek higher ground immediately.", "Do not walk or drive through floodwaters.", "Turn off utilities if told to do so."]
            },
            "thunderstorm": {
                "LOW": ["Stay indoors if you hear thunder.", "Unplug sensitive electronic equipment."],
                "MODERATE": ["Avoid using corded phones and electrical appliances.", "Stay away from windows and doors.", "Seek shelter in a sturdy building."],
                "HIGH": ["Stay indoors and away from windows.", "Avoid all contact with electrical equipment.", "Do not take a shower or bath during the storm."]
            },
            "windstorm": {
                "LOW": ["Secure outdoor objects like patio furniture.", "Stay away from windows during high winds."],
                "MODERATE": ["Seek shelter in a sturdy building.", "Stay clear of trees and power lines.", "Keep emergency supplies on hand."],
                "HIGH": ["Go to a basement or interior room on the lowest floor.", "Stay away from windows and outside walls.", "Protect your head and neck from flying debris."]
            }
        }
        
        result_safety = {}
        for disaster, risk in risks.items():
            if disaster == "cumulative":
                continue
            level = risk["level"]
            result_safety[disaster] = precautions.get(disaster, {}).get(level, ["Follow local official advice."])
            
        return result_safety

    def predict_thunderstorm_monthly(self, place, month):
        # risks dict to match frontend expected keys
        # We need to make sure we handle month correctly (frontend 0-indexed passed to backend 1-indexed)
        # However, predictor.py currently expects the month as it is in the CSV (1-indexed)
        data = self.ts_df[(self.ts_df["place"] == place) & (self.ts_df["month"] == month)]
        if data.empty:
            return None
        
        # Average features for the month
        means = data[self.thunderstorm.feature_cols].mean()
        prob, _ = self.thunderstorm.predict(means.to_dict())
        
        return {
            "probability": round(float(prob), 3),
            "level": risk_level(prob)
        }

    def predict_thunderstorm(self, features_row):
        return self.thunderstorm.predict(features_row)

if __name__ == "__main__":
    # Sample usage
    predictor = DisasterPredictor()
    res = predictor.predict_all_monthly("Munnar", 8)
    import json
    print(json.dumps(res, indent=2))
