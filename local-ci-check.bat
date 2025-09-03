@echo off
REM This script simulates the GitHub Actions CI checks for local development.

REM Enable delayed variable expansion for better error handling
setlocal enabledelayedexpansion

REM --- Install Dependencies ---
echo Installing dependencies...
call npm ci
if !errorlevel! neq 0 (
    echo ERROR: Failed to install dependencies
    exit /b 1
)

REM --- Lint Code ---
echo.
echo Linting code...
call npm run lint
if !errorlevel! neq 0 (
    echo ERROR: Linting failed
    exit /b 1
)

REM --- Build Project ---
echo.
echo Building project...
call npm run build
if !errorlevel! neq 0 (
    echo ERROR: Build failed
    exit /b 1
)

REM --- Run Tests ---
echo.
echo Running tests...
call npm run test:ci
if !errorlevel! neq 0 (
    echo ERROR: Tests failed
    exit /b 1
)

echo.
echo CI check completed successfully!
pause
