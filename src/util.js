export const isEnglish = (s) => {
	for (var i = 0; i < s.length; i++) {
		if (s.charCodeAt(i) > 126) {
			return false;
		}
	}
	return true;
}

export const isChinese = (temp) => {
	var re = /[^\u4e00-\u9fa5]/;
	if (re.test(temp)) return false;
	return true;
}

export const isJapanese = (temp)=> {
	var re = /[^\u0800-\u4e00]/;
	if (re.test(temp)) return false;
	return true;
}

export const isKoera = (str) => {
	for (var i = 0, len = str.length; i < len; i++) {
		if (((str.charCodeAt(i) > 0x3130 && str.charCodeAt(i) < 0x318F) || (str.charCodeAt(i) >= 0xAC00 && str.charCodeAt(i) <= 0xD7A3))) {
			return true;
		}
	}
	return false;
}

export const isContainChinese = (temp)=> {
	var cnt = 0;
	for (var i = 0, len = temp.length; i < len; i++) {
		if (isChinese(temp.charAt(i))) cnt++;
	}
	if (cnt > 5) return true;
	return false;
}

export const isContainJapanese = (temp) =>{
	var cnt = 0;
	for (var i = 0, len = temp.length; i < len; i++) {
		if (isJapanese(temp.charAt(i))) cnt++;
	}
	if (cnt > 2) return true;
	return false;
}

export const isContainKoera = (temp) => {
	var cnt = 0;
	for (var i = 0, len = temp.length; i < len; i++) {
		if (isKoera(temp.charAt(i))) cnt++;
	}
	if (cnt > 0) return true;
	return false;
}

export const isAlpha = (str) => {
	return /[a-zA-Z']+/.test(str);
}

export const spaceCount = (temp) => {
	var cnt = 0;
	for (var i = 0; i < temp.length; i++) {
		if (temp.charAt(i) == ' ') {
			cnt++;
		}
	}
	return cnt;
}

export const ExtractEnglish = (word) => {
	var patt = new RegExp(/([a-zA-Z ]+)/);
	var results = patt.exec(word);
	if( results && results.length ){
		return results[1];
	}
	return '';
}

export const playAudio = (word) => {
	chrome.runtime.sendMessage({
		'action': 'speech',
		'word': word
	}, function() {});
}

export const addToNote = (word, callback) => {
	chrome.runtime.sendMessage({
		action: 'youdao-add-word',
		word: word
	}, (resp) => {
		callback && callback( resp );
	});
}
/**
 * JSON 转 queryString
 * @param  {JSON} params [description]
 * @return {[type]}        [description]
 */
export const queryString = (params)=>{
	if( params ){
		return Object.keys( params ).map((key) => {
			return [ encodeURIComponent(key), encodeURIComponent( params[key] ) ].join('=');
		}).join('&');
	}else{
		return '';
	}
}
// 去抖动
export const debounce = ( fn, delay = 200) =>{
	let timer = null;
	return (...args)=>{
		clearTimeout( timer );
		timer = setTimeout(()=>{
			fn.apply(null, args);
		}, delay);
	}
}

function qs( json ){
	return Object.keys(json).map(function( key ){
		return key + '=' + encodeURIComponent( json[key] );
	}).join('&');
}

export const ajax = ( option ) => {
	return new Promise( (resolve, reject)=>{
		let url = option.url;
		const type = option.type || 'GET';
		const dataType = (option.dataType || '').toLowerCase();
		const data = option.data;

		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = (data) => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					let ret = xhr.responseText;
					if( dataType === 'json'){
						try{
							ret = JSON.parse(ret); // 添加单词本接口返回内容需要 parse
						}
						catch( err ){
							reject( err );
							return;
						}
					}
					else if (dataType === 'xml' ){
						ret = xhr.responseXML;
					}
					resolve( ret );
				}
			}
		};

		const queryString = qs(data);
		if( type === 'GET' ){
			url += '?' + queryString;
		}

		xhr.open(type, url, true);
		xhr.send(type === 'GET' ? null : queryString);
	});
};