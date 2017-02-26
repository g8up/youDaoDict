/**
 * @author Dongxu Huang
 * @date   2010-2-21
 *
 * @optimizing Simga
 * @date 2014.09.20 cut verbose code
 */
var body = document.body;
var Options = {},
	last_frame;
var list = [];
var last_time = 0,
	last_request_time = 0;
var TriggerDelay = 350;

function getOptions(next) {
	chrome.runtime.sendMessage({
		'action': "getOptions"
	}, function(response) {
		if (response.options) {
			Options = response.options;
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
	if (!e.ctrlKey || e.shiftKey || e.altKey) {
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
		closePanel();
		last_frame = null;
		return true;
	}
	return false
}

function closePanel() {
	if( content ) {
		content.classList.remove('fadeIn');
		content.innerHTML = '';
	}
}

function createPopUpEx(html, x, y, screenx, screeny) {
	if( html !== undefined ){
		var sel = window.getSelection();
		if( sel && sel.rangeCount ){
			createPopUp(html, sel.getRangeAt(0).startContainer.nodeValue, x, y, screenx, screeny);
		}
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
	var frame = getYoudaoDictPanelCont( html );

	body.style.position = "static";
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
	if (frame.style.left + frame_width > screen_width) {
		frame.style.left -= frame.style.left + frame_width - screen_width;
	}
	var leftbottom = frame_top + 10 + frame.clientHeight;
	if (leftbottom < y) {
		var newtop = y - frame.clientHeight;
		frame.style.top = newtop + 'px';
	}
	frame.style.display = '';// 设定了新节点位置，清除隐藏属性
	list.push(frame);
	last_time = new Date().getTime();
	last_frame = frame;
}

var content = null;
function getYoudaoDictPanelCont( html ){
	var panelId = 'yddWrapper';
	var panel = document.querySelector('div#yddWrapper');
	if( !panel ){
		panel = document.createElement('div');
		panel.style.display = 'none';// 此时新生成的节点还没确定位置，默认隐藏，以免页面暴露
		panel.id = panelId;
		markTagOrigin( panel );
		body.appendChild(panel);
		addPanelEvent( panel );

		var tmpl = genTmpl();
		var root = panel.createShadowRoot();
		root.appendChild( document.importNode( tmpl.content, true) );
		content = root.querySelector('#ydd-content');
	}
	content.innerHTML = html;
	content.classList.add('fadeIn');
	addContentEvent();
	return panel;
}

function addPanelEvent( panel ){
	panel.setAttribute('draggable', true);
	// panel.innerHTML += html;

	panel.onmouseover = function(e) {
		inDictPannel = true;
	};
	panel.onmouseout = function(e) {
		inDictPannel = false;
	};

	// 拖放
	var distanceX, distanceY;
	panel.ondragstart = function(e) {
		distanceX = e.x - parseInt(panel.style.left);
		distanceY = e.y - parseInt(panel.style.top);
	};
	panel.ondragend = function(e) {
		panel.style.left = e.x - distanceX + 'px';
		panel.style.top = e.y - distanceY + 'px';
		distanceX = 0;
		distanceY = 0;
	};

}

function addContentEvent(){
	// 关闭按钮
	var closeBtn = content.querySelector('.ydd-close');
	closeBtn.onclick = function(e) {
		closePanel();
	};
	closeBtn = null;
	// 语音播放
	(function renderAudio() {
		var speech = content.querySelector(".ydd-voice");
		if (speech) {
			if (speech.innerHTML != '') {
				speech.classList.add('ydd-voice-icon');
				var wordAndType = speech.textContent;
				if (getOptVal('auto_speech')) {
					playAudio( wordAndType );
				}
				speech.addEventListener('click', function(e){
					playAudio( wordAndType );
				});
			}
			speech.innerHTML = '';
		}
	})();
}

function getYoudaoDict(word, next) {
	chrome.runtime.sendMessage({
		'action': 'dict',
		'word': word
	}, function(data) {
		next && next(data);
	});
}

function getYoudaoTrans(word, next) {
	chrome.runtime.sendMessage({
		'action': 'translate',
		'word': word
	}, function(data) {
		next && next(data);
	});
}

// 获取配置修改的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if( request.optionChanged ){
		Options = request.optionChanged;
		dealSelectEvent();
		dealPointEvent();
	}
});

function genTmpl(){
	var tmplId = 'yodaoDictPanel';
	var tmpl = document.querySelector('template#' + tmplId );
	if( tmpl ){
		return tmpl;
	}else{
		var _tmpl = document.createElement('template');
		_tmpl.id = tmplId;
		markTagOrigin( _tmpl );
		var cssUrl = chrome.extension.getURL('youdao-crx.css');
		_tmpl.innerHTML = '<style> @import "'+ cssUrl +'"; </style> <div id="ydd-content"></div>'; // for panel content
		body.appendChild( _tmpl );
		return _tmpl;
	}
}
/**
 * 给插入的节点做标识，以免 web page 的开发者迷惑。
 */
function markTagOrigin ( tag ){
	if( tag ){
		tag.setAttribute('tag-info', '这是有道词典 “Chrome 划词扩展 V3” 插入的节点');
	}
}