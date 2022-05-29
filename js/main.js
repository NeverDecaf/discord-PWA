const discordHome = "https://discord.com/channels/@me";
const modal = document.getElementById("extWarning");
const extensionID = "edfpalahildnikdjdnmmoekoncglnblh";
var modalCloseButton = document.getElementById("modalClose");
var installedExtVersion;
var extUpdateUrl;
var wco_integration = false;

function version_is_newer(current, available) {
    let current_subvs = current.split(".");
    let available_subvs = available.split(".");
    for (let i = 0; i < 4; i++) {
        let ver_diff =
            (parseInt(available_subvs[i]) || 0) -
            (parseInt(current_subvs[i]) || 0);
        if (ver_diff > 0) return true;
        else if (ver_diff < 0) return false;
    }
    return false;
}
var theme_element = document.getElementById("theme-color");
theme_element.setAttribute("old-theme", theme_element.getAttribute("content"));

window.addEventListener("DOMContentLoaded", (event) => {
    var extNotLoaded;
    fetch("chrome-extension://" + extensionID + "/manifest.json")
        .then((response) => response.json())
        .then((data) => {
            installedExtVersion = data.version;
            extUpdateUrl = data.update_url;
            extNotLoaded = setTimeout(() => {
                document.getElementById("frame").src += "";
            }, 1000);
        })
        .catch((error) => modal.classList.add("show"));

    window.addEventListener("message", function (e) {
        switch (e.data.dest) {
            case "PWA":
                switch (e.data.type) {
                    case "init":
                        clearTimeout(extNotLoaded);
                        wco_integration = !!e.data.payload;
                        break;
                    case "badge":
                        navigator.setAppBadge(e.data.payload);
                        break;
                    case "refresh":
                        setTimeout(
                            () => (document.getElementById("frame").src += ""),
                            1000
                        );
                        break;
                    case "discordLoaded":
                        // inject some WCO vars as CSS vars
                        if (
                            navigator.windowControlsOverlay &&
                            navigator.windowControlsOverlay
                                .getTitlebarAreaRect &&
                            wco_integration
                        ) {
                            function update_wco(visible, titlebarAreaRect) {
                                if (visible) {
                                    theme_element.setAttribute(
                                        "content",
                                        "#36393f"
                                    );
                                } else {
                                    theme_element.setAttribute(
                                        "content",
                                        theme_element.getAttribute("old-theme")
                                    );
                                }
                                e.source.postMessage(
                                    {
                                        dest: "iframe",
                                        type: "injectcss",
                                        payload:
                                            ":root{--titlebar-area-height: " +
                                            (titlebarAreaRect?.height ||
                                                "'invalid'") +
                                            ";}",
                                    },
                                    e.origin
                                );
                            }
                            update_wco(
                                navigator.windowControlsOverlay.visible,
                                navigator.windowControlsOverlay.getTitlebarAreaRect()
                            );
                            navigator.windowControlsOverlay.ongeometrychange = (
                                ev
                            ) => {
                                update_wco(ev.visible, ev.titlebarAreaRect);
                            };
                        }
                        // check for updates
                        fetch(extUpdateUrl)
                            .then((response) => response.text())
                            .then((str) =>
                                new window.DOMParser().parseFromString(
                                    str,
                                    "text/xml"
                                )
                            )
                            .then((data) => {
                                if (
                                    version_is_newer(
                                        installedExtVersion,
                                        data
                                            .getElementsByTagName(
                                                "updatecheck"
                                            )[0]
                                            .getAttribute("version")
                                    )
                                ) {
                                    e.source.postMessage(
                                        {
                                            dest: "iframe",
                                            type: "updateAvailable",
                                            payload: data
                                                .getElementsByTagName(
                                                    "updatecheck"
                                                )[0]
                                                .getAttribute("codebase"),
                                        },
                                        e.origin
                                    );
                                }
                            })
                            .catch((err) => {
                                console.error(
                                    "Error checking for Discord PWA extension updates."
                                );
                            });
                        break;
                    case "clientcss":
                        fetch("./css/client.css").then((resp) =>
                            resp.text().then((txt) => {
                                e.source.postMessage(
                                    {
                                        dest: "background",
                                        type: "clientcss",
                                        payload: txt,
                                    },
                                    e.origin
                                );
                            })
                        );
                        break;
                    case "customTitle":
                        document.title = e.data.payload;
                        break;
                }
                break;
        }
    });
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("./discord-pwa-sw.js");
    }
});

window.onclick = function (event) {
    if (event.target == modal) {
        modal.classList.remove("show");
    }
};
modalCloseButton.onclick = function () {
    modal.classList.remove("show");
};

// PWA Install page stuff
const loadDiscord = () =>
    document.getElementById("frame").src ||
    (document.getElementById("frame").src = "https://discord.com/channels/@me");
const isInStandaloneMode = () =>
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.navigator.standalone ||
    document.referrer.includes("android-app://");
if (isInStandaloneMode()) {
    loadDiscord();
} else {
    // https://web.dev/customize-install/
    let deferredPrompt;

    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;
    });
    document
        .getElementById("PWAInstallButton")
        .addEventListener("click", async () => {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            deferredPrompt = null;
        });
}
window
    .matchMedia("(display-mode: standalone)")
    .addEventListener("change", (evt) => {
        if (evt.matches) {
            loadDiscord();
        }
    });
