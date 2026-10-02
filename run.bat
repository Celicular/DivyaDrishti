@echo off
start "DDrishti Backend" cmd /k "cd /d "%~dp0backend" && uvicorn main:app --reload --port 8000"
start "DDrishti Frontend" cmd /k "cd /d "%~dp0project" && npm run dev"
exit
