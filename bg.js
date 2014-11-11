var taburls = {}, oData = {};

var modifyMainRequest = function (tabId, url) {
	taburls[tabId] = url;
	return url;
}

var modifySubRequest = function (tabId, url) {
	if (url.match(/.+-qa\.\w+.com/) != null) {
		if (taburls[tabId] != null) {
			var urlmatch = taburls[tabId].match(/-qa[0-9]{1}\./);
			if (urlmatch != null) {
				console.log('updated url from: ' + url);
				url = url.replace(/-qa\./, urlmatch);
				console.log('updated url to: ' + url);
			}
		}
	}
	return url;
}

var modifyHeader = function (tabId, url, allHeaders) {
	if (url.match(/-qa[0-9]{1}/) != null) {
		var hostname = getHostname(url);
		var ret = allHeaders.slice();
		console.log('updated host header from: ' + hostname);
		newhostname = hostname.replace(/-qa[0-9]{1}/, "-qa");
		console.log('updated host header to: ' + newhostname);
		
		//modify host header for partner
		if(oData[PARTNER_KEY] != undefined) {
			//we do not want to replace asset site
			var urlmatch = newhostname.match(/assets-qa.*\.kabbage.com/);
			if (urlmatch == null) {
				var dataId = getIdFromArray(oData[PARTNER_KEY], tabId);
				if (dataId != -1) {
					console.log('updated host header from: ' + newhostname);
					newhostname = newhostname.replace(/kabbage.com/, oData[PARTNER_KEY][dataId].partnerName);
					console.log('updated host header to: ' + newhostname);
				}
			}
		}
		
		ret.push({name:"Host", value:newhostname});
	}
    return ret;
}

var initpgpage = function (reload) {
	var mainRequestListener = function(details) {
		return { redirectUrl:modifyMainRequest(details.tabId, details.url) }
	};
	
	var subRequestListener = function(details) {
		return { redirectUrl:modifySubRequest(details.tabId, details.url) }
	};
	
    var headerListener = function (details) {
        return { requestHeaders:modifyHeader(details.tabId, details.url, details.requestHeaders) }
    };
	
    if (reload) {
		chrome.webRequest.onBeforeSendHeaders.removeListener(beforeListener);
        chrome.webRequest.onBeforeSendHeaders.removeListener(requestListener);
    }
	
	chrome.webRequest.onBeforeRequest.addListener(mainRequestListener, {urls:["*://*.kabbage.com/*"], types:["main_frame", "xmlhttprequest"]}, ["blocking"]);
	chrome.webRequest.onBeforeRequest.addListener(subRequestListener, {urls:["*://*.kabbage.com/*"], types:["sub_frame", "stylesheet", "script", "image", "object", "other"]}, ["blocking"]);
	chrome.webRequest.onBeforeSendHeaders.addListener(headerListener, {urls:["*://*.kabbage.com/*"], types:["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]}, ["requestHeaders", "blocking"]);	
}

initpgpage();