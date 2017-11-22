var div = null;
var selectTxt = null;
var lastSelectTxt = null;

document.addEventListener("copy", function () {
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
    var left = rect.left;

    if (left < 0)
        left = 0

    div.style.left = document.body.scrollLeft + document.documentElement.scrollLeft + left + "px";
    div.style.top = document.body.scrollTop + document.documentElement.scrollTop + rect.bottom + 5 + "px";

    query(selectTxt);
};

function checkAvailable() {
    if (selectTxt == "" || lastSelectTxt == selectTxt)
        return false;

    var ele = event.toElement || event.relatedTarget;
    var result = div.compareDocumentPosition(ele);

    if (result == 20)
        return false;

    lastSelectTxt = selectTxt;

    return true;
}

function query(value) {
    var start = performance.now();
    chrome.runtime.sendMessage({
        "method": "translate",
        "value": value
    }, function (json) {
        if (json) {
            var data = eval("(" + json + ")");
            // if (data.translate.text.substr(0, 3) != selectTxt.substr(0, 3))
            //     return;
            var time = ((performance.now() - start) / 1000).toFixed(3);
            display(data, time);
        }
    });
}

function createDiv() {
    div = document.createElement("div");
    div.setAttribute("id", "trans_main");
    document.body.appendChild(div);
}

function display(data, time) {
    var html = ['<div class="trans_title">'];
    html.push('<b>', selectTxt.substr(0, 5), selectTxt.length > 5 ? '...' : '', '</b>');

    var sourceLanguage = data[2];
    html.push('<span style="float:right;color:#0F74BD">(', sourceLanguage, '→中)(', time, ' seconds)</span>');
    html.push('</div>');

    var dictionary = data[1];
    if (dictionary == null) {
        var content = data[0];
        for (var i = 0; i < content.length; i++)
            html.push('<div class="trans_content">', content[i][0], '</div>');
    }
    else {
        for (var i = 0; i < dictionary.length; i++) {
            var translation = dictionary[i];
            var str = '<i><b>' + translation[0] + '&nbsp;</b></i>';
            for (var j = 0; j < translation[1].length && j < 3; j++) {
                str += translation[1][j] + ',';
            }
            html.push('<div class="trans_content">', str, '</div>');
        }
    }

    html.push('<div style="padding-bottom:2px"></div>');

    div.innerHTML = html.join('');
    div.style.display = "block";
}

createDiv();
