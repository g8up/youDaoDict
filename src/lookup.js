import{
	isEnglish,
	isChinese,
	isJapanese,
	isKoera,
	isContainChinese,
	isContainJapanese,
	isContainKoera,
	isAlpha,
	spaceCount,
	ExtractEnglish,
	playAudio,
	addToNote,
	debounce,
} from './util'
let Options = {};
let body = document.body;
let list = [];
let last_time = 0, last_frame;
let TriggerDelay = 250;

const getOption = (next) => {
	chrome.runtime.sendMessage({
		'action': "getOption"
	}, (resp) => {
		if (resp && resp.option) {
			Object.assign(Options, resp.option)

			dealSelectEvent();
			dealPointEvent();
		}
		next && next();
	});
}

const getOptVal = (strKey) => {
	if (Options !== null) {
		return Options[strKey][1];
	}
}

getOption();

// 划词翻译
const onSelectToTrans = debounce((e) => {
	let word = window.getSelection().toString().trim();
	if (word.length < 1 || word.length > 2000) {
		return;
	}
	let{
		pageX: xx,
		pageY: yy,
		screenX: sx,
		screenY: sy,
	} = e;
	let hasJapanese = isContainJapanese(word);
	let	hasChinese = isContainChinese(word);
	if (getOptVal("english_only")) {
		let hasKoera = isContainKoera(word);
		if (hasJapanese || hasChinese || hasKoera) {
			return;
		}
		word = ExtractEnglish(word);
		// TODO: add isEnglish function
		if (word !== '') {
			getYoudaoDict(word, function (data) {
				createPopUpEx(data, xx, yy, sx, sy);
			});
		}
	} else if ((!hasChinese && spaceCount(word) >= 3)
		|| (hasChinese && word.length > 4)
		|| hasJapanese && word.length > 4) {
		getYoudaoTrans(word, function (data) {
			createPopUpEx(data, xx, yy, sx, sy);
		});
	}
});

function dealSelectEvent(){
	if ( getOptVal("dict_enable") ) {
		body.removeEventListener("mouseup", onSelectToTrans);
		body.addEventListener("mouseup", onSelectToTrans);
	}else{
		body.removeEventListener("mouseup", onSelectToTrans);
	}
}

let prevC, prevO, c;
// 指词即译
const onPointToTrans = debounce((e)=>{
	if (!e.ctrlKey || e.shiftKey || e.altKey) {
		return;
	}
	let caretRange = document.caretRangeFromPoint(e.clientX, e.clientY);
	if (!caretRange) return true;
	let so = caretRange.startOffset;
	let	eo = caretRange.endOffset;
	if (prevC === caretRange.startContainer && prevO === so) return true;
	prevC = caretRange.startContainer;
	prevO = so;
	let tr = caretRange.cloneRange();
	let	_tempText = '';
	if (caretRange.startContainer.data) {
		while (so >= 1) {
			tr.setStart(caretRange.startContainer, --so);
			_tempText = tr.toString();
			if (!isAlpha(_tempText.charAt(0))) {
				tr.setStart(caretRange.startContainer, so + 1);
				break;
			}
		}
	}
	if (caretRange.endContainer.data) {
		while (eo < caretRange.endContainer.data.length) {
			tr.setEnd(caretRange.endContainer, ++eo);
			_tempText = tr.toString();
			if (!isAlpha(_tempText.charAt(_tempText.length - 1))) {
				tr.setEnd(caretRange.endContainer, eo - 1);
				break;
			}
		}
	}
	let word = tr.toString();
	if (word.length >= 1) {
		let {
			pageX: xx,
			pageY: yy,
			screenX: sx,
			screenY: sy,
		} = e;
		let selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(tr);
		getYoudaoDict(word, function (data) {
			createPopUpEx(data, xx, yy, sx, sy);
		});
	}
});

const dealPointEvent = () =>{
	if ( getOptVal("ctrl_only") ) {
		document.removeEventListener('mousemove', onPointToTrans);
		document.addEventListener('mousemove', onPointToTrans);
	}else{
		document.removeEventListener('mousemove', onPointToTrans);
	}
}

const OnCheckCloseWindow = () => {
	if (last_frame) {
		let cur = new Date().getTime();
		if (cur - last_time < 500) {
			return;
		}
		closePanel();
		last_frame = null;
	}
}

document.addEventListener('click', OnCheckCloseWindow);

const closePanel = ()=> {
	if( content ) {
		content.classList.remove('fadeIn');
		content.innerHTML = '';
	}
}

const createPopUpEx = (html, x, y, screenx, screeny) => {
	if( html !== undefined ){
		let sel = window.getSelection();
		if( sel && sel.rangeCount ){
			createPopUp(html, sel.getRangeAt(0).startContainer.nodeValue, x, y, screenx, screeny);
		}
	}
}

const createPopUp = (html, senctence, x, y, screenX, screenY) => {
	let frame_height = 150;
	let frame_width = 300;
	let padding = 10;
	let frame_left = 0;
	let frame_top = 0;
	let frame = getYoudaoDictPanelCont( html );

	body.style.position = "static";
	// 确定位置
	let screen_width = screen.availWidth;
	let screen_height = screen.availHeight;
	if (screenX + frame_width < screen_width) {
		frame_left = x;
	} else {
		frame_left = (x - frame_width - 2 * padding);
	}
	frame.style.left = frame_left + 'px';
	if (screenY + frame_height + 20 < screen_height) {
		frame_top = y;
	} else {
		frame_top = (y - frame_height - 2 * padding);
	}
	frame.style.top = frame_top + 10 + 'px';
	if (frame.style.left + frame_width > screen_width) {
		frame.style.left -= frame.style.left + frame_width - screen_width;
	}
	let leftbottom = frame_top + 10 + frame.clientHeight;
	if (leftbottom < y) {
		let newtop = y - frame.clientHeight;
		frame.style.top = newtop + 'px';
	}
	frame.style.display = '';// 设定了新节点位置，清除隐藏属性
	list.push(frame);
	last_time = new Date().getTime();
	last_frame = frame;
}

let content = null;
const getYoudaoDictPanelCont = ( html )=>{
	const PANEL_ID = 'yddWrapper';
	let panel = document.querySelector(`div#${PANEL_ID}`);
	if( !panel ){
		panel = document.createElement('div');
		panel.id = PANEL_ID;
		panel.style.display = 'none';// 此时新生成的节点还没确定位置，默认隐藏，以免页面暴露
		markTagOrigin( panel );
		body.appendChild(panel);
		addPanelEvent( panel );

		let tmpl = genTmpl();
		let root = panel.createShadowRoot();
		root.appendChild(document.importNode(tmpl.content, true) );
		content = root.querySelector('#ydd-content');
	}
	content.innerHTML = html;
	content.classList.add('fadeIn');
	addContentEvent(content );
	return panel;
}

const addPanelEvent = (panel) => {
	panel.setAttribute('draggable', true);
	// panel.innerHTML += html;

	// 拖放
	let distanceX, distanceY;
	panel.ondragstart = (e) => {
		distanceX = e.x - parseInt(panel.style.left);
		distanceY = e.y - parseInt(panel.style.top);
	};
	panel.ondragend = (e) => {
		panel.style.left = e.x - distanceX + 'px';
		panel.style.top = e.y - distanceY + 'px';
		distanceX = 0;
		distanceY = 0;
	};
}

const addContentEvent = (content )=>{
	// 关闭按钮
	content.addEventListener('click', (e) => {
		e.stopPropagation();
	});
	// 防止触发划词查询
	content.addEventListener('mouseup', (e) => {
		e.stopPropagation();
	});
	let closeBtn = content.querySelector('.ydd-close');
	closeBtn.onclick = (e) => {
		closePanel();
	};
	closeBtn = null;
	// 语音播放
	(function renderAudio() {
		let speech = content.querySelector(".ydd-voice");
		if (speech) {
			if (speech.innerHTML != '') {
				speech.classList.add('ydd-voice-icon');
				let wordAndType = speech.textContent;
				if (getOptVal('auto_speech')) {
					playAudio( wordAndType );
				}
				speech.addEventListener('click', (e) => {
					playAudio( wordAndType );
				});
			}
			speech.innerHTML = '';
		}
	})();
	// 添加到单词本
	let addBtn = content.querySelector('#addToNote');
	addBtn.addEventListener('click', (e) => {
		e.preventDefault();
		let word = content.querySelector('.yddKeyTitle').textContent.trim();
		if( word ){
			addToNote( word, ()=>{
				addBtn.classList.add('green');
			});
		}
	});
}

const getYoudaoDict = (word, next) => {
	chrome.runtime.sendMessage({
		'action': 'dict',
		'word': word
	}, (data) => {
		next && next(data);
	});
}

const getYoudaoTrans = (word, next) => {
	chrome.runtime.sendMessage({
		'action': 'translate',
		'word': word
	}, (data) => {
		next && next(data);
	});
}

// 获取配置修改的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>{
	if( request.optionChanged ){
		Object.assign(Options, request.optionChanged)

		dealSelectEvent();
		dealPointEvent();
	}
});

const genTmpl = ()=>{
	const TMPL_ID = 'youdaoDictPanel';
	let tmpl = document.querySelector(`template#${TMPL_ID}` );
	if( tmpl ){
		return tmpl;
	}
	else{
		tmpl = document.createElement('template');
		tmpl.id = TMPL_ID;
		markTagOrigin( tmpl );
		let cssUrl = chrome.extension.getURL('youdao-crx.css');
		tmpl.innerHTML = `<style>@import "${cssUrl}"; </style><div id="ydd-content"></div>`; // for panel content
		// body.appendChild( tmpl );
		return tmpl;
	}
}
/**
 * 给插入的节点做标识，以免 web page 的开发者迷惑。
 */
const markTagOrigin = (tag) => {
	if( tag ){
		tag.setAttribute('data-comment', '这是有道词典 “Chrome 划词扩展 V3” 插入的节点');
	}
}