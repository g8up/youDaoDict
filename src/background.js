import Setting from './util/setting'
import { OPTION_STORAGE_ITEM } from './config'
import {
	isContainKoera,
	isContainJapanese,
	ajax,
} from './util'
const setting = new Setting();
let Options = null;
setting.get().then( data =>{
	Options = data;
});

chrome.storage.onChanged.addListener((changes, areaName) =>{
	if (areaName !== 'sync'){
		return;
	}
	for (let key in changes) {
		if( key === OPTION_STORAGE_ITEM ){
			let storageChange = changes[key];
			Object.assign(Options, storageChange.newValue)
			console.log(Options);
			publishOptionChangeToTabs( Options );
			break;
		}
	}
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	let action = request.action;
	switch ( action) {
		case 'getOption':
			setting.get().then( data =>{
				sendResponse({
					option: data
				});
			})
			return true;
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
			break;
		case 'login-youdao':
			loginYoudao();
			break;
		case 'youdao-add-word':
			let word = request.word;
			addWord( word , () =>{
				popBadgeTips('OK', 'green');
				sendResponse();
			}, function(){
				loginYoudao();
			});
			return true;
			break;
		default:
			break;
	}
});
// 页面中弹出的的面板
const genTable = (word, speach, strpho, noBaseTrans, noWebTrans, baseTrans, webTrans) => {
	let lan = '';
	if (isContainKoera(word)) {
		lan = "&le=ko";
	}
	if (isContainJapanese(word)) {
		lan = "&le=jap";
	}
	let fmt = '';
	let searchUrlPrefix = ( noBaseTrans && noWebTrans ) ? 'http://www.youdao.com/search?keyfrom=chrome.extension&ue=utf8'
		: 'http://dict.youdao.com/search?keyfrom=chrome.extension';
	let searchUrl = searchUrlPrefix + '&q=' + encodeURIComponent(word) + lan;

	fmt = `<div id="yddContainer">
				  <div class="yddTop" class="ydd-sp">
					<div class="yddTopBorderlr">
						<a class="yddKeyTitle" href="${searchUrl}" target=_blank title="查看完整释义">${word}</a>
						<span class="ydd-phonetic" style="font-size:10px;">${strpho}</span>
						<span class="ydd-voice">${speach}</span>
						<a class="ydd-detail" href="http://www.youdao.com/search?q=${encodeURIComponent(word)}&ue=utf8&keyfrom=chrome.extension" target=_blank>详细</a>',
						<a class="ydd-detail" href="#" id="addToNote" title="添加到单词本">+</a>
						<a class="ydd-close" href="javascript:void(0);">&times;</a>
					</div>
				</div>
				<div class="yddMiddle">`;

	if (noBaseTrans && noWebTrans) {
		fmt += `&nbsp;&nbsp;没有英汉互译结果<br/>&nbsp;&nbsp;<a href="${searchUrl}" target=_blank>请尝试网页搜索</a>`;
	}else {
		fmt += ( noBaseTrans == false ? renderTransDetail( '基本翻译', baseTrans) : '');
		fmt += ( noWebTrans == false ? renderTransDetail( '网络释义', webTrans) : '');
	}
	fmt += `</div></div>`;
	return fmt;
}

const renderTransDetail = (title, body) => {
	return `<div class="ydd-trans-wrapper">
			<div class="ydd-tabs">
				<span class="ydd-tab">
					${title}
				</span>
			</div>
			${body}
		</div>`;
}

//解析返回的查询结果
const translateXML = (xmlnode) =>{
	let noBaseTrans = false;
	let noWebTrans = false;
	let translate = "<strong>查询:</strong><br/>";
	let root = xmlnode.getElementsByTagName("yodaodict")[0];

	let retrieveDataMap = {
		'phrase': 'return-phrase',// 查询的单词、短语
		'speach': 'dictcn-speach',// 发音
		'lang': 'lang',
		'phonetic': 'phonetic-symbol'
	};
	let params = {};
	for(let key in retrieveDataMap){
		let node = retrieveDataMap[key];
		node = root.getElementsByTagName(node);
		if( node.length ){
			let el = node[0].childNodes[0];
			if ( el != "undefined") {
				params[key] = el.nodeValue;
				continue;
			}
		}
		params[key] = '';
	}

	let title = params.phrase;

	if( params.phonetic ){
		params.phonetic = "[" + params.phonetic + "]";
	}

	let basetrans = "";
	let $translations = root.getElementsByTagName("translation");
	if ( !$translations.length ) {
		noBaseTrans = true;
	} else if (typeof $translations[0].childNodes[0] == "undefined") {
		noBaseTrans = true;
	} else {
		for (let i = 0; i < $translations.length; i++) {
			let transContVal = $translations[i].getElementsByTagName("content")[0].textContent;
			basetrans += `<div class="ydd-trans-container">${transContVal}</div>`;
		}
	}

	let webtrans = "";
	let $webtranslations = root.getElementsByTagName("web-translation");
	if ( !$webtranslations.length ) {
		noWebTrans = true;
	}else if (typeof $webtranslations[0].childNodes[0] == "undefined") {
		noWebTrans = true;
	}else{
		for (let i = 0; i < $webtranslations.length; i++) {
			let key = $webtranslations[i].getElementsByTagName("key")[0].childNodes[0].nodeValue;
			let val = $webtranslations[i].getElementsByTagName("trans")[0].getElementsByTagName("value")[0].childNodes[0].nodeValue;
			webtrans += `<div class="ydd-trans-container"><a href="http://dict.youdao.com/search?q=${encodeURIComponent(key)}&keyfrom=chrome.extension&le=${params.lang}" target=_blank>${key}:</a>`;
			webtrans += val + "<br /></div>";
		}

	}
	return genTable( title, params.speach, params.phonetic,  noBaseTrans, noWebTrans, basetrans, webtrans);
}

const translateTransXML = (xmlnode) =>{
	let s = xmlnode.indexOf("CDATA[");
	let e = xmlnode.indexOf("]]");
	let input_str = xmlnode.substring(s + 6, e);
	let remain = xmlnode.substring(e + 2, xmlnode.length - 1);
	s = remain.indexOf("CDATA[");
	e = remain.indexOf("]]");
	let trans_str = remain.substring(s + 6, e);
	trans_str_tmp = trans_str.trim();
	input_str_tmp = input_str.trim();
	if ((isContainChinese(input_str_tmp) || isContainJapanese(input_str_tmp) || isContainKoera(input_str_tmp)) && input_str_tmp.length > 15) {
		input_str_tmp = input_str_tmp.substring(0, 8) + ' ...';
	} else if (input_str_tmp.length > 25) {
		input_str_tmp = input_str_tmp.substring(0, 15) + ' ...';
	}
  if (trans_str_tmp == input_str_tmp) {
    return null;
  }
    let res = `<div id="yddContainer">
      <div class="yddTop" class="ydd-sp">
        <div class="yddTopBorderlr">
          <a class="ydd-icon" href="http://fanyi.youdao.com/translate?i=${encodeURIComponent(input_str)}&keyfrom=chrome" target=_blank">有道词典</a>
          <span>${input_str_tmp.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, "&quot;").replace(/'/g, "&#39;")}</span>
          <a href="http://fanyi.youdao.com/translate?i=${encodeURIComponent(input_str)}&smartresult=dict&keyfrom=chrome.extension" target=_blank>详细</a>
          <a class="ydd-close">&times;</a>
        </div>
      </div>
      <div class="yddMiddle">
        <div class="ydd-trans-wrapper">
          <div class="ydd-trans-container">
            ${trans_str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#39;")}
          </div>
        </div>
      </div>
    </div>`;
	return res;
}

const fetchWordOnline = (word, callback) =>{
	ajax({
		url: 'http://dict.youdao.com/fsearch',
		data: {
			client: 'deskdict',
			keyfrom: 'chrome.extension',
			xmlVersion: '3.2',
			dogVersion: '1.0',
			ue: 'utf8',
			q: word,
			doctype: 'xml',
			pos: '-1',
			vendor: 'unknown',
			appVer: '3.1.17.4208',
			le: isContainKoera(word) ? 'ko' : 'eng'
		},
		dataType: 'xml',
		success: (ret) =>{
			let dataText = translateXML(ret);
			if (dataText != null){
				callback(dataText);
			}
		}
	});
}

// 查询英文之外的语言
const fetchTranslate = (words, callback) =>{
	ajax({
		url: 'http://fanyi.youdao.com/translate',
		data:{
			client: 'deskdict',
			keyfrom: 'chrome.extension',
			xmlVersion: '1.1',
			dogVersion: '1.0',
			ue: 'utf8',
			i: words,
			doctype: 'xml'
		},
		dataType: 'xml',
		success: (ret) => {
			let dataText = translateTransXML(ret);
			if (dataText != null){
				callback({
					data: dataText
				});
			}
		}
	});
}

/**
 * 将配置更新通知已经打开的 Tab
 */
const publishOptionChangeToTabs = (Options) =>{
	chrome.tabs.query({
		status: "complete"
	}, (tabs) =>{
		if (tabs.length) {
			tabs.forEach((tab) => {
				chrome.tabs.sendMessage(tab.id, {
					optionChanged: Options,
				}, (rep) => {
					// console.log('option changed event has been published');
				});
			});
		}
	});
}

const playAudio = (word) => {
	let audioUrl = "http://dict.youdao.com/speech?audio=" + word;
	let audio = document.createElement('audio');
	audio.autoplay = true;
	audio.src = audioUrl;
}

// let YouDaoLoginUrl = "http://account.youdao.com/login";
// let YouDaoLoginUrl = "http://account.youdao.com/login?service=dict&back_url=http://dict.youdao.com/wordbook/wordlist";
let YouDaoLoginUrl = "http://dict.youdao.com/wordbook/wordlist";
// 打开登录框
const loginYoudao = () => {
	let w = 500;
	let h = 500;
	// chrome.windows.create({
	chrome.tabs.create({
		url   : YouDaoLoginUrl,
	// 	type  : "popup",
	// 	width : w,
	// 	height: h,
	// 	left  : Math.floor(screen.width / 2 - (w + 1) / 2),
	// 	top   : Math.floor(screen.height / 2 - h / 2)
	}, ( win ) =>{
		// win.onload = function(){
		// 	let formEl = win.document.querySelector('#login-form');
		// 	if( formEl ){
		// 		formEl.scrollIntoViewIfNeeded();
		// 	}
		// };
	});
}

let YouDaoAddWordUrl = 'http://dict.youdao.com/wordbook/ajax';

const addWord = (word, success, fail) => {
	ajax({
		url: YouDaoAddWordUrl,
		data:{
			action: 'addword',
			le: 'eng',
			q: word,
		},
		dataType: 'json',
		success: (ret) => {
			let msg = ret.message;
			if (msg === "adddone") {
				success && success();
			}
			else if (msg === 'nouser') {
				fail && fail();
			}
		},
	});
}

const setBadge = (text , color) => {
	chrome.browserAction.setBadgeText({text: text});
	color && chrome.browserAction.setBadgeBackgroundColor({color: color});
};

const hideBadge = () =>{
	setBadge('', '');
};

const popBadgeTips = (text, color) => {
	setBadge( text + '', color);
	setTimeout( hideBadge, 3e3);
};