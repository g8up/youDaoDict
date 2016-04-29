var ColorsChanged = true;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	var action = request.action;
	switch ( action) {
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
			fetchWordOnline(request.word, sendResponse);
			return true;
			break;
		case 'translate':
			fetchTranslate(request.word, sendResponse);
			return true;
			break;
		case 'speech':
			playAudio( request.word );
		default:
			break;
	}
});

function genTable(word, speach, strpho, noBaseTrans, noWebTrans, baseTrans, webTrans) {
	var lan = '';
	if (isContainKoera(word)) {
		lan = "&le=ko";
	}
	if (isContainJapanese(word)) {
		lan = "&le=jap";
	}
	var fmt = '';
	var searchUrlPrefix = ( noBaseTrans && noWebTrans ) ? 'http://www.youdao.com/search?keyfrom=chrome.extension&ue=utf8'
		: 'http://dict.youdao.com/search?keyfrom=chrome.extension';
	var searchUrl = searchUrlPrefix + '&q=' + encodeURIComponent(word) + lan;

	fmt = [ '<div id="yddContainer">',
				'<div class="yddTop" class="ydd-sp">',
					'<div class="yddTopBorderlr">',
						'<a class="yddKeyTitle" href="', searchUrl, '" target=_blank title="查看完整释义">', word, '</a>',
						'<span class="ydd-phonetic" style="font-size:10px;">', strpho, '</span>',
						'<span class="ydd-voice">', speach, '</span>',
						'<a class="ydd-detail" href="http://www.youdao.com/search?q=', encodeURIComponent(word), '&ue=utf8&keyfrom=chrome.extension" target=_blank>详细</a>',
						'<a class="ydd-close" href="javascript:void(0);">&times;</a>',
					'</div>',
				'</div>',
				'<div class="yddMiddle">'
				].join('');

	if (noBaseTrans && noWebTrans) {
		fmt += '&nbsp;&nbsp;没有英汉互译结果<br/>&nbsp;&nbsp;<a href="' + searchUrl + '" target=_blank>请尝试网页搜索</a>';
	}else {
		fmt += ( noBaseTrans == false ? renderTransDetail( '基本翻译', baseTrans) : '');
		fmt += ( noWebTrans == false ? renderTransDetail( '网络释义', webTrans) : '');
	}
	fmt += '</div></div>';
	res = fmt;
	return res;
}

function renderTransDetail( title, body){
	return [
		'<div class="ydd-trans-wrapper">',
			'<div class="ydd-tabs">',
				'<span class="ydd-tab">',
					title,
				'</span>',
			'</div>',
			body,
		'</div>'].join('');
}

//解析返回的查询结果
function translateXML(xmlnode) {
	var noBaseTrans = false;
	var noWebTrans = false;
	var translate = "<strong>查询:</strong><br/>";
	var root = xmlnode.getElementsByTagName("yodaodict")[0];

	var retrieveDataMap = {
		'phrase': 'return-phrase',// 查询的单词、短语
		'speach': 'dictcn-speach',// 发音
		'lang': 'lang',
		'phonetic': 'phonetic-symbol'
	};
	var params = {};
	for(var key in retrieveDataMap){
		var node = retrieveDataMap[key];
		var node = root.getElementsByTagName(node);
		if( node.length ){
			var el = node[0].childNodes[0];
			if ( el != "undefined") {
				params[key] = el.nodeValue;
				continue;
			}
		}
		params[key] = '';
	}

	var title = params.phrase;

	if( params.phonetic ){
		params.phonetic = "[" + params.phonetic + "]";
	}

	var basetrans = "";
	var $translations = root.getElementsByTagName("translation");
	if ( !$translations.length ) {
		noBaseTrans = true;
	} else if (typeof $translations[0].childNodes[0] == "undefined") {
		noBaseTrans = true;
	} else {
		for (var i = 0; i < $translations.length; i++) {
			var transContVal = $translations[i].getElementsByTagName("content")[0].textContent;
			basetrans += '<div class="ydd-trans-container">' + transContVal + "</div>";
		}
	}

	var webtrans = "";
	var $webtranslations = root.getElementsByTagName("web-translation");
	if ( !$webtranslations.length ) {
		noWebTrans = true;
	}else if (typeof $webtranslations[0].childNodes[0] == "undefined") {
		noWebTrans = true;
	}else{
		for (var i = 0; i < $webtranslations.length; i++) {
			var key = $webtranslations[i].getElementsByTagName("key")[0].childNodes[0].nodeValue;
			var val = $webtranslations[i].getElementsByTagName("trans")[0].getElementsByTagName("value")[0].childNodes[0].nodeValue;
			webtrans += '<div class="ydd-trans-container"><a href="http://dict.youdao.com/search?q=' + encodeURIComponent(key) + '&keyfrom=chrome.extension&le=' + params.lang + '" target=_blank>' + key + ":</a> ";
			webtrans += val + "<br /></div>";
		}

	}
	return genTable( title, params.speach, params.phonetic,  noBaseTrans, noWebTrans, basetrans, webtrans);
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
	var res = [
		'<div id="yddContainer">',
			'<div class="yddTop" class="ydd-sp">',
				'<div class="yddTopBorderlr">',
					'<a class="ydd-icon" href="http://fanyi.youdao.com/translate?i=' + encodeURIComponent(input_str) + '&keyfrom=chrome" target=_blank">有道词典</a>',
					'<span>' + input_str_tmp.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, "&quot;").replace(/'/g, "&#39;") + '</span>',
					'<a href="http://fanyi.youdao.com/translate?i=' + encodeURIComponent(input_str) + '&smartresult=dict&keyfrom=chrome.extension" target=_blank>详细</a>',
					'<a class="ydd-close">&times;</a>',
				'</div>',
			'</div>',
			'<div class="yddMiddle">',
				'<div class="ydd-trans-wrapper">',
					'<div class="ydd-trans-container">',
						trans_str.replace(/&/g, '&amp;')
							.replace(/</g, '&lt;')
							.replace(/>/g, '&gt;')
							.replace(/"/g, "&quot;")
							.replace(/'/g, "&#39;") ,
					'</div>',
				'</div>',
			'</div>',
		'</div>'].join('');
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

// 查询英文之外的语言
function fetchTranslate(words, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(data) {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				var dataText = translateTransXML(xhr.responseText);
				if (dataText != null) callback({
					data:dataText
				});
			}
		}
	}
	var url = "http://fanyi.youdao.com/translate?client=deskdict&keyfrom=chrome.extension&xmlVersion=1.1&dogVersion=1.0&ue=utf8&i=" + encodeURIComponent(words) + "&doctype=xml";
	xhr.open('GET', url, true);
	xhr.send();
}

/**
 * 将配置更新通知已经打开的 Tab
 */
function publishOptionChangeToTabs() {
	chrome.tabs.query({
		status: "complete"
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

function playAudio( word ){
	var audioUrl = "http://dict.youdao.com/speech?audio=" + word;
	var audio = document.createElement('audio');
	audio.autoplay = true;
	audio.src = audioUrl;
}