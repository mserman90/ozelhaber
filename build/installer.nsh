!macro customInstall
  CopyFiles "$INSTDIR\ÖzelHaber.exe" "$INSTDIR\ÖzelHaber.scr"
  CreateDirectory "$SMPROGRAMS\ÖzelHaber"
  CreateShortcut "$SMPROGRAMS\ÖzelHaber\ÖzelHaber Ekran Koruyucu.lnk" "$INSTDIR\ÖzelHaber.scr" "/s" "$INSTDIR\ÖzelHaber.exe" 0
!macroend

!macro customUnInstall
  Delete "$INSTDIR\ÖzelHaber.scr"
  Delete "$SMPROGRAMS\ÖzelHaber\ÖzelHaber Ekran Koruyucu.lnk"
  RMDir "$SMPROGRAMS\ÖzelHaber"
!macroend
