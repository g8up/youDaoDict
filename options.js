/**
 * @author Dongxu Huang
 * @date   2010-2-21
 *
 * @optimizing Simga
 * @date 2014.04.24
 */

// 配置项
var Options = {
	"dict_disable": ["checked", false],
	"ctrl_only": ["checked", false],
	"english_only": ["checked", false],
	"history_count":5
};

var retphrase = '';
var basetrans = '';
var webtrans = '';
var noBaseTrans = false;
var noWebTrans = false;

var langType = '';
//布局结果页
function translateXML(xmlnode) {
	var translate = "<strong>查询:</strong><br/>";
	var root = xmlnode.getElementsByTagName("yodaodict")[0];

	if ('' + root.getElementsByTagName("return-phrase")[0].childNodes[0] != "undefined")
		retphrase = root.getElementsByTagName("return-phrase")[0].childNodes[0].nodeValue;
	if ('' + root.getElementsByTagName("lang")[0] != "undefined") {
		langType = root.getElementsByTagName("lang")[0].childNodes[0].nodeValue;
	}
	var strpho = '';
	var symbol = root.getElementsByTagName("phonetic-symbol")[0];
	if ('' + symbol != "undefined") {
		if ('' + symbol.childNodes[0] != "undefined"){
			var pho = symbol.childNodes[0].nodeValue;
			if (pho !== null) {
				strpho = "&nbsp;[" + pho + "]";
			}
		}
	}
	var translation = root.getElementsByTagName("translation")[0];
	if ('' + translation == "undefined") {
		noBaseTrans = true;
	}
	if ('' + root.getElementsByTagName("web-translation")[0] == "undefined") {
		noWebTrans = true;
	}


	if ( noBaseTrans === false ) {
		translate += retphrase + "<br/><br/><strong>基本释义:</strong><br/>";
		if ('' + translation.childNodes[0] != "undefined"){
			var translations = root.getElementsByTagName("translation");
			for (var i = 0; i < translations.length; i++) {
				var line = translations[i].getElementsByTagName("content")[0].childNodes[0].nodeValue + "<br/>";
				if (line.length > 50) {
					var reg = /[;；]/;
					var childs = line.split(reg);
					line = '';
					for (var j = 0; j < childs.length; j++)
						line += childs[j] + "<br/>";
				}
				basetrans += line;
			}
		}else {
			basetrans += '未找到基本释义';
		}
	}
	if ( noWebTrans === false ) {
		//网络释义
		if ('' + root.getElementsByTagName("web-translation")[0].childNodes[0] != "undefined")
			var webtranslations = root.getElementsByTagName("web-translation");
		else {
			webtrans += '未找到网络释义';
		}

		for (var i = 0; i < webtranslations.length; i++) {
			webtrans += webtranslations[i].getElementsByTagName("key")[0].childNodes[0].nodeValue + ":  ";
			webtrans += webtranslations[i].getElementsByTagName("trans")[0].getElementsByTagName("value")[0].childNodes[0].nodeValue + "<br/>";
		}
	}
	buildSearchResult();
	return;
}
var _word;

function mainQuery(word, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(data) {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				var dataText = translateXML(xhr.responseXML);
				if (dataText != null)
					callback(dataText);
			}
		}
	}
	_word = trim(word);
	var url = 'http://dict.youdao.com/fsearch?client=deskdict&keyfrom=chrome.extension.g8up&q=' + encodeURIComponent(word) + '&pos=-1&doctype=xml&xmlVersion=3.2&dogVersion=1.0&vendor=g8up&appVer=3.1.17.4208&le=eng'
	xhr.open('GET', url, true);
	xhr.send();
}

function buildSearchResult() {
	document.querySelector('#options').style.display = "none";//hide option pannel
	var lan = '';
	if (isContainKoera(_word)) {
		lan = "&le=ko";
	}
	if (isContainJapanese(_word)) {
		lan = "&le=jap";
	}
	if (langType == 'fr') {
		lan = "&le=fr";
	}
	var res = document.getElementById('result');
	res.innerHTML = '';
	if (noBaseTrans == false) {
		if (langType == 'ko')
			basetrans = "<strong>韩汉翻译:</strong><br/>" + basetrans;
		else if (langType == 'jap')
			basetrans = "<strong>日汉翻译:</strong><br/>" + basetrans;
		else if (langType == 'fr')
			basetrans = "<strong>法汉翻译:</strong><br/>" + basetrans;
		else basetrans = "<strong>英汉翻译:</strong><br/>" + basetrans;
		res.innerHTML = basetrans;
	}
	if (noWebTrans == false) {
		webtrans = "<strong>网络释义:</strong><br/>" + webtrans;
		res.innerHTML += webtrans;
	}
	if (noBaseTrans == false || noWebTrans == false) {
		res.innerHTML += "<a href ='http://dict.youdao.com/search?q=" + encodeURIComponent(_word) + "&ue=utf8&keyfrom=chrome.extension" + lan + "' target=_blank>点击 查看详细释义</a>";
	}
	if (noBaseTrans && noWebTrans) {
		res.innerHTML = "未找到英汉翻译!";
		res.innerHTML += "<br><a href ='http://www.youdao.com/search?q=" + encodeURIComponent(_word) + "&ue=utf8&keyfrom=chrome.extension' target=_blank>尝试用有道搜索</a>";
	} else {
		saveSearchedWord();
	}
	getCachedWord();
	retphrase = '';
	webtrans = '';
	basetrans = '';
	_word = '';
	langType = '';
	noBaseTrans = false;
	noWebTrans = false;
	document.getElementsByName('word')[0].focus();
}
// 取缓存查询次
function getCachedWord() {
	var html = [],
		cache = localStorage.getItem('wordcache'),
		count = Options.history_count >= 0 ? Options.history_count: 0;
	var words = cache.split(',').slice( 0, count );
	for (var i = 0, len = words.length; i < len; i++) {
		html.push('<a>' + words[i] + '</a>');
	}
	if (html.length) {
		var cache = document.querySelector('#cache');
		html.unshift('<strong>查询历史：</strong>');
		cache.innerHTML = html.join('<br/>');
		cache.onclick = function(event) { //查询
			var e = event || window.event;
			var a = e.target;
			if (a.tagName.toLowerCase() == 'a') {
				var w = a.innerText;
				if (w) {
					document.querySelector('#word').value = w;
					mainQuery(w, translateXML);
				}
			}
		};
		cache = null;
	}
}
// 缓存查询词
function saveSearchedWord(word) {
	var w = word || (document.querySelector('#word') ? document.querySelector('#word').value : '');
	if( w ){
		w = trim( w );
		var cache = localStorage.getItem('wordcache');
		if (cache) {
			//distinct
			if (cache.indexOf(w) > -1) {
				return;
			}
			cache = [w, cache].join();
		} else {
			cache = w;
		}
		localStorage.setItem('wordcache', cache);
	}
}


function initIcon() {
	if (Options['dict_disable'][1] == true) {
		chrome.browserAction.setIcon({
			path: "icon_nodict.gif"
		})
	}
}

function changeIcon() {
	if (document.getElementById('dict_disable').checked) {
		var a = document.getElementById('ctrl_only');
		a.disabled = true;
		a = document.getElementById('english_only');
		a.disabled = true;
		chrome.browserAction.setIcon({
			path: "icon_nodict.gif"
		})
	} else {
		var a = document.getElementById('ctrl_only');
		a.disabled = false;
		a = document.getElementById('english_only');
		a.disabled = false;
		chrome.browserAction.setIcon({
			path: "icon_dict.gif"
		})
	}
}

function check() {
	var word = document.getElementsByName("word")[0].value;
	window.open("http://dict.youdao.com/search?q=" + encodeURI(word) + "&ue=utf8&keyfrom=chrome.index.g8up");
}

/**
 * 读取配置信息
 * {"dict_disable":["checked",false],"ctrl_only":["checked",false],"english_only":["checked",true]}
 */
function restore_options() {
	var cachedOpts = localStorage["ColorOptions"];
	if( cachedOpts ){//有缓存
		adaptCachedOptions( JSON.parse( cachedOpts ) );
	}
	for (key in Options) {
		var elem = document.getElementById(key);
		if (elem) {
			var val = Options[key];
			if (!val) continue;
			var elemType = elem.getAttribute('type');
			switch( elemType ){
				case 'checkbox':
					elem.value = val[1];
					switch (val[0]) {
						case "checked":
							if (val[1]) elem.checked = true;
							else elem.checked = false;
							break;
					}
					break;
				case 'number':
					elem.value = val || Options.history_count;
					break;
			}
		}
	}
}

/**
 * 适配缓存的配置，用于配置升级后的兼容
 */
function adaptCachedOptions( cachedOpts ){
	for(var item in Options ){
		var c = cachedOpts[item],
			o = Options[item];
		if( typeof c !== 'undefined' && typeof o !== 'undefined' ){
			Options[item] = c;
		}
	}
}

function save_options() {
	changeIcon();
	for (key in Options) {
		var elem = document.getElementById(key);
		if (Options[key][0] == "checked") {
			Options[key][1] = elem.checked;
		}else{
			Options[key] = elem.value;
		}
	}
	localStorage["ColorOptions"] = JSON.stringify(Options);
}

document.body.onload = function() {
	document.getElementById('word').focus();
	restore_options();
	changeIcon();
	getCachedWord();
};

/**
 * 配置项设置
 */
document.querySelector('#options').onmouseover = function(){
	document.querySelector('table',this).style.display = "block";
	this.onmouseover = null;

	document.getElementById("dict_disable").onclick = function() {
		save_options();
	};
	document.getElementById("ctrl_only").onclick = function() {
		save_options();
	};
	document.getElementById("english_only").onclick = function() {
		save_options();
	};
	document.getElementById("history_count").onclick = document.getElementById("history_count").onkeyup = function() {
		save_options();
		getCachedWord();
	};
};

document.getElementById("word").onkeydown = function() {
	if (event.keyCode == 13) mainQuery(document.getElementsByName("word")[0].value, translateXML);
};
document.getElementById("querybutton").onclick = function() {
	mainQuery(document.getElementsByName("word")[0].value, translateXML);
};

/**
 * util
 */
function trim( str ){
	return str.replace( /^\s+|\s+$/, '' );
}

function isChinese(temp) {
	var re = /[^\u4e00-\u9fa5]/;
	if (re.test(temp)) return false;
	return true;
}

function isJapanese(temp) {
	var re = /[^\u0800-\u4e00]/;
	if (re.test(temp)) return false;
	return true;
}

function isKoera(str) {
	for (i = 0; i < str.length; i++) {
		if (((str.charCodeAt(i) > 0x3130 && str.charCodeAt(i) < 0x318F) || (str.charCodeAt(i) >= 0xAC00 && str.charCodeAt(i) <= 0xD7A3))) {
			return true;
		}
	}
	return false;
}

function isContainKoera(temp) {
	var cnt = 0;
	for (var i = 0; i < temp.length; i++) {
		if (isKoera(temp.charAt(i)))
			cnt++;
	}
	if (cnt > 0) return true;
	return false;
}

function isContainChinese(temp) {
	var cnt = 0;
	for (var i = 0; i < temp.length; i++) {
		if (isChinese(temp.charAt(i)))
			cnt++;
	}
	if (cnt > 5) return true;
	return false;
}

function isContainJapanese(temp) {
	var cnt = 0;
	for (var i = 0; i < temp.length; i++) {
		if (isJapanese(temp.charAt(i)))
			cnt++;
	}
	if (cnt > 2) return true;
	return false;
}