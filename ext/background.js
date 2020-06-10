const HEADERS_TO_STRIP_LOWERCASE = [
    'content-security-policy',
    'x-frame-options',
];

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
            chrome.windows.update(sender.tab.windowId, {
                drawAttention: request.unread > 0
            });
        }
    });