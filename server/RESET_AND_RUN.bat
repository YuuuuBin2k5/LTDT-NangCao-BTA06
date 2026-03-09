@echo off
echo ============================================
echo RESET DATABASE VA CHAY SERVER
echo ============================================

echo.
echo [1/4] Kill process tren port 8081...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081 ^| findstr LISTENING') do (
    echo Killing PID: %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo [2/4] Drop va tao lai database...
psql -U postgres -c "DROP DATABASE IF EXISTS mapic_db;"
psql -U postgres -c "CREATE DATABASE mapic_db;"

echo.
echo [3/4] Chay SQL setup (KHONG CAN PostGIS)...
psql -U postgres -d mapic_db -f FULL_DATABASE_SETUP.sql

echo.
echo [4/4] Compile va chay server...
call mvnw.cmd clean compile
call mvnw.cmd spring-boot:run

pause
