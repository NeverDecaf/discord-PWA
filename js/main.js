const discordHome = "https://discord.com/channels/@me";
const modal = document.getElementById("extWarning");
var modalCloseButton = document.getElementById("modalClose");

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
    var extNotInstalled = setTimeout(() => {
        modal.classList.add('show');
    }, 6000);
    window.addEventListener('message', function (e) {
        switch (e.data.dest) {
        case 'PWA':
            switch (e.data.type) {
            case 'badge':
                navigator.setAppBadge(e.data.payload);
                break;
            case 'refresh':
                setTimeout(() => window.location.reload(), 1000);
                break;
            case 'extversion':
                clearTimeout(extNotInstalled);
                fetch('https://raw.githubusercontent.com/NeverDecaf/discord-PWA/master/updates.xml')
                    .then(response => response.text())
                    .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
                    .then(data => {
                        if (version_is_newer(e.data.payload, data.getElementsByTagName("updatecheck")[0].getAttribute('version'))) {
                            e.source.postMessage({
                                dest: 'iframe',
                                type: 'updateAvailable'
                            }, e.origin);
                        }
                    }).catch(err => {
                        console.log('Error checking for extension updates.');
                    })
                break;
            case 'clientcss':
                fetch('./css/client.css').then(resp => resp.text().then(txt => {
                    e.source.postMessage({
                        dest: 'background',
                        type: 'clientcss',
                        payload: txt
                    }, e.origin);
                }));
                break;
            }
            break;
        }
    });
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./discord-pwa-sw.js');
    }
});

window.onclick = function (event) {
    if (event.target == modal) {
		modal.classList.remove('show');
    }
}
modalCloseButton.onclick = function() {
  modal.classList.remove('show');
}