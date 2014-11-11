$(function () {
	var bgp = chrome.extension.getBackgroundPage();
    oData = bgp.oData;
	
	if (oData[PARTNER_KEY] == undefined) {
		oData[PARTNER_KEY] = [];
	}
	
	updatePartnerList();
	
    $("#lstPartners").change(function (e) {
		setPartner();
    });
	
	$("#qa1").on('click', function (e) {
		browseTab($('#newtab').is(':checked'), 'https://app-qa1.kabbage.com');
	});
	
	$("#qa2").on('click', function (e) {
		browseTab($('#newtab').is(':checked'), 'https://app-qa2.kabbage.com');
	});
	
	$("#qa3").on('click', function (e) {
		browseTab($('#newtab').is(':checked'), 'https://app-qa3.kabbage.com');
	});
})

function updatePartnerList() {
	chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
		function(tabs){
			var dataId = getIdFromArray(oData[PARTNER_KEY], tabs[0].id);
			if (dataId != -1) {
				$('#lstPartners').val(oData[PARTNER_KEY][dataId].partnerName);
			}
		}
	);
}

function setPartner() {
	chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
		function(tabs){
			var dataId = getIdFromArray(oData[PARTNER_KEY], tabs[0].id);
			if (dataId == -1) {
				oData[PARTNER_KEY].push({id:tabs[0].id, partnerName:$('#lstPartners').val()});
			} else {
				oData[PARTNER_KEY][dataId].id = tabs[0].id;
				oData[PARTNER_KEY][dataId].partnerName = $('#lstPartners').val();
			}
		}
	);
}