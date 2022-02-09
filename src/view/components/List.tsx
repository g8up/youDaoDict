/**
 * 按钮列表
 * todo：高阶函数封装同类按钮操作
 */

import { Component } from 'react';
// import { h, Component } from 'preact';
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

  render() {
    const {
      list,
      currentPageNum,
      pageSize,
      onDelete,
      onCheck,
    } = this.props;

    const indexBase = pageSize * (currentPageNum - 1);

    return (
      <div>
        <table>
          <thead>
            <tr>
              <th>序号</th>
              <th>单词</th>
              <th>音标</th>
              <th>解释</th>
              <th>添加时间</th>
              <th>上次查询</th>
              <th>操作</th>
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
                    <td className="text-muted" width="45px">{indexBase + index + 1}</td>
                    <td width="85px">
                      <a
                        className="word"
                        target="_blank"
                        href={`https://dict.youdao.com/search?keyfrom=chrome.extension&q=${word}`}>{word}</a>
                    </td>
                    <td width="80px">
                      <a
                        className="phonetic"
                        onClick={()=>this.phonetic(word)}
                        title="朗读">
                        {phonetic ? `/${phonetic}/`: ''}
                      </a>
                    </td>
                    <td className="translation" width="320px">
                      {
                        translation ? translation : <a className="check" onClick={() => { onCheck(word); }}>查询</a>
                      }
                    </td>
                    <td className="text-muted" width="85px">{ createTime === '' ? '' : getDate(createTime) }</td>
                    <td className="text-muted" width="85px">{lastView === '' ? <a className="check" onClick={ ()=>{onCheck(word);} }>现在就看</a> : getDate(lastView) }</td>
                    <td width="85px">
                      {/* <a href="#" class="editword" title="编辑"></a> */}
                      <a
                        className="delete-word"
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
