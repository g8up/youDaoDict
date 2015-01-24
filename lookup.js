/**
 * @author Dongxu Huang
 * @date   2010-2-21
 *
 * @optimizing Simga
 * @date 2014.09.20 cut verbose code
 */
var body = document.querySelector('body');

var Options,
	last_frame,
	last_div;
var list = [];
var last_time = 0,
	last_request_time = 0;

var youdaoStyle = document.createElement("style"),
	styleContent = document.createTextNode("#yddContainer{display:block;font-family:Microsoft YaHei;position:relative;width:100%;height:100%;font-size:12px;border:1px solid #4b7598;background:#fff;}#yddTop{display:block;height:22px;cursor:move;border-bottom: 1px solid #d7e3eb; background: #e1f1fb;}#yddTopBorderlr{display:block;position:static;height:22px;line-height:22px;padding:0 28px;font-size:12px;color:#5079bb;font-weight:bold;}#yddWrapper .ydd-icon{display: inline-block; position: absolute; left: 5px; top: 2px; width: 17px; height: 17px;background:url(" + chrome.extension.getURL("icon-yd-dict.png") + ") no-repeat;}.ydd-close{display: inline-block; width: 20px; height: 22px; line-height: 22px; font-size: 16px; position: absolute; right: 0; padding-left: 4px; text-decoration: none!important; cursor: pointer;}#yddKeyTitle{float:left;text-decoration:none}#yddMiddle{display:block;margin-bottom:10px}.ydd-tabs{display:block;margin:5px 0;padding:0 5px;height:18px;border-bottom:1px solid}.ydd-tab{display:block;float:left;height:18px;margin:0 5px -1px 0;padding:0 4px;line-height:18px;border:1px solid;border-bottom:none}.ydd-trans-container{display:block;line-height:160%}.ydd-trans-container a{text-decoration:none;}#yddBottom{position:absolute;bottom:0;left:0;width:100%;height:22px;line-height:22px;overflow:hidden;background-position:left -22px}.ydd-padding010{padding:0 10px}#yddWrapper{-webkit-user-drag:element;color:#252525;z-index:10001;box-shadow: 2px 2px 4px gray;}#yddWrapper a,#yddWrapper a:hover,#yddWrapper a:visited{color:#50799b}#yddWrapper .ydd-tabs{color:#959595}.ydd-tabs,.ydd-tab{background:#fff;border-color:#d5e7f3}#yddBottom{color:#363636}#yddWrapper{min-width:250px;max-width:400px;}#ydd-voice{margin-left:2px;height:15px;width:15px}#ydd-voice object{vertical-align: top;}");

youdaoStyle.type = "text/css";
youdaoStyle.info = "youdaoDict";
if (youdaoStyle.styleSheet) {
	youdaoStyle.styleSheet.cssText = styleContent.nodeValue;
} else {
	youdaoStyle.appendChild(styleContent);
	document.querySelector("head").appendChild(youdaoStyle)
}

function getOptions(next) {
	chrome.extension.sendRequest({
		'action': "getOptions"
	}, function(response) {
		if (response.ColorOptions) {
			Options = response.ColorOptions;
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

body.addEventListener("mouseup", function OnDictEvent(e) {

	var word = window.getSelection().toString();
	if( word !== '' ){
		word = word.trim();
	}
	if ( word.length < 1 || word.length > 2000 ) {
		OnCheckCloseWindow();
		return;
	}
	/*read options*/
	getOptions(function() {
		if (inDictPannel) return;
		OnCheckCloseWindow();

		if (getOptVal("dict_disable")) {
			return;
		}
		if (!getOptVal("ctrl_only") && e.ctrlKey) {
			return;
		}
		if (getOptVal("ctrl_only") && !e.ctrlKey) {
			return;
		}

		if (getOptVal("english_only")) {
			if (isContainJapanese(word) || isContainKoera(word) || isContainChinese(word)) {
				return;
			}
			word = ExtractEnglish(word);
		} else if ((!isContainChinese(word) && spaceCount(word) >= 3) ||
			(isContainChinese(word) && word.length > 4) ||
			isContainJapanese(word) && word.length > 4) {
			var xx = e.pageX, yy = e.pageY, sx = e.screenX, sy = e.screenY;
			getYoudaoTrans(word, e.pageX, e.pageY, e.screenX, e.screenY,function( data ){
				createPopUpEx(data, xx, yy, sx, sy);
			});
			return;
		}
		// TODO: add isEnglish function
		if (word != '') {
			OnCheckCloseWindowForce();
			var xx = e.pageX, yy = e.pageY, sx = e.screenX, sy = e.screenY;
			getYoudaoDict(word, e.pageX, e.pageY, e.screenX, e.screenY,function( data ){
				createPopUpEx(data, xx, yy, sx, sy);
			});
			return;
		}
	});
}, false);

var prevC, prevO, prevWord, c;

document.addEventListener('mousemove', function onScrTrans(e) {
	clearTimeout(window._ydTimer);
	window._ydTimer = setTimeout(function() {
		if (!getOptVal("ctrl_only")) {
			return;
		} else if (!e.ctrlKey) {
			return true;
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
		if (caretRange.startContainer.data){
			while (so >= 1) {
				tr.setStart( caretRange.startContainer, --so );
				text = tr.toString();
				if (!isAlpha(text.charAt(0))) {
					tr.setStart( caretRange.startContainer, so + 1);
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

		if (prevWord == word) return true;

		prevWord = word;

		if (word.length >= 1) {
			setTimeout(function() {
				var selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(tr);
				var xx = pX, yy = pY, sx = e.screenX, sy = e.screenY;
				getYoudaoDict(word, pX, pY, e.screenX, e.screenY, function( data ){
					createPopUpEx(data, xx, yy, sx, sy);
				});
			}, 50);
		}
	}, 200);
}, true);

document.onkeydown = function(e) {
	if (e.ctrlKey) {
		return true;
	}
	if (getOptVal("ctrl_only")) {
		return;
	}
	e = e || window.event;
	var key = e.keyCode || e.which;
	OnCheckCloseWindow();
}

function OnCheckCloseWindow() {
	if (inDictPannel) return;
	if (last_frame != null) {
		var cur = new Date().getTime();
		if (cur - last_time < 500) {
			return;
		}
		while (list.length != 0) {
			body.removeChild(list.pop());
		}
		last_frame = null;
		last_div = null;
		return true;
	}
	return false
}

function OnCheckCloseWindowForce() {
	inDictPannel = false;
	if ( last_frame != null ) {
		var cur = new Date().getTime();
		while ( list.length != 0 ) {
			body.removeChild( list.pop() );
		}
		last_frame = null;
		last_div = null;
		return true;
	}
	return false;
}

function createPopUpEx( html , x, y, screenx, screeny) {
	OnCheckCloseWindowForce();
	createPopUp( html , window.getSelection().getRangeAt(0).startContainer.nodeValue, x, y, screenx, screeny);
}

// 鼠标是否在弹出框上
var inDictPannel = false;

function createPopUp( html , senctence, x, y, screenX, screenY) {
	var frame_height = 150;
	var frame_width = 300;
	var padding = 10;

	var frame_left = 0;
	var frame_top = 0;
	var frame = document.createElement( 'div' );

	frame.id = 'yddWrapper';
	frame.setAttribute('draggable', true );

	var screen_width = screen.availWidth;
	var screen_height = screen.availHeight;

	if ( screenX + frame_width < screen_width ) {
		frame_left = x;
	} else {
		frame_left = ( x - frame_width - 2 * padding );
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
	var distanceX,distanceY;
	frame.ondragstart = function(e){
		distanceX = e.x - parseInt( frame.style.left );
		distanceY = e.y - parseInt( frame.style.top );
	};
	frame.ondragend = function(e){
		frame.style.left = e.x - distanceX + 'px';
		frame.style.top = e.y - distanceY + 'px';
		distanceX = 0;
		distanceY = 0;
	};

	document.querySelector('#yddMiddle').setAttribute('draggable', true );
	document.querySelector('#yddMiddle').ondragstart = function(e){
		e.preventDefault();
	};

	// 关闭按钮
	var closeBtn = document.querySelector('.ydd-close');
	closeBtn.onclick = function(e) {
		OnCheckCloseWindowForce();
	};
	closeBtn = null;

	// 语音播放
	var speach_swf = document.getElementById("ydd-voice");
	if ( speach_swf ) {
		if( window.location.protocol == 'http:' ){
			if (speach_swf.innerHTML != '') {
				speach_swf.innerHTML = insertAudio("http://dict.youdao.com/speech?audio=" + speach_swf.innerHTML );
				var speach_flash = document.getElementById("speach_flash");
				if (speach_flash != null) {
					try {
						speach_flash.StopPlay();
					} catch (err) {}
				}
			}
		}else{
			speach_swf.innerHTML = '';
		}
	}

	// 确定位置
	var leftbottom = frame_top + 10 + document.getElementById("yddWrapper").clientHeight;

	if (leftbottom < y) {
		var newtop = y - document.getElementById("yddWrapper").clientHeight;
		frame.style.top = newtop + 'px';
	}
	if (last_frame != null) {
		if (last_frame.style.top == frame.style.top && last_frame.style.left == frame.style.left) {
			body.removeChild(frame);
			list.pop();
			return;
		}
	}
	last_time = new Date().getTime();
	last_frame = frame;
}

function insertAudio( link ) {
	return ['<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,0,0" width="15px" height="15px" align="absmiddle" id="speach_flash">' ,
		'<param name="allowScriptAccess" value="sameDomain" />' ,
		'<param name="movie" value="http://cidian.youdao.com/chromeplus/voice.swf" />' ,
		'<param name="loop" value="false" />' ,
		'<param name="menu" value="false" />' ,
		'<param name="quality" value="high" />' ,
		'<param name="wmode"  value="transparent">' ,
		'<param name="FlashVars" value="audio=' , link , '">' ,
		'<embed wmode="transparent" src="http://cidian.youdao.com/chromeplus/voice.swf" loop="false" menu="false" quality="high" bgcolor="#ffffff" width="15" height="15" align="absmiddle" allowScriptAccess="sameDomain" FlashVars="audio=' , link , '" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" />' ,
		'</object>'].join('');
}

function getYoudaoDict(word, x, y, screenX, screenY, next ) {
	chrome.extension.sendRequest({
		'action': 'dict',
		'word': word,
		'x': x,
		'y': y,
		'screenX': screenX,
		'screenY': screenY
	}, function( data ){
		next && next( data );
	});
}

function getYoudaoTrans(word, x, y, screenX, screenY, next ) {
	chrome.extension.sendRequest({
		'action': 'translate',
		'word': word,
		'x': x,
		'y': y,
		'screenX': screenX,
		'screenY': screenY
	}, function( data ){
		next && next( data );
	});
}