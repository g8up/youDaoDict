import { h, Component } from 'preact';
import List,{
  ListProps,
} from './components/List';
import History from '../model/History';

export default class extends Component<any, ListProps> {
  state = {
    list : [],
  }

  constructor(props) {
    super(props);
  }

  componentDidMount(){
    this.updateList();
  }

  async updateList() {
    const words = await History.get(20);
    this.setState({
      list: words,
    });
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

  render(props, state: ListProps) {
    return (
      <List
        list={state.list}
        onDelete={this.deleteWord.bind(this)}
      />
    )
  }
}