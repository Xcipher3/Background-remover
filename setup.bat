@echo off
echo Setting up BG Remover Application...
echo.

echo [1/4] Setting up Python virtual environment...
cd backend
python -m venv venv
call venv\Scripts\activate.bat

echo [2/4] Installing Python dependencies...
pip install -r requirements.txt

echo [3/4] Setting up Node.js dependencies...
cd ..
call npm install

echo [4/4] Setup complete!
echo.
echo To start the application:
echo 1. Run: start-backend.bat (in one terminal)
echo 2. Run: start-frontend.bat (in another terminal)
echo 3. Open: http://localhost:3000
echo.
pause
