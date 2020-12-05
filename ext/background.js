const HEADERS_TO_STRIP_LOWERCASE = [
    'x-frame-options'
];
var cacheName = 'discord-pwa';
var default_options = {
    "custom_css": "",
    "custom_js": "",
    "custom_title": "DISCORD",
    "relax_CSP_styles": false
};
var relax_CSP_styles = false;

chrome.storage.local.get(default_options, function (items) {
    relax_CSP_styles = items.relax_CSP_styles
});
chrome.storage.onChanged.addListener(
    (changes, areaName) => {
        if (areaName === 'local') {
            if ('relax_CSP_styles' in changes)
                relax_CSP_styles = changes['relax_CSP_styles'].newValue;
        }
    }
)

chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
        if (relax_CSP_styles) {
            for (var i = 0; i < details.responseHeaders.length; i++) {
                if (details.responseHeaders[i].name.toLowerCase() === "content-security-policy") {
                    let csp = details.responseHeaders[i].value;
                    let header = csp.replace(/connect-src ([^;]+);/, "connect-src $1 https://*;");
                    header = header.replace(/style-src ([^;]+);/, "style-src $1 https://*;");
                    header = header.replace(/img-src ([^;]+);/, "img-src $1 https://*;");
                    details.responseHeaders[i].value = header;
                    break;
                }
            }
        }
        return {
            responseHeaders: details.responseHeaders.filter(header =>
                !HEADERS_TO_STRIP_LOWERCASE.includes(header.name.toLowerCase()))
        }
    }, {
        urls: ['https://discord.com/*']
    },
    ['blocking', 'responseHeaders']);

chrome.runtime.onConnect.addListener(function (port) {
    var wid = port.sender.tab.windowId;
    var tid = port.sender.tab.id;
    var currentAttentionState = false;
    port.onMessage.addListener(
        function (request, senderPort) {
            switch (request.dest) {
            case 'background':
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
                        type: 'clientcss'
                    });
                    chrome.storage.local.get(default_options, function (items) {
                        port.postMessage({
                            dest: 'PWA',
                            type: 'customTitle',
                            payload: items.custom_title
                        });
                        chrome.webNavigation.getAllFrames({
                            tabId: tid
                        }, (e) => {
                            chrome.tabs.executeScript(tid, {
                                code: "let style = document.createElement('style'); style.textContent = `" + items.custom_css + "`; document.head.append(style);",
                                frameId: e.filter(el => el.parentFrameId == 0)[0].frameId
                            });
                            chrome.tabs.executeScript(tid, {
                                code: items.custom_js,
                                frameId: e.filter(el => el.parentFrameId == 0)[0].frameId
                            });
                        });
                    });
                    break;
                case 'discordLoaded':
                    break;
                }
                break;
            }
        }
    );
});