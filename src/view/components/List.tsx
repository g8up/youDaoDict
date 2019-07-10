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

export interface Props {
  list: IWord[];
  onDelete?: (word: string)=>any;
};

export default class extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render(props: Props) {
    const {
      list,
      onDelete,
    } = props;

    return (
      <div>
        <table>
          <thead>
            <tr>
              <th width="50px">序号</th>
              <th width="80px">单词</th>
              <th width="80px">音标</th>
              <th width="320px">解释</th>
              <th width="85px">添加时间</th>
              <th width="85px">上次查看</th>
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
                    <td className="text-muted">{index + 1}</td>
                    <td>
                      <a
                        className="word"
                        target="_blank"
                        href={`https://dict.youdao.com/search?keyfrom=chrome.extension&q=${word}`}>{word}</a>
                    </td>
                    <td>
                      {phonetic ? `/${phonetic}/`: ''}
                    </td>
                    <td>{translation}</td>
                    <td className="text-muted">{ createTime === '' ? '' : getDate(createTime) }</td>
                    <td className="text-muted">{ lastView === '' ? '' : getDate(lastView) }</td>
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
      </div>
    )
  }
}
