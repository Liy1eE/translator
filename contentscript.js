var div = null;
var selectTxt = null;
var lastSelectTxt = null;

document.onmousemove = function (event) {
	if (!event.ctrlKey)
		return;

	var word = getWordAtPoint(event.target, event.x, event.y);

	if (word)
		selectTxt = word.trim();

	if (!checkAvailable())
		return;

	div.style.left = event.x - 30 + "px";
	div.style.top = document.body.scrollTop + event.y + 20 + "px";
	query(selectTxt);
}

document.addEventListener('copy', function () {
	div.style.display = "none";
}, true);

document.onmousedown = function (event) {
	var ele = event.toElement || event.relatedTarget;
	var result = div.compareDocumentPosition(ele);

	if (result != 20)
		div.style.display = "none";
};

document.onmouseup = function (event) {
	var selection = window.getSelection();
	selectTxt = selection.toString().trim();

	if (!checkAvailable()) {
		lastSelectTxt = null;
		return;
	}

	var rect = selection.getRangeAt(0).getBoundingClientRect();
	var left = rect.left - 6;

	if (left < 0)
		left = document.body.scrollWidth / 2 - 200;

	div.style.left = left + "px";
	div.style.top = document.body.scrollTop + rect.top + rect.height + 5 + "px";

	query(selectTxt);
};

function getWordAtPoint(elem, x, y) {
	if (elem.nodeType == elem.TEXT_NODE) {
		var range = elem.ownerDocument.createRange();
		range.selectNodeContents(elem);
		var currentPos = 0;
		var endPos = range.endOffset;
		while (currentPos + 1 < endPos) {
			range.setStart(elem, currentPos);
			range.setEnd(elem, currentPos + 1);
			if (range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right >= x &&
				range.getBoundingClientRect().top <= y && range.getBoundingClientRect().bottom >= y) {
				range.expand("word");
				var ret = range.toString();
				range.detach();
				return (ret);
			}
			currentPos += 1;
		}
	} else {
		for (var i = 0; i < elem.childNodes.length; i++) {
			var range = elem.childNodes[i].ownerDocument.createRange();
			range.selectNodeContents(elem.childNodes[i]);
			if (range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right >= x &&
				range.getBoundingClientRect().top <= y && range.getBoundingClientRect().bottom >= y) {
				range.detach();
				return (getWordAtPoint(elem.childNodes[i], x, y));
			} else {
				range.detach();
			}
		}
	}
	return (null);
}

function checkAvailable() {
	if (selectTxt == "" || !/[a-zA-Z]/.test(selectTxt) || lastSelectTxt == selectTxt)
		return false;

	var ele = event.toElement || event.relatedTarget;
	var result = div.compareDocumentPosition(ele);

	if (result == 20)
		return false;

	lastSelectTxt = selectTxt;
	selectTxt = selectTxt.replace(new RegExp("([A-Z][a-z]+)", 'g'), " $1 ").trim();

	return true;
}

function query(value) {
	var start = performance.now();
	chrome.runtime.sendMessage({
		"method": "translate",
		"value": value
	}, function (json) {
		if (json) {
			var time = ((performance.now() - start) / 1000).toFixed(3);
			display(eval("(" + json + ")"), time);
		}
	});
}

function createDiv() {
	div = document.createElement("div");
	div.setAttribute("id", "trans_main");
	document.body.appendChild(div);
}

function display(data, time) {
	var html = ['<div class="trans_title">']
	html.push('<strong>', selectTxt.substr(0, 18), selectTxt.length > 18 ? "..." : "", "</strong>");
	html.push('<span style="float:right;color:#0F74BD">(', time, " seconds)</span>")
	html.push('</div>');
	html.push('<div class="trans_content"></div>');
	html.push('<div style="padding-bottom:2px"></div>');
	div.innerHTML = html.join('');
	div.childNodes[1].innerText = data.translate.dit
	div.style.display = "block";
}

createDiv();
