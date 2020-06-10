const HEADERS_TO_STRIP_LOWERCASE = [
    'content-security-policy',
    'x-frame-options',
];

var flashingWindows = {};
var flasher = null
chrome.webRequest.onHeadersReceived.addListener(
    details => ({
        responseHeaders: details.responseHeaders.filter(header =>
            !HEADERS_TO_STRIP_LOWERCASE.includes(header.name.toLowerCase()))
    }), {
        urls: ['https://discord.com/*']
    },
    ['blocking', 'responseHeaders']);

function flashWindow(wid, state) {
    chrome.windows.update(wid, {
        drawAttention: state
    });
}
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.content == "drawAttention") {
            // console.log(flashingWindows);
            let drawRequested = request.unread > 0;
            chrome.windows.get(sender.tab.windowId, (w) => {
                // console.log('got msg with ' + request.unread + ' and focus: ' + w.focused);
                if (!w.focused) {
                    if (!(sender.tab.windowId in flashingWindows) || !flashingWindows[sender.tab.windowId]) {
                        if (drawRequested) {
                            // console.log('initiating flash');
                            flashWindow(sender.tab.windowId, drawRequested);
                            flasher = setInterval(() => flashWindow(sender.tab.windowId, drawRequested), 1000);
                            flashingWindows[sender.tab.windowId] = true;
                        }
                    } else if (!drawRequested) {
                        // note that this does not actually work due to a bug in Chromium.
                        flashWindow(sender.tab.windowId, false);
                        clearInterval(flasher);
                        flashingWindows[sender.tab.windowId] = false;
                    }
                } else {
                    flashingWindows[sender.tab.windowId] = false;
                    clearInterval(flasher);
                }
            });
        }
    });