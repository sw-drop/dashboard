Set objShell = CreateObject("WScript.Shell")
' Get directory of this VBScript file dynamically
strPath = Left(WScript.ScriptFullName, InstrRev(WScript.ScriptFullName, "\"))
' Build execution command pointing to the push.ps1 in the same directory
strCommand = "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & strPath & "push.ps1"""
' Run the shell command in a truly hidden window (0) and do not wait for exit (False)
objShell.Run strCommand, 0, False
