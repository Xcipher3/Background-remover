@echo off
echo Restarting BG Remover Backend with fixes...
echo.

echo Stopping any existing backend processes...
taskkill /f /im python.exe 2>nul

echo Starting updated backend...
cd backend
call venv\Scripts\activate.bat
python start_simple.py
