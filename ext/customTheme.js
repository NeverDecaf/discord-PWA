var default_options = {
	enable_custom_theme: false,
	custom_theme: "#202225",
};
chrome.storage.local.get(default_options, function (settings) {
	if (settings.enable_custom_theme) {
		let theme_element = document.getElementById("theme-color");
		theme_element.setAttribute("content", settings.custom_theme);
		theme_element.setAttribute("locked", "");
	}
});
