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

chrome.runtime.onConnect.addListener(function (port) {
    var wid = port.sender.tab.windowId;
    port.onMessage.addListener(
        function (request, senderPort) {
            // console.log('drawattention request: ' + request)
            if (request.content == "drawAttention") {
                currentAttentionState = request.unread > 0;
                chrome.windows.update(wid, {
                    drawAttention: currentAttentionState
                });
            } else if (request.content == "interval")
                chrome.windows.update(wid, {
                    drawAttention: currentAttentionState
                });
        }
    );
});