var proxyByStore = {};

browser.storage.local.get('proxyByStore').then(function(items){
	proxyByStore = items.proxyByStore;
});

browser.storage.onChanged.addListener(function(changes, areaName){
	if ('proxyByStore' in changes) {
		proxyByStore = changes.proxyByStore.newValue;
	}
});

browser.proxy.onRequest.addListener(function(requestInfo) {
	return new Promise(function(resolve, reject) {
		browser.tabs.get(requestInfo.tabId)
			.then(tab => resolve(proxyByStore[tab.cookieStoreId]))
			.catch(() => resolve({type: 'direct'}));
	});
}, {urls: ['<all_urls>']});
