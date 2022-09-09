var BADGE_COUNT = "mentions";
var DRAWATTENTION_COUNT = "messages";
import WebpackModules, { Filters } from "./webpackmodules.js";

function updateModal(url) {
    setTimeout(() => updateModal(url), 1000);
}
window.addEventListener("message", function (ev) {
    switch (ev.data.dest) {
        case "iframe":
            switch (ev.data.type) {
                case "updateAvailable":
                    updateModal(ev.data.payload);
                    break;
                case "badgeCount":
                    BADGE_COUNT = ev.data.payload;
                    break;
                case "drawAttentionCount":
                    DRAWATTENTION_COUNT = ev.data.payload;
                    break;
                case "injectcss":
                    let style = document.createElement("style");
                    style.textContent = ev.data.payload;
                    document.head.append(style);
                    break;
                case "injectscript":
                    let script = document.createElement("script");
                    script.setAttribute("type", "text/javascript");
                    // script.textContent = 'try {'+ev.data.payload+'} catch(e) {console.error(e, e.stack)}';
                    script.textContent = ev.data.payload;
                    (
                        document.body ||
                        document.head ||
                        document.documentElement
                    ).appendChild(script);
                    break;
                case "init":
                    !!ev.data?.payload?.wco_integration
                        ? document.documentElement.setAttribute(
                              "wco_integration",
                              ""
                          )
                        : document.documentElement.removeAttribute(
                              "wco_integration",
                              ""
                          );
                    break;
            }
            break;
    }
});

// source for props: https://github.com/mwittrien/BetterDiscordAddons/blob/master/Library/_res/0BDFDB.data.json
// some (Dispatcher) from here: https://github.com/BetterDiscord/BetterDiscord/blob/main/renderer/src/modules/discordmodules.js
const UsedModules = {
    // Dispatcher: ["dirtyDispatch"],
    Dispatcher: ["dispatch", "subscribe"],
    UnreadGuildUtils: ["hasUnread", "getTotalMentionCount"],
    RelationshipStore: ["getFriendIDs", "getRelationships"],
    UserStore: ["getCurrentUser"],
    // ItemLayerContainer: ["layer", "layerContainer"],
    // Backdrop: ["backdrop", "withLayer"],
    // MessageStore: ["getAllReadStates"],
    // GuildChannelStore: ["getChannels", "getDefaultChannel"],
    // UnreadChannelUtils: ["getUnreadCount", "getOldestUnreadMessageId"],
    // DirectMessageUnreadStore: ["getUnreadPrivateChannelIds"],
    // MuteStore: [
    //     "isGuildOrCategoryOrChannelMuted",
    //     "isMuted",
    //     "isChannelMuted",
    //     "_isCategoryMuted",
    // ],
    // FolderStore: ["getFlattenedGuilds"],
    // AltChannelStore: ["getChannels", "getDefaultChannel"],
};
const modulePromises = [];
// use getLazy for all modules in case some are not immediately loaded
for (const [key, value] of Object.entries(UsedModules)) {
    const p = WebpackModules.getLazy(Filters.byProps(value));
    modulePromises.push(p);
    p.then((mod) => (UsedModules[key] = mod));
}
Promise.allSettled(modulePromises)
    .then(
        () =>
            new Promise((done) => {
                if (UsedModules.UserStore.getCurrentUser()) return done();
                UsedModules.Dispatcher.subscribe("CONNECTION_OPEN", done);
            })
    )
    .then(() => {
        window.postMessage(
            {
                dest: "PWA",
                type: "discordLoaded",
            },
            "*"
        );
        window.postMessage(
            {
                dest: "background",
                type: "discordLoaded",
            },
            "*"
        );
        window.postMessage(
            {
                dest: "content",
                type: "discordLoaded",
            },
            "*"
        );

        function addUnread() {
            var unreadMessages = UsedModules.UnreadGuildUtils.hasAnyUnread(),
                unreadChannels =
                    UsedModules.UnreadGuildUtils.getMutableUnreadGuilds().size,
                unreadMentions =
                    UsedModules.UnreadGuildUtils.getTotalMentionCount() +
                    UsedModules.RelationshipStore.getPendingCount();
            const data = {
                messages: unreadMessages,
                mentions: unreadMentions,
                channels: unreadChannels,
                never: 0,
            };
            window.postMessage(
                {
                    dest: "PWA",
                    type: "badge",
                    payload: data[BADGE_COUNT],
                },
                "*"
            );
            window.postMessage(
                {
                    dest: "background",
                    type: "drawAttention",
                    payload: data[DRAWATTENTION_COUNT] || data[BADGE_COUNT],
                },
                "*"
            );
        }
        function sendStyle() {
            let rootstyle = getComputedStyle(document.documentElement);
            window.postMessage(
                {
                    dest: "PWA",
                    type: "style",
                    payload: {
                        titlebarColor: rootstyle.getPropertyValue(
                            "--background-tertiary"
                        ),
                        backgroundColor: rootstyle.getPropertyValue(
                            "--background-primary"
                        ),
                        leftSidebarWidth: getComputedStyle(
                            document.querySelector('div[class|="scroller"]')
                        ).getPropertyValue("width"),
                    },
                },
                "*"
            );
        }
        UsedModules.Dispatcher.subscribe("RPC_NOTIFICATION_CREATE", () =>
            addUnread()
        );
        UsedModules.Dispatcher.subscribe("MESSAGE_ACK", () => addUnread());
        UsedModules.Dispatcher.subscribe("WINDOW_FOCUS", (e) => {
            if (!e.focused) addUnread();
        });
        UsedModules.Dispatcher.subscribe(
            "USER_SETTINGS_PROTO_UPDATE",
            sendStyle
        );
        sendStyle();

        // UsedModules.Dispatcher.subscribe('CHAT_RESIZE',()=>addUnread());
        // UsedModules.Dispatcher.subscribe('TRACK',()=>addUnread());
        function showConfirmationModal(title, content, options = {}) {
            const ModalActions = WebpackModules.findByUniqueProperties([
                "openModal",
                "updateModal",
            ]);
            const Markdown = WebpackModules.findByDisplayName("Markdown");
            const ConfirmationModal =
                WebpackModules.findByDisplayName("ConfirmModal");
            const React = WebpackModules.findByUniqueProperties([
                "Component",
                "PureComponent",
                "Children",
                "createElement",
                "cloneElement",
            ]);
            if (!ModalActions || !ConfirmationModal || !Markdown)
                return alert(content);

            const emptyFunction = () => {};
            const {
                onConfirm = emptyFunction,
                onCancel = emptyFunction,
                confirmText = "Okay",
                cancelText = "Cancel",
                danger = false,
                key = undefined,
            } = options;

            if (!Array.isArray(content)) content = [content];
            content = content.map((c) =>
                typeof c === "string"
                    ? React.createElement(Markdown, null, c)
                    : c
            );
            return ModalActions.openModal(
                (props) => {
                    return React.createElement(
                        ConfirmationModal,
                        Object.assign(
                            {
                                header: title,
                                red: danger,
                                confirmText: confirmText,
                                cancelText: cancelText,
                                onConfirm: onConfirm,
                                onCancel: onCancel,
                            },
                            props
                        ),
                        content
                    );
                },
                {
                    modalKey: key,
                }
            );
        }

        updateModal = function (url) {
            return showConfirmationModal(
                "Update Available",
                "An update for the Discord PWA extension is available.",
                {
                    confirmText: "Download now",
                    cancelText: "Remind me later",
                    onConfirm: () => {
                        window.open(url, "_blank");
                    },
                }
            );
        };
    });
