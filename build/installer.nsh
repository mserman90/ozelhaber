!macro customInstall
  CopyFiles "$INSTDIR\ÖzelHaber.exe" "$INSTDIR\ÖzelHaber.scr"
!macroend

!macro customUnInstall
  Delete "$INSTDIR\ÖzelHaber.scr"
!macroend
