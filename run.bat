@echo off
echo Starting EmployeeConnect...

:: Start MySQL (if not running)
net start MySQL80

:: Initialize database schema if needed
echo Initializing database schema...
mysql -u root -proot ems_db < server/db_setup.sql

:: Initialize default data
echo Loading default data...
mysql -u root -proot ems_db < server/init_data.sql

:: Start the Flask backend server
start cmd /k "cd server && python app.py"

:: Start the React frontend
start cmd /k "cd client && npm run dev"

:: Wait for servers to start
timeout /t 4

:: Open in Microsoft Edge
start msedge "http://localhost:5173"

echo System is starting up...
echo Frontend will be available at http://localhost:5173
echo Backend will be available at http://localhost:5000 