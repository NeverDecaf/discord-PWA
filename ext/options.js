function load_options() {
    var default_options = {
        badge_count: "mentions",
        draw_attention_on: "messages",
        custom_css: "",
        custom_js: "",
        custom_title: "",
        enable_custom_theme: false,
        custom_theme: "#202225",
        relax_CSP_styles: false,
        wco_integration: true,
    };
    chrome.storage.local.get(default_options, function (items) {
        for (const [setting, value] of Object.entries(items)) {
            let node = document.getElementById(setting);
            if (node.type === "checkbox") {
                node.checked = value;
                node.addEventListener("click", (e) => {
                    const checked = e.target.checked;
                    chrome.storage.local.set(
                        {
                            [e.target.id]: checked,
                        },
                        function () {
                            if (chrome.runtime.lastError) {
                                node.checked = !checked;
                            }
                        }
                    );
                });
            } else {
                node.value = value;
                node.addEventListener("input", (e) => {
                    const setval = e.target.value;
                    chrome.storage.local.set(
                        {
                            [e.target.id]: setval,
                        },
                        function () {
                            if (chrome.runtime.lastError) {
                            }
                        }
                    );
                });
            }
        }
        // 2nd loop to set sub keys
        for (const [setting, value] of Object.entries(items)) {
            const node = document.getElementById(setting);
            if (node.parentElement.classList.contains("sub")) {
                const cb =
                    node.parentElement.previousElementSibling.querySelector(
                        "input[type=checkbox]"
                    );
                if (cb) {
                    const toggleDisabled = () => {
                        node.toggleAttribute("disabled");
                        node.parentElement.classList.toggle("disabled");
                    };
                    cb.addEventListener("change", toggleDisabled);
                    if (!cb.checked) toggleDisabled();
                }
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", load_options);
