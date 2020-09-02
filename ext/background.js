const HEADERS_TO_STRIP_LOWERCASE = [
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
            switch (request.type) {
            case 'drawAttention':
                currentAttentionState = request.payload > 0;
                chrome.windows.update(wid, {
                    drawAttention: currentAttentionState
                });
                break;
            case 'clientcss':
                chrome.webNavigation.getAllFrames({
                    tabId: tid
                }, (e) => {
                    chrome.tabs.insertCSS(tid, {
                        code: request.payload,
                        frameId: e.filter(el => el.parentFrameId == 0)[0].frameId
                    });
                });
                break;
            case 'init':
                port.postMessage({
                    dest: 'PWA',
                    type: 'extversion',
                    payload: chrome.runtime.getManifest().version
                });
                port.postMessage({
                    dest: 'PWA',
                    type: 'clientcss'
                });
                break;
            }
        }
    );
});