var ColorsChanged = true;
initIcon();

function initIcon() {
    if (Options['dict_enable'][1] == true) {
        chrome.browserAction.setIcon({
            path: "icon_nodict.gif"
        });
    }
}
sprintfWrapper = {
    init: function() {
        if (typeof arguments == "undefined") {
            return null;
        }
        if (arguments.length < 1) {
            return null;
        }
        if (typeof arguments[0] != "string") {
            return null;
        }
        if (typeof RegExp == "undefined") {
            return null;
        }
        var string = arguments[0];
        var exp = new RegExp(/(%([%]|(\-)?(\+|\x20)?(0)?(\d+)?(\.(\d)?)?([bcdfosxX])))/g);
        var matches = new Array();
        var strings = new Array();
        var convCount = 0;
        var stringPosStart = 0;
        var stringPosEnd = 0;
        var matchPosEnd = 0;
        var newString = '';
        var match = null;
        while (match = exp.exec(string)) {
            if (match[9]) {
                convCount += 1;
            }
            stringPosStart = matchPosEnd;
            stringPosEnd = exp.lastIndex - match[0].length;
            strings[strings.length] = string.substring(stringPosStart, stringPosEnd);
            matchPosEnd = exp.lastIndex;
            matches[matches.length] = {
                match: match[0],
                left: match[3] ? true : false,
                sign: match[4] || '',
                pad: match[5] || ' ',
                min: match[6] || 0,
                precision: match[8],
                code: match[9] || '%',
                negative: parseInt(arguments[convCount]) < 0 ? true : false,
                argument: String(arguments[convCount])
            };
        }
        strings[strings.length] = string.substring(matchPosEnd);
        if (matches.length == 0) {
            return string;
        }
        if ((arguments.length - 1) < convCount) {
            return null;
        }
        var code = null;
        var match = null;
        var i = null;
        for (i = 0; i < matches.length; i++) {
            if (matches[i].code == '%') {
                substitution = '%'
            } else if (matches[i].code == 'b') {
                matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(2));
                substitution = sprintfWrapper.convert(matches[i], true);
            } else if (matches[i].code == 'c') {
                matches[i].argument = String(String.fromCharCode(parseInt(Math.abs(parseInt(matches[i].argument)))));
                substitution = sprintfWrapper.convert(matches[i], true);
            } else if (matches[i].code == 'd') {
                matches[i].argument = String(Math.abs(parseInt(matches[i].argument)));
                substitution = sprintfWrapper.convert(matches[i]);
            } else if (matches[i].code == 'f') {
                matches[i].argument = String(Math.abs(parseFloat(matches[i].argument)).toFixed(matches[i].precision ? matches[i].precision : 6));
                substitution = sprintfWrapper.convert(matches[i]);
            } else if (matches[i].code == 'o') {
                matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(8));
                substitution = sprintfWrapper.convert(matches[i]);
            } else if (matches[i].code == 's') {
                matches[i].argument = matches[i].argument.substring(0, matches[i].precision ? matches[i].precision : matches[i].argument.length)
                substitution = sprintfWrapper.convert(matches[i], true);
            } else if (matches[i].code == 'x') {
                matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(16));
                substitution = sprintfWrapper.convert(matches[i]);
            } else if (matches[i].code == 'X') {
                matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(16));
                substitution = sprintfWrapper.convert(matches[i]).toUpperCase();
            } else {
                substitution = matches[i].match;
            }
            newString += strings[i];
            newString += substitution;
        }
        newString += strings[i];
        return newString;
    },
    convert: function(match, nosign) {
        if (nosign) {
            match.sign = '';
        } else {
            match.sign = match.negative ? '-' : match.sign;
        }
        var l = match.min - match.argument.length + 1 - match.sign.length;
        var pad = new Array(l < 0 ? 0 : l).join(match.pad);
        if (!match.left) {
            if (match.pad == "0" || nosign) {
                return match.sign + pad + match.argument;
            } else {
                return pad + match.sign + match.argument;
            }
        } else {
            if (match.pad == "0" || nosign) {
                return match.sign + match.argument + pad.replace(/0/g, ' ');
            } else {
                return match.sign + match.argument + pad;
            }
        }
    }
}
sprintf = sprintfWrapper.init;

function genTable(word, strpho, baseTrans, webTrans) {
    var lan = '';
    if (isContainKoera(word)) {
        lan = "&le=ko";
    }
    if (isContainJapanese(word)) {
        lan = "&le=jap";
    }
    var title = word;
    if ((isContainChinese(title) || isContainJapanese(title) || isContainKoera(title)) && title.length > 15) {
        title = title.substring(0, 10) + '...';
    }
    if (title.length > 25) {
        title = title.substring(0, 15) + ' ...';
    }
    var fmt = '';
    if (noBaseTrans && noWebTrans) {
        fmt = ['<div id="yddContainer" align=left style="padding:0px 0px 0px 0px;">', '<div id="yddTop" class="ydd-sp"><div id="yddTopBorderlr"><a href="http://dict.youdao.com/search?q=',
            encodeURIComponent(word), '&keyfrom=chrome.extension', lan, '" title="查看完整释义" class="ydd-icon" style="padding:0px 0px 0px 0px;padding-top:17px;" target=_blank></a> <a href="http://dict.youdao.com/search?q=',
            encodeURIComponent(word), '&keyfrom=chrome.extension', lan, '" target=_blank title="查看完整释义" id="yddKeyTitle">', title, '</a>&nbsp;<span style="font-weight:normal;font-size:10px;">', strpho, '</span><span style="float:right;font-weight:normal;font-size:10px"><a href="http://www.youdao.com/search?q=',
            encodeURIComponent(word), '&ue=utf8&keyfrom=chrome.extension" target=_blank>详细</a></span><a class="ydd-close">&times;</a></div></div>', '    <div id="yddMiddle">'
        ].join('');
    } else {
        fmt = ['<div id="yddContainer" align=left style="padding:0px 0px 0px 0px;">', '<div id="yddTop" class="ydd-sp"><div id="yddTopBorderlr"><a href="http://dict.youdao.com/search?q=',
            encodeURIComponent(word), '&keyfrom=chrome.extension', lan, '" title="查看完整释义" class="ydd-icon" style="padding:0px 0px 0px 0px;padding-top:17px;" target=_blank></a> <a href="http://dict.youdao.com/search?q=',
            encodeURIComponent(word), '&keyfrom=chrome.extension', lan, '" target=_blank title="查看完整释义" id="yddKeyTitle">', title, '</a>&nbsp;<span style="font-weight:normal;font-size:10px;">',
            strpho, '&nbsp;&nbsp;</span><span id="ydd-voice">',
            speach, '</span><span style="float:right;font-weight:normal;font-size:10px"><a href="http://dict.youdao.com/search?q=',
            encodeURIComponent(word), '&keyfrom=chrome.extension', lan, '" target=_blank>详细</a></span><a class="ydd-close">&times;</a></div></div>', '<div id="yddMiddle">'
        ].join('');
    }
    if (noBaseTrans == false) {
        var base = ['<div class="ydd-trans-wrapper" style="display:block;padding:0px 0px 0px 0px" id="yddSimpleTrans">', '      <div class="ydd-tabs"><span class="ydd-tab">基本翻译</span></div>', '      %s', '</div>'].join('');
        base = sprintf(base, baseTrans);
        fmt += base;
    }
    if (noWebTrans == false) {
        var web = [' <div class="ydd-trans-wrapper" style="display:block;padding:0px 0px 0px 0px">', '  <div class="ydd-tabs"><span class="ydd-tab">网络释义</span></div>', '  %s', '</div>'].join('');
        web = sprintf(web, webTrans);
        fmt += web;
    }
    if (noBaseTrans && noWebTrans) {
        fmt += '&nbsp;&nbsp;没有英汉互译结果<br/>&nbsp;&nbsp;<a href="http://www.youdao.com/search?q=' + encodeURIComponent(word) + '&ue=utf8&keyfrom=chrome.extension" target=_blank>请尝试网页搜索</a>';
    }
    fmt += '</div></div>';
    res = fmt;
    noBaseTrans = false;
    noWebTrans = false;
    speach = '';
    return res;
}
var noBaseTrans = false;
var noWebTrans = false;
var speach = '';
//解析返回的查询结果
function translateXML(xmlnode) {
    var translate = "<strong>查询:</strong><br/>";
    var root = xmlnode.getElementsByTagName("yodaodict")[0];
    if ("" + root.getElementsByTagName("return-phrase")[0].childNodes[0] != "undefined") var retphrase = root.getElementsByTagName("return-phrase")[0].childNodes[0].nodeValue;
    if ("" + root.getElementsByTagName("dictcn-speach")[0] != "undefined") speach = root.getElementsByTagName("dictcn-speach")[0].childNodes[0].nodeValue;
    var lang = "&le=";
    if ("" + root.getElementsByTagName("lang")[0] != "undefined") lang += root.getElementsByTagName("lang")[0].childNodes[0].nodeValue;
    var strpho = "";
    if ("" + root.getElementsByTagName("phonetic-symbol")[0] != "undefined") {
        if ("" + root.getElementsByTagName("phonetic-symbol")[0].childNodes[0] != "undefined") var pho = root.getElementsByTagName("phonetic-symbol")[0].childNodes[0].nodeValue;
        if (pho != null) {
            strpho = "&nbsp;[" + pho + "]";
        }
    }
    if ("" + root.getElementsByTagName("translation")[0] == "undefined") {
        noBaseTrans = true;
    }
    if ("" + root.getElementsByTagName("web-translation")[0] == "undefined") {
        noWebTrans = true;
    }
    var basetrans = "";
    var webtrans = "";
    var translations;
    var webtranslations;
    if (noBaseTrans == false) {
        if ("" + root.getElementsByTagName("translation")[0].childNodes[0] != "undefined") {
            translations = root.getElementsByTagName("translation");
        } else {
            noBaseTrans = true;
        }
        var i;
        for (i = 0; i < translations.length - 1; i++) {
            basetrans += '<div class="ydd-trans-container ydd-padding010">' + translations[i].getElementsByTagName("content")[0].childNodes[0].nodeValue + "</div>";
        }
        basetrans += '<div class="ydd-trans-container ydd-padding010">' + translations[i].getElementsByTagName("content")[0].childNodes[0].nodeValue + "</div>";
    }
    if (noWebTrans == false) {
        if ("" + root.getElementsByTagName("web-translation")[0].childNodes[0] != "undefined") {
            webtranslations = root.getElementsByTagName("web-translation");
        } else {
            noWebTrans = true;
        }
        var i;
        for (i = 0; i < webtranslations.length - 1; i++) {
            webtrans += '<div class="ydd-trans-container ydd-padding010"><a href="http://dict.youdao.com/search?q=' + encodeURIComponent(webtranslations[i].getElementsByTagName("key")[0].childNodes[0].nodeValue) + '&keyfrom=chrome.extension' + lang + '" target=_blank>' + webtranslations[i].getElementsByTagName("key")[0].childNodes[0].nodeValue + ":</a> ";
            webtrans += webtranslations[i].getElementsByTagName("trans")[0].getElementsByTagName("value")[0].childNodes[0].nodeValue + "<br /></div>";
        }
        webtrans += '<div class="ydd-trans-container ydd-padding010"><a href="http://dict.youdao.com/search?q=' + encodeURIComponent(webtranslations[i].getElementsByTagName("key")[0].childNodes[0].nodeValue) + '&keyfrom=chrome.extension' + lang + '" target=_blank>' + webtranslations[i].getElementsByTagName("key")[0].childNodes[0].nodeValue + ":</a> ";
        webtrans += webtranslations[i].getElementsByTagName("trans")[0].getElementsByTagName("value")[0].childNodes[0].nodeValue + "</div>";
    }
    return genTable(retphrase, strpho, basetrans, webtrans);
    //return translate;
}

function translateTransXML(xmlnode) {
    var s = xmlnode.indexOf("CDATA[");
    var e = xmlnode.indexOf("]]");
    var input_str = xmlnode.substring(s + 6, e);
    var remain = xmlnode.substring(e + 2, xmlnode.length - 1);
    s = remain.indexOf("CDATA[");
    e = remain.indexOf("]]");
    var trans_str = remain.substring(s + 6, e);
    trans_str_tmp = trans_str.trim();
    input_str_tmp = input_str.trim();
    if ((isContainChinese(input_str_tmp) || isContainJapanese(input_str_tmp) || isContainKoera(input_str_tmp)) && input_str_tmp.length > 15) {
        input_str_tmp = input_str_tmp.substring(0, 8) + ' ...';
    } else if (input_str_tmp.length > 25) {
        input_str_tmp = input_str_tmp.substring(0, 15) + ' ...';
    }
    if (trans_str_tmp == input_str_tmp) return null;
    var res = '<div id="yddContainer" align=left style="padding:0px 0px 0px 0px;" >' + '    <div id="yddTop" class="ydd-sp"><div id="yddTopBorderlr"><a href="http://fanyi.youdao.com/translate?i=' + encodeURIComponent(input_str) + '&keyfrom=chrome" class="ydd-icon" style="padding:0px 0px 0px 0px;padding-top:17px;" target=_blank">有道词典</a><div style="font-weight:normal;display: inline;">' + input_str_tmp.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, "&quot;").replace(/'/g, "&#39;") + '</div><span style="float:right;font-weight:normal;font-size:10px"><a href="http://fanyi.youdao.com/translate?i=' + encodeURIComponent(input_str) + '&smartresult=dict&keyfrom=chrome.extension" target=_blank>详细</a></span><a class="ydd-close">&times;</a></div></div>' + '    <div id="yddMiddle">' + '      <div class="ydd-trans-wrapper" id="yddSimpleTrans">' + '        <div class="ydd-trans-container ydd-padding010">' + trans_str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, "&quot;").replace(/'/g, "&#39;") + '</div>' + '      ' + '	</div>' + '   </div>' + '  </div>';
    return res;
}

function fetchWordOnline(word, callback) {
    var lang = '';
    if (isContainKoera(word)) {
        lang = '&le=ko';
    }
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(data) {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var dataText = translateXML(xhr.responseXML);
                if (dataText != null) callback(dataText);
            }
        }
    }
    var url = 'http://dict.youdao.com/fsearch?client=deskdict&keyfrom=chrome.extension&q=' + encodeURIComponent(word) + '&pos=-1&doctype=xml&xmlVersion=3.2&dogVersion=1.0&vendor=unknown&appVer=3.1.17.4208&le=eng';
    xhr.open('GET', url, true);
    xhr.send();
}
var _word;
var _callback;
var _timer;

function fetchWord(word, callback) {
    if (isContainKoera(word)) {
        fetchWordOnline(word, callback);
        return;
    }
    var xhr = new XMLHttpRequest();
    _word = word;
    _callback = callback;
    xhr.onreadystatechange = function(data) {
        clearTimeout(_timer);
    }
    var url = 'http://127.0.0.1:8999/word=' + word + '&';
    xhr.open('GET', url, true);
    xhr.send();
    _timer = setTimeout(handleTimeout, 600);
}

function handleTimeout() {
    fetchWordOnline(_word, _callback);
}

function fetchTranslate(words, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(data) {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var dataText = translateTransXML(xhr.responseText);
                if (dataText != null) callback(dataText);
            } else {
                //callback(null);
            }
        }
    }
    var url = "http://fanyi.youdao.com/translate?client=deskdict&keyfrom=chrome.extension&xmlVersion=1.1&dogVersion=1.0&ue=utf8&i=" + encodeURIComponent(words) + "&doctype=xml";
    xhr.open('GET', url, true);
    xhr.send();
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    var _action = request.action;
    switch (_action) {
        case 'getOptions':
            if (ColorsChanged == true) {
                sendResponse({
                    init: "globalPages",
                    ChangeColors: "true",
                    ColorOptions: Options
                });
            }
            break;
        case 'setOptions':
            Options = request.data;
            publishOptionChangeToTabs();
            break;
        case 'dict':
            if (navigator.appVersion.indexOf("Win") > -1) {
                fetchWordOnline(request.word, sendResponse);
            } else {
                fetchWordOnline(request.word, sendResponse);
            }
            break;
        case 'translate':
            fetchTranslate(request.word, sendResponse);
            break;
        default:
            break;
    }
});
/**
 * 将配置更新通知已经打开的 Tab
 */
function publishOptionChangeToTabs() {
    chrome.tabs.query({
        status:"complete"
    }, function(tabs) {
        if (tabs.length) {
            tabs.forEach(function(tab) {
                chrome.tabs.sendMessage(tab.id, {
                    optionChanged: Options
                }, function(rep) {
                    // console.log('option changed event has been published');
                });
            });
        }
    });
}