const isInStandaloneMode = () => (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone) || document.referrer.includes('android-app://');
const discordHome = "https://discord.com/channels/@me";

function version_is_newer(current, available) {
    let current_subvs = current.split(".");
    let available_subvs = available.split(".");
    for (let i = 0; i < 4; i++) {
        if ((current_subvs[i] || 0) < (available_subvs[i] || 0))
            return true;
    }
    return false;
}

window.addEventListener('DOMContentLoaded', (event) => {
    window.addEventListener('message', function (e) {
        if (e.origin == 'https://discord.com') {
            if (e.data.name == 'badge')
                navigator.setAppBadge(e.data.value);
            else if (e.data.name == 'refresh')
                setTimeout(() => window.location.reload(), 1000);
            else if (e.data.name == 'extversion')
                fetch('https://raw.githubusercontent.com/NeverDecaf/discord-PWA/master/updates.xml')
                .then(response => response.text())
                .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
                .then(data => {
                    if (version_is_newer(e.data.value, data.getElementsByTagName("updatecheck")[0].getAttribute('version'))) {
                        e.source.postMessage({
                            name: 'updateAvailable'
                        }, e.origin);
                    }
                })
        }
    });
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./discord-pwa-sw.js');
    }
    if (!isInStandaloneMode()) {
        document.getElementById("main").setAttribute("style", "");
        document.getElementById("main").innerHTML = `
<h1 class="title">Install as PWA to use</h1>
<img src='./PWA_Install_Button.png'/>
<a href ='./Discord-PWA-Bypass.crx'><h2 class="subtitle">You will also need the Chrome Extension</h2></a>
You may also need to <a href="https://web.dev/badging-api/#alternatives-to-the-origin-trial">enable this experimental flag</a> <br/>if you don't see badges like this: <img src="./badge_example.png"/>`
        document.getElementById("frame").setAttribute("style", "display:none;");
    } else {
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = '.fullscreen {background: #202225;}'; //#36393F;
        document.getElementsByTagName('head')[0].appendChild(style);
    }
});

window.onappinstalled = () => {
    document.getElementById("main").setAttribute("style", "display:none;");
    document.getElementById("frame").setAttribute("style", "");
};