const isInStandaloneMode = () => (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone) || document.referrer.includes('android-app://');
const discordHome = "https://discord.com/channels/@me";

window.addEventListener('DOMContentLoaded', (event) => {
    window.addEventListener('message', function (e) {
        if (e.origin == 'https://discord.com') {
            navigator.setAppBadge(e.data);
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
    }
});

window.onappinstalled = () => { 
  document.getElementById("main").setAttribute("style", "display:none;");
  document.getElementById("frame").setAttribute("style", "");
};