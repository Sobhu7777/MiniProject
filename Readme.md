# 📍 Project Roadmap: Multi‑Disaster Risk Prediction System

This roadmap describes the **end‑to‑end workflow** for building a machine‑learning‑based disaster risk prediction system, from data collection to final deployment and presentation.

---

## 🔷 PHASE 1: Problem Framing (Foundation)

### Step 1: Define the Problem Scope
- **Disasters Covered**
  - Thunderstorm
  - Windstorm
  - Flood
  - Landslide

- **Prediction Type**
  - Thunderstorm & Windstorm → Real‑time probability‑based prediction
  - Flood & Landslide → Historical / susceptibility‑based prediction

- **Model Output**
  - Probability score between **0 and 1**
  - Converted into **Low / Medium / High risk** using rule‑based thresholds

---

## 🔷 PHASE 2: Data Collection

### Step 2: Collect Feature Datasets
Multiple datasets are combined instead of relying on a single source.

- **Meteorological Data**
  - ERA5 Reanalysis (temperature, humidity, wind, pressure, CAPE)
  - NOAA GSOD (daily weather parameters)

- **Rainfall / Flood Data**
  - IMD gridded rainfall datasets
  - Kaggle India rainfall datasets

- **Landslide Data**
  - NASA Global Landslide Catalog
  - DEM‑derived slope and elevation (optional)

**Output:**  
Clean datasets with `Date + Location + Features`

---

### Step 3: Collect Label Data
Labels indicate whether a disaster event occurred.

- Thunderstorm / Windstorm → Event occurred (1) or not (0)
- Flood → Flood occurred (1) or not (0)
- Landslide → Landslide occurred (1) or not (0)

> ⚠️ Labels are **binary**, not Low/Medium/High.

---

## 🔷 PHASE 3: Dataset Construction

### Step 4: Merge Features and Labels
Create the final ML dataset by joining data sources using **date and location**.

Example structure:
Date | Location | Temp | Humidity | Wind | Pressure | Rainfall | Label


---

### Step 5: Data Cleaning & Imbalance Handling
- Handle missing values
- Normalize / scale features
- Address class imbalance using SMOTE or class weighting
- Remove duplicates and noise

---

## 🔷 PHASE 4: Model Development

### Step 6: Model Selection (One per Disaster)
- Thunderstorm → Random Forest / XGBoost
- Windstorm → Random Forest Regressor / XGBoost
- Flood → XGBoost / Logistic Regression
- Landslide → Random Forest (susceptibility modeling)

All models:
- Binary classification
- Output probability between **0 and 1**

---

### Step 7: Training & Validation
- Train‑test split: 80/20
- Evaluation metrics:
  - Accuracy
  - Precision & Recall
  - ROC‑AUC
- Save trained models for inference

---

## 🔷 PHASE 5: Risk Interpretation Layer

### Step 8: Probability to Risk Mapping
Convert model output into human‑readable risk levels.

Example thresholds:

0.00 – 0.30 → Low Risk
0.30 – 0.60 → Medium Risk
0.60 – 1.00 → High Risk


> This layer is **rule‑based**, not machine learning.

---

## 🔷 PHASE 6: Calendar‑Based Prediction Logic

### Step 9: Calendar Integration
When a user selects a date:

- **Thunderstorm & Windstorm**
  - Fetch recent or real‑time weather features
  - Predict probability → map to risk level

- **Flood**
  - Use historical rainfall trends for the selected date/month
  - Predict probability → map to risk level

- **Landslide**
  - Use static susceptibility score for the location
  - Map score to risk level

---

## 🔷 PHASE 7: Output & Visualization Layer

### Step 10: User‑Facing Outputs
- Interactive disaster‑predictive calendar
- Map overlays (Green / Orange / Red zones)
- Travel safety summaries
- Integrated Disaster Risk Score (optional)

---

## 🔷 PHASE 8: Evaluation & Justification

### Step 11: System Validation
- Compare predicted risks with historical disaster events
- Analyze confusion matrix and ROC curves
- Clearly document limitations and assumptions

---

## 🔷 PHASE 9: Documentation & Presentation

### Step 12: Final Deliverables
- Dataset sources and descriptions
- System architecture diagram
- Model workflow and risk‑mapping logic
- UI mockups or screenshots
- Limitations and future scope

---

## 🧠 One‑Line Summary
> Historical environmental data is used to train binary classification models that estimate disaster probabilities, which are then converted into interpretable risk levels and visualized through a calendar‑based decision support system.

---
