const isInStandaloneMode = () => (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone) || document.referrer.includes('android-app://');
const discordHome = "https://discord.com/channels/@me";
window.onload = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./discord-pwa-sw.js');
  }
  if (isInStandaloneMode()) {
    window.location.replace(discordHome);
  }
}
window.onappinstalled = () => { 
  window.location.replace(discordHome);
};
