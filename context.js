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

function createProxyForm(identity, values) {
	var form = document.createElement('form');

	let typeSelect = document.createElement('select');
	typeSelect.name = 'type';
	for (let type of ['direct', 'socks', 'socks4', 'http']) {
		let typeOption = document.createElement('option');
		typeOption.value = type;
		typeOption.innerText = type;
		typeSelect.appendChild(typeOption);
	}
	typeSelect.value = values.type || 'direct';
	form.appendChild(typeSelect);

	let hostInput = document.createElement('input');
	hostInput.name = 'host';
	hostInput.value = values.host || '';
	hostInput.placeholder = 'Host';
	form.appendChild(hostInput);

	let portInput = document.createElement('input');
	portInput.name = 'port';
	portInput.value = values.port || '';
	portInput.placeholder = 'Port';
	form.appendChild(portInput);

	let saveButton = document.createElement('button');
	saveButton.type = 'submit';
	saveButton.innerText = 'Save';
	form.appendChild(saveButton);

	return form;
}

var list = document.getElementById('identity-list');

if (browser.contextualIdentities === undefined) {
	list.innerText = 'browser.contextualIdentities not available. Check that the privacy.userContext.enabled pref is set to true, and reload the add-on.';
} else {
	Promise.all([
		browser.contextualIdentities.query({}),
		browser.storage.local.get('proxyByStore')
	]).then(([identities, items]) => {
		let proxyByStore = items.proxyByStore || {};

		if (!identities.length) {
			list.innerText = 'No identities returned from the API.';
			return;
		}

		for (let identity of identities) {
			let form = createProxyForm(identity, proxyByStore[identity.cookieStoreId] || {});
			form.addEventListener('submit', e => {
				e.preventDefault();

				proxyByStore[identity.cookieStoreId] = {
					type: form.elements.type.value,
					host: form.elements.host.value,
					port: form.elements.port.value,
				};

				browser.storage.local.set({proxyByStore});
			});

			let row = document.createElement('div');
			row.className = 'row';

			row.appendChild(createIdentityHead(identity));
			row.appendChild(form);

			list.appendChild(row);
		}
	});
}
