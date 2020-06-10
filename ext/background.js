const HEADERS_TO_STRIP_LOWERCASE = [
    'content-security-policy',
    'x-frame-options',
];

var flashingWindows = {};

chrome.webRequest.onHeadersReceived.addListener(
    details => ({
        responseHeaders: details.responseHeaders.filter(header =>
            !HEADERS_TO_STRIP_LOWERCASE.includes(header.name.toLowerCase()))
    }), {
        urls: ['https://discord.com/*']
    },
    ['blocking', 'responseHeaders']);

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.content == "drawAttention") {
            let drawRequested = request.unread > 0;
            chrome.windows.get(sender.tab.windowId, (w) => {
                if (!w.focused) {
                    if (!(sender.tab.windowId in flashingWindows) || !flashingWindows[sender.tab.windowId]) {
                        if (drawRequested) {
                            chrome.windows.update(sender.tab.windowId, {
                                drawAttention: drawRequested
                            });
                            flashingWindows[sender.tab.windowId] = true;
                        }
                    } else if (!drawRequested) {
                        // note that this does not actually work due to a bug in Chromium.
                        chrome.windows.update(sender.tab.windowId, {
                            drawAttention: drawRequested
                        });
                        flashingWindows[sender.tab.windowId] = false;
                    }
                } else {
                    flashingWindows[sender.tab.windowId] = false;
                    chrome.windows.update(sender.tab.windowId, {
                        drawAttention: false
                    });
                }
            });
        }
    });
