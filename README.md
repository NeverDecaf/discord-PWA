# discord-PWA
A (failed) attempt to wrap the discord web client in a Progressive Web Application, though still a WIP so there may be hope yet. This is an effort to create a successor to [discord-chrome-app](https://github.com/NeverDecaf/discord-chrome-app) for when [chromium drops support for apps](https://blog.chromium.org/2020/01/moving-forward-from-chrome-apps.html). (Modified from [https://github.com/jamesjohnson280/hello-pwa](https://github.com/jamesjohnson280/hello-pwa).)
#### You can try it [here.](https://neverdecaf.github.io/discord-PWA/)

## Why this doesn't work
- Discord sets the X-Frame-Options header to "deny". This disallows the use of iframes, etc. to seamlessly embed the web client in a PWA.
- If a PWA redirects to a site outside of its scope, the address bar will always be shown.
- Any scope defined in the manifest must share the same domain as the source of the PWA.

### This tells us 2 things:
1. Discord could very quickly and easily turn their web application into a PWA.
2. For anyone on a separate domain to do so would involve circumventing security measures in some way.

#### Notes:
- It is actually possible to use an iframe if you modify the X-Frame-Options and Content-Security-Policy headers with an extension like [this one](https://github.com/guilryder/chrome-extensions/tree/master/xframe_ignore).
- However, cross-origin javascript access will still be impossible, meaning you can access discord in an iframe, but will be unable to receive any notifications from it, making it not much different from just opening it in a browser tab.
- This technique of using an extension alongside a PWA might actually make this possible in the end. A PWA might not be able to interfere with discord's js but an extension surely can.
