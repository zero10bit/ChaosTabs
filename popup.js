document.getElementById('createGroup').addEventListener('click', () => {
  const groupName = document.getElementById('newGroupName').value.trim();
  if (groupName) {
    browser.runtime.sendMessage({ action: 'createGroup', name: groupName }).then(() => {
      console.log(`Group '${groupName}' created.`);
    }).catch((error) => console.error(`Failed to create group: ${error}`));
    document.getElementById('newGroupName').value = '';
  } else {
    alert('Please enter a valid group name.');
  }
});

document.getElementById('groupByDomain').addEventListener('click', () => {
  browser.runtime.sendMessage({ action: 'groupByDomain' });
});

function loadGroups() {
  browser.storage.local.get('tabGroups').then((result) => {
    const groupsDiv = document.getElementById('groups');
    groupsDiv.innerHTML = '';
    const groups = result.tabGroups || {};
    for (const [name, group] of Object.entries(groups)) {
      const groupItem = document.createElement('div');
      groupItem.classList.add('group');
      groupItem.style.backgroundColor = group.color;
      groupItem.textContent = `${name} (${group.tabs.length} tabs)`;
      groupItem.addEventListener('click', () => openGroup(group.tabs));
      groupsDiv.appendChild(groupItem);
    }
  }).catch((error) => console.error(`Failed to load groups: ${error}`));
}

function openGroup(tabs) {
  tabs.forEach((tab) => browser.tabs.create({ url: tab.url }));
}

browser.storage.onChanged.addListener(loadGroups);
loadGroups();
