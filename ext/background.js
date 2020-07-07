const HEADERS_TO_STRIP_LOWERCASE = [
    'content-security-policy',
    'x-frame-options',
];

var cacheName = 'discord-pwa';
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
    var tid = port.sender.tab.id;
    var currentAttentionState = false;
    port.onMessage.addListener(
        function (request, senderPort) {
            // console.log('drawattention request: ' + request.unread + ' current: ' + currentAttentionState + ' window: ' + wid + ' content: ' + request.content)
            if (request.content == "drawAttention") {
                currentAttentionState = request.unread > 0;
                chrome.windows.update(wid, {
                    drawAttention: currentAttentionState
                });
            } else if (request.content == "update")
                chrome.windows.update(wid, {
                    drawAttention: currentAttentionState
                });
            else if (request.content == "clientcss")
                chrome.webNavigation.getAllFrames({
                    tabId: tid
                }, (e) => {
                    chrome.tabs.insertCSS(tid, {
                        code: request.css,
                        frameId: e.filter(el => el.parentFrameId==0)[0].frameId
                    });
                });
        }
    );
    port.postMessage({
        name: 'version',
        data: chrome.runtime.getManifest().version
    });
    port.postMessage({
        name: 'clientcss',
        data: 1
    });
});