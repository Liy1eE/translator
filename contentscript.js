let div = null;
let selectTxt = null;
let lastSelectTxt = null;

let showId = null;
let hideId = null;

function clear() {
    if (showId) {
        clearInterval(showId);
        showId = null;
    }
    if (hideId) {
        clearInterval(hideId);
        hideId = null;
    }
}

function show() {
    clear();
    div.style.display = "block";
    showId = setInterval(function () {
        if (div.style.opacity <= 1)
            div.style.opacity = div.style.opacity * 1 + 0.06;
        else
            clear();
    }, 0)
}

function hide() {
    clear();
    hideId = setInterval(function () {
        if (div.style.opacity > 0)
            div.style.opacity -= 0.04;
        else {
            clear();
            div.style.display = "none";
        }
    }, 0)
}

document.addEventListener("copy", function () {
    hide();
}, true);

document.onmousedown = function (event) {
    let ele = event.toElement || event.relatedTarget;
    let result = div.compareDocumentPosition(ele);

    if (result !== 20)
        hide();
};

document.onmouseup = function () {
    let selection = window.getSelection();
    selectTxt = selection.toString().trim();

    if (!checkAvailable()) {
        lastSelectTxt = null;
        return;
    }

    let rect = selection.getRangeAt(0).getBoundingClientRect();
    let left = rect.left;

    // search bar pos
    if (left === 0)
        return;

    if (left < 0)
        left = 0;

    div.style.left = document.body.scrollLeft + document.documentElement.scrollLeft + left + "px";
    div.style.top = document.body.scrollTop + document.documentElement.scrollTop + rect.bottom + 5 + "px";

    query(selectTxt);
};

function checkAvailable() {
    if (selectTxt === "" || lastSelectTxt === selectTxt || /[\u4e00-\u9fa5]/g.test(selectTxt))
        return false;

    let ele = event.toElement || event.relatedTarget;
    let result = div.compareDocumentPosition(ele);

    if (result === 20)
        return false;

    lastSelectTxt = selectTxt;

    return true;
}

function query(value) {
    let start = performance.now();
    chrome.runtime.sendMessage({
        "method": "translate",
        "value": value
    }, function (value) {
        let time = ((performance.now() - start) / 1000).toFixed(3);
        display(value, time);
    });
}

function createDiv() {
    div = document.createElement("div");
    div.setAttribute("id", "trans_main");
    div.style.opacity = 0;
    document.body.appendChild(div);
}

function display(value, time) {
    let data = value.data;
    let cocaIdx = value.cocaIdx;
    let sourceLanguage = value.sourceLanguage;

    let content = data[0];
    let source = content[0][1];
    let dictionary = data[1];

    let title = null;
    if (cocaIdx)
        title = `${source}[${cocaIdx}]`;
    else
        title = `${source.substr(0, 15)}${source.length > 15 ? "..." : ""}`;


    let dict_txt = "";
    if (dictionary) {
        for (let i = 0; i < dictionary.length; i++) {
            let translation = dictionary[i];
            let str = `<i><b>${translation[0]}&nbsp;</b></i>`;
            let length = Math.min(translation[1].length, 3);
            for (let j = 0; j < length; j++) {
                str += translation[1][j] + (j === length - 1 ? ";" : ",");
            }
            dict_txt += `<div class="trans_content">${str}</div>`;
        }
    } else {
        let length = content.length;
        let prefix = length > 1 ? "·" : "";
        for (let i = 0; i < length; i++)
            dict_txt += `<div class="trans_content">${prefix}${content[i][0]}</div>`;
    }

    div.innerHTML = `
<div class="trans_title">
    <b>${title}</b>
    <span style="float:right;color:#0F74BD">
        (${sourceLanguage}→中文)(${time} 秒)
    </span>
</div>
${dict_txt}
<div style="padding-bottom:2px"></div>
`;

    show()
}

createDiv();
