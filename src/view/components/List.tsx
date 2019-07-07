/**
 * 按钮列表
 * todo：高阶函数封装同类按钮操作
 */

import { h, Component } from 'preact';
import {
  Word,
} from '../../types/word';

export interface ListProps {
  list: Word[];
  onDelete?: (word: string)=>any;
};

const getDate = (time) => {
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour12: false,
  };
  return (time ? new Date(time) : new Date()).toLocaleString('zh-cn', options);
};

export default class extends Component<ListProps> {
  constructor(props: ListProps) {
    super(props);
  }

  render(props: ListProps) {
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
              <th width="85px">时间</th>
              {/* <th>分类</th> */}
              <th width="65px">操作</th>
            </tr>
          </thead>

          <tbody>
            {
              list.map((item, index)=>{
                const{
                  word,
                  createtime = '',
                } = item;
                return (
                  <tr>
                    <td>{index + 1}</td>
                    <td>{word}</td>
                    <td></td>
                    <td></td>
                    <td>{ createtime === '' ? '' : getDate(createtime) }</td>
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
