var proxyByContainer = {};

browser.storage.local.get().then(function(items){
	proxyByContainer = items;
});

browser.storage.onChanged.addListener(function(changes, areaName){
	for (let name in changes) {
		proxyByContainer[name] = changes[name].newValue;
	}
});

browser.proxy.onRequest.addListener(function(requestInfo) {
	return new Promise(function(resolve, reject) {
		browser.tabs.get(requestInfo.tabId)
			.then(tab => resolve(proxyByContainer[tab.cookieStoreId]))
			.catch(() => resolve({type: 'direct'}));
	});
}, {urls: ['<all_urls>']});
