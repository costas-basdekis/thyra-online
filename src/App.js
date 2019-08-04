import React, {Component} from 'react';
import 'fomantic-ui-css/semantic.css';
import { Container, Header } from 'semantic-ui-react';
import './styles/App.css';
import Game from "./game/game";
import Play from "./components/play";

class App extends Component {
  state = {
    game: Game.create(),
  };

  makeMove = newGame => {
    this.setState({game: newGame});
  };

  undo = () => {
    this.setState(state => ({game: state.game.undo()}));
  };

  render() {
    const {game} = this.state;
    return (
      <Container>
        <Header>Thyra Online</Header>
        <Play game={game} makeMove={this.makeMove} undo={this.undo}/>
      </Container>
    );
  }
}

export default App;
