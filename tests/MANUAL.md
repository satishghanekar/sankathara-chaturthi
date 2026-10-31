# Manual checks for a release

Automation covers the engines (Chromium, Firefox, WebKit) and emulated phones and tablets. These need a real device or a person, and take about 20 minutes. Tick them on the pull request.

## Devices

| Device | Browser | Check |
|---|---|---|
| iPhone (current iOS) | Safari | Open, Add to Home Screen, open from the icon, turn on Airplane mode and reopen. Print → Save as PDF in Portrait and in Landscape; every text starts on a new page; From the Home Screen app, Print goes to Open in Safari, and the choices carry over. |
| iPhone with a notch or Dynamic Island | Safari | **Pinch** (the tests can only simulate it in Chromium): on a verse the text grows and shrinks and the page never zooms; on the home card nothing happens; the size bubble and then Default size appear below the top bar, also at the very end of a piece, and Default size can be tapped. Turn the phone sideways: Help's ✕, the picture's ✕ and the bottom bar buttons are clear of the notch. |
| iPhone | WhatsApp link preview and in-app viewer | The preview shows the picture and title; the page opens and reads. |
| Older iPad or iPhone on iOS 15 | Safari | Home card and its ring, Settings switches (on/off visible), More dates, search highlight all show their colours. |
| iPhone, the Home Screen app | Safari | Once a new version is published: Settings → More, the round button beside the version turns, then the line says "Saved. Close the app and open it again"; How? shows the iPhone steps first; following them opens the new version. |
| Android phone | Chrome | Install from the App button; reopen offline; pinch; Print → Save as PDF (A4). Settings → More → About shows the version with "Offline ready" under it; the round button beside it turns, then shows ✓ and "You have the latest version". |
| Android phone | Samsung Internet | Opens and reads; Settings; dark theme. |
| Windows PC | Edge | Two columns and the side menu sit centred (the scrollbar doesn't push them); Ctrl + / −; Print (Letter) in Portrait and in Landscape: the PDF has the pages the pop-up said ("about N pages"). Settings → Accessibility → Contrast themes on: buttons, icons and the focus ring stay visible. |
| Mac | Safari | Print → PDF in Portrait and in Landscape (pick Landscape in Safari's dialog too; the pop-up says Safari prints a little smaller, without page numbers); a changed Print font or Dhrupad prints, and the reading page keeps its own; File → Add to Dock. |
| Large monitor (≥ 2560 px) | any | The page uses the width without stretching lines. |

## Screen readers

| Reader | Check |
|---|---|
| VoiceOver (iPhone) | Swipe through the home card and an aarti: Marathi lines read in a Marathi or Hindi voice, English lines in English. Fold states are announced ("collapsed / expanded"). |
| TalkBack (Android) | Same as above; the bottom bar buttons have names. |
| VoiceOver (Mac) or NVDA (Windows) | Tab through Settings to the end and back; Escape closes it and returns to the ⚙ button. Search: results are announced. |

## Keyboard only (any computer)

The first Tab shows "Skip to the texts". Every button can be reached and used with Tab, Enter and Escape, and the focus ring is always visible.
