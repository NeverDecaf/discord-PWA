const RELAX_CSP = {
    condition: {
        urlFilter: "||discord.com"
    },
    action: {
        type: "modifyHeaders",
        responseHeaders: [{
            "header": "content-security-policy",
            "operation": "remove"
            // "value": "script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://*;"
        }]
    },
    id: 2,
    priority: 2
};
var default_options = {
    "custom_css": "",
    "custom_js": "",
    "custom_title": "DISCORD",
    "relax_CSP_styles": false
};

chrome.storage.local.get(default_options, function (items) {
    if (items.relax_CSP_styles)
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [2],
            addRules: [RELAX_CSP]
        })
});
chrome.storage.onChanged.addListener(
    (changes, areaName) => {
        if (areaName === 'local') {
            if ('relax_CSP_styles' in changes)
                if (changes['relax_CSP_styles'].newValue)
                    chrome.declarativeNetRequest.updateDynamicRules({
                        removeRuleIds: [2],
                        addRules: [RELAX_CSP]
                    })
            else
                chrome.declarativeNetRequest.updateDynamicRules({
                    removeRuleIds: [2]
                })
        }
    }
)

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
                            frameId: e.filter(el => el.parentFrameId == 0)[0] ? e.filter(el => el.parentFrameId == 0)[0].frameId : 0
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
                                frameId: e.filter(el => el.parentFrameId == 0)[0] ? e.filter(el => el.parentFrameId == 0)[0].frameId : 0
                            });
                            chrome.tabs.executeScript(tid, {
                                code: items.custom_js,
                                frameId: e.filter(el => el.parentFrameId == 0)[0] ? e.filter(el => el.parentFrameId == 0)[0].frameId : 0
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
