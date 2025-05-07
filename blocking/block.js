document.addEventListener("DOMContentLoaded", () => {
  const moreTimeBtn = document.getElementById("moretime");
  const blockedUrl = window.location.href;
  moreTimeBtn.href = `chrome-extension://${chrome.runtime.id}/popup.html?editUrl=${encodeURIComponent(blockedUrl)}`;
});