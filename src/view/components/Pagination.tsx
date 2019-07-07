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
    for (let n = start; n <= end && n < totalPage; n += 1) {
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

    return (
      <div className="pagination">
        <a onClick={() => { goToPageNum(1) }}>首页</a>
        {
          this.renderPaginationIcon(Math.max(currentPageNum - offset, 1), currentPageNum -1, totalPage)
        }

        <a className="current-page">{currentPageNum}</a>

        {
          this.renderPaginationIcon(Math.min(currentPageNum + 1, totalPage), Math.min(currentPageNum + offset, totalPage), totalPage)
        }

        {
          (currentPageNum + offset) < totalPage ? (
            [
              <a>...</a>,
              <a onClick={() => { goToPageNum(totalPage) }}>{totalPage}</a>
            ]
          ) : ''
        }

        <a onClick={() => { goToPageNum( currentPageNum - 1 ) } }>上一页</a>
        <a onClick={() => { goToPageNum(currentPageNum + 1) } }>下一页</a>

      </div>
    )
  }
}