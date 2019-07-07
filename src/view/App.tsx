import { h, Component } from 'preact';
import List from './components/List';
import History from '../model/History';
import {
  Word,
} from '../types/word';

interface ListProps {
  list: Word[];
}

export default class extends Component<any, ListProps> {
  state = {
    list : [],
  }

  constructor(props) {
    super(props);
  }

  async componentDidMount(){
    const words = await History.get(20);
    this.setState({
      list: words,
    });
  }

  render(props, state: ListProps) {
    return (
      <List list={state.list}/>
    )
  }
}