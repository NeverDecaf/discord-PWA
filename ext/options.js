function load_options() {
    var default_options = {
        "badge_count": "mentions",
        "draw_attention_on": "messages"
    };
    chrome.storage.sync.get(default_options, function (items) {
        for (const [setting, value] of Object.entries(items)) {
            let node = document.getElementById(setting);
            node.value = value;
            node.addEventListener("change", e => {
                const setval = e.target.value;
                chrome.storage.sync.set({
                    [e.target.id]: setval
                }, function () {
                    if (chrome.runtime.lastError) {
                        // should revert to old value or alert somehow that change was not saved.
                    }
                });
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', load_options);
