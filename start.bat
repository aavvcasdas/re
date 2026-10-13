@echo off
rem 潮汐 / 生日快乐 —— 本地渲染。双击这个文件即可(也可以在命令行里带参数调用)。
rem 它只做一件事:找到 Python 3,然后把参数原样交给同目录的 start.py。
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if not errorlevel 1 goto run_py
where python >nul 2>nul
if not errorlevel 1 goto run_python

echo.
echo   找不到 Python 3。
echo   去 https://www.python.org/downloads/ 装一个,安装时勾上
echo   "Add python.exe to PATH",然后重新双击本文件。
echo.
pause
goto end

:run_py
py -3 start.py %*
goto done

:run_python
python start.py %*
goto done

:done
if "%~1"=="" pause
:end
endlocal
