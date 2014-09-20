(function(win) {
    var _isDev = !1;
    var _DefaultOptions = {
        "ctrl_only": ["checked", false],
        "dict_disable": ["checked", false],
        "english_only": ["checked", true],
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
    var _initOpt = function(cachedOpts, opt) {
        for (var item in opt) {
            var c = cachedOpts[item],
                o = opt[item];
            if (typeof c !== 'undefined' && typeof o !== 'undefined') {
                opt[item] = c;
            }
        }
    };
    var _opt = _DefaultOptions,
        _cachedOtp = localStorage["ColorOptions"];
    if (_cachedOtp) {
        _initOpt(JSON.parse(_cachedOtp), _opt);
        log('init Options', _opt);
    } else {
        localStorage["ColorOptions"] = JSON.stringify(_DefaultOptions);
        log('first plant ColorOptions');
    }
    win.Options = _opt;
})(window);