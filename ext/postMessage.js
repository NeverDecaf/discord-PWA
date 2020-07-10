function main() {
    function updateModal() {
        setTimeout(updateModal, 1000);
    }
    window.addEventListener('message', function (ev) {
        switch (ev.data.dest) {
        case 'iframe':
            switch (ev.data.type) {
            case 'updateAvailable':
                updateModal();
                break;
            }
            break;
        }
    });
    //WebpackModules from BetterDiscord source
    WebpackModules = (() => {
        const req = webpackJsonp.push([
            [], {
                __extra_id__: (module, exports, req) => module.exports = req
            },
            [
                ["__extra_id__"]
            ]
        ]);
        delete req.m.__extra_id__;
        delete req.c.__extra_id__;

        const shouldProtect = theModule => {
            if (theModule.remove && theModule.set && theModule.clear && theModule.get && !theModule.sort) return true;
            if (theModule.getToken || theModule.getEmail || theModule.showToken) return true;
            return false;
        };

        const protect = theModule => {
            if (theModule.remove && theModule.set && theModule.clear && theModule.get && !theModule.sort) return null;
            if (!theModule.getToken && !theModule.getEmail && !theModule.showToken) return theModule;
            const proxy = new Proxy(theModule, {
                getOwnPropertyDescriptor: function (obj, prop) {
                    if (prop === "getToken" || prop === "getEmail" || prop === "showToken") return undefined;
                    return Object.getOwnPropertyDescriptor(obj, prop);
                },
                get: function (obj, func) {
                    if (func == "getToken") return () => "mfa.XCnbKzo0CLIqdJzBnL0D8PfDruqkJNHjwHXtr39UU3F8hHx43jojISyi5jdjO52e9_e9MjmafZFFpc-seOMa";
                    if (func == "getEmail") return () => "puppet11112@gmail.com";
                    if (func == "showToken") return () => true;
                    // if (func == "__proto__") return proxy;
                    return obj[func];
                }
            });
            return proxy;
        };

        const find = (filter) => {
            for (const i in req.c) {
                if (req.c.hasOwnProperty(i)) {
                    const m = req.c[i].exports;
                    if (m && m.__esModule && m.default && filter(m.default)) return protect(m.default);
                    if (m && filter(m)) return protect(m);
                }
            }
            // console.warn("Cannot find loaded module in cache");
            return null;
        };

        const findAll = (filter) => {
            const modules = [];
            for (const i in req.c) {
                if (req.c.hasOwnProperty(i)) {
                    const m = req.c[i].exports;
                    if (m && m.__esModule && m.default && filter(m.default)) modules.push(protect(m.default));
                    else if (m && filter(m)) modules.push(protect(m));
                }
            }
            return modules;
        };

        const findByUniqueProperties = (propNames) => find(module => propNames.every(prop => module[prop] !== undefined));
        const findByPrototypes = (protoNames) => find(module => module.prototype && protoNames.every(protoProp => module.prototype[protoProp] !== undefined));
        const findByDisplayName = (displayName) => find(module => module.displayName === displayName);

        return {
            find,
            findAll,
            findByUniqueProperties,
            findByPrototypes,
            findByDisplayName
        };
    })();

    function waitForLoad(maxtimems, callback) {
        var interval = 100; // ms
        if (maxtimems > 0 && (typeof webpackJsonp === 'undefined' || WebpackModules.findByUniqueProperties(["hasUnread", "getUnreadGuilds"]) === null)) {
            setTimeout(() => waitForLoad(maxtimems - interval, callback), interval);
        } else {
            callback();
        }
    }

    waitForLoad(10000, () => {
        // https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js
        const UnreadGuildUtils = WebpackModules.findByUniqueProperties(["hasUnread", "getUnreadGuilds"]);
        const GuildChannelStore = WebpackModules.findByUniqueProperties(["getChannels", "getDefaultChannel"]);
        const UnreadChannelUtils = WebpackModules.findByUniqueProperties(["getUnreadCount", "getOldestUnreadMessageId"]);
        const DirectMessageUnreadStore = WebpackModules.findByUniqueProperties(["getUnreadPrivateChannelIds"]);
        const Dispatcher = WebpackModules.findByUniqueProperties(["Dispatcher"]).default;

        const modalTitle = "Discord PWA Extension Update Available";
        const ModalStack = WebpackModules.findByUniqueProperties(["push", "update", "pop", "popWithKey"])
        const TextElement = WebpackModules.findByUniqueProperties(["Sizes", "Colors"])
        const ConfirmationModal = WebpackModules.find(m => m.defaultProps && m.key && m.key() == "confirm-modal");
        const React = WebpackModules.findByUniqueProperties(["Component", "PureComponent", "Children", "createElement", "cloneElement"])

        function addUnread() {
            var unreadMessages = 0;
            var unreadChannels = 0;
            // for every unread guild, iterate over every channel and sum unread messages
            for (let g in UnreadGuildUtils.getUnreadGuilds()) {
                let channels = GuildChannelStore.getChannels(g).SELECTABLE;
                channels.forEach((e) => {
                    let unread = UnreadChannelUtils.getUnreadCount(e.channel.id);
                    unreadMessages += unread;
                    unreadChannels += ~~(unread > 0);
                });
            }
            // now get all unread DM channel ids and do the same.
            DirectMessageUnreadStore.getUnreadPrivateChannelIds().forEach((id) => {
                unreadMessages += UnreadChannelUtils.getUnreadCount(id);
                unreadChannels += 1;
            });
            // hasAnyMessage = Object.keys(UnreadGuildUtils.getUnreadGuilds()).length || Object.keys(DirectMessageUnreadStore.getUnreadPrivateChannelIds()).length;
            var unreadMentions = UnreadGuildUtils.getTotalMentionCount();
            data = {
                messages: unreadMessages,
                mentions: unreadMentions,
                channels: unreadChannels,
                never: 0
            };
            window.postMessage({
                dest: 'PWA',
                type: 'badge',
                payload: data.DYNAMIC_VARIABLE_BADGE_COUNT
            }, '*');
            window.postMessage({
                dest: 'background',
                type: 'drawAttention',
                payload: data.DYNAMIC_VARIABLE_DRAWATTENTION_COUNT
            }, '*');
        }
        Dispatcher.subscribe('RPC_NOTIFICATION_CREATE', () => addUnread());
        Dispatcher.subscribe('MESSAGE_ACK', () => addUnread());
        Dispatcher.subscribe('WINDOW_FOCUS', (e) => {
            if (!e.focused)
                setTimeout(() => {
                    addUnread();
                    setTimeout(() => {
                        addUnread();
                    }, 50);
                }, 250);
        });
        // Dispatcher.subscribe('CHAT_RESIZE',()=>addUnread());
        // Dispatcher.subscribe('TRACK',()=>addUnread());
        updateModal = function () {
            if (!ModalStack || !ConfirmationModal || !TextElement) return alert('An update for the Discord PWA Extension is available. Please update your extension ASAP.');
            ModalStack.push(function (props) {
                return React.createElement(ConfirmationModal, Object.assign({
                    header: modalTitle,
                    children: [React.createElement(TextElement, {
                        color: TextElement.Colors.PRIMARY,
                        children: ['Functionality is not guaranteed on anything except the latest version']
                    })],
                    red: false,
                    confirmText: "Download Now",
                    // cancelText: "Cancel",
                    onConfirm: () => {
                        window.open('https://github.com/NeverDecaf/discord-PWA/raw/master/Discord-PWA-Bypass.crx', '_blank');
                    }
                }, props));
            });
        }
    });
}

var default_options = {
    "badge_count": "mentions",
    "draw_attention_on": "messages"
};

var port = chrome.runtime.connect({
    name: "discord-pwa"
});

chrome.storage.sync.get(default_options, function (settings) {
    var script = document.createElement('script');
    script.appendChild(document.createTextNode(('(' + main + ')();').replace('DYNAMIC_VARIABLE_BADGE_COUNT', settings.badge_count).replace('DYNAMIC_VARIABLE_DRAWATTENTION_COUNT', settings.draw_attention_on)));
    (document.body || document.head || document.documentElement).appendChild(script);
    var relayMsg = function (event) {
        switch (event.data.dest) {
        case 'content':
            // handle anything with dest: "content" here.
            break;
        case 'background':
            port.postMessage(event.data, '*');
            break;
        case 'PWA':
            parent.postMessage(event.data, '*');
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
            }
        }
    );
});