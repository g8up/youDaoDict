/**
 * @author Dongxu Huang
 * @date   2010-2-21
 *
 * @optimizing Simga
 * @date 2014.09.20 cut verbose code
 */
var body = document.querySelector('body');
var Options = {},
    last_frame;
var list = [];
var last_time = 0,
    last_request_time = 0;
var TriggerDelay = 350;

function getOptions(next) {
    chrome.extension.sendRequest({
        'action': "getOptions"
    }, function(response) {
        if (response.ColorOptions) {
            Options = response.ColorOptions;
            dealSelectEvent();
            dealPointEvent();
        }
        next && next();
    });
}

function getOptVal(strKey) {
    if (Options !== null) {
        return Options[strKey][1];
    }
}

getOptions();

// 划词翻译
function _onDictEvent(e) {
    clearTimeout(window._ydTimerSelect);
    window._ydTimerSelect = setTimeout(function() {
        var word = window.getSelection().toString();
        if (word !== '') {
            word = word.trim();
        }
        if (word.length < 1 || word.length > 2000) {
            OnCheckCloseWindow();
            return;
        }
        if (inDictPannel) return;
        OnCheckCloseWindow();
        if (getOptVal("english_only")) {
            if (isContainJapanese(word) || isContainKoera(word) || isContainChinese(word)) {
                return;
            }
            word = ExtractEnglish(word);
        } else if ((!isContainChinese(word) && spaceCount(word) >= 3) || (isContainChinese(word) && word.length > 4) || isContainJapanese(word) && word.length > 4) {
            var xx = e.pageX,
                yy = e.pageY,
                sx = e.screenX,
                sy = e.screenY;
            getYoudaoTrans(word, e.pageX, e.pageY, e.screenX, e.screenY, function(data) {
                createPopUpEx(data, xx, yy, sx, sy);
            });
            return;
        }
        // TODO: add isEnglish function
        if (word != '') {
            OnCheckCloseWindowForce();
            var xx = e.pageX,
                yy = e.pageY,
                sx = e.screenX,
                sy = e.screenY;
            getYoudaoDict(word, e.pageX, e.pageY, e.screenX, e.screenY, function(data) {
                createPopUpEx(data, xx, yy, sx, sy);
            });
            return;
        }
    }, TriggerDelay);
}

function dealSelectEvent(){
    if ( getOptVal("dict_enable") ) {
        body.addEventListener("mouseup", _onDictEvent);
    }else{
        body.removeEventListener("mouseup", _onDictEvent);
    }
}

var prevC, prevO, c;

// 指词即译
function _onScrTrans(e) {
    clearTimeout(window._ydTimer);
    if (!e.ctrlKey) {
        return;
    }
    window._ydTimer = setTimeout(function() {
        if (!e.ctrlKey) {
            return;
        }
        var caretRange = document.caretRangeFromPoint(e.clientX, e.clientY);
        if (!caretRange) return true;
        pX = e.pageX;
        pY = e.pageY;
        var so = caretRange.startOffset,
            eo = caretRange.endOffset;
        if (prevC === caretRange.startContainer && prevO === so) return true;
        prevC = caretRange.startContainer;
        prevO = so;
        var tr = caretRange.cloneRange(),
            text = '';
        if (caretRange.startContainer.data) {
            while (so >= 1) {
                tr.setStart(caretRange.startContainer, --so);
                text = tr.toString();
                if (!isAlpha(text.charAt(0))) {
                    tr.setStart(caretRange.startContainer, so + 1);
                    break;
                }
            }
        }
        if (caretRange.endContainer.data) {
            while (eo < caretRange.endContainer.data.length) {
                tr.setEnd(caretRange.endContainer, ++eo);
                text = tr.toString();
                if (!isAlpha(text.charAt(text.length - 1))) {
                    tr.setEnd(caretRange.endContainer, eo - 1);
                    break;
                }
            }
        }
        var word = tr.toString();
        if (word.length >= 1) {
            setTimeout(function() {
                var selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(tr);
                var xx = pX,
                    yy = pY,
                    sx = e.screenX,
                    sy = e.screenY;
                getYoudaoDict(word, pX, pY, e.screenX, e.screenY, function(data) {
                    createPopUpEx(data, xx, yy, sx, sy);
                });
            }, 50);
        }
    }, TriggerDelay);
}

function dealPointEvent(){
    if ( getOptVal("ctrl_only") ) {
        document.addEventListener('mousemove', _onScrTrans);
    }else{
        document.removeEventListener('mousemove', _onScrTrans);
    }
}

document.onmousedown = function(e) {
    OnCheckCloseWindow();
}

function OnCheckCloseWindow() {
    if (inDictPannel) return;
    if (last_frame) {
        var cur = new Date().getTime();
        if (cur - last_time < 500) {
            return;
        }
        while (list.length != 0) {
            body.removeChild(list.pop());
        }
        last_frame = null;
        return true;
    }
    return false
}

function OnCheckCloseWindowForce() {
    inDictPannel = false;
    if (last_frame) {
        var cur = new Date().getTime();
        while (list.length != 0) {
            body.removeChild(list.pop());
        }
        last_frame = null;
        return true;
    }
    return false;
}

function createPopUpEx(html, x, y, screenx, screeny) {
    OnCheckCloseWindowForce();
    var sel = window.getSelection();
    if( sel && sel.rangeCount ){
        createPopUp(html, sel.getRangeAt(0).startContainer.nodeValue, x, y, screenx, screeny);
    }
}
// 鼠标是否在弹出框上
var inDictPannel = false;

function createPopUp(html, senctence, x, y, screenX, screenY) {
    var frame_height = 150;
    var frame_width = 300;
    var padding = 10;
    var frame_left = 0;
    var frame_top = 0;
    var frame = document.createElement('div');
    frame.id = 'yddWrapper';
    frame.setAttribute('draggable', true);
    var screen_width = screen.availWidth;
    var screen_height = screen.availHeight;
    if (screenX + frame_width < screen_width) {
        frame_left = x;
    } else {
        frame_left = (x - frame_width - 2 * padding);
    }
    frame.style.left = frame_left + 'px';
    if (screenY + frame_height + 20 < screen_height) {
        frame_top = y;
    } else {
        frame_top = (y - frame_height - 2 * padding);
    }
    frame.style.top = frame_top + 10 + 'px';
    frame.style.position = 'absolute';
    if (frame.style.left + frame_width > screen_width) {
        frame.style.left -= frame.style.left + frame_width - screen_width;
    }
    frame.innerHTML += html;
    frame.onmouseover = function(e) {
        inDictPannel = true;
    };
    frame.onmouseout = function(e) {
        inDictPannel = false;
    };
    body.style.position = "static";
    body.appendChild(frame);
    list.push(frame);
    // 拖放
    var distanceX, distanceY;
    frame.ondragstart = function(e) {
        distanceX = e.x - parseInt(frame.style.left);
        distanceY = e.y - parseInt(frame.style.top);
    };
    frame.ondragend = function(e) {
        frame.style.left = e.x - distanceX + 'px';
        frame.style.top = e.y - distanceY + 'px';
        distanceX = 0;
        distanceY = 0;
    };
    document.querySelector('#yddMiddle').setAttribute('draggable', true);
    document.querySelector('#yddMiddle').ondragstart = function(e) {
        e.preventDefault();
    };
    // 关闭按钮
    var closeBtn = document.querySelector('.ydd-close');
    closeBtn.onclick = function(e) {
        OnCheckCloseWindowForce();
    };
    closeBtn = null;
    // 语音播放
    renderAudio();
    // 确定位置
    var leftbottom = frame_top + 10 + document.getElementById("yddWrapper").clientHeight;
    if (leftbottom < y) {
        var newtop = y - document.getElementById("yddWrapper").clientHeight;
        frame.style.top = newtop + 'px';
    }
    if (last_frame) {
        if (last_frame.style.top == frame.style.top && last_frame.style.left == frame.style.left) {
            body.removeChild(frame);
            list.pop();
            return;
        }
    }
    last_time = new Date().getTime();
    last_frame = frame;
}

function renderAudio() {
    var speech = document.getElementById("ydd-voice");
    if (speech) {
        if (window.location.protocol == 'http:') {
            if (speech.innerHTML != '') {
                speech.classList.add('ydd-void-icon');
                var audioSrc = "http://dict.youdao.com/speech?audio=" + speech.innerHTML;
                var audio = document.createElement('audio');
                if (getOptVal('auto_speech')) {
                    // audio.play();
                    audio.autoplay = true;
                }
                audio.src = audioSrc;
                speech.addEventListener('click', function(e){
                    audio.play();
                });
            }
        }
        speech.innerHTML = '';
    }
}

function getYoudaoDict(word, x, y, screenX, screenY, next) {
    chrome.extension.sendRequest({
        'action': 'dict',
        'word': word,
        'x': x,
        'y': y,
        'screenX': screenX,
        'screenY': screenY
    }, function(data) {
        next && next(data);
    });
}

function getYoudaoTrans(word, x, y, screenX, screenY, next) {
    chrome.extension.sendRequest({
        'action': 'translate',
        'word': word,
        'x': x,
        'y': y,
        'screenX': screenX,
        'screenY': screenY
    }, function(data) {
        next && next(data);
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // console.log( request.optionChanged);
    if( request.optionChanged ){
        Options = request.optionChanged;
        dealSelectEvent();
        dealPointEvent();
    }
});