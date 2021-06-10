# discord-PWA
A wrapper for the Discord web client as a Progressive Web Application, for use with Chromium based browsers. This project aims to provide a more persistent version of the web client, without the process monitor and other bloat included in the official desktop client.
## [Click here to Install](https://neverdecaf.github.io/discord-PWA/)
#### Differences from the web client
- Opens in a separate window that can be pinned to your taskbar and used/launched independently* from your browser.
- Highlight taskbar icon when you have new messages, show unread mention count in a badge (you can customize this in options)
- Extensions can modify the discord page, meaning you can use Tampermonkey/Stylus, proxy extensions, etc. with Discord.
- Supports injection of custom CSS or Javascript via the extension's options if you don't want to use Tampermonkey/Stylus.
#### To install the accompanying extension
###### Note: You cannot use extensions from outside of the Chrome Web Store on Google Chrome by design. Unless someone decides to upload this to the Chrome Web Store, consider this extension incompatible with Google Chrome. Chromium and its derivatives or Chrome Canary, etc. should all work, though you may need to use the workaround below.
1. Download [the crx file](https://neverdecaf.github.io/discord-PWA/Discord-PWA-Bypass.crx). (right click > `Save link as...`)
2. Navigate to `chrome://extensions/`
3. Enable `Developer mode` (toggle/checkbox in top right corner, may vary depending on version)
4. Drag and drop the .crx file onto the `chrome://extensions/` page to install
5. To launch the app visit `chrome://apps/` (after first installing it from the link above)
6. After lauching you can pin the app to your taskbar (on windows) and it will essentially function as a stand-alone program
#### If drag-and-drop install fails, try this workaround
1. Download [the crx file](https://neverdecaf.github.io/discord-PWA/Discord-PWA-Bypass.crx) and extract its contents. ([Download the directory from source](https://neverdecaf.github.io/discord-PWA/ext.zip) if your browser blocks CRX files.)
2. Visit chrome://extensions/ and turn on developer mode (toggle in top right)
3. Click `Load unpacked` and select the directory you extracted the crx to.
#### If discord iframe does not load (despite having the extension installed)
- **Remove** and re-install the extension. This happens when multiple extensions try to modify headers for a page; the last installed extension has priority while others are blocked access.
#### Bugs
- Unread count only includes messages after the PWA has started, meaning the icon will not flash/highlight upon startup.
- It is possible to open multiple windows at once, which causes undefined notification behaviour.
#### Notes
- To hide the status bar, set the flag `chrome://flags/#enable-desktop-pwas-remove-status-bar` to `Enabled`. (This will probably become the default in the future.)
- Taskbar behaviour is customizable in the [extension's options](chrome-extension://edfpalahildnikdjdnmmoekoncglnblh/options.html) `chrome-extension://edfpalahildnikdjdnmmoekoncglnblh/options.html`.
- Code modified from [https://github.com/jamesjohnson280/hello-pwa](https://github.com/jamesjohnson280/hello-pwa), [BetterDiscord](https://github.com/rauenzi/BetterDiscordApp) code was also used/referenced.
