<<<<<<< HEAD
import requests
import pandas as pd
import numpy as np
import calendar
from datetime import datetime, timedelta
import io
import matplotlib.pyplot as plt
=======
import os
from datetime import datetime
>>>>>>> 159e84c (done monthly , daily api  place info)
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

<<<<<<< HEAD
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
=======
    def get_landslide_api_data(self, place):
        from src.data_utils import place_coordinates
        import requests
        if place not in place_coordinates:
            raise ValueError("Coordinates not found for selected place.")
        lat, lon = place_coordinates[place]
        url = (
            "https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            "&daily=precipitation_sum&forecast_days=16&timezone=auto"
        )
        response = requests.get(url)
        data = response.json()
        dates = data["daily"]["time"]
        rainfall_raw = data["daily"]["precipitation_sum"]
        rainfall = [float(r) if r is not None else 0.0 for r in rainfall_raw]
        return list(zip(dates, rainfall))

    def predict_landslide_16day(self, place):
        # Get static place features
        place_data = self.ls_df[self.ls_df["place"] == place]
        if place_data.empty:
            return []
        static = place_data.iloc[0]
        
        api_forecast = self.get_landslide_api_data(place)
        daily_results = []
        for date, rain in api_forecast:
            month_of_day = datetime.strptime(date, "%Y-%m-%d").month
            features = {
                "month": month_of_day,
                "rainfall_mm": rain,
                "elevation_m": static["elevation_m"],
                "slope_deg": static["slope_deg"],
                "soil_type": static["soil_type"]
            }
            res = self.landslide.predict_raw(features)
            daily_results.append({
                "date": date,
                "rainfall": round(rain, 2),
                "probability": res["probability"],
                "level": res["level"]
            })
        return daily_results

    def get_flood_api_data(self, place):
        from src.data_utils import place_coordinates
        import requests
        import numpy as np
        import pandas as pd
        lat, lon = place_coordinates[place]
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}"
            f"&daily=precipitation_sum,temperature_2m_max"
            f"&hourly=relative_humidity_2m"
            f"&forecast_days=16&timezone=auto"
        )
        response = requests.get(url)
        data = response.json()
        dates = data["daily"]["time"]
        rainfall = [float(x) if x is not None else 0.0 for x in data["daily"]["precipitation_sum"]]
        temperature = [float(x) if x is not None else 0.0 for x in data["daily"]["temperature_2m_max"]]
        hourly_df = pd.DataFrame({
            "time": pd.to_datetime(data["hourly"]["time"]),
            "humidity": data["hourly"]["relative_humidity_2m"]
        })
        hourly_df["date"] = hourly_df["time"].dt.date
        daily_humidity_map = hourly_df.groupby("date")["humidity"].mean().to_dict()
        humidity = []
        for d_str in dates:
            d_obj = datetime.strptime(d_str, "%Y-%m-%d").date()
            humidity.append(float(daily_humidity_map.get(d_obj, 0.0)))
        return dates, rainfall, temperature, humidity

    def predict_flood_16day(self, place):
        # Get static place features
        place_data = self.fl_df[self.fl_df["place"] == place]
        if place_data.empty:
            return []
        static = place_data.iloc[0]
        
        dates, rainfall_api, temperature_api, humidity_api = self.get_flood_api_data(place)
        
        results = []
        for i in range(len(dates)):
            date = dates[i]
            month_of_day = datetime.strptime(date, "%Y-%m-%d").month
            rain_3day = sum(rainfall_api[max(0, i-2):i+1])
            
            features = {
                "month": month_of_day,
                "rainfall_mm": rainfall_api[i],
                "rainfall_3day": rain_3day,
                "temperature_c": temperature_api[i],
                "humidity_percent": humidity_api[i],
                "elevation_m": static["elevation_m"],
                "slope_deg": static["slope_deg"],
                "soil_type": static["soil_type"]
            }
            
            res = self.flood.predict_raw(features)
            results.append({
                "date": date,
                "rainfall_3day": round(rain_3day, 2),
                "probability": res["probability"],
                "level": res["level"]
            })
        return results

    def get_thunder_api_data(self, place):
        from src.data_utils import place_coordinates
        import requests
        import pandas as pd
        lat, lon = place_coordinates[place]
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            f"&daily=temperature_2m_max,precipitation_sum"
            f"&hourly=dewpoint_2m,surface_pressure,wind_speed_10m,cape"
            f"&forecast_days=16&timezone=auto"
        )
        response = requests.get(url)
        data = response.json()
        daily_dates = data["daily"]["time"]
        daily_temp = data["daily"]["temperature_2m_max"]
        daily_rain = data["daily"]["precipitation_sum"]
        hourly_df = pd.DataFrame({
            "time": pd.to_datetime(data["hourly"]["time"]),
            "dewpoint": data["hourly"]["dewpoint_2m"],
            "pressure": data["hourly"]["surface_pressure"],
            "wind": data["hourly"]["wind_speed_10m"],
            "cape": data["hourly"]["cape"]
        })
        hourly_df["date"] = hourly_df["time"].dt.date
        agg = hourly_df.groupby("date").agg({
            "dewpoint": "mean", "pressure": "mean", "wind": "mean", "cape": "max"
        }).to_dict("index")
        results = []
        for i, date_str in enumerate(daily_dates):
            d_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
            day_agg = agg.get(d_obj, {"dewpoint":0,"pressure":0,"wind":0,"cape":0})
            results.append({
                "date": date_str,
                "2m_temperature": daily_temp[i],
                "2m_dewpoint_temperature": day_agg["dewpoint"],
                "surface_pressure": day_agg["pressure"],
                "10m_wind_speed": day_agg["wind"],
                "total_precipitation": daily_rain[i],
                "cape": day_agg["cape"]
            })
        return results

    def predict_thunder_16day(self, place):
        api_data = self.get_thunder_api_data(place)
        results = []
        for day in api_data:
            features = {
                "2m_temperature": day["2m_temperature"],
                "2m_dewpoint_temperature": day["2m_dewpoint_temperature"],
                "surface_pressure": day["surface_pressure"],
                "10m_wind_speed": day["10m_wind_speed"],
                "total_precipitation": day["total_precipitation"],
                "cape": day["cape"]
            }
            prob, _ = self.thunderstorm.predict(features)
            results.append({
                "date": day["date"],
                "probability": round(float(prob), 3),
                "level": risk_level(prob)
            })
        return results

    def get_wind_api_data(self, place):
        from src.data_utils import place_coordinates
        import requests
        import pandas as pd
        lat, lon = place_coordinates[place]
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            f"&daily=wind_speed_10m_max,temperature_2m_max"
            f"&hourly=relative_humidity_2m"
            f"&forecast_days=16&timezone=auto"
        )
        response = requests.get(url)
        data = response.json()
        dates = data["daily"]["time"]
        wind_speed = [float(x) if x is not None else 0.0 for x in data["daily"]["wind_speed_10m_max"]]
        temp = [float(x) if x is not None else 0.0 for x in data["daily"]["temperature_2m_max"]]
        h_df = pd.DataFrame({
            "time": pd.to_datetime(data["hourly"]["time"]),
            "hum": data["hourly"]["relative_humidity_2m"]
        })
        h_df["date"] = h_df["time"].dt.date
        hum_map = h_df.groupby("date")["hum"].mean().to_dict()
        humidity = [float(hum_map.get(datetime.strptime(d, "%Y-%m-%d").date(), 0.0)) for d in dates]
        return dates, wind_speed, temp, humidity

    def predict_wind_16day(self, place):
        dates, wind_api, temp_api, hum_api = self.get_wind_api_data(place)
        
        results = []
        for i in range(len(dates)):
            date = dates[i]
            month = datetime.strptime(date, "%Y-%m-%d").month
            wind_3day_cum = sum(wind_api[max(0, i-2):i+1])
            
            features = {
                "month": month,
                "WindSpeed_km_per_hr": wind_api[i],
                "Temperature_C": temp_api[i],
                "Humidity_percent": hum_api[i],
                "WindSpeed_3day_cum": wind_3day_cum
            }
            
            res = self.windstorm.predict_raw(features)
            results.append({
                "date": date,
                "probability": res["probability"],
                "level": res["level"]
            })
        return results

    def get_comprehensive_weather_api_data(self, place):
        from src.data_utils import place_coordinates
        import requests
        import pandas as pd
        
        lat, lon = place_coordinates[place]
        # Consolidate all needed fields for all models
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}"
            f"&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,wind_speed_10m_max"
            f"&hourly=relative_humidity_2m,dewpoint_2m,surface_pressure,wind_speed_10m,cape"
            f"&forecast_days=16&timezone=auto"
        )
        response = requests.get(url)
        data = response.json()
        
        daily = data["daily"]
        hourly = data["hourly"]
        
        dates = daily["time"]
        precip = [float(x) if x is not None else 0.0 for x in daily["precipitation_sum"]]
        temp_max = [float(x) if x is not None else 0.0 for x in daily["temperature_2m_max"]]
        temp_min = [float(x) if x is not None else 0.0 for x in daily["temperature_2m_min"]]
        wind_max = [float(x) if x is not None else 0.0 for x in daily["wind_speed_10m_max"]]
        
        h_df = pd.DataFrame({
            "time": pd.to_datetime(hourly["time"]),
            "humidity": hourly["relative_humidity_2m"],
            "dewpoint": hourly["dewpoint_2m"],
            "pressure": hourly["surface_pressure"],
            "wind": hourly["wind_speed_10m"],
            "cape": hourly["cape"]
        })
        h_df["date"] = h_df["time"].dt.date
        
        daily_agg = h_df.groupby("date").agg({
            "humidity": "mean",
            "dewpoint": "mean",
            "pressure": "mean",
            "wind": "mean",
            "cape": "max"
        }).to_dict("index")
        
        results = []
        for i, d_str in enumerate(dates):
            d_obj = datetime.strptime(d_str, "%Y-%m-%d").date()
            agg = daily_agg.get(d_obj, {"humidity": 70, "dewpoint": 15, "pressure": 1010, "wind": 10, "cape": 0})
            
            results.append({
                "date": d_str,
                "temp_max": temp_max[i],
                "temp_min": temp_min[i],
                "precipitation": precip[i],
                "wind_speed": wind_max[i],
                "humidity": round(float(agg["humidity"]), 1),
                "dewpoint": round(float(agg["dewpoint"]), 1),
                "pressure": round(float(agg["pressure"]), 1),
                "wind_hourly_avg": round(float(agg["wind"]), 1),
                "cape": round(float(agg["cape"]), 1)
            })
        return results

    def integrate_16day_forecast(self, place):
        # 1. Get static data
        ls_static = self.ls_df[self.ls_df["place"] == place].iloc[0] if not self.ls_df[self.ls_df["place"] == place].empty else None
        fl_static = self.fl_df[self.fl_df["place"] == place].iloc[0] if not self.fl_df[self.fl_df["place"] == place].empty else None
        
        if ls_static is None or fl_static is None:
            return []

        # 2. Get all weather data for 16 days
        weather_data = self.get_comprehensive_weather_api_data(place)
        
        # Prepare lists for 3-day window calculations
        precip_list = [d["precipitation"] for d in weather_data]
        wind_list = [d["wind_speed"] for d in weather_data]
        
        forecast = []
        for i, day in enumerate(weather_data):
            month = datetime.strptime(day["date"], "%Y-%m-%d").month
            
            # Landslide
            ls_res = self.landslide.predict_raw({
                "month": month,
                "rainfall_mm": day["precipitation"],
                "elevation_m": ls_static["elevation_m"],
                "slope_deg": ls_static["slope_deg"],
                "soil_type": ls_static["soil_type"]
            })
            
            # Flood
            rain_3day = sum(precip_list[max(0, i-2):i+1])
            fl_res = self.flood.predict_raw({
                "month": month,
                "rainfall_mm": day["precipitation"],
                "rainfall_3day": rain_3day,
                "temperature_c": day["temp_max"],
                "humidity_percent": day["humidity"],
                "elevation_m": fl_static["elevation_m"],
                "slope_deg": fl_static["slope_deg"],
                "soil_type": fl_static["soil_type"]
            })
            
            # Thunderstorm
            ts_prob, _ = self.thunderstorm.predict({
                "2m_temperature": day["temp_max"],
                "2m_dewpoint_temperature": day["dewpoint"],
                "surface_pressure": day["pressure"],
                "10m_wind_speed": day["wind_hourly_avg"],
                "total_precipitation": day["precipitation"],
                "cape": day["cape"]
            })
            
            # Windstorm
            wind_3day_cum = sum(wind_list[max(0, i-2):i+1])
            ws_res = self.windstorm.predict_raw({
                "month": month,
                "WindSpeed_km_per_hr": day["wind_speed"],
                "Temperature_C": day["temp_max"],
                "Humidity_percent": day["humidity"],
                "WindSpeed_3day_cum": wind_3day_cum
            })
            
            forecast.append({
                "date": day["date"],
                "weather": {
                    "tempMax": day["temp_max"],
                    "tempMin": day["temp_min"],
                    "precipitation": day["precipitation"],
                    "rain_3day": round(rain_3day, 2),
                    "windSpeed": day["wind_speed"],
                    "wind_3day": round(wind_3day_cum, 2),
                    "humidity": day["humidity"],
                    "dewpoint": day["dewpoint"],
                    "pressure": day["pressure"],
                    "cape": day["cape"],
                    "condition": "Stormy" if ts_prob > 0.4 else "Rainy" if day["precipitation"] > 5 else "Cloudy" if day["precipitation"] > 0 else "Sunny"
                },
                "risks": {
                    "landslide": ls_res,
                    "flood": fl_res,
                    "thunderstorm": {"probability": round(float(ts_prob), 3), "level": risk_level(ts_prob)},
                    "windstorm": ws_res
                }
            })
        return forecast
>>>>>>> 159e84c (done monthly , daily api  place info)

if __name__ == "__main__":
    # Sample usage
    predictor = DisasterPredictor()
    res = predictor.integrate_16day_forecast("Munnar")
    import json
    print(json.dumps(res[0], indent=2))
