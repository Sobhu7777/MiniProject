import os
import io
import base64
import matplotlib.pyplot as plt
from datetime import datetime
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
        
        # 2. Get all weather data for 16 days
        weather_data = self.get_comprehensive_weather_api_data(place)
        
        # Prepare lists for 3-day window calculations
        precip_list = [d["precipitation"] for d in weather_data]
        wind_list = [d["wind_speed"] for d in weather_data]
        
        forecast = []
        for i, day in enumerate(weather_data):
            month = datetime.strptime(day["date"], "%Y-%m-%d").month
            
            # Landslide - fallback to LOW if data missing
            if ls_static is not None:
                ls_res = self.landslide.predict_raw({
                    "month": month,
                    "rainfall_mm": day["precipitation"],
                    "elevation_m": ls_static["elevation_m"],
                    "slope_deg": ls_static["slope_deg"],
                    "soil_type": ls_static["soil_type"]
                })
            else:
                ls_res = {"probability": 0.01, "level": "LOW"}
            
            # Flood - fallback to LOW if data missing
            rain_3day = sum(precip_list[max(0, i-2):i+1])
            if fl_static is not None:
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
            else:
                fl_res = {"probability": 0.01, "level": "LOW"}
            
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

    def generate_disaster_plot(self, place, disaster_type):
        """
        Generates a matplotlib plot for a specific disaster probability over 16 days.
        Returns the image as a base64 encoded string.
        """
        forecast = self.integrate_16day_forecast(place)
        if not forecast:
            return None

        dates = [datetime.strptime(d["date"], "%Y-%m-%d").strftime("%d %b") for d in forecast]
        probs = [d["risks"][disaster_type]["probability"] * 100 for d in forecast]

        plt.figure(figsize=(10, 5), facecolor='#0f172a')
        ax = plt.gca()
        ax.set_facecolor('#1e293b')
        
        # Plotting
        plt.plot(dates, probs, marker='o', color='#38bdf8', linewidth=2, label=f'{disaster_type.capitalize()} Probability')
        plt.fill_between(dates, probs, color='#38bdf8', alpha=0.2)
        
        # Aesthetics
        plt.title(f'16-Day {disaster_type.capitalize()} Risk Probability: {place}', color='white', fontsize=14, pad=20)
        plt.xlabel('Date', color='#94a3b8', fontsize=12)
        plt.ylabel('Probability (%)', color='#94a3b8', fontsize=12)
        plt.xticks(rotation=45, color='#94a3b8')
        plt.yticks(color='#94a3b8')
        plt.grid(True, linestyle='--', alpha=0.3, color='#475569')
        plt.ylim(0, 100)
        
        # Legends and margins
        legend = plt.legend(facecolor='#1e293b', edgecolor='#475569')
        plt.setp(legend.get_texts(), color='white')
        plt.tight_layout()

        # Save to buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', transparent=False)
        plt.close()
        buf.seek(0)
        img_str = base64.b64encode(buf.read()).decode('utf-8')
        return img_str

if __name__ == "__main__":
    # Sample usage
    predictor = DisasterPredictor()
    res = predictor.integrate_16day_forecast("Munnar")
    import json
    print(json.dumps(res[0], indent=2))
