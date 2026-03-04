import sys
import os
# Add current directory to path so src can be imported
sys.path.append(os.getcwd())

from src.data_utils import (
    load_landslide_data, load_flood_data, 
    load_thunderstorm_data, load_windstorm_data
)
from src.models.landslide_logic import LandslideModel
from src.models.flood_logic import FloodModel
from src.models.thunderstorm_logic import ThunderstormModel
from src.models.windstorm_logic import WindstormModel

def train_all_models():
    print("Training Landslide Model...")
    ls_df = load_landslide_data("landslide.csv")
    ls_model = LandslideModel()
    ls_acc = ls_model.train(ls_df)
    ls_model.save()
    print(f"Landslide Model Accuracy: {ls_acc:.4f}")

    print("\nTraining Flood Model...")
    fl_df = load_flood_data("flood.csv")
    fl_model = FloodModel()
    fl_acc = fl_model.train(fl_df)
    fl_model.save()
    print(f"Flood Model Accuracy: {fl_acc:.4f}")

    print("\nTraining Thunderstorm Model...")
    th_df = load_thunderstorm_data("thunderstorm.csv")
    th_model = ThunderstormModel()
    th_acc = th_model.train(th_df)
    th_model.save()
    print(f"Thunderstorm Model Accuracy: {th_acc:.4f}")

    print("\nTraining Windstorm Model...")
    wi_df = load_windstorm_data("windstorm.csv")
    wi_model = WindstormModel()
    wi_acc = wi_model.train(wi_df)
    wi_model.save()
    print(f"Windstorm Model Accuracy: {wi_acc:.4f}")

    print("\nAll models trained and saved to models/ directory.")

if __name__ == "__main__":
    train_all_models()
