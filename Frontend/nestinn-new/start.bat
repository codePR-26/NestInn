@echo off
echo ========================================
echo    NestInn New Frontend Setup
echo ========================================
echo.
echo Step 1: Installing dependencies...
call npm install
echo.
echo Step 2: Starting development server on port 4201...
echo.
echo Open http://localhost:4201 in your browser
echo.
echo Your OLD frontend still works at http://localhost:4200
echo.
call ng serve --port 4201
