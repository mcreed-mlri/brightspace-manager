@echo off
rem Double-clickable launcher for dev-code.ps1 — prints a sign-in code
rem without sending an email. Window stays open so you can copy the code.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0dev-code.ps1" %*
pause
