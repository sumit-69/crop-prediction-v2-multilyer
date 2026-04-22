#!/bin/bash
# Start Crop Prediction v2

echo "🌱 Starting Crop Prediction v2..."

# Start backend
echo "→ Setting up Python virtual environment..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt -q
echo "→ Starting FastAPI backend on port 8000..."
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Start frontend
echo "→ Starting React frontend..."
cd frontend
npm install -q
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
