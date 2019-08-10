import React, {Component} from 'react';
import Play from "./play";
import Game from "../game/game";

class Hotseat extends Component {
  state = {
    game: Game.create(),
  };

  makeMove = newGame => {
    this.setState({game: newGame});
  };

  render() {
    const {game} = this.state;
    return (
      <Play game={game} makeMove={this.makeMove} />
    );
  }
}

export default Hotseat;
