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