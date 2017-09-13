chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (message.method = "translate") {
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "http://fanyi.sogou.com/reventondc/translate", true);
		xhr.setRequestHeader("CONTENT-TYPE", "application/x-www-form-urlencoded");
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4 && xhr.status == 200)
				sendResponse(xhr.responseText);
		}
		xhr.send("from=auto&to=zh-CHS&text=" + encodeURIComponent(message.value));
		return true;
	}
});
