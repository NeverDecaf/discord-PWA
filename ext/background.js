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
var default_options = {
    "custom_css": "",
    "custom_js": "",
    "custom_title": "DISCORD",
    "relax_CSP_styles": false
};
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
                        chrome.scripting.insertCSS({
                            css: request.payload,
                            target: {
                                tabId: tid,
                                frameIds: [e.filter(el => el.parentFrameId == 0)[0] ? e.filter(el => el.parentFrameId == 0)[0].frameId : 0]
                            }
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
                            port.postMessage({
                                dest: 'iframe',
                                type: 'injectcss',
                                payload: items.custom_css
                            });
                            port.postMessage({
                                dest: 'iframe',
                                type: 'injectscript',
                                payload: items.custom_js
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
