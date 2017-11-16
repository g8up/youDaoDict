import { Options } from './common.js'
import {
	getOption,
	queryString,
	isContainKoera,
	isContainJapanese,
} from './util';
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
	var phrase = root.getElementsByTagName("return-phrase");
	if ('' + phrase[0].childNodes[0] != "undefined") {
		retphrase = phrase[0].childNodes[0].nodeValue;
	}
	if ('' + root.getElementsByTagName("lang")[0] != "undefined") {
		langType = root.getElementsByTagName("lang")[0].childNodes[0].nodeValue;
	}
	var strpho = '';
	var symbol = root.getElementsByTagName("phonetic-symbol")[0];
	if ('' + symbol != "undefined") {
		if ('' + symbol.childNodes[0] != "undefined") {
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
	if (noBaseTrans === false) {
		translate += retphrase + "<br/><br/><strong>基本释义:</strong><br/>";
		if ('' + translation.childNodes[0] != "undefined") {
			var translations = root.getElementsByTagName("translation");
			for (var i = 0; i < translations.length; i++) {
				var line = translations[i].getElementsByTagName("content")[0].childNodes[0].nodeValue + "<br/>";
				if (line.length > 50) {
					var reg = /[;；]/;
					var childs = line.split(reg);
					line = '';
					for (var j = 0; j < childs.length; j++) line += childs[j] + "<br/>";
				}
				basetrans += line;
			}
		} else {
			basetrans += '未找到基本释义';
		}
	}
	if (noWebTrans === false) {
		//网络释义
		if ('' + root.getElementsByTagName("web-translation")[0].childNodes[0] != "undefined") var webtranslations = root.getElementsByTagName("web-translation");
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
	if( word !== '' ){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(data) {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					var dataText = translateXML(xhr.responseXML);
					if (dataText != null) callback(dataText);
				}
			}
		}
		_word = word.trim();
		if( _word !== '' ){
			var url = 'http://dict.youdao.com/fsearch?client=deskdict&keyfrom=chrome.extension.g8up&q=' + encodeURIComponent(word) + '&pos=-1&doctype=xml&xmlVersion=3.2&dogVersion=1.0&vendor=g8up&appVer=3.1.17.4208&le=eng'
			xhr.open('GET', url, true);
			xhr.send();
		}
	}
}

function buildSearchResult() {
	document.querySelector('#options').style.display = "none"; //hide option pannel
	var params = {
		q: _word,
		ue: 'utf8',
		keyfrom: 'chrome.extension'
	};
	var lan = '';
	if (isContainKoera(_word)) {
		params.le = 'ko';
	}
	if (isContainJapanese(_word)) {
		params.le = 'jap';
	}
	if (langType == 'fr') {
		params.le = 'fr';
	}
	var res = document.getElementById('result');
	res.innerHTML = '';
	if (noBaseTrans == false) {
		if (langType == 'ko') basetrans = "<strong>韩汉翻译:</strong><br/>" + basetrans;
		else if (langType == 'jap') basetrans = "<strong>日汉翻译:</strong><br/>" + basetrans;
		else if (langType == 'fr') basetrans = "<strong>法汉翻译:</strong><br/>" + basetrans;
		else basetrans = "<strong>英汉翻译:</strong><span class='word-speech' data-toggle='play'></span> <a href='#' class='add-to-note' data-toggle='addToNote'>+</a><br/>" + basetrans;
		res.innerHTML = basetrans;
	}
	if (noWebTrans == false) {
		webtrans = "<strong>网络释义:</strong><br/>" + webtrans;
		res.innerHTML += webtrans;
	}
	if (noBaseTrans == false || noWebTrans == false) {
		var link = getLink( 'http://dict.youdao.com/search', params);
		res.innerHTML += "<a href ='" + link + "' target='_blank'>点击 查看详细释义</a>";
	}
	if (noBaseTrans && noWebTrans) {
		res.innerHTML = "未找到英汉翻译!";
		res.innerHTML += "<br><a href ='" + 'http://www.youdao.com/w/' + encodeURIComponent(_word) + "' target='_blank'>尝试用有道搜索</a>";
	} else {
		saveSearchedWord();
	}
	getCachedWord();
	retphrase = '';
	webtrans = '';
	basetrans = '';
	// _word = '';
	langType = '';
	noBaseTrans = false;
	noWebTrans = false;
}
// 取缓存查询次
function getCachedWord() {
	var html = [],
		cache = localStorage.getItem('wordcache');
	if( cache && ( cache = cache.trim() ) ){
		var count = Options.history_count >= 0 ? Options.history_count : 0;
		var words = cache.split( ',' , count );
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
}

// 缓存查询词
function saveSearchedWord(word) {
	var w = word || (document.querySelector('#word') ? document.querySelector('#word').value : '');
	if ( w && ( w = w.trim() ) ) {
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

function changeIcon() {
	var engBox = document.getElementById('english_only'),
		dictBox = document.getElementById('dict_enable');
	var isEnabled = dictBox.checked;
	engBox.disabled = !isEnabled;
}

function getLink( urlPrefix, params ) {
	var url = urlPrefix + "?" + queryString(params);
	return url;
}
/**
 * 读取配置信息
 */
function restoreOptions( option ) {
	for (var key in option) {
		var elem = document.getElementById(key);
		if (elem) {
			var val = option[key];
			if (!val) continue;
			var elemType = elem.getAttribute('type');
			switch (elemType) {
				case 'checkbox':
					if (val[0] == "checked") {
						elem.checked = val[1];
					}
					break;
				case 'number':
					elem.value = val || option.history_count;
					break;
			}
		}
	}
}
/*
 * 导出单词查询历史
 */
const exportHistory = () => {
	const cachedWords = localStorage.getItem('wordcache');
	if (cachedWords) {
		const extDetail = chrome.app.getDetails();
		const extName = extDetail.name;
		const version = extDetail.version;
		const BR = '\r\n';
		const banner = [
			`【${extName}】V${version} 查询历史备份文件`,
			`${new Date().toString().slice(0, 24)}`,
			`By https://chrome.google.com/webstore/detail/chgkpfgnhlojjpjchjcbpbgmdnmfmmil`,
			`${new Array(25).join('=')}`
		].join(BR).trim();
		const content = `${banner}${BR}${cachedWords.replace(/\,/g, BR)}`;
		saveContent2File(content, `youDaoCrx-history ${+new Date()}.txt`);
	}
}
/*
 * 保存为系统文件
 */
function saveContent2File(content, filename) {
	var blob = new Blob( [content], {
		type: "text/plain;charset=utf-8"
	});
	saveAs(blob, filename);
}

function saveOptions() {
	for (var key in Options) {
		var elem = document.getElementById(key);
		if (Options[key][0] == "checked") {
			Options[key][1] = elem.checked;
		} else {
			Options[key] = elem.value;
		}
	}
	// https://developer.chrome.com/extensions/storage
	chrome.storage.sync.set({'Options': Options}, function() {});
}

window.onload = function() {
	var word = document.getElementById('word');
	word && word.focus();
	getOption( function( option ){
		restoreOptions( option );
		Object.assign(Options , option )
		changeIcon();
		getCachedWord();
	});
};
/**
 * 配置项设置
 */
var optElem = document.querySelector('#options');
optElem && (optElem.onmouseover = function() {
	this.onmouseover = null;
	document.getElementById("dict_enable").onclick = function() {
		saveOptions();
		changeIcon();
	};
	document.getElementById("ctrl_only").onclick = function() {
		saveOptions();
	};
	document.getElementById("english_only").onclick = function() {
		saveOptions();
	};
	document.getElementById("auto_speech").onclick = function() {
		saveOptions();
	};
	document.getElementById("history_count").onclick = document.getElementById("history_count").onkeyup = function() {
		saveOptions();
		getCachedWord();
	};
});

document.getElementById("word").onkeydown = function() {
	if (event.keyCode == 13) {
		mainQuery(document.querySelector("#word").value, translateXML);
	}
};
document.getElementById("querybutton").onclick = function() {
	mainQuery(document.querySelector("#word").value, translateXML);
};
document.querySelector('#backup').onclick = function() {
	exportHistory();
};
// 登录按钮
document.querySelector('#login-youdao').addEventListener('click',function(){
	chrome.runtime.sendMessage({
		'action': 'login-youdao',
	},function( rep ){
		console.log( rep );
	});
});
// 检测当前页面打开入口：option / popup
(function(){
	var hash = window.location.hash;
	if( hash === '#popup' ){
		document.body.classList.add('popup');
	}
})();

document.body.addEventListener('click', function(e){
	var toggle = e.target.dataset.toggle;
	if( toggle === 'play'){
		playAudio(_word);
	}else if( toggle === 'addToNote') {
		addToNote( _word );
	}
});