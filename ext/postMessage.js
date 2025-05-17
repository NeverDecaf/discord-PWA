var default_options = {
    badge_count: "mentions",
    draw_attention_on: "messages",
    wco_integration: true,
};

function extMessage(data) {
    try {
        chrome.runtime.sendMessage(data);
    } catch (e) {
        if (e.message == "Extension context invalidated.")
            parent.postMessage(
                {
                    dest: "PWA",
                    type: "refresh",
                },
                "*",
            );
    }
}
chrome.storage.local.get(default_options, function (settings) {
    parent.postMessage(
        {
            dest: "PWA",
            type: "init",
            payload: settings,
        },
        "*",
    );
    const head =
        document.head ||
        document.getElementsByTagName("head")[0] ||
        document.documentElement;
    const wm = document.createElement("script");
    wm.setAttribute("type", "module");
    // must load webpackmodules first as it's used by inject.js
    wm.src = "https://neverdecaf.github.io/discord-PWA/webpackmodules.js";
    wm.onload = () => {
        const script = document.createElement("script");
        script.setAttribute("type", "module");
        script.setAttribute("src", chrome.runtime.getURL("inject.js"));
        head.insertBefore(script, head.lastChild);
    };
    head.insertBefore(wm, head.lastChild);
    var relayMsg = function (event) {
        switch (event.data.dest) {
            case "background":
                extMessage(event.data);
                break;
            case "PWA":
                parent.postMessage(event.data, "*");
                break;
            case "content":
                switch (event.data.type) {
                    case "discordLoaded":
                        window.postMessage(
                            {
                                dest: "iframe",
                                type: "badgeCount",
                                payload: settings.badge_count,
                            },
                            "*",
                        );
                        window.postMessage(
                            {
                                dest: "iframe",
                                type: "drawAttentionCount",
                                payload: settings.draw_attention_on,
                            },
                            "*",
                        );
                        window.postMessage(
                            {
                                dest: "iframe",
                                type: "init",
                                payload: {
                                    wco_integration: settings.wco_integration,
                                },
                            },
                            "*",
                        );
                        extMessage({
                            dest: "background",
                            type: "init",
                            payload: {
                                wco_integration: settings.wco_integration,
                            },
                        });
                        break;
                }
                break;
        }
    };
    window.addEventListener("message", relayMsg);
    chrome.runtime.onMessage.addListener(function (
        request,
        sender,
        sendResponse,
    ) {
        switch (request.dest) {
            case "PWA":
                parent.postMessage(request, "*");
                break;
            case "content":
                break;
            case "iframe":
                window.postMessage(request, "*");
                break;
        }
    });
});
