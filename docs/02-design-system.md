# Design system

## Material
Liquid Glass (iOS 26). `Glass` is the only surface primitive:

| Platform | Rendering |
|---|---|
| iOS 26+ | `GlassView` (UIGlassEffect), `regular` or `clear`, interactive on controls, grouped with `GlassContainer` so neighbours merge |
| iOS < 26, web | system material blur (`expo-blur`) with hairline border |
| Android | blur for floating bars; cards are solid elevated surfaces for frame rate |
| Reduce Transparency on | opaque elevated surface, everywhere |

Tab bar and stack headers are native, so they get the system glass and the
minimize-on-scroll behaviour for free. The mini player rides the tab bar as a
`BottomAccessory` on iOS 26 and floats above it elsewhere.

## Theme
System / Light / Dark, chosen in Settings, persisted. The choice drives both our tokens
and `Appearance.setColorScheme`, so native bars, sheets, and glass follow the override.

## Tokens
- One accent (`accent`), a soft tint of it, and `onAccent`.
- Neutrals in three text tones and two fills.
- Semantic: success, warning, danger, and one colour per pipeline stage.
- Radii are concentric: `lg` card → `md` inner row → `sm` icon tile. Pills are fully round.
- Type follows Apple text styles (largeTitle … caption) on the system font.

## Motion
Spring scale on press (`Pressable`), light haptic tick on native. Reduce Motion is
respected by the native navigators; custom animations stay under 300 ms.

## Open items
- Brand mark, colours, app icon, splash art.
- Real audio playback (expo-audio), lock-screen controls, downloads.
- PDF viewer and share sheet on Resources.
- List Builder (parked): needs per-person accounts before it can ship.
- Listening position saved on-device, since the shared login can't hold per-person progress.
- Push notifications for new audio and events.
- Admin surface for uploading content.
