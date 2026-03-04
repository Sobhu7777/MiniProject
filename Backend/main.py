from fastapi import FastAPI, Query
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
async def get_predictions(place: str, month: int):
    """
    Returns disaster risk predictions for a given place and month.
    month is 0-indexed from frontend (0=Jan, 11=Dec).
    Backend logic expects 1-indexed (1=Jan, 12=Dec).
    """
    # Convert 0-indexed to 1-indexed
    backend_month = month + 1
    
    try:
        results = predictor.predict_all_monthly(place, backend_month)
        if results is None:
            return {
                "place": place,
                "month": month,
                "error": "No data available for this location and month"
            }
            
        # Ensure the response uses the 0-indexed month from the request
        results["month"] = month
        return results
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
