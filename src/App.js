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
    [Game.MOVE_TYPE_MOVE_FIRST_WORKER]: "Move one of your workers",
    [Game.MOVE_TYPE_MOVE_SECOND_WORKER]: "Move one of your workers",
  };

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
      <Fragment>
        <div>
          Move: {game.moveCount}
          <br />
          {game.finished ? (
            <Fragment>
              {this.constructor.PLAYER_NAMES[game.winner]} won!
            </Fragment>
          ) : (
            <Fragment>
              Next player: {this.constructor.PLAYER_NAMES[game.nextPlayer]}
              <br />
              {this.constructor.MOVE_TYPE_NAMES[game.moveType]}
              {game.canUndo ? (
                <button onClick={this.undo}>Undo</button>
              ) : null}
            </Fragment>
          )}
        </div>
        <Board game={game} makeMove={this.makeMove} />
      </Fragment>
    );
  }
}

export default App;
