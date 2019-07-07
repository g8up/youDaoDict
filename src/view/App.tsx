import { h, Component } from 'preact';
import History from '../model/History';
import List,{
  ListProps,
} from './components/List';
import Pagination, {
  Props as PaginationProps,
} from './components/Pagination';

interface AppState extends ListProps, PaginationProps {

}

export default class extends Component<any, AppState> {
  state = {
    list : [],

    currentPageNum: 1,
    pageSize: 15,
    total: 0,
    goToPageNum: (pageNum) => {}
  }

  constructor(props) {
    super(props);
  }

  componentDidMount(){
    this.updateList();
  }

  async updateList() {
    this.goToPageNum(this.state.currentPageNum);
  }

  /**
   * 删除一个单词
   * @param {string} word
   */
  async deleteWord(word){
    if( confirm(`要删除：${word} ?`) ) {
      await History.deleteOne(word);
      this.updateList();
    }
  }

  /**
   * 跳转到指定页
   * @param pageNum 跳转到的页面
   */
  async goToPageNum(pageNum) {
    const {
      pageSize,
    } = this.state;
    const words = await History.getAll() || [];
    const total = words.length;
    let list = [];

    if( total > 0 ) {
      if( pageNum < 1){
        pageNum = 1;
      }
      const totalPage = Math.ceil( total / pageSize );
      if (pageNum > totalPage) {
        pageNum = totalPage;
      }
      list = words.slice((pageNum - 1) * pageSize, pageNum * pageSize );
    }

    this.setState(Object.assign(this.state, {
      list,
      currentPageNum: pageNum,
      total,
    }));

  }

  render(props, state: ListProps) {
    const {
      currentPageNum,
      pageSize,
      total,
    } = this.state;

    return (
      <div>
        <List
          list={state.list}
          onDelete={this.deleteWord.bind(this)}
        />
        <Pagination
          currentPageNum={currentPageNum}
          pageSize={pageSize}
          total={total}
          goToPageNum={this.goToPageNum.bind(this) }
        />
      </div>
    )
  }
}