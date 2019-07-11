import { h, Component } from 'preact';
import {
  shareDownloadLink,
} from '../../common/util';

export interface Props {
  exportFile: ()=>void;
};

export default class extends Component<Props> {
  render(props: Props) {
    const {
      exportFile,
    } = props;

    return (
      <div className="toolbar">
        <a onClick={() => { exportFile();}} title="导出所有查询历史">
          <img src="image/export.svg" alt="导出" />
        </a>

        <a
          href="http://dict.youdao.com/wordbook/wordlist"
          target="_blank"
          title="打开有道单词本页面">
          <img src="image/memo.svg" alt="单词本"/>
        </a>

        <a
          onClick={shareDownloadLink}
          title="复制下载链接分享给朋友">
          <img src="image/share.svg" alt="分享给朋友"/>
        </a>

        <a
          href="https://weibo.com/1055554120/FvlTldXO5"
          offical-href="https://chrome.google.com/webstore/detail/%E6%9C%89%E9%81%93%E8%AF%8D%E5%85%B8chrome%E5%88%92%E8%AF%8D%E6%8F%92%E4%BB%B6/chgkpfgnhlojjpjchjcbpbgmdnmfmmil/reviews"
          target="_blank"
          title="告诉我您使用不太方便的地方吧">
          <img src="image/feedback.svg" alt="意见反馈"/>
        </a>
      </div>
    )
  }
}