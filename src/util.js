/**
 * util
 */
function isEnglish(s) {
	for (var i = 0; i < s.length; i++) {
		if (s.charCodeAt(i) > 126) {
			return false;
		}
	}
	return true;
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
	for (var i = 0, len = str.length; i < len; i++) {
		if (((str.charCodeAt(i) > 0x3130 && str.charCodeAt(i) < 0x318F) || (str.charCodeAt(i) >= 0xAC00 && str.charCodeAt(i) <= 0xD7A3))) {
			return true;
		}
	}
	return false;
}

function isContainChinese(temp) {
	var cnt = 0;
	for (var i = 0, len = temp.length; i < len; i++) {
		if (isChinese(temp.charAt(i))) cnt++;
	}
	if (cnt > 5) return true;
	return false;
}

function isContainJapanese(temp) {
	var cnt = 0;
	for (var i = 0, len = temp.length; i < len; i++) {
		if (isJapanese(temp.charAt(i))) cnt++;
	}
	if (cnt > 2) return true;
	return false;
}

function isContainKoera(temp) {
	var cnt = 0;
	for (var i = 0, len = temp.length; i < len; i++) {
		if (isKoera(temp.charAt(i))) cnt++;
	}
	if (cnt > 0) return true;
	return false;
}

function isAlpha(str) {
	return /[a-zA-Z']+/.test(str);
}

function spaceCount(temp) {
	var cnt = 0;
	for (var i = 0; i < temp.length; i++) {
		if (temp.charAt(i) == ' ') {
			cnt++;
		}
	}
	return cnt;
}

function ExtractEnglish(word) {
	var patt = new RegExp(/([a-zA-Z ]+)/);
	var results = patt.exec(word);
	if( results && results.length ){
		return results[1];
	}
	return '';
}

function playAudio( word ){
	chrome.runtime.sendMessage({
		'action': 'speech',
		'word': word
	}, function() {});
}

function addToNote( word, callback ){
	chrome.runtime.sendMessage({
		action: 'youdao-add-word',
		word: word
	},function( resp ){
		callback && callback( resp );
	});
}
/**
 * JSON 转 queryString
 * @param  {JSON} params [description]
 * @return {[type]}        [description]
 */
function queryString( params ){
	if( params ){
		var keyVal = Object.keys( params ).map( function( key ){
			return [ encodeURIComponent(key), encodeURIComponent( params[key] ) ].join('=');
		});
		return keyVal.join('&');
	}else{
		return '';
	}
}

function qs( json ){
	return Object.keys(json).map(function( key ){
		return key + '=' + encodeURIComponent( json[key] );
	}).join('&');
}

var noop = function(){}

function ajax( option ){
	var url = option.url;
	var type = option.type || 'GET';
	var dataType = (option.dataType || '').toLowerCase();
	var data = option.data;
	var success = option.success || noop;
	var error = option.error || noop;

	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function (data) {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				var ret = xhr.responseText;
				if( dataType === 'json'){
					try{
						ret = JSON.parse(ret);
					}
					catch( err ){
						error( err );
					}
				}
				else if (dataType === 'xml' ){
					ret = xhr.responseXML;
				}
				success( ret );
			}
		}
	};

	var queryString = qs(data);
	if( type === 'GET' ){
		url += '?' + queryString;
	}

	xhr.open(type, url, true);
	xhr.send(type === 'GET' ? null : queryString);
}