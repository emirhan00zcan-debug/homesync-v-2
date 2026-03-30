@echo off
echo HomeSync Recommender Service baslatiliyor...
echo Port: 8001
echo.

REM Check if virtual environment exists, if not create it
if not exist "venv" (
    echo Sanal ortam olusturuluyor...
    python -m venv venv
    echo Bagimliliklar yukleniyor...
    venv\Scripts\pip install -r requirements.txt
)

echo Servis baslatiliyor: http://localhost:8001
venv\Scripts\uvicorn main:app --host 0.0.0.0 --port 8001 --reload
