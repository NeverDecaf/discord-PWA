var default_options = {
    "custom_theme": "#202225"
};
chrome.storage.local.get(default_options, function (settings) {
	document.getElementById('theme-color').setAttribute("content",settings.custom_theme)
});