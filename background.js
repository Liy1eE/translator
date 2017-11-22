chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.method = "translate") {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "https://translate.google.cn/translate_a/single", true);
        xhr.setRequestHeader("CONTENT-TYPE", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200)
                sendResponse(xhr.responseText);
        }
        // sl:source language, tl:translation language, q:query, dj:detail json(value: 1)
        // dt:detail translation(value: t-translation, bd-dictionary)
        xhr.send("client=gtx&sl=auto&tl=zh-CN&dt=t&dt=bd&q=" + message.value);
        return true;
    }
});
