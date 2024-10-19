browser.runtime.onMessage.addListener((message) => {
  switch (message.action) {
    case 'createGroup':
      createGroup(message.name);
      break;
    case 'deleteGroup':
      deleteGroup(message.name);
      break;
    case 'groupByDomain':
      groupByDomain();
      break;
    case 'restoreBackup':
      restoreBackup(message.backupKey);
      break;
  }
});

function createGroup(groupName) {
  browser.tabs.query({ currentWindow: true }).then((tabs) => {
    const tabData = tabs.map((tab) => ({
      id: tab.id,
      url: tab.url,
      title: tab.title,
    }));
    const color = getRandomColor();
    browser.storage.local.get('tabGroups').then((result) => {
      const groups = result.tabGroups || {};
      groups[groupName] = { tabs: tabData, color };
      browser.storage.local.set({ tabGroups: groups });
    });
  });
}

function deleteGroup(groupName) {
  browser.storage.local.get('tabGroups').then((result) => {
    const groups = result.tabGroups || {};
    delete groups[groupName];
    browser.storage.local.set({ tabGroups: groups });
  });
}

function groupByDomain() {
  browser.tabs.query({ currentWindow: true }).then((tabs) => {
    const domainGroups = {};
    tabs.forEach((tab) => {
      const domain = new URL(tab.url).hostname;
      if (!domainGroups[domain]) domainGroups[domain] = [];
      domainGroups[domain].push({ id: tab.id, url: tab.url, title: tab.title });
    });
    browser.storage.local.get('tabGroups').then((result) => {
      const groups = result.tabGroups || {};
      for (const [domain, domainTabs] of Object.entries(domainGroups)) {
        groups[domain] = { tabs: domainTabs, color: getRandomColor() };
      }
      browser.storage.local.set({ tabGroups: groups });
    });
  });
}

function restoreBackup(backupKey) {
  browser.storage.local.get(backupKey).then((result) => {
    browser.storage.local.set({ tabGroups: result[backupKey] });
  });
}

function getRandomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

browser.contextMenus.removeAll().then(() => {
  browser.contextMenus.create({
    id: 'chaosTabsMenu',
    title: 'Chaos Tabs',
    contexts: ['tab']
  });

  browser.contextMenus.create({
    id: 'createGroupFromDomain',
    title: 'Create Group from Domain',
    parentId: 'chaosTabsMenu',
    contexts: ['tab']
  });
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'createGroupFromDomain') {
    createGroupFromDomain(tab);
  }
});

function createGroupFromDomain(tab) {
  const domain = new URL(tab.url).hostname;
  browser.tabs.query({ currentWindow: true }).then((tabs) => {
    const domainTabs = tabs.filter((t) => new URL(t.url).hostname === domain);
    const color = getRandomColor();
    const groupName = domain;
    browser.storage.local.get('tabGroups').then((result) => {
      const groups = result.tabGroups || {};
      groups[groupName] = { tabs: domainTabs, color };
      browser.storage.local.set({ tabGroups: groups });
    });
  });
}
