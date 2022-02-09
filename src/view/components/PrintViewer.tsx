import { Component } from 'react';
// import { h } from 'react-dom';
import {
  IWord,
} from '../../types';
// import './PrintView.less';

interface Props {
  list: IWord[];
};

export default class extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const {
      list,
    } = this.props;

    return (
      <div className="print-view">
        {
          list.map((item, index) => {
            const {
              word,
              phonetic,
              baseTrans = '',
              webTrans = '',
            } = item;

            const translation = baseTrans ? baseTrans
              : webTrans ? `网络释义：${webTrans}`
                : '';

            return (

              <div className="card">
                <div className="title">{word}</div>
                <div className="phonetic">
                  {phonetic ? `/${phonetic}/` : ''}
                </div>
                <div className="translation">
                  {translation ? translation : ''}
                </div>
              </div>

            );
          })
        }

      </div >
    )
  }
}
