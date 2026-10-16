# Manual checks for a release

Automation covers the engines (Chromium, Firefox, WebKit) and emulated phones and tablets. These need a real device or a person, and take about 20 minutes. Tick them on the pull request.

## Devices

| Device | Browser | Check |
|---|---|---|
| iPhone (current iOS) | Safari | Open, Add to Home Screen, open from the icon, turn on Airplane mode and reopen. Pinch the text. Print → Save as PDF in each layout; the contents numbers match. |
| iPhone | WhatsApp link preview and in-app viewer | The preview shows the picture and title; the page opens and reads. |
| Older iPad or iPhone on iOS 15 | Safari | Home card, Settings switches (on/off visible), date strip, search highlight all show their colours. |
| Android phone | Chrome | Install from the App button; reopen offline; pinch; Print → Save as PDF (A4). |
| Android phone | Samsung Internet | Opens and reads; Settings; dark theme. |
| Windows PC | Edge | Two columns and the side menu; Ctrl + / −; Print (Letter) in each layout. |
| Mac | Safari | Print → PDF two columns (the Safari table layout); File → Add to Dock. |
| Large monitor (≥ 2560 px) | any | The page uses the width without stretching lines. |

## Screen readers

| Reader | Check |
|---|---|
| VoiceOver (iPhone) | Swipe through the home card and an aarti: Marathi lines read in a Marathi or Hindi voice, English lines in English. Fold states are announced ("collapsed / expanded"). |
| TalkBack (Android) | Same as above; the bottom bar buttons have names. |
| VoiceOver (Mac) or NVDA (Windows) | Tab through Settings to the end and back; Escape closes it and returns to the ⚙ button. Search: results are announced. |

## Keyboard only (any computer)

The first Tab shows "Skip to the texts". Every button can be reached and used with Tab, Enter and Escape, and the focus ring is always visible.
