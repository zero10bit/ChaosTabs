function addGroupToDOM(name, group) {
  const groupItem = document.createElement('div');
  groupItem.classList.add('group');
  groupItem.style.backgroundColor = group.color;
  groupItem.textContent = `${name} (${group.tabs.length} tabs)`;

  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = '&#10006;';
  deleteButton.classList.add('delete-button');
  deleteButton.addEventListener('click', (event) => {
    event.stopPropagation();
    browser.runtime.sendMessage({ action: 'deleteGroup', name });
  });

  groupItem.appendChild(deleteButton);
  groupItem.addEventListener('click', () => openGroup(group.tabs));
  document.getElementById('groups').prepend(groupItem);
}

function openGroup(tabs) {
  tabs.forEach((tab) => browser.tabs.create({ url: tab.url }));
}

function loadGroups() {
  browser.storage.local.get('tabGroups').then((result) => {
    const groupsDiv = document.getElementById('groups');
    groupsDiv.innerHTML = '';
    const groups = result.tabGroups || {};
    for (const [name, group] of Object.entries(groups)) {
      addGroupToDOM(name, group);
    }
  });
}

document.getElementById('createGroup').addEventListener('click', () => {
  const groupName = document.getElementById('newGroupName').value.trim();
  if (groupName) {
    browser.runtime.sendMessage({ action: 'createGroup', name: groupName }).catch((error) => {
      console.error(`Failed to create group: ${error}`);
    });
    document.getElementById('newGroupName').value = '';
  } else {
    alert('Please enter a valid group name.');
  }
});

document.getElementById('groupByDomain').addEventListener('click', () => {
  browser.runtime.sendMessage({ action: 'groupByDomain' });
});

document.getElementById('openOptions').addEventListener('click', () => {
  browser.runtime.openOptionsPage();
});

document.getElementById('restoreBackup').addEventListener('click', () => {
  browser.storage.local.get(null).then((result) => {
    const backupKeys = Object.keys(result).filter((key) => key.startsWith('backup_'));
    const latestBackupKey = backupKeys.sort().pop();
    if (latestBackupKey) {
      browser.runtime.sendMessage({ action: 'restoreBackup', backupKey: latestBackupKey });
    } else {
      alert('No backups found.');
    }
  });
});

document.getElementById('searchBox').addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase();
  browser.storage.local.get('tabGroups').then((result) => {
    const groupsDiv = document.getElementById('groups');
    groupsDiv.innerHTML = '';
    const groups = result.tabGroups || {};
    for (const [name, group] of Object.entries(groups)) {
      const filteredTabs = group.tabs.filter(tab =>
        tab.title.toLowerCase().includes(query) || tab.url.toLowerCase().includes(query)
      );
      if (filteredTabs.length > 0 || name.toLowerCase().includes(query)) {
        addGroupToDOM(name, group);
      }
    }
  });
});

browser.storage.onChanged.addListener(loadGroups);
loadGroups();
