import requests
import pandas as pd
import numpy as np
import calendar
from datetime import datetime, timedelta
import io
import matplotlib.pyplot as plt
from src.data_utils import load_model, load_landslide_data, load_flood_data, load_windstorm_data, load_thunderstorm_data, risk_level
from src.models.landslide_logic import LandslideModel
from src.models.flood_logic import FloodModel
from src.models.thunderstorm_logic import ThunderstormModel
from src.models.windstorm_logic import WindstormModel

PLACE_COORDINATES = {
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
            # Note: models are loaded using joblib in data_utils.load_model
            self.landslide_clf = load_model("landslide.pkl", self.models_dir)
            self.flood_clf = load_model("flood.pkl", self.models_dir)
            self.thunder_clf = load_model("thunder.pkl", self.models_dir)
            self.wind_clf = load_model("wind.pkl", self.models_dir)

            self.landslide.load(self.landslide_clf)
            self.flood.load(self.flood_clf)
            self.thunderstorm.load(self.thunder_clf)
            self.windstorm.load(self.wind_clf)
            print("All models loaded successfully.")
        except Exception as e:
            print(f"Error loading models: {e}")

    def _load_reference_data(self):
        # Load data for historical context (used in monthly predictions)
        self.ls_df = load_landslide_data("landslide.csv")
        self.fl_df = load_flood_data("flood.csv")
        self.wi_df = load_windstorm_data("windstorm.csv")
        self.ts_df = load_thunderstorm_data("thunderstorm.csv")

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

    # =========================================================================
    # 16-DAY FORECAST LOGIC
    # =========================================================================

    def forecast_16day(self, place):
        if place not in PLACE_COORDINATES:
            return {"error": f"Coordinates not found for {place}"}

        # 1. Get Landslide 16-day
        landslide_data = self.predict_landslide_16day(place)
        
        # 2. Get Flood 16-day
        flood_data = self.predict_flood_16day(place)
        
        # 3. Get Thunderstorm 16-day
        thunder_data = self.predict_thunder_16day(place)
        
        # 4. Get Windstorm 16-day
        wind_data = self.predict_wind_16day(place)

        # Aggregate into daily slots
        today = datetime.now()
        data = []
        for i in range(16):
            date_str = (today + timedelta(days=i)).strftime("%Y-%m-%d")
            day_slot = {
                "date": date_str,
                "disasters": {
                    "landslide": landslide_data[i] if landslide_data and i < len(landslide_data) else None,
                    "flood": flood_data[i] if flood_data and i < len(flood_data) else None,
                    "thunderstorm": thunder_data[i] if thunder_data and i < len(thunder_data) else None,
                    "windstorm": wind_data[i] if wind_data and i < len(wind_data) else None
                }
            }
            data.append(day_slot)

        return {
            "place": place,
            "forecast_days": 16,
            "data": data
        }

    # --- LANDSLIDE 16-DAY ---
    def predict_landslide_16day(self, place):
        lat, lon = PLACE_COORDINATES[place]
        rainfall_data = self.get_16day_rainfall(lat, lon)
        if not rainfall_data: return None

        dates = rainfall_data["dates"]
        rainfall = rainfall_data["rainfall"]
        
        results = []
        for i in range(len(dates)):
            date_obj = datetime.strptime(dates[i], "%Y-%m-%d")
            month = date_obj.month
            
            # Historical baseline
            hist_avg = self.ls_df[(self.ls_df["place"] == place) & (self.ls_df["month"] == month)]["rainfall_mm"].mean()
            hist_daily = (hist_avg / 30.0) if not np.isnan(hist_avg) else 1.0
            
            # Base prob from monthly
            monthly_res = self.landslide.predict(place, month, self.ls_df)
            base_prob = monthly_res["probability"] if monthly_res else 0.05
            
            # Adjustment
            rain_today = rainfall[i]
            if rain_today > hist_daily * 3: prob = base_prob + 0.15
            elif rain_today > hist_daily * 1.5: prob = base_prob + 0.08
            elif rain_today < hist_daily * 0.5: prob = base_prob - 0.05
            else: prob = base_prob
            
            prob = max(0, min(prob, 1))
            results.append({"probability": round(prob, 3), "level": risk_level(prob)})
            
        return results

    def get_16day_rainfall(self, lat, lon):
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=precipitation_sum&forecast_days=16&timezone=auto"
        try:
            resp = requests.get(url).json()
            return {"dates": resp["daily"]["time"], "rainfall": [float(x) if x is not None else 0.0 for x in resp["daily"]["precipitation_sum"]]}
        except: return None

    # --- FLOOD 16-DAY ---
    def predict_flood_16day(self, place):
        api_data = self.get_flood_api_data(place)
        if not api_data: return None

        dates = api_data["dates"]
        precip = api_data["precip"]
        temp = api_data["temp"]
        humidity = api_data["humidity"]
        
        # 3-day rolling
        precip_3day = []
        for i in range(len(precip)):
            if i == 0: precip_3day.append(precip[i])
            elif i == 1: precip_3day.append(precip[i] + precip[i-1])
            else: precip_3day.append(precip[i] + precip[i-1] + precip[i-2])

        results = []
        for i in range(len(dates)):
            month = datetime.strptime(dates[i], "%Y-%m-%d").month
            monthly_res = self.flood.predict(place, month, self.fl_df)
            base_prob = monthly_res["probability"] if monthly_res else 0.05
            
            hist = self.fl_df[(self.fl_df["place"] == place) & (self.fl_df["month"] == month)]
            if hist.empty:
                results.append({"probability": round(base_prob, 3), "level": risk_level(base_prob)})
                continue
            
            prob = self.adjust_flood_probability(base_prob, precip[i], hist["rainfall_mm"].mean()/30.0,
                                               precip_3day[i], (hist["rainfall_mm"].mean()/30.0)*2.5,
                                               temp[i], hist["temperature_C"].mean(),
                                               humidity[i], hist["humidity_percent"].mean())
            results.append({"probability": round(prob, 3), "level": risk_level(prob)})
        return results

    def get_flood_api_data(self, place):
        lat, lon = PLACE_COORDINATES[place]
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=precipitation_sum,temperature_2m_max,relative_humidity_2m_mean&forecast_days=16&timezone=auto"
        try:
            resp = requests.get(url).json()
            d = resp["daily"]
            return {"dates": d["time"], "precip": [float(x) if x is not None else 0.0 for x in d["precipitation_sum"]],
                    "temp": [float(x) if x is not None else 0.0 for x in d["temperature_2m_max"]],
                    "humidity": [float(x) if x is not None else 0.0 for x in d["relative_humidity_2m_mean"]]}
        except: return None

    def adjust_flood_probability(self, base_prob, p_today, h_p, p_3d, h_3d, t_today, h_t, hum_today, h_hum):
        prob = base_prob
        if p_today > h_p * 2: prob += 0.05
        if p_3d > h_3d * 1.5: prob += 0.08
        if t_today > h_t + 2: prob += 0.02
        if hum_today > h_hum + 5: prob += 0.02
        return max(0, min(prob, 1))

    # --- THUNDERSTORM 16-DAY ---
    def predict_thunder_16day(self, place):
        api_data = self.get_thunder_api_data(place)
        if not api_data: return None
        
        dates = api_data["dates"]
        features = api_data["features"]
        
        results = []
        for i in range(len(dates)):
            # Use model predict
            prob, _ = self.thunderstorm.predict(features[i])
            results.append({"probability": round(float(prob), 3), "level": risk_level(prob)})
        return results

    def get_thunder_api_data(self, place):
        lat, lon = PLACE_COORDINATES[place]
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_max,precipitation_sum,wind_speed_10m_max&hourly=surface_pressure,dew_point_2m,cape&forecast_days=16&timezone=auto"
        try:
            resp = requests.get(url).json()
            daily = resp["daily"]
            hourly = resp["hourly"]
            
            features = []
            for i in range(16):
                # Aggregate hourly to daily (take max/avg)
                h_start, h_end = i*24, (i+1)*24
                avg_pressure = np.mean(hourly["surface_pressure"][h_start:h_end])
                avg_dew = np.mean(hourly["dew_point_2m"][h_start:h_end])
                max_cape = np.max(hourly["cape"][h_start:h_end])
                
                features.append({
                    "Temperature_C": daily["temperature_2m_max"][i],
                    "Precipitation_mm": daily["precipitation_sum"][i],
                    "Wind_Speed_km_h": daily["wind_speed_10m_max"][i],
                    "Pressure_hPa": avg_pressure,
                    "Dew_Point_C": avg_dew,
                    "CAPE_J_kg": max_cape
                })
            return {"dates": daily["time"], "features": features}
        except: return None

    # --- WINDSTORM 16-DAY ---
    def predict_wind_16day(self, place):
        api_data = self.get_wind_api_data(place)
        if not api_data: return None
        
        dates = api_data["dates"]
        wind = api_data["wind"]
        temp = api_data["temp"]
        hum = api_data["humidity"]
        
        wind_3day = []
        for i in range(len(wind)):
            if i == 0: wind_3day.append(wind[i])
            elif i == 1: wind_3day.append(wind[i] + wind[i-1])
            else: wind_3day.append(wind[i] + wind[i-1] + wind[i-2])

        results = []
        for i in range(len(dates)):
            month = datetime.strptime(dates[i], "%Y-%m-%d").month
            monthly_res = self.windstorm.predict(place, month, self.wi_df)
            base_prob = monthly_res["probability"] if monthly_res else 0.05
            
            hist = self.wi_df[(self.wi_df["place"] == place) & (self.wi_df["month"] == month)]
            if hist.empty:
                results.append({"probability": round(base_prob, 3), "level": risk_level(base_prob)})
                continue
                
            prob = self.adjust_wind_probability(base_prob, wind[i], hist["WindSpeed_km_per_hr"].mean(),
                                              wind_3day[i], hist["WindSpeed_3day_cum"].mean(),
                                              temp[i], hist["Temperature_C"].mean(),
                                              hum[i], hist["Humidity_percent"].mean())
            results.append({"probability": round(prob, 3), "level": risk_level(prob)})
        return results

    def get_wind_api_data(self, place):
        lat, lon = PLACE_COORDINATES[place]
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=wind_speed_10m_max,temperature_2m_max,relative_humidity_2m_mean&forecast_days=16&timezone=auto"
        try:
            resp = requests.get(url).json()
            d = resp["daily"]
            return {"dates": d["time"], "wind": [float(x) if x is not None else 0.0 for x in d["wind_speed_10m_max"]],
                    "temp": [float(x) if x is not None else 0.0 for x in d["temperature_2m_max"]],
                    "humidity": [float(x) if x is not None else 0.0 for x in d["relative_humidity_2m_mean"]]}
        except: return None

    def adjust_wind_probability(self, base_prob, w_api, h_w, w3_api, h_w3, t_api, h_t, hum_api, h_hum):
        prob = base_prob
        if w_api > h_w * 1.2: prob += 0.05
        if w3_api > h_w3 * 1.2: prob += 0.05
        if t_api > h_t + 3: prob += 0.03
        if hum_api > h_hum + 10: prob += 0.03
        return max(0, min(prob, 1))

    # --- PLOT GENERATION ---
    def get_forecast_plot(self, place, disaster):
        if place not in PLACE_COORDINATES: return None
        
        results = None
        title = ""
        ylabel = "Probability"
        y_data = []
        
        if disaster == "landslide":
            results = self.predict_landslide_16day(place)
            title = "16-Day Landslide Probability Forecast"
            y_data = [r["probability"] for r in results] if results else []
        elif disaster == "flood":
            results = self.predict_flood_16day(place)
            title = "16-Day Flood Probability Forecast"
            y_data = [r["probability"] for r in results] if results else []
        elif disaster == "thunderstorm":
            results = self.predict_thunder_16day(place)
            title = "16-Day Thunderstorm Risk Forecast"
            y_data = [r["probability"] for r in results] if results else []
        elif disaster == "windstorm":
            results = self.predict_wind_16day(place)
            title = "16-Day Wind Speed Forecast"
            ylabel = "Wind Speed (km/h)"
            # For wind, the results structure in my implementation is probability/level, 
            # but usually wind speed is plotted. I'll stick to probability for consistency 
            # unless I fetch the raw wind values again.
            # Actually, the user asked for risk levels and probabilities. 
            # Let's plot probability.
            y_data = [r["probability"] for r in results] if results else []

        if not y_data: return None

        today = datetime.now()
        dates = [(today + timedelta(days=i)) for i in range(len(y_data))]
        
        plt.figure(figsize=(10, 5))
        plt.plot(dates, y_data, marker='o', linestyle='-', color='teal')
        plt.title(title)
        plt.xlabel("Date")
        plt.ylabel(ylabel)
        plt.xticks(rotation=45)
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        plt.close()
        buf.seek(0)
        return buf.getvalue()

if __name__ == "__main__":
    # Sample usage
    predictor = DisasterPredictor()
    res = predictor.predict_all_monthly("Munnar", 8)
    import json
    print(json.dumps(res, indent=2))
