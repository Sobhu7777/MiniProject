from fastapi import FastAPI, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from src.predictor import DisasterPredictor
import uvicorn
import os

app = FastAPI(title="TravelSafe API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize predictor
# Assuming we are running from the Backend directory
predictor = DisasterPredictor(models_dir="models")

@app.get("/")
async def root():
    return {"message": "TravelSafe API is running"}

@app.get("/api/predict")
async def get_monthly_predictions(place: str, month: int):
    """
    Returns monthly disaster risk predictions for a given place and month.
    Frontend sends 0-indexed month, backend expects 1-indexed.
    """
    try:
        results = predictor.predict_all_monthly(place, month + 1)
        if not results:
            return {
                "place": place,
                "error": "No data available for this location/month"
            }
        return results
    except Exception as e:
        return {"error": str(e)}

<<<<<<< HEAD:Backend/app.py
@app.get("/api/forecast/16day")
async def get_16day_forecast(place: str):
    """
    Returns a daily 16-day forecast for all disasters.
    """
    try:
        results = predictor.forecast_16day(place)
        return results
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

@app.get("/api/forecast/plot/{disaster}")
async def get_forecast_plot(disaster: str, place: str):
    """
    Returns a Matplotlib-generated plot for the 16-day forecast of a specific disaster.
    """
    try:
        plot_bytes = predictor.get_forecast_plot(place, disaster)
        if not plot_bytes:
            return {"error": f"No plot available for {disaster} at {place}"}
        return Response(content=plot_bytes, media_type="image/png")
=======
@app.get("/api/predict_16day")
async def get_16day_predictions(place: str):
    """
    Returns 16-day integrated disaster risk predictions for a given place.
    """
    try:
        results = predictor.integrate_16day_forecast(place)
        if not results:
            return {
                "place": place,
                "error": "No data available for this location"
            }
        return {
            "place": place,
            "forecast": results
        }
>>>>>>> 159e84c (done monthly , daily api  place info):Backend/main.py
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
