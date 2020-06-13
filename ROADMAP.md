# Roadmap
- Not really a roadmap, just a list of features and what will need to change to implement them.
- This is just a reminder for my future self of what will be possible when/if these things are added. [this](https://www.chromium.org/chrome-apps) may prove to be a useful resource.
- Any one of the numbered items would be enough to make the preceeding feature possible, all are not required.
## Parity with [discord-chrome-app](https://github.com/NeverDecaf/discord-chrome-app)
- Theme title bar to match appearance of desktop client
1. Chromium support for display: fullscreen in manifest.json *may* allow this.
2. Chromium support for [chrome.app.window](https://developer.chrome.com/apps/app_window) in PWAs would allow this through `frame: none` (this is how it is done in discord-chrome-app.
- Hide status bar
1. Both fixes for the title bar would incidentally fix this, though I'm not 100% sure `display: fullscreen` would.
- Run independently from browser extensions.
1. Already possible through the chrome flag `#enable-desktop-pwas-without-extensions`

## Function solely as a PWA (no extension required) [very unlikely]
- iframe workaround
1. Chromium would need to supply an api similar to webrequest for PWAs, specifically the ability to modify HTTP headers is needed.
2. Chromium should add something similar to a webview for PWAs, this would allow discord to be "embedded" without an iframe, the way discord-chrome-app does it.
- Desktop icon highlight
1. Chromium needs to allow something like [chrome.window's](https://developer.chrome.com/extensions/windows) drawAttention in PWAs.