import { h, Component } from 'preact';
import History from '../model/History';
import List,{
  Props as ListProps,
} from './components/List';
import Pagination, {
  Props as PaginationProps,
} from './components/Pagination';
import Toolbar,{
  Props as ToolbarProps,
} from './components/Toolbar';
import {
  queryAndRecord,
} from '../common/query';

interface AppState extends ListProps, PaginationProps, ToolbarProps {

}

export default class extends Component<any, AppState> {
  state = {
    list : [],

    currentPageNum: 1,
    pageSize: 15,
    total: 0,
    goToPageNum: (pageNum) => {},
    exportFile: ()=>{},
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
   * 查看单词释义
   */
  check(word){
    queryAndRecord(word).then(resp=>{
      this.updateList();
    });
  }

  exportFile(){
    return History.exportIt();
  }

  /**
   * 跳转到指定页
   * @param pageNum 跳转到的页面
   */
  async goToPageNum(pageNum) {
    const {
      pageSize,
    } = this.state;
    const {
      list,
      total,
    } = await History.getPage({
      pageNum,
      pageSize,
    });

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
      <div className="content">
        <div className="top">
          <div className="title">查询历史</div>
          <Toolbar
            exportFile={this.exportFile.bind(this) }
          />
        </div>
        <List
          list={state.list}
          onDelete={this.deleteWord.bind(this)}
          onCheck={this.check.bind(this)}
        />
        <div className="table-bottom">
          <Pagination
            currentPageNum={currentPageNum}
            pageSize={pageSize}
            total={total}
            goToPageNum={this.goToPageNum.bind(this) }
          />
        </div>
      </div>
    )
  }
}