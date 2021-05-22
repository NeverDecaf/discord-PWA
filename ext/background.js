function createCSPRule() {
    fetch('https://discord.com/app').then(function (response) {
        let csp = (response.headers.get('Content-Security-Policy'));
        let header = csp.replace(/connect-src ([^;]+);/, "connect-src $1 https://*;");
        header = header.replace(/style-src ([^;]+);/, "style-src $1 https://*;");
        header = header.replace(/img-src ([^;]+);/, "img-src $1 https://* data:*;");
        header = header.replace(/'nonce-[^']*'/, "");
        return {
            condition: {
                urlFilter: "||discord.com",
                resourceTypes: ["sub_frame"]
            },
            action: {
                type: "modifyHeaders",
                responseHeaders: [{
                    "header": "content-security-policy",
                    "operation": "set",
                    "value": header
                }]
            },
            id: 2,
            priority: 2
        };
    }).catch((err) => {
        console.error('Failed to fetch CSP header from discord.com, will not modify.');
        return {}
    }).then((RELAX_CSP) => {
        chrome.storage.local.get(default_options, function (items) {
            if (items.relax_CSP_styles)
                chrome.declarativeNetRequest.updateDynamicRules({
                    removeRuleIds: [2],
                    addRules: [RELAX_CSP]
                })
            else
                chrome.declarativeNetRequest.updateDynamicRules({
                    removeRuleIds: [2]
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
    })
}
createCSPRule();
var default_options = {
    "custom_css": "",
    "custom_js": "",
    "custom_title": "Discord",
    "relax_CSP_styles": false
};

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        switch (request.dest) {
        case 'background':
            chrome.webNavigation.getAllFrames({
                tabId: sender.tab.id
            }, (allFrames) => {
                var discordFrame = allFrames.filter(el => el.parentFrameId == 0)[0] ? allFrames.filter(el => el.parentFrameId == 0)[0].frameId : 0
                switch (request.type) {
                case 'drawAttention':
                    chrome.windows.update(sender.tab.windowId, {
                        drawAttention: request.payload > 0
                    });
                    break;
                case 'clientcss':
                    chrome.scripting.insertCSS({
                        css: request.payload,
                        target: {
                            tabId: sender.tab.id,
                            frameIds: [discordFrame]
                        }
                    });
                    break;
                case 'init':
                    createCSPRule();
                    chrome.tabs.sendMessage(sender.tab.id, {
                        dest: 'PWA',
                        type: 'clientcss'
                    }, {
                        frameId: discordFrame
                    });
                    chrome.storage.local.get(default_options, function (items) {
                        chrome.tabs.sendMessage(sender.tab.id, {
                            dest: 'PWA',
                            type: 'customTitle',
                            payload: items.custom_title
                        }, {
                            frameId: discordFrame
                        });
                        chrome.tabs.sendMessage(sender.tab.id, {
                            dest: 'iframe',
                            type: 'injectcss',
                            payload: items.custom_css
                        }, {
                            frameId: discordFrame
                        });
                        chrome.tabs.sendMessage(sender.tab.id, {
                            dest: 'iframe',
                            type: 'injectcss',
                            payload: items.custom_css
                        }, {
                            frameId: discordFrame
                        });
                        chrome.tabs.sendMessage(sender.tab.id, {
                            dest: 'iframe',
                            type: 'injectscript',
                            payload: items.custom_js
                        }, {
                            frameId: discordFrame
                        });
                    });
                    break;
                case 'discordLoaded':
                    break;
                }
            });
            break;
        }
    }
);