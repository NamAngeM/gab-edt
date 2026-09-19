@REM ===========================================================================
@REM Maven Wrapper startup batch script for Windows
@REM Utilise le Maven local installé dans d:\EDT\apache-maven-3.9.9
@REM ===========================================================================
@echo off
setlocal

set "MAVEN_HOME=d:\EDT\apache-maven-3.9.9"
set "MAVEN_CMD=%MAVEN_HOME%\bin\mvn.cmd"

if not exist "%MAVEN_CMD%" (
    echo Error: Maven not found at %MAVEN_HOME%
    echo Please download Apache Maven 3.9.9 and extract to d:\EDT\apache-maven-3.9.9
    exit /b 1
)

call "%MAVEN_CMD%" %*

exit /b %ERRORLEVEL%
