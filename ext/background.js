const HEADERS_TO_STRIP_LOWERCASE = [
    'content-security-policy',
    'x-frame-options',
];

var currentAttentionState = false;

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
            currentAttentionState = request.unread > 0;
            chrome.windows.update(sender.tab.windowId, {
                drawAttention: currentAttentionState
            });
        } else if (request.content == "interval")
            chrome.windows.update(sender.tab.windowId, {
                drawAttention: currentAttentionState
            });
    }
);