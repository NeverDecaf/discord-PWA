function main() {
    wm = (() => {
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



    checkForGuilds = function () {
        let timesChecked = 0;
        return new Promise(resolve => {
            const checkForGuilds = function () {
                const wrapper = BDV2.guildClasses.wrapper.split(" ")[0];
                if (document.querySelectorAll(`.${wrapper}`).length > 0) timesChecked++;
                const guild = BDV2.guildClasses.listItem.split(" ")[0];
                const blob = BDV2.guildClasses.blobContainer.split(" ")[0];
                if (document.querySelectorAll(`.${wrapper} .${guild} .${blob}`).length > 0) return resolve(bdConfig.deferLoaded = true);
                else if (timesChecked >= 50) return resolve(bdConfig.deferLoaded = true);
                setTimeout(checkForGuilds, 100);
            };
            if (document.readyState != "loading") setTimeout(checkForGuilds, 100);
            document.addEventListener("DOMContentLoaded", () => {
                setTimeout(checkForGuilds, 100);
            });
        });
    };
    let timesChecked = 0;

    function waitForLoad() {
        if (timesChecked < 100 && (typeof webpackJsonp === 'undefined' || wm.findByUniqueProperties(["hasUnread", "getUnreadGuilds"]) === null)) {
            timesChecked++;
            setTimeout(waitForLoad, 100);
            return;
        }
        // https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js
        const UnreadGuildUtils = wm.findByUniqueProperties(["hasUnread", "getUnreadGuilds"]);
        const GuildChannelStore = wm.findByUniqueProperties(["getChannels", "getDefaultChannel"]);
        const UnreadChannelUtils = wm.findByUniqueProperties(["getUnreadCount", "getOldestUnreadMessageId"]);
        const DirectMessageUnreadStore = wm.findByUniqueProperties(["getUnreadPrivateChannelIds"]);
        const Dispatcher = wm.findByUniqueProperties(["Dispatcher"]).default;

        function addUnread() {
            var totalUnread = 0;
            // commented below is the correct way to get a count of all unread messages, we are using a shortcut now as this value is not needed atm
            // // for every unread guild, iterate over every channel and sum unread messages
            // for (let g in UnreadGuildUtils.getUnreadGuilds()) {
            // let channels = GuildChannelStore.getChannels(g).SELECTABLE;
            // channels.forEach((e) => totalUnread += UnreadChannelUtils.getUnreadCount(e.channel.id));
            // }
            // // now get all unread DM channel ids and do the same.
            // DirectMessageUnreadStore.getUnreadPrivateChannelIds().forEach((id) => totalUnread += UnreadChannelUtils.getUnreadCount(id));
            // // get total unread mention count.
            totalUnread = Object.keys(UnreadGuildUtils.getUnreadGuilds()).length || Object.keys(DirectMessageUnreadStore.getUnreadPrivateChannelIds()).length;
            var unreadMentions = UnreadGuildUtils.getTotalMentionCount();
            parent.postMessage(unreadMentions, '*');
            window.postMessage(totalUnread, '*');
        }
        Dispatcher.subscribe('RPC_NOTIFICATION_CREATE', () => addUnread());
        Dispatcher.subscribe('MESSAGE_ACK', () => addUnread());
        // Dispatcher.subscribe('WINDOW_FOCUS',()=>addUnread());
        // Dispatcher.subscribe('CHAT_RESIZE',()=>addUnread());
        // Dispatcher.subscribe('TRACK',()=>addUnread());
    }
    waitForLoad();
}

var script = document.createElement('script');
script.appendChild(document.createTextNode('(' + main + ')();'));
(document.body || document.head || document.documentElement).appendChild(script);

window.addEventListener("message", function (event) {
    if (event.origin == "https://discord.com")
        chrome.runtime.sendMessage({
            content: "drawAttention",
            unread: event.data
        });
});