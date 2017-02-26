(function(win) {
	var _isDev = !1;
	var _DefaultOptions = {
		"dict_enable": ["checked", false],
		"ctrl_only": ["checked", true],
		"english_only": ["checked", true],
		"auto_speech": ["checked", true],
		"history_count": 5
	};
	win.log = function() {
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
	if (_cachedOtp) {
		mergeOption(_DefaultOptions, JSON.parse(_cachedOtp));
	} else {
		localStorage["ColorOptions"] = JSON.stringify(_DefaultOptions);
	}
	win.Options = _DefaultOptions;
})(window);