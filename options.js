document.getElementById('saveOptions').addEventListener('click', () => {
  const enableSuspension = document.getElementById('enableSuspension').checked;
  browser.storage.local.set({ enableSuspension });
});

browser.storage.local.get('enableSuspension').then((result) => {
  document.getElementById('enableSuspension').checked = result.enableSuspension ?? false;
});
