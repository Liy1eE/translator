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

    // search bar pos
    if (left == 0)
        return

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
    }, function (value) {
        var time = ((performance.now() - start) / 1000).toFixed(3);
        display(value, time);
    });
}

function createDiv() {
    div = document.createElement("div");
    div.setAttribute("id", "trans_main");
    document.body.appendChild(div);
}

function display(value, time) {
    var data = value.data;
    var cocaIdx = value.cocaIdx;

    var title = null;
    if (cocaIdx)
        title = selectTxt + '[' + cocaIdx + ']';
    else
        title = selectTxt.substr(0, 8) + (selectTxt.length > 8 ? '...' : '');

    var html = ['<div class="trans_title">'];
    html.push('<b>', title, '</b>');

    var content = data[0];
    var dictionary = data[1];
    var sourceLanguage = data[2];


    html.push('<span style="float:right;color:#0F74BD">(', sourceLanguage, ')(', time, ' seconds)</span>');
    html.push('</div>');

    if (dictionary) {
        for (var i = 0; i < dictionary.length; i++) {
            var translation = dictionary[i];
            var str = '<i><b>' + translation[0] + '&nbsp;</b></i>';
            var length = Math.min(translation[1].length, 3)
            for (var j = 0; j < length; j++) {
                str += translation[1][j] + (j == length - 1 ? ';' : ',');
            }
            html.push('<div class="trans_content">', str, '</div>');
        }
    } else {
        for (var i = 0; i < content.length; i++)
            html.push('<div class="trans_content">', content[i][0], '</div>');
    }

    html.push('<div style="padding-bottom:2px"></div>');

    div.innerHTML = html.join('');
    div.style.display = 'block';
}

createDiv();
