import React, {Component} from 'react';
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
      <Play game={game} makeMove={this.makeMove} undo={this.undo}/>
    );
  }
}

export default App;
