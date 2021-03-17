var default_options = {
    "badge_count": "mentions",
    "draw_attention_on": "messages"
};
parent.postMessage({
    dest: 'PWA',
    type: 'init'
}, '*');

function extMessage(data) {
    try {
        chrome.runtime.sendMessage(data);
    } catch (e) {
        if (e.message == 'Extension context invalidated.')
            parent.postMessage({
                dest: 'PWA',
                type: 'refresh'
            }, '*');
    }
}
chrome.storage.local.get(default_options, function (settings) {
    let script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', chrome.runtime.getURL('inject.js'));
    (document.body || document.head || document.documentElement).appendChild(script);
    var relayMsg = function (event) {
        switch (event.data.dest) {
        case 'background':
            extMessage(event.data);
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
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
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
    extMessage({
        dest: 'background',
        type: 'init'
    });
});