from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from utils import pred_crop, pred_rainfall, pred_weather, pred_multilayer

app = FastAPI(title="Crop Prediction API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Crop Prediction API v2.0", "status": "running"}


@app.get("/states")
async def get_states():
    return pred_rainfall.get_states()


@app.get("/districts/{state}")
async def get_districts(state: str):
    return pred_rainfall.get_districts(state)


class PredictRequest(BaseModel):
    nitrogen: float
    phosphorous: float
    potassium: float
    ph: float
    state: str
    district: str
    month: str


@app.post("/predict")
async def predict(inputs: PredictRequest):
    try:
        rainfall = pred_rainfall.get_rainfall(
            inputs.state, inputs.district, inputs.month
        )
        temperature, humidity = pred_weather.get_temp_hum(inputs.district)
        result = pred_crop.predict_crop(
            inputs.nitrogen, inputs.phosphorous, inputs.potassium,
            temperature, humidity, inputs.ph, rainfall
        )
        top3 = pred_crop.predict_top3(
            inputs.nitrogen, inputs.phosphorous, inputs.potassium,
            temperature, humidity, inputs.ph, rainfall
        )
        return {
            "prediction": result,
            "top3": top3,
            "weather": {"temperature": round(temperature, 2), "humidity": round(humidity, 2)},
            "rainfall": round(float(rainfall), 2),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/predict/multilayer")
async def predict_multilayer_endpoint(inputs: PredictRequest):
    try:
        rainfall = pred_rainfall.get_rainfall(inputs.state, inputs.district, inputs.month)
        temperature, humidity = pred_weather.get_temp_hum(inputs.district)
        scenarios = pred_multilayer.predict_scenarios(
            inputs.nitrogen, inputs.phosphorous, inputs.potassium,
            temperature, humidity, inputs.ph, rainfall
        )
        ph_layers = pred_multilayer.predict_ph_layers(
            inputs.nitrogen, inputs.phosphorous, inputs.potassium,
            temperature, humidity, inputs.ph, rainfall
        )
        consistency = pred_multilayer.predict_consistency(
            inputs.nitrogen, inputs.phosphorous, inputs.potassium,
            temperature, humidity, inputs.ph, rainfall
        )
        return {
            "scenarios": scenarios,
            "ph_layers": ph_layers,
            "consistency": consistency,
            "base_conditions": {
                "temperature": round(temperature, 2),
                "humidity": round(humidity, 2),
                "rainfall": round(float(rainfall), 2),
                "ph": inputs.ph,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/predict/stability")
async def predict_stability(inputs: PredictRequest):
    try:
        rainfall = pred_rainfall.get_rainfall(inputs.state, inputs.district, inputs.month)
        temperature, humidity = pred_weather.get_temp_hum(inputs.district)
        matrix = pred_multilayer.predict_stability_matrix(
            inputs.nitrogen, inputs.phosphorous, inputs.potassium,
            temperature, humidity, inputs.ph, rainfall
        )
        return matrix
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/predict/seasonal")
async def predict_seasonal(inputs: PredictRequest):
    try:
        rainfall = pred_rainfall.get_rainfall(inputs.state, inputs.district, inputs.month)
        seasonal = pred_multilayer.predict_seasonal(
            inputs.nitrogen, inputs.phosphorous, inputs.potassium,
            inputs.ph, rainfall
        )
        return {"months": seasonal}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/predict/risk")
async def predict_risk(inputs: PredictRequest):
    try:
        rainfall = pred_rainfall.get_rainfall(inputs.state, inputs.district, inputs.month)
        temperature, humidity = pred_weather.get_temp_hum(inputs.district)
        risk = pred_multilayer.predict_risk_profile(
            inputs.nitrogen, inputs.phosphorous, inputs.potassium,
            temperature, humidity, inputs.ph, rainfall
        )
        return risk
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
