@echo off
cd /d "%~dp0"
echo Starting Google Snake at http://127.0.0.1:8787
node server.js --open
