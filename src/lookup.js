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
function onSelectToTrans(e) {
	clearTimeout(window._ydTimerSelect);
	window._ydTimerSelect = setTimeout(function() {
		if (inDictPannel) return;
		OnCheckCloseWindow();
		var word = window.getSelection().toString();
		if (word !== '') {
			word = word.trim();
		}
		if (word.length < 1 || word.length > 2000) {
			return;
		}
		var xx = e.pageX,
			yy = e.pageY,
			sx = e.screenX,
			sy = e.screenY;
		var hasJapanese = isContainJapanese(word),
			hasChinese = isContainChinese(word);
		if (getOptVal("english_only")) {
			var hasKoera = isContainKoera(word);
			if ( hasJapanese || hasChinese || hasKoera) {
				return;
			}
			word = ExtractEnglish(word);
			// TODO: add isEnglish function
			if( word !== ''){
				getYoudaoDict(word, function(data) {
					createPopUpEx(data, xx, yy, sx, sy);
				});
			}
		} else if ((!hasChinese && spaceCount(word) >= 3)
				|| (hasChinese && word.length > 4)
				|| hasJapanese && word.length > 4) {
			getYoudaoTrans(word, function(data) {
				createPopUpEx(data, xx, yy, sx, sy);
			});
		}
	}, TriggerDelay);
}

function dealSelectEvent(){
	if ( getOptVal("dict_enable") ) {
		body.removeEventListener("mouseup", onSelectToTrans);
		body.addEventListener("mouseup", onSelectToTrans);
	}else{
		body.removeEventListener("mouseup", onSelectToTrans);
	}
}

var prevC, prevO, c;
var _ydTimerPoint = null;
// 指词即译
function onPointToTrans(e) {
	clearTimeout(_ydTimerPoint);
	if (!window.event.ctrlKey || window.event.shiftKey || window.event.altKey) {
		return;
	}
	_ydTimerPoint = setTimeout(function() {
		var caretRange = document.caretRangeFromPoint(e.clientX, e.clientY);
		if (!caretRange) return true;
		var so = caretRange.startOffset,
			eo = caretRange.endOffset;
		if (prevC === caretRange.startContainer && prevO === so) return true;
		prevC = caretRange.startContainer;
		prevO = so;
		var tr = caretRange.cloneRange(),
			_tempText = '';
		if (caretRange.startContainer.data) {
			while (so >= 1) {
				tr.setStart(caretRange.startContainer, --so);
				_tempText = tr.toString();
				if (!isAlpha(_tempText.charAt(0))) {
					tr.setStart(caretRange.startContainer, so + 1);
					break;
				}
			}
		}
		if (caretRange.endContainer.data) {
			while (eo < caretRange.endContainer.data.length) {
				tr.setEnd(caretRange.endContainer, ++eo);
				_tempText = tr.toString();
				if (!isAlpha(_tempText.charAt(_tempText.length - 1))) {
					tr.setEnd(caretRange.endContainer, eo - 1);
					break;
				}
			}
		}
		var word = tr.toString();
		if (word.length >= 1) {
			var xx = e.pageX,
				yy = e.pageY,
				sx = e.screenX,
				sy = e.screenY;
			var selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(tr);
			getYoudaoDict(word, function(data) {
				createPopUpEx(data, xx, yy, sx, sy);
			});
		}
	}, TriggerDelay);
}

function dealPointEvent(){
	if ( getOptVal("ctrl_only") ) {
		document.removeEventListener('mousemove', onPointToTrans);
		document.addEventListener('mousemove', onPointToTrans);
	}else{
		document.removeEventListener('mousemove', onPointToTrans);
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

function closeWindow() {
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
	closeWindow();
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
	var frame = getYoudaoDictPanelCont();
	frame.setAttribute('draggable', true);
	// frame.innerHTML += html;

	frame.onmouseover = function(e) {
		inDictPannel = true;
	};
	frame.onmouseout = function(e) {
		inDictPannel = false;
	};

	body.style.position = "static";
	body.appendChild(frame);
	shadow( frame, html);
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
	// 确定位置
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
	var leftbottom = frame_top + 10 + frame.clientHeight;
	if (leftbottom < y) {
		var newtop = y - frame.clientHeight;
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

function getYoudaoDictPanelCont(){
	var panelId = 'yddWrapper';
	var panel = document.querySelector('div#yddWrapper');
	if( panel ){
		return panel;
	}else{
		var _panel = document.createElement('div');
		_panel.id = panelId;
		return _panel;
	}
}

function getYoudaoDict(word, next) {
	chrome.extension.sendRequest({
		'action': 'dict',
		'word': word
	}, function(data) {
		next && next(data);
	});
}

function getYoudaoTrans(word, next) {
	chrome.extension.sendRequest({
		'action': 'translate',
		'word': word
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

function get( url ) {
	return new Promise(function(resolve, reject){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					var dataText = xhr.responseText;
					resolve( dataText );
				}else{
					reject( xhr.statusText );
				}
			}
		}
		req.onerror = function() {
	    	reject( "Network Error" );
	    };
		xhr.open('GET', url, true);
		xhr.send();
	});
}

function shadow( host, html ){
	var tmpl = genTmpl();

	/*if( getCSS ){
		getCSS(function(style){
			tmpl.appendChild(style);
			getCSS = null;
			_shadow();
		});
		return;
	}*/
	_shadow();
	function _shadow(){
		var root = host.createShadowRoot();
		tmpl.content.querySelector('#content').innerHTML = html;
		root.appendChild( document.importNode( tmpl.content, true) );
	}
}

function getCSS( callback ){
	return new Promise(function( resolve, reject){
		var url = chrome.extension.getURL("youdao-crx.css");
		get( url).then(function(css){
			var style = document.createElement('style');
			style.textContent = css;
			resolve( style );
		});
	});
}

function genTmpl(){
	var tmplId = 'yodaoDictPanel';
	var tmpl = document.querySelector('template#' + tmplId );
	if( tmpl ){
		return tmpl;
	}else{
		var _tmpl = document.createElement('template');
		_tmpl.id = tmplId;
		_tmpl.innerHTML = '<style> @import "chrome-extension://nfgfijaedapejnbpfnloblfedmnhifij/youdao-crx.css"; </style> <div id="content"></div>'; // for panel content
		body.appendChild( _tmpl );
		return _tmpl;
	}
}

function getTmpl( callback ){
	return new Promise(function(resolve, reject) {
		var url = chrome.extension.getURL("webcomponent-panel.html");
		get( url).then(function( tmplHTML ){
			resolve(tmplHTML);
		});
	});

}

