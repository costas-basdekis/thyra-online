import React, {Component, Fragment} from 'react';
import './App.css';
import Game from "./game";
import Board from "./components/board";

class App extends Component {
  static PLAYER_NAMES = {
    [Game.PLAYER_A]: "Player A",
    [Game.PLAYER_B]: "Player B",
  };
  static MOVE_TYPE_NAMES = {
    [Game.MOVE_TYPE_PLACE_FIRST_WORKER]: "Place your first worker",
    [Game.MOVE_TYPE_PLACE_SECOND_WORKER]: "Place your second worker",
  };

  state = {
    game: new Game(),
  };

  render() {

    const {game} = this.state;
    return (
      <Fragment>
        <div>
          {game.finished ? (
            <Fragment>
              {this.constructor.PLAYER_NAMES[game.winner]} won!
            </Fragment>
          ) : (
            <Fragment>
              Next player: {this.constructor.PLAYER_NAMES[game.nextPlayer]}
              <br />
              {this.constructor.MOVE_TYPE_NAMES[game.moveType]}
            </Fragment>
          )}
        </div>
        <Board game={game} />
      </Fragment>
    );
  }
}

export default App;
