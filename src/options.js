import Setting from './util/setting'
import {
	queryString,
	isContainKoera,
	isContainJapanese,
	ajax,
	addToNote,
	playAudio,
} from './util';
let Options = null;
var retphrase = '';
var noBaseTrans = false;
var noWebTrans = false;
var langType = '';

var setting = new Setting();
//布局结果页
function translateXML(xmlnode) {
	let basetrans = '';
	var webtrans = '';

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
					line = childs.join('<br/>')
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
	buildSearchResult({ basetrans, webtrans});
	return;
}
var _word;

function mainQuery(word, callback) {
	if (word !== '') {
		_word = word.trim();
		ajax({
			url: 'http://dict.youdao.com/fsearch',
			dataType: 'xml',
			data:{
				client: 'deskdict',
				keyfrom: 'chrome.extension.g8up',
				q: _word,
				pos: -1,
				doctype: 'xml',
				xmlVersion: '3.2',
				dogVersion: '1.0',
				vendor: 'g8up',
				appVer: '3.1.17.4208',
				le: 'eng'
			},
			success(ret) {
				var dataText = translateXML(ret);
				if (dataText != null) {
					callback(dataText);
				}
			}
		});
	}
}

function buildSearchResult({ basetrans, webtrans }) {
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
		const langTypeMap = {
			ko: '韩汉',
			jap: '日汉',
			fr: '法汉',
		};
		res.innerHTML = `<strong>${langTypeMap[langType] || '英汉'}翻译:</strong><span class='word-speech' data-toggle='play'></span> <a href='#' class='add-to-note' data-toggle='addToNote'>+</a><br/>${basetrans}`;
	}
	if (noWebTrans == false) {
		res.innerHTML += `<strong>网络释义:</strong><br/>${webtrans}`;
	}
	if (noBaseTrans == false || noWebTrans == false) {
		var link = getLink( 'http://dict.youdao.com/search', params);
		res.innerHTML += `<a class="weblink" href="${link}" target="_blank">点击 查看详细释义</a>`;
	}
	if (noBaseTrans && noWebTrans) {
		res.innerHTML = `未找到英汉翻译!<br><a class="weblink" href="http://www.youdao.com/w/${encodeURIComponent(_word)}" target="_blank">尝试用有道搜索</a>`;
	} else {
		saveSearchedWord();
	}
	getCachedWord();
	retphrase = '';
	langType = '';
	noBaseTrans = false;
	noWebTrans = false;
}

// 取缓存查询词
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
var exportHistory = () => {
	var cachedWords = localStorage.getItem('wordcache');
	if (cachedWords) {
		var extDetail = chrome.app.getDetails();
		var extName = extDetail.name;
		var version = extDetail.version;
		var BR = '\r\n';
		var banner = [
			`【${extName}】V${version} 查询历史备份文件`,
			`${new Date().toString().slice(0, 24)}`,
			`By https://chrome.google.com/webstore/detail/chgkpfgnhlojjpjchjcbpbgmdnmfmmil`,
			`${new Array(25).join('=')}`
		].join(BR).trim();
		var content = `${banner}${BR}${cachedWords.replace(/\,/g, BR)}`;
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
	setting.set(Options);
}

window.onload = function() {
	setting.get().then(data => {
		Options = data;
		console.log('option from sync storage', data);
		restoreOptions(data);
		changeIcon();
		getCachedWord();
	});
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

	document.body.addEventListener('click', (e)=> {
		let target = e.target;
		let toggle = target.dataset.toggle;
		if( toggle === 'play'){
			playAudio(_word);
		}else if( toggle === 'addToNote') {
			addToNote( _word, ()=>{
				target.classList.add('green')
			});
		}
	});
};