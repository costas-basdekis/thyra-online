import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import '../styles/play.css';
import Game from "../game/game";
import Board from "./board";

class Play extends Component {
  static PLAYER_NAMES = {
    [Game.PLAYER_A]: "Player A",
    [Game.PLAYER_B]: "Player B",
  };
  static MOVE_TYPE_NAMES = {
    [Game.MOVE_TYPE_PLACE_FIRST_WORKER]: "Place your first worker",
    [Game.MOVE_TYPE_PLACE_SECOND_WORKER]: "Place your second worker",
    [Game.MOVE_TYPE_SELECT_WORKER_TO_MOVE]: "Select a worker to move",
    [Game.MOVE_TYPE_MOVE_FIRST_WORKER]: "Move one of your workers",
    [Game.MOVE_TYPE_MOVE_SECOND_WORKER]: "Move one of your workers",
    [Game.MOVE_TYPE_BUILD_AROUND_WORKER]: "Build around the moved worker",
  };

  render() {
    const {game, makeMove, undo} = this.props;
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
                <button onClick={undo}>Undo</button>
              ) : null}
            </Fragment>
          )}
        </div>
        <Board game={game} makeMove={makeMove} />
      </Fragment>
    );
  }
}

Play.propTypes = {
  game: PropTypes.instanceOf(Game).isRequired,
  makeMove: PropTypes.func.isRequired,
  undo: PropTypes.func.isRequired,
};

export default Play;
