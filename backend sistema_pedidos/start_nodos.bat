@echo off
start cmd /k "set NODO_ID=nodo1 && set NODO_PORT=5000 && python app.py"
timeout /t 3
start cmd /k "set NODO_ID=nodo2 && set NODO_PORT=5001 && python app.py"
timeout /t 3
start cmd /k "set NODO_ID=nodo3 && set NODO_PORT=5002 && python app.py"