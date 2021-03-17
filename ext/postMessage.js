var default_options = {
    "badge_count": "mentions",
    "draw_attention_on": "messages"
};
var port = chrome.runtime.connect({
    name: "discord-pwa"
});
parent.postMessage({
    dest: 'PWA',
    type: 'init'
}, '*');
chrome.storage.local.get(default_options, function (settings) {
    let script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', chrome.runtime.getURL('inject.js'));
    (document.body || document.head || document.documentElement).appendChild(script);
    var relayMsg = function (event) {
        switch (event.data.dest) {
        case 'background':
            port.postMessage(event.data, '*');
            break;
        case 'PWA':
            parent.postMessage(event.data, '*');
            break;
        case 'content':
            switch (event.data.type) {
            case 'discordLoaded':

                window.postMessage({
                    dest: 'iframe',
                    type: 'badgeCount',
                    payload: settings.badge_count
                }, '*');

                window.postMessage({
                    dest: 'iframe',
                    type: 'drawAttentionCount',
                    payload: settings.draw_attention_on
                }, '*');
                break;
            }
            break;
        }
    };
    window.addEventListener("message", relayMsg);
    port.onDisconnect.addListener(() => {
        window.removeEventListener("message", relayMsg);
        parent.postMessage({
            dest: 'PWA',
            type: 'refresh'
        }, '*');
    });
    port.onMessage.addListener(
        function (request, senderPort) {
            switch (request.dest) {
            case 'PWA':
                parent.postMessage(request, '*');
                break;
            case 'content':
                break;
            case 'iframe':
                window.postMessage(request, '*');
                break;
            }
        }
    );
    port.postMessage({
        dest: 'background',
        type: 'init'
    });
});
