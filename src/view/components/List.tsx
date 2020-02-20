/**
 * 按钮列表
 * todo：高阶函数封装同类按钮操作
 */

import { h, Component } from 'preact';
import {
  IWord,
} from '../../types';
import {
  getDate,
} from '../../common/util';
import {
  playAudio,
} from '@/common/chrome';

export interface Props {
  list: IWord[];
  currentPageNum: number;
  pageSize: number;
  onDelete?: (word: string)=>any;
  onCheck?: (word: string)=>any;
};

export default class extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  // 语音朗读
  phonetic(word: string) {
    playAudio({word});
  }

  render(props: Props) {
    const {
      list,
      currentPageNum,
      pageSize,
      onDelete,
      onCheck,
    } = props;

    const indexBase = pageSize * (currentPageNum - 1);

    return (
      <div className="history">
        <table>
          <thead>
            <tr>
              <th width="50px">序号</th>
              <th width="80px">单词</th>
              <th width="80px">音标</th>
              <th width="320px">解释</th>
              <th width="85px">添加时间</th>
              <th width="85px">上次查询</th>
              {/* <th>分类</th> */}
              <th width="65px">
                <ruby>弄<rt>nèng</rt></ruby>它
              </th>
            </tr>
          </thead>

          <tbody>
            {
              list.map((item, index)=>{
                const{
                  word,
                  phonetic,
                  baseTrans = '',
                  webTrans = '',
                  createTime = '',
                  lastView = '',
                } = item;

                const translation = baseTrans ? baseTrans
                  : webTrans ? `网络释义：${webTrans}`
                  : '';

                return (
                  <tr>
                    <td className="text-muted">{indexBase + index + 1}</td>
                    <td>
                      <a
                        className="word"
                        target="_blank"
                        href={`https://dict.youdao.com/search?keyfrom=chrome.extension&q=${word}`}>{word}</a>
                    </td>
                    <td>
                      <a
                        className="phonetic"
                        onClick={()=>this.phonetic(word)}
                        title="朗读">
                        {phonetic ? `/${phonetic}/`: ''}
                      </a>
                    </td>
                    <td className="translation">{translation}</td>
                    <td className="text-muted">{ createTime === '' ? '' : getDate(createTime) }</td>
                    <td className="text-muted">{lastView === '' ? <a className="check" onClick={ ()=>{onCheck(word);} }>现在就看</a> : getDate(lastView) }</td>
                    <td>
                      {/* <a href="#" class="editword" title="编辑"></a> */}
                      <a
                        class="delete-word"
                        onClick={() => { onDelete(word);}}></a>
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>

        { list.length < 1 && <p className="no-data text-muted">
          暂无查询历史
        </p>}
      </div>
    )
  }
}
