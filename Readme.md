# 🛡️ TravelSafe — Multi-Disaster Risk Prediction System

A full-stack web application that predicts disaster risks (Landslide, Flood, Thunderstorm, Windstorm) for popular travel destinations across India. Built with **React** and **FastAPI**, it uses **Random Forest** machine learning models trained on historical environmental data.

---

## ✨ Features

- **Monthly Disaster Prediction** — Select a destination and month to get real-time risk assessments for 4 disaster types
- **16-Day Forecast** — Integrated daily disaster forecast using live weather data from the Open-Meteo API
- **Place Info** — Detailed location profiles with elevation, best time to visit, highlights, and top tourist spots with Google Maps links
- **Safety Precautions** — Context-aware safety tips based on predicted risk levels
- **Interactive Graphs & Data Tables** — Visualize 16-day trends for rainfall, wind speed, CAPE, and more
- **30+ Indian Destinations** — Covers hill stations, coastal cities, and heritage towns across all regions

---

## 🧰 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 6** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **Recharts** | Charts & data visualization |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | REST API framework |
| **Uvicorn** | ASGI server |
| **scikit-learn** | Random Forest ML models |
| **Pandas / NumPy** | Data processing |
| **Joblib** | Model serialization |
| **Requests** | External API calls (Open-Meteo) |

### External APIs
| API | Purpose |
|---|---|
| **Open-Meteo Forecast API** | 16-day weather forecast data (precipitation, temperature, wind, humidity, CAPE, pressure) |

---

## 📁 Project Structure

```
MiniProject/
├── Backend/
│   ├── app.py                  # FastAPI application entry point
│   ├── requirements.txt        # Python dependencies
│   ├── models/                 # Trained ML model files (.pkl)
│   ├── data/                   # CSV datasets (landslide, flood, windstorm, thunderstorm)
│   └── src/
│       ├── predictor.py        # Core prediction logic & 16-day forecast integration
│       ├── data_utils.py       # Data loading & helper utilities
│       ├── train_models.py     # Model training script
│       └── models/
│           ├── landslide_logic.py
│           ├── flood_logic.py
│           ├── thunderstorm_logic.py
│           └── windstorm_logic.py
├── Frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx             # Main app with navigation & routing
│       ├── services/
│       │   └── api.js          # API calls & static place data
│       ├── data/
│       │   └── touristSpots.js # Tourist attraction data
│       └── components/
│           ├── RegionSelector.jsx
│           ├── StateSelector.jsx
│           ├── PlaceSelector.jsx
│           ├── ActionButtons.jsx
│           ├── PredictionDashboard.jsx
│           ├── WeatherForecast.jsx
│           └── PlaceInfo.jsx
└── Readme.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**

### Backend Setup
```bash
cd Backend
pip install -r requirements.txt
python app.py
```
The API server starts at `http://localhost:8000`.

### Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```
The dev server starts at `http://localhost:5173`.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/predict?place={place}&month={month}` | Monthly disaster risk prediction |
| `GET` | `/api/predict_16day?place={place}` | 16-day integrated forecast |

### Example Request
```
GET /api/predict?place=Munnar&month=5
GET /api/predict_16day?place=Varanasi
```

---

## 🤖 ML Pipeline

1. **Data Collection** — Historical meteorological & disaster event data (ERA5, IMD, NASA Landslide Catalog)
2. **Feature Engineering** — Date-based features, rolling rainfall windows, wind speed aggregation
3. **Model Training** — Random Forest classifiers trained per disaster type (80/20 train-test split)
4. **Inference** — Models output probability (0–1), mapped to risk levels:
   - `0.00 – 0.30` → **Low Risk** 🟢
   - `0.30 – 0.60` → **Moderate Risk** 🟡
   - `0.60 – 1.00` → **High Risk** 🔴
5. **16-Day Forecast** — Live weather data from Open-Meteo is fed into trained models for daily risk predictions

---

## 📍 Supported Destinations

| Region | Locations |
|---|---|
| **South** | Munnar, Wayanad, Coorg, Nilgiris, Thiruvananthapuram, Chennai, Kochi |
| **North** | Srinagar, Chamoli, Pithoragarh, Kedarnath, Manali, Shimla, Mussoorie, Varanasi |
| **East** | Darjeeling, Gangtok, Shillong, Guwahati, Kolkata, Bhubaneswar, Puri, Patna, Ranchi |
| **West** | Mumbai, Udaipur, Panaji, Visakhapatnam |

---

## 📜 License

This project is for educational purposes as part of a Mini Project.
