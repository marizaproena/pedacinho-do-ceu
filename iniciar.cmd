@echo off
setlocal
cd /d "%~dp0"
set "ACAI_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%ACAI_NODE%" set "ACAI_NODE=node"
echo Iniciando Pedacinho do Ceu no computador...
echo Abra http://127.0.0.1:5173 no navegador.
echo Esta e uma previa local. Para clientes, e necessario publicar na internet.
echo Para encerrar, pressione Ctrl+C.
"%ACAI_NODE%" scripts/run-framework.mjs dev --hostname 127.0.0.1
pause
