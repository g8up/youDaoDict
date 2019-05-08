/**
 * doc: https://gist.github.com/praveenpuglia/0832da687ed5a5d7a0907046c9ef1813
 */
const STYLE_CONTENT = 'style/content.css';

/**
 * 给插入的节点做标识，以免 web page 的开发者迷惑。
 */
const markTagOrigin = (tag) => {
  if (tag) {
    tag.setAttribute('data-comment', '这是【有道词典划词扩展】插入的节点');
  }
};

const genTmpl = () => {
  const tmpl = document.createElement('template');
  const cssUrl = chrome.extension.getURL(STYLE_CONTENT);
  tmpl.innerHTML = `<style>@import "${cssUrl}"; </style>
      <div id="ydd-content"></div>`; // for panel content
  return tmpl;
};

export const wrapShadowDom = (panel) => {
  const tmpl = genTmpl();
  markTagOrigin(panel);
  // `mode`设置为`open`则可访问`panel.shadowRoot`
  const root = panel.attachShadow({ mode: 'open' });
  root.appendChild(document.importNode(tmpl.content, true));
};

export default {
  wrapShadowDom,
};
