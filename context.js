/*
function eventHandler(event) {
	if (event.target.dataset.action == 'create') {
		browser.tabs.create({
			url: 'about:blank',
			cookieStoreId: event.target.dataset.identity
		});
	}
	if (event.target.dataset.action == 'close-all') {
		browser.tabs.query({
			cookieStoreId: event.target.dataset.identity
		}).then((tabs) => {
			browser.tabs.remove(tabs.map((i) => i.id));
		});
	}
	event.preventDefault();
}

function createOptions(node, identity) {
	for (let option of ['Create', 'Close All']) {
		let a = document.createElement('a');
		a.href = '#';
		a.innerText = option;
		a.dataset.action = option.toLowerCase().replace(' ', '-');
		a.dataset.identity = identity.cookieStoreId;
		a.addEventListener('click', eventHandler);
		node.appendChild(a);
	}
}
*/

function createIdentityHead(identity) {
	let head = document.createElement('div');
	head.className = 'head';
	head.innerText = identity.name;
	head.style.borderColor = identity.colorCode;

	var img = document.createElement('img');
	img.src = identity.iconUrl;
	head.prepend(img);

	return head;
}

function createProxyForm(identity) {
	var form = document.createElement('form');
	form.dataset.identity = identity.cookieStoreId;

	let typeSelect = document.createElement('select');
	typeSelect.name = 'type';
	for (let type of ['direct', 'socks', 'socks4', 'http']) {
		let typeOption = document.createElement('option');
		typeOption.value = type;
		typeOption.innerText = type;
		typeSelect.appendChild(typeOption);
	}
	form.appendChild(typeSelect);

	let hostInput = document.createElement('input');
	hostInput.name = 'host';
	hostInput.placeholder = 'Host';
	form.appendChild(hostInput);

	let portInput = document.createElement('input');
	portInput.name = 'port';
	portInput.placeholder = 'Port';
	form.appendChild(portInput);

	let saveButton = document.createElement('button');
	saveButton.type = 'submit';
	saveButton.innerText = 'Save';
	form.appendChild(saveButton);

	form.addEventListener('submit', function(e){
		e.preventDefault();
		browser.storage.local.set({
			[identity.cookieStoreId]: {
				type: form.elements.type.value,
				host: form.elements.host.value,
				port: form.elements.port.value,
			}
		});
	});

	browser.storage.local.get(identity.cookieStoreId).then(function(items){
		let values = items[identity.cookieStoreId];
		for (let name in values) {
			form.elements[name].value = values[name];
		}
	});

	return form;
}

var div = document.getElementById('identity-list');

if (browser.contextualIdentities === undefined) {
	div.innerText = 'browser.contextualIdentities not available. Check that the privacy.userContext.enabled pref is set to true, and reload the add-on.';
} else {
	browser.contextualIdentities.query({})
		.then((identities) => {
			if (!identities.length) {
				div.innerText = 'No identities returned from the API.';
				return;
			}

		 for (let identity of identities) {
			let row = document.createElement('div');
			row.className = 'row';

			row.appendChild(createIdentityHead(identity));
			row.appendChild(createProxyForm(identity));

			div.appendChild(row);
		 }
	});
}
