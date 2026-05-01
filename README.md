# 🌱 Crop Prediction v2 — AI Farming Assistant
Fully devloped and run by Sumit Kumar Mandal

A full-stack crop recommendation system using Deep Learning (NumPy), FastAPI, and React.

> ✅ **No PyTorch required!** Model runs on pure NumPy — installs in seconds.

## 🚀 Getting Started

### Step 1 — Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Step 2 — Frontend (new terminal)

```bash
cd frontend
npm install
npm start
```

App runs at: http://localhost:3000 (or 3001 if 3000 is busy)
API docs at: http://localhost:8000/docs

## 🧠 Model

- **Architecture**: 3-layer DNN (7 → 64 → 128 → 64 → 22)
- **Inference**: Pure NumPy (no PyTorch needed)
- **Crops**: 22 classes — rice, maize, chickpea, kidneybeans, pigeonpeas, mothbeans, mungbean, blackgram, lentil, pomegranate, banana, mango, grapes, watermelon, muskmelon, apple, orange, papaya, coconut, cotton, jute, coffee

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/states` | List all Indian states |
| GET | `/districts/{state}` | List districts for a state |
| POST | `/predict` | Predict crop (returns top 3) |
