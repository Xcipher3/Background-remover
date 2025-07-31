@echo off
echo Testing BG Remover Application...
echo.
echo Make sure both backend and frontend are running before running this test.
echo Backend should be on: http://localhost:8000
echo Frontend should be on: http://localhost:3000
echo.
pause
echo.
python test_app.py
pause
