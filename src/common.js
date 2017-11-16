import { DEFAULT_OPTION } from './config'

var _isDev = !1;

window.log = function() {
	if (_isDev) {
		console.debug.apply(console, arguments);
	}
};
/**
 * 适配缓存的配置，用于配置升级后的兼容
 */
var mergeOption = function(defaultOption, setting) {
	for (var item in defaultOption) {
		var s = setting[item];
		if( typeof s !== 'undefined'){
			defaultOption[item] = s;
		}
	}
};

var _cachedOtp = localStorage["ColorOptions"];
export const Options = {};
Object.assign({}, DEFAULT_OPTION)

if (_cachedOtp) {
	mergeOption(Options, JSON.parse(_cachedOtp));
} else {
	localStorage["ColorOptions"] = JSON.stringify(DEFAULT_OPTION);
}