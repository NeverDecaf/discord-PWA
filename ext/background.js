// need atomic data storage, this will expire but should be good enough.
const fakeLocalStorage = {};
function createCSPRule() {
    fetch("https://discord.com/app")
        .then(function (response) {
            let csp = response.headers.get("Content-Security-Policy");
            let header = csp.replace(
                /connect-src ([^;]+);/,
                "connect-src $1 https://*;"
            );
            header = header.replace(
                /style-src ([^;]+);/,
                "style-src $1 https://*;"
            );
            header = header.replace(
                /img-src ([^;]+);/,
                "img-src $1 https://* data:*;"
            );
            header = header.replace(/'nonce-[^']*'/, "");
            return {
                condition: {
                    urlFilter: "||discord.com",
                    resourceTypes: ["sub_frame"],
                },
                action: {
                    type: "modifyHeaders",
                    responseHeaders: [
                        {
                            header: "content-security-policy",
                            operation: "set",
                            value: header,
                        },
                    ],
                },
                id: 2,
                priority: 2,
            };
        })
        .catch((err) => {
            console.error(
                "Failed to fetch CSP header from discord.com, will not modify."
            );
            return {};
        })
        .then((RELAX_CSP) => {
            chrome.storage.local.get(default_options, function (items) {
                if (items.relax_CSP_styles)
                    chrome.declarativeNetRequest.updateDynamicRules({
                        removeRuleIds: [2],
                        addRules: [RELAX_CSP],
                    });
                else
                    chrome.declarativeNetRequest.updateDynamicRules({
                        removeRuleIds: [2],
                    });
            });
            chrome.storage.onChanged.addListener((changes, areaName) => {
                if (areaName === "local") {
                    if ("relax_CSP_styles" in changes)
                        if (changes["relax_CSP_styles"].newValue)
                            chrome.declarativeNetRequest.updateDynamicRules({
                                removeRuleIds: [2],
                                addRules: [RELAX_CSP],
                            });
                        else
                            chrome.declarativeNetRequest.updateDynamicRules({
                                removeRuleIds: [2],
                            });
                }
            });
        });
}
createCSPRule();
var default_options = {
    custom_css: "",
    custom_js: "",
    custom_title: "Discord",
    relax_CSP_styles: false,
};
const drawAttention_options = {
    drawAttention: false,
    windowId: chrome.windows.WINDOW_ID_NONE,
    toggledWindows: {},
};
chrome.runtime.onStartup.addListener(() =>
    chrome.storage.local.set(drawAttention_options)
);
chrome.storage.local.get(drawAttention_options, (opts) => {
    fakeLocalStorage.toggledWindows = opts.toggledWindows;
});
chrome.windows.onCreated.addListener((window) => {
    fakeLocalStorage.toggledWindows[window.id] = false;
    chrome.storage.local.set({
        toggledWindows: fakeLocalStorage.toggledWindows,
    });
});
chrome.windows.onRemoved.addListener((id) => {
    delete fakeLocalStorage.toggledWindows[id];
    chrome.storage.local.set({
        windowId: chrome.windows.WINDOW_ID_NONE,
        toggledWindows: fakeLocalStorage.toggledWindows,
    });
});
const updateAttention = (id) => {
    chrome.storage.local.get(drawAttention_options, (data) => {
        console.log(data.windowId, id);
        if (
            data.windowId != chrome.windows.WINDOW_ID_NONE &&
            id != data.windowId
        ) {
            // send a double request to toggle on.
            if (!fakeLocalStorage.toggledWindows[data.windowId]) {
                // first time, do one request only.
                fakeLocalStorage.toggledWindows[data.windowId] = true;
                chrome.windows.update(data.windowId, {
                    drawAttention: data.drawAttention,
                });
            } else {
                chrome.windows.update(
                    data.windowId,
                    {
                        drawAttention: false,
                    },
                    (x) =>
                        chrome.windows.update(data.windowId, {
                            drawAttention: data.drawAttention,
                        })
                );
            }
            chrome.storage.local.set({
                toggledWindows: fakeLocalStorage.toggledWindows,
            });
        }
    });
};
// onFocusChanged is incredibly broken [TOo5q4NLCpk], rely on discord's js focus lost detection instead.
// chrome.windows.onFocusChanged.addListener((id) => {
//     updateAttention(id);
// });
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.dest) {
        case "background":
            chrome.webNavigation.getAllFrames(
                {
                    tabId: sender.tab.id,
                },
                (allFrames) => {
                    var discordFrame = allFrames.filter(
                        (el) => el.parentFrameId == 0
                    )[0]
                        ? allFrames.filter((el) => el.parentFrameId == 0)[0]
                              .frameId
                        : 0;
                    switch (request.type) {
                        case "drawAttention":
                            chrome.storage.local.set(
                                {
                                    drawAttention: request.payload > 0,
                                    windowId: sender.tab.windowId,
                                },
                                () =>
                                    updateAttention(
                                        chrome.windows.WINDOW_ID_NONE
                                    )
                            );
                            break;
                        case "clientcss":
                            chrome.scripting.insertCSS({
                                css: request.payload,
                                target: {
                                    tabId: sender.tab.id,
                                    frameIds: [discordFrame],
                                },
                            });
                            break;
                        case "init":
                            createCSPRule();
                            chrome.tabs.sendMessage(
                                sender.tab.id,
                                {
                                    dest: "PWA",
                                    type: "clientcss",
                                },
                                {
                                    frameId: discordFrame,
                                }
                            );
                            chrome.storage.local.get(
                                default_options,
                                function (items) {
                                    chrome.tabs.sendMessage(
                                        sender.tab.id,
                                        {
                                            dest: "PWA",
                                            type: "customTitle",
                                            payload: items.custom_title,
                                        },
                                        {
                                            frameId: discordFrame,
                                        }
                                    );
                                    chrome.tabs.sendMessage(
                                        sender.tab.id,
                                        {
                                            dest: "iframe",
                                            type: "injectcss",
                                            payload: items.custom_css,
                                        },
                                        {
                                            frameId: discordFrame,
                                        }
                                    );
                                    chrome.tabs.sendMessage(
                                        sender.tab.id,
                                        {
                                            dest: "iframe",
                                            type: "injectscript",
                                            payload: items.custom_js,
                                        },
                                        {
                                            frameId: discordFrame,
                                        }
                                    );
                                }
                            );
                            break;
                        case "discordLoaded":
                            break;
                    }
                }
            );
            break;
    }
});
