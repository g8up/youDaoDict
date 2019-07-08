import { h, Component } from 'preact';

export interface Props {
  currentPageNum: number;
  pageSize: number;
  total: number;
  // event
  goToPageNum: (pageNum: number)=>void;
};

export default class extends Component<Props>{
  static defaultProps = {
    currentPageNum: 1,
    pageSize: 15,
    total: 0,
  }

  constructor(props: Props) {
    super(props);
  }

  renderPaginationIcon(start, end, totalPage) {
    const {
      goToPageNum,
    } = this.props;
    const buttons = [];
    for (let n = start; n <= end && n <= totalPage; n += 1) {
      buttons.push(<a onClick={() => { goToPageNum(n) }}>
        {n}
      </a>);
    }
    return buttons;
  }

  render(props: Props, state) {
    const {
      currentPageNum,
      pageSize,
      total,
      goToPageNum,
    } = props;

    const totalPage = Math.ceil( total / pageSize );
    const offset = 3;
    const beforeCur = Math.max( currentPageNum - offset, 1);
    const afterCur = Math.min( currentPageNum + offset, total);

    return (
      <div className="pagination">
        {
          beforeCur > 2 ? ([
            <a onClick={() => { goToPageNum(1) }}>{1}</a>,
            <a className="omit">...</a>
          ]) : beforeCur === 2 ? <a onClick={() => { goToPageNum(1) }}>{1}</a> : ''
        }

        {
          this.renderPaginationIcon(beforeCur, currentPageNum - 1, totalPage)
        }

        <a className="current-page">{currentPageNum}</a>

        {
          this.renderPaginationIcon(currentPageNum + 1, afterCur, totalPage)
        }

        {
          afterCur < totalPage - 1 ? (
            [
              <a className="omit">...</a>,
              <a onClick={() => { goToPageNum(totalPage) }}>{totalPage}</a>
            ]
          ) : afterCur === totalPage - 1 ? <a onClick={() => { goToPageNum(totalPage) }}>{totalPage}</a> : ''
          // currentPageNum !== total ? this.renderPaginationIcon(Math.min(currentPageNum + 1, totalPage), Math.min(currentPageNum + offset, totalPage), totalPage) : ''
        }

        <a onClick={() => { goToPageNum( currentPageNum - 1 ) } }>上一页</a>
        <a onClick={() => { goToPageNum(currentPageNum + 1) } }>下一页</a>

      </div>
    )
  }
}