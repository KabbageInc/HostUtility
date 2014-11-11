var STORAGE = chrome.storage.local;
var STORAGE_KEY = "kabbage_host_utility";
var PARTNER_KEY = "partner";

function parseUri (str) {
    var	o   = parseUri.options,
        m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i   = 14;
    while (i--) uri[o.key[i]] = m[i] || "";
    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) uri[o.q.name][$1] = $2;
    });
    return uri;
};

parseUri.options = {
    strictMode: false,
    key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
    q:   {
        name:   "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
};

var makeId = function () {
    return 'h' + (new Date()).getTime();
}

String.prototype.startsWithDot = function () {
    return "." === this.charAt(0);
}

String.prototype.stripDot = function () {
    if ("." === this.charAt(0)) {
        return this.substring(1);
    }
    return this;
}

String.prototype.endsWithDomain = function (s) {
    return this.indexOf(s, this.length - s.length) !== -1;
}

function getStoredItem() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY))
    } catch (e) {
    }
    return null
}

function persist(value, f) {
    if (!value) {
        value = ""
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    if(f && typeof f === 'function'){
        f();
    }
}

function getHostname(url) {
    var uri = parseUri(url);
    return uri['host'].toLowerCase();
}

function getIdFromArray(data, id) {
	if (data != null && data != undefined) {
		for (i = 0; i < data.length; i += 1) {
			if (data[i].id === id) {
				return i;
			}
		}
	}
	return -1;
}

function browseTab(isChecked, url) {
	chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
		function(tabs){
			if(isChecked) {
				chrome.tabs.create({ active:true, url: url });
			} else {
				chrome.tabs.update(tabs[0].id, { url: url });
			}
		}
	);
}