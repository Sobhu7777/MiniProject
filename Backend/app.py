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
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/disaster_graph")
async def get_disaster_graph(place: str, disaster: str):
    """
    Returns a base64 encoded PNG image of the disaster risk probability graph.
    """
    try:
        img_base64 = predictor.generate_disaster_plot(place, disaster)
        if not img_base64:
            return {"error": "Failed to generate graph"}
        return {"image": img_base64}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
