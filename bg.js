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
				var newurl = url.replace(/-qa\./, urlmatch);
				console.log('redirect ' + url + ' to ' + newurl);
				url = newurl;
			}
		}
	}
	return url;
}

var modifyHeader = function (tabId, url, allHeaders) {
	if (url.match(/-qa[0-9]{1}/) != null) {
		var hostname = getHostname(url);
		var ret = allHeaders.slice();
		var newhostname = hostname.replace(/-qa[0-9]{1}/, "-qa");
		
		var requestedDomain = newhostname;
				
		if(oData[PARTNER_KEY] != undefined) {
			var urlmatch = newhostname.match(/assets-qa.*\.kabbage.com/);
			if (urlmatch == null) {
				var dataId = getIdFromArray(oData[PARTNER_KEY], tabId);
				if (dataId != -1) {
					requestedDomain = newhostname.replace(/kabbage.com/, oData[PARTNER_KEY][dataId].partnerName);
				}
			}
		}
		
		//this will come out once we fully utilize requested domain
		newhostname = requestedDomain;
		
		console.log('host=' + newhostname + ' for ' + url);
		
		ret.push({name:"Host", value:newhostname});
		ret.push({name:"X-Requested-Domain", value:requestedDomain});
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
		chrome.webRequest.onBeforeRequest.removeListener(mainRequestListener);
		chrome.webRequest.onBeforeRequest.removeListener(subRequestListener);
        chrome.webRequest.onBeforeSendHeaders.removeListener(headerListener);
    }
	
	chrome.webRequest.onBeforeRequest.addListener(mainRequestListener, {urls:["*://*.kabbage.com/*"], types:["main_frame", "xmlhttprequest"]}, ["blocking"]);
	chrome.webRequest.onBeforeRequest.addListener(subRequestListener, {urls:["*://*.kabbage.com/*"], types:["sub_frame", "stylesheet", "script", "image", "object"]}, ["blocking"]);
	chrome.webRequest.onBeforeSendHeaders.addListener(headerListener, {urls:["*://*.kabbage.com/*"], types:["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]}, ["requestHeaders", "blocking"]);
}

initpgpage();