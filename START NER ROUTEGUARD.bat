@echo off
setlocal enabledelayedexpansion
title RASTA-NER / NER RouteGuard -- SIH26002 Launcher
color 0A

echo.
echo ============================================================
echo       RASTA-NER / NER RouteGuard -- SIH26002 Launcher
echo       Disaster-Aware Route Planning and Logistics Platform
echo ============================================================
echo.

:: -------------------------------------------------------------
:: CONFIGURATION: Always use current script directory (%~dp0)
:: -------------------------------------------------------------
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

set "BACKEND_DIR=%ROOT%\backend"
set "FRONTEND_DIR=%ROOT%\frontend"
set "BACKEND_PORT=5000"
set "FRONTEND_PORT=5173"

echo [CONFIG] Project Root   : %ROOT%
echo [CONFIG] Backend Dir    : %BACKEND_DIR%
echo [CONFIG] Frontend Dir   : %FRONTEND_DIR%
echo [CONFIG] Backend Target : http://localhost:%BACKEND_PORT%
echo [CONFIG] Frontend Target: http://localhost:%FRONTEND_PORT%
echo.

:: -------------------------------------------------------------
:: STEP 1: Release ports used by stale / duplicate processes
:: -------------------------------------------------------------
echo [STEP 1/5] Releasing ports 5173, 5174, 5000 from old processes...

for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr /C:":5173 " ^| findstr "LISTENING"') do (
    echo          Freeing port 5173 (Killing PID %%p)
    taskkill /F /PID %%p >nul 2>&1
)

for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr /C:":5174 " ^| findstr "LISTENING"') do (
    echo          Freeing port 5174 (Killing PID %%p)
    taskkill /F /PID %%p >nul 2>&1
)

for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr /C:":5000 " ^| findstr "LISTENING"') do (
    echo          Freeing port 5000 (Killing PID %%p)
    taskkill /F /PID %%p >nul 2>&1
)

ping 127.0.0.1 -n 2 >nul
echo [STEP 1/5] Ports cleared and ready.
echo.

:: -------------------------------------------------------------
:: STEP 2: Verify project files and dependencies
:: -------------------------------------------------------------
echo [STEP 2/5] Verifying project files and dependencies...

if not exist "%BACKEND_DIR%\server.js" (
    echo [ERROR] Backend entry point "%BACKEND_DIR%\server.js" not found!
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%\package.json" (
    echo [ERROR] Frontend configuration "%FRONTEND_DIR%\package.json" not found!
    pause
    exit /b 1
)

if not exist "%BACKEND_DIR%\node_modules" (
    echo [WARN] Backend dependencies missing. Running npm install...
    cd /d "%BACKEND_DIR%"
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install backend dependencies!
        pause
        exit /b 1
    )
)

if not exist "%FRONTEND_DIR%\node_modules" (
    echo [WARN] Frontend dependencies missing. Running npm install...
    cd /d "%FRONTEND_DIR%"
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install frontend dependencies!
        pause
        exit /b 1
    )
)

echo [STEP 2/5] Dependencies and entry points verified.
echo.

:: -------------------------------------------------------------
:: STEP 3: Start Node.js Express Backend
:: -------------------------------------------------------------
echo [STEP 3/5] Starting Backend (Express on port %BACKEND_PORT%)...
start "RASTA-NER Backend [Port %BACKEND_PORT%]" /D "%BACKEND_DIR%" cmd /k "node server.js"

echo [STEP 3/5] Backend window opened.
echo.

:: -------------------------------------------------------------
:: STEP 4: Start Vite React Frontend
:: -------------------------------------------------------------
echo [STEP 4/5] Starting Frontend (Vite Dev Server on port %FRONTEND_PORT%)...
start "RASTA-NER Frontend [Port %FRONTEND_PORT%]" /D "%FRONTEND_DIR%" cmd /k "npm run dev -- --port %FRONTEND_PORT%"

echo [STEP 4/5] Frontend window opened.
echo.

:: -------------------------------------------------------------
:: STEP 5: Verify services are LISTENING before opening browser
:: -------------------------------------------------------------
echo [STEP 5/5] Waiting for Backend and Frontend to become ready...

:: Verify Backend Port 5000
set "BACKEND_READY=0"
for /L %%i in (1,1,15) do (
    if !BACKEND_READY!==0 (
        netstat -ano 2>nul | findstr /C:":%BACKEND_PORT% " | findstr "LISTENING" >nul 2>&1
        if !errorlevel!==0 (
            set "BACKEND_READY=1"
            echo [STATUS] Backend is active and LISTENING on port %BACKEND_PORT%.
        ) else (
            ping 127.0.0.1 -n 2 >nul
        )
    )
)

if !BACKEND_READY!==0 (
    echo [WARN] Backend did not respond on port %BACKEND_PORT% within 15 seconds.
    echo        Check the "RASTA-NER Backend" console window for database/port errors.
)

:: Verify Frontend Port 5173
set "FRONTEND_READY=0"
for /L %%i in (1,1,20) do (
    if !FRONTEND_READY!==0 (
        netstat -ano 2>nul | findstr /C:":%FRONTEND_PORT% " | findstr "LISTENING" >nul 2>&1
        if !errorlevel!==0 (
            set "FRONTEND_READY=1"
            echo [STATUS] Frontend is active and LISTENING on port %FRONTEND_PORT%.
        ) else (
            ping 127.0.0.1 -n 2 >nul
        )
    )
)

if !FRONTEND_READY!==0 (
    echo [WARN] Frontend did not respond on port %FRONTEND_PORT% within 20 seconds.
    echo        Check the "RASTA-NER Frontend" console window for Vite compilation errors.
)

:: Extra second to allow Vite dev server to finish initial page prep
ping 127.0.0.1 -n 2 >nul

echo.
echo ============================================================
echo   SUCCESS: Opening RASTA-NER in Browser...
echo   URL: http://localhost:%FRONTEND_PORT%/
echo ============================================================
echo.

start "" "http://localhost:%FRONTEND_PORT%/"

echo.
echo ============================================================
echo   RASTA-NER / NER RouteGuard is running!
echo.
echo   - Frontend: http://localhost:%FRONTEND_PORT%/
echo   - Backend : http://localhost:%BACKEND_PORT%/api/health
echo.
echo   IMPORTANT: Keep the Backend and Frontend terminal windows
echo   open during your SIH presentation.
echo ============================================================
echo.
pause
