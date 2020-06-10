# discord-PWA
A wrapper for the discord web client as a Progressive Web Application, for use with Chromium browsers. This is an effort to create a successor to [discord-chrome-app](https://github.com/NeverDecaf/discord-chrome-app) for when [chromium drops support for apps](https://blog.chromium.org/2020/01/moving-forward-from-chrome-apps.html). This project aims to provide a more persistent version of the web client, without the process monitor and other bloat included in the official desktop client.
## [Click here to Install](https://neverdecaf.github.io/discord-PWA/)
#### Differences from the web client
- Opens in a separate window that can be pinned and used independently from your browser.
- Shows taskbar notifications on mentions/messages (currently will highlight on new message and display badge with mention count)
#### Differences from [discord-chrome-app](https://github.com/NeverDecaf/discord-chrome-app)
- Shows number of unread mentions in a badge in your taskbar.
- Title bar cannot be themed to match the native discord client's. If Chromium allows borderless PWAs in the future this will be possible.
- Chromium's url tooltips will display in the bottom left when hovering over links/images.
#### Bugs:
- Unread count only includes messages after the PWA has started, meaning the icon will not flash/highlight upon startup.
- It is possible to open multiple windows at once, which causes undefined notification behaviour.
#### Notes:
- Badges will not work unless you enable the `#enable-experimental-web-platform-features` flag in `chrome://flags` though it should be standard soon™. Badges display the number of unread mentions, so you may not see any.
- Modified from [https://github.com/jamesjohnson280/hello-pwa](https://github.com/jamesjohnson280/hello-pwa).
