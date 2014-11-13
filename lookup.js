/**
 * @author Dongxu Huang
 * @date   2010-2-21
 *
 * @optimizing Simga
 * @date 2014.09.20 cut verbose code
 */
var body = document.getElementsByTagName("body")[0];
var Options = null;
var last_frame = null;
var last_div = null;
var div_num = 0;
var xx, yy, sx, sy;
var list = new Array();
var last_time = 0;
var last_request_time = 0;

var youdaoStyle = document.createElement("style"),
	styleContent = document.createTextNode("#yddContainer{display:block;font-family:Microsoft YaHei;position:relative;width:100%;height:100%;top:-4px;left:-4px;font-size:12px;border:1px solid}#yddTop{display:block;height:22px}#yddTopBorderlr{display:block;position:static;height:17px;padding:2px 28px;line-height:17px;font-size:12px;color:#5079bb;font-weight:bold;border-style:none solid;border-width:1px}#yddTopBorderlr .ydd-sp{position:absolute;top:2px;height:0;overflow:hidden}.ydd-icon{left:5px;width:17px;padding:0px 0px 0px 0px;padding-top:17px;background-position:-16px -44px}.ydd-close{right:5px;width:16px;padding-top:16px;background-position:left -44px}#yddKeyTitle{float:left;text-decoration:none}#yddMiddle{display:block;margin-bottom:10px}.ydd-tabs{display:block;margin:5px 0;padding:0 5px;height:18px;border-bottom:1px solid}.ydd-tab{display:block;float:left;height:18px;margin:0 5px -1px 0;padding:0 4px;line-height:18px;border:1px solid;border-bottom:none}.ydd-trans-container{display:block;line-height:160%}.ydd-trans-container a{text-decoration:none;}#yddBottom{position:absolute;bottom:0;left:0;width:100%;height:22px;line-height:22px;overflow:hidden;background-position:left -22px}.ydd-padding010{padding:0 10px}#yddWrapper{color:#252525;z-index:10001;background:url(" + chrome.extension.getURL("ab20.png") + ");}#yddContainer{background:#fff;border-color:#4b7598}#yddTopBorderlr{border-color:#f0f8fc}#yddWrapper .ydd-sp{background-image:url(" + chrome.extension.getURL("ydd-sprite.png") + ")}#yddWrapper a,#yddWrapper a:hover,#yddWrapper a:visited{color:#50799b}#yddWrapper .ydd-tabs{color:#959595}.ydd-tabs,.ydd-tab{background:#fff;border-color:#d5e7f3}#yddBottom{color:#363636}#yddWrapper{min-width:250px;max-width:400px;}");
youdaoStyle.type = "text/css";
youdaoStyle.info = "youdaoDict";
if (youdaoStyle.styleSheet) {
	youdaoStyle.styleSheet.cssText = styleContent.nodeValue;
} else {
	youdaoStyle.appendChild(styleContent);
	document.getElementsByTagName("head")[0].appendChild(youdaoStyle)
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
	/*read options*/
	getOptions(function() {
		if (in_div) return;
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

		var word = String(window.getSelection());
		if ( word !== undefined ) {
			word = word.trim();
			if ( word.length < 1 || word.length > 2000 ) {
				return;
			}
		}

		if (getOptVal("english_only")) {
			if (isContainJapanese(word) || isContainKoera(word) || isContainChinese(word)) {
				return;
			}
			word = ExtractEnglish(word);
		} else if ((!isContainChinese(word) && spaceCount(word) >= 3) ||
			(isContainChinese(word) && word.length > 4) ||
			isContainJapanese(word) && word.length > 4) {
			xx = e.pageX, yy = e.pageY, sx = e.screenX, sy = e.screenY;
			getYoudaoTrans(word, e.pageX, e.pageY, e.screenX, e.screenY);
			return;
		}
		// TODO: add isEnglish function
		if (word != '') {
			OnCheckCloseWindowForce();
			xx = e.pageX, yy = e.pageY, sx = e.screenX, sy = e.screenY;
			getYoudaoDict(word, e.pageX, e.pageY, e.screenX, e.screenY);
			return;
		}
	});
}, false);

var prevC, prevO, prevWord, c;

document.addEventListener('mousemove', function onScrTrans(event) {
	clearTimeout(window._ydTimer);
	window._ydTimer = setTimeout(function() {
		if (!getOptVal("ctrl_only")) {
			return;
		} else if (!event.ctrlKey) {
			return true;
		}

		var r = document.caretRangeFromPoint(event.clientX, event.clientY);
		if (!r) return true;

		pX = event.pageX;
		pY = event.pageY;
		var so = r.startOffset,
			eo = r.endOffset;
		if (prevC === r.startContainer && prevO === so) return true

		prevC = r.startContainer;
		prevO = so;
		var tr = r.cloneRange(),
			text = '';
		if (r.startContainer.data)
			while (so >= 1) {
				tr.setStart(r.startContainer, --so);
				text = tr.toString();
				if (!isAlpha(text.charAt(0))) {
					tr.setStart(r.startContainer, so + 1);
					break;
				}
			}
		if (r.endContainer.data) {
			while (eo < r.endContainer.data.length) {
				tr.setEnd(r.endContainer, ++eo);
				text = tr.toString();
				if (!isAlpha(text.charAt(text.length - 1))) {
					tr.setEnd(r.endContainer, eo - 1);
					break;
				}
			}
		}
		var word = tr.toString();

		if (prevWord == word) return true;

		prevWord = word;

		if (word.length >= 1) {
			setTimeout(function() {
				var s = window.getSelection();
				s.removeAllRanges();
				s.addRange(tr);
				xx = event.pageX, yy = event.pageY, sx = event.screenX, sy = event.screenY;
				getYoudaoDict(word, event.pageX, event.pageY, event.screenX, event.screenY);
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
	isDrag = false;
	if (in_div) return;
	if (last_frame != null) {
		var cur = Math.round(new Date().getTime());
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
	in_div = false;
	if (last_frame != null) {
		var cur = Math.round(new Date().getTime());
		while (list.length != 0) {
			body.removeChild(list.pop());
		}
		last_frame = null;
		last_div = null;
		return true;
	}
	return false;
}

function createPopUpEx(word, x, y, screenx, screeny) {
	OnCheckCloseWindowForce();
	createPopUp(word, window.getSelection().getRangeAt(0).startContainer.nodeValue, x, y, screenx, screeny);
}

var in_div = false;

function createPopUp(word, senctence, x, y, screenX, screenY) {
	last_word = word;
	var frame_height = 150;
	var frame_width = 300;
	var padding = 10;

	var frame_left = 0;
	var frame_top = 0;
	var frame = document.createElement('div');

	frame.id = 'yddWrapper';

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
	frame.innerHTML += word;
	frame.onmouseover = function(e) {
		in_div = true;
	};
	frame.onmouseout = function(e) {
		in_div = false;
	};
	body.style.position = "static";
	body.appendChild(frame);
	document.getElementById("test").onclick = function(e) {
		OnCheckCloseWindowForce();
	};
	document.getElementById("test").onmousemove = function(e) {
		frame.style.cursor = 'default';
	};
	var _yddTop = document.getElementById("yddTop");
	_yddTop.onmousedown = dragDown;
	_yddTop.onmouseup = dragUp;
	_yddTop.onmousemove = dragMove;
	_yddTop.onmouseover = function(e) {
		frame.style.cursor = 'move';
	};
	_yddTop.onmouseout = function(e) {
		frame.style.cursor = 'default';
	};

	if (document.getElementById("voice") != null) {
		var speach_swf = document.getElementById("voice");
		if (speach_swf.innerHTML != '') {
			speach_swf.innerHTML = insertAudio("http://dict.youdao.com/speech?audio=" + speach_swf.innerHTML, "test", "CLICK", "dictcn_speech");
			var speach_flash = document.getElementById("speach_flash");
			if (speach_flash != null) {
				try {
					speach_flash.StopPlay();
				} catch (err) {;
				}
			}
		}
	}
	list.push(frame);
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
	last_time = Math.round(new Date().getTime());
	last_frame = frame;
	div_num++;
}

function insertAudio(a, query, action, type) {
	return '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,0,0" width="15px" height="15px" align="absmiddle" id="speach_flash">' + '<param name="allowScriptAccess" value="sameDomain" />' + '<param name="movie" value="http://cidian.youdao.com/chromeplus/voice.swf" />' + '<param name="loop" value="false" />' + '<param name="menu" value="false" />' + '<param name="quality" value="high" />' + '<param name="wmode"  value="transparent">' + '<param name="FlashVars" value="audio=' + a + '">' + '<embed wmode="transparent" src="http://cidian.youdao.com/chromeplus/voice.swf" loop="false" menu="false" quality="high" bgcolor="#ffffff" width="15" height="15" align="absmiddle" allowScriptAccess="sameDomain" FlashVars="audio=' + a + '" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" />' + '</object>';
}
var isDrag = false;
var px = 0;
var py = 0;

function dragMove(e) {
	if (isDrag) {
		var myDragDiv = last_frame;
		myDragDiv.style.pixelLeft = px + e.x;
		myDragDiv.style.pixelTop = py + e.y;
	}
}

function dragDown(e) {
	var oDiv = last_frame;
	px = oDiv.style.pixelLeft - e.x;
	py = oDiv.style.pixelTop - e.y;
	isDrag = true;
}

function dragUp(e) {
	var oDiv = last_frame;
	isDrag = false;
}

function onText(data) {
	createPopUpEx(data, xx, yy, sx, sy);
}

function getYoudaoDict(word, x, y, screenx, screeny) {
	chrome.extension.sendRequest({
		'action': 'dict',
		'word': word,
		'x': x,
		'y': y,
		'screenX': screenx,
		'screenY': screeny
	}, onText);
}

function getYoudaoTrans(word, x, y, screenx, screeny) {
	chrome.extension.sendRequest({
		'action': 'translate',
		'word': word,
		'x': x,
		'y': y,
		'screenX': screenx,
		'screenY': screeny
	}, onText);
}