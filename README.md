# discord-PWA
A failed attempt to wrap the discord web client in a Progressive Web Application. Modified from [https://github.com/jamesjohnson280/hello-pwa](https://github.com/jamesjohnson280/hello-pwa).
#### You can try it [here.](https://neverdecaf.github.io/discord-PWA/)

## Why this doesn't work
- Discord sets the X-Frame-Options header to "deny". This disallows the use of iframes, etc. to seamlessly embed the web client in a PWA.
- If a PWA redirects to a site outside of its scope, the address bar will always be shown.
- Any scope defined in the manifest must share the same domain as the source of the PWA.

### This tells us 2 things:
1. Discord could very quickly and easily turn their web application into a PWA.
2. For anyone on a separate domain to do so would involve circumventing security measures in some way.
