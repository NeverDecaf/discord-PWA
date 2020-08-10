# discord-PWA
A wrapper for the discord web client as a Progressive Web Application, for use with Chromium browsers. This is an effort to create a successor to [discord-chrome-app](https://github.com/NeverDecaf/discord-chrome-app) for when [chromium drops support for apps](https://blog.chromium.org/2020/01/moving-forward-from-chrome-apps.html). This project aims to provide a more persistent version of the web client, without the process monitor and other bloat included in the official desktop client.
## [Click here to Install](https://neverdecaf.github.io/discord-PWA/)
#### Differences from the web client
- Opens in a separate window that can be pinned and used independently from your browser.
- Shows taskbar notifications on mentions/messages (highlight on new message and display badge with mention count -- can be customized in extension options)
#### Differences from [discord-chrome-app](https://github.com/NeverDecaf/discord-chrome-app)
- Shows number of unread mentions in a badge in your taskbar.
- Title bar cannot be themed to match the native discord client's. If Chromium allows borderless PWAs in the future this will be possible (by supporting "display":"fullscreen").
- Chromium's url tooltips will display in the bottom left when hovering over links/images.
- Your extensions can access/modify the Discord iframe.
#### To install the accompanying extension
1. Download [the crx file](https://neverdecaf.github.io/discord-PWA/Discord-PWA-Bypass.crx).
2. Navigate to `chrome://extensions/`
3. Enable `Developer mode` (toggle/checkbox in top right corner, may vary depending on version)
4. Drag and drop the .crx file onto the `chrome://extensions/` page to install
5. To launch the app visit `chrome://apps/` (after first installing it from the link above)
6. After lauching you can pin the app to your taskbar (on windows) and it will essentially function as a stand-alone program
#### If drag-and-drop install fails, try this workaround
1. Download the .crx and extract its contents to a folder
2. Visit chrome://extensions/ and turn on developer mode (toggle in top right)
3. Click `Load unpacked` and select the directory you extracted the crx to.
#### If discord iframe does not load (despite having the extension installed)
- Remove and re-install the extension. This happens when multiple extensions try to modify headers for a page; the last installed extension has priority while others are blocked access.
#### Bugs
- Unread count only includes messages after the PWA has started, meaning the icon will not flash/highlight upon startup.
- It is possible to open multiple windows at once, which causes undefined notification behaviour.
- The "extension is required" warning may appear even if discord successfully loads, simply refresh the PWA with F5 or ctrl+r to fix this.
#### Notes
- Badges will not work unless you enable the `#enable-experimental-web-platform-features` flag in `chrome://flags` though it should be standard soon™. Badges display the number of unread mentions, so you may not see any.
- Taskbar behaviour is customizable in the [extension's options](chrome-extension://edfpalahildnikdjdnmmoekoncglnblh/options.html) `chrome-extension://edfpalahildnikdjdnmmoekoncglnblh/options.html`.
- Code modified from [https://github.com/jamesjohnson280/hello-pwa](https://github.com/jamesjohnson280/hello-pwa), [BetterDiscord](https://github.com/rauenzi/BetterDiscordApp) code was also used/referenced.
