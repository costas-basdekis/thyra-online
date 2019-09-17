import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Game from "../../game/game";
import BoardBackground from "./BoardBackground";

class PlayerColourBoard extends Component {
  static colours = {
    [Game.PLAYER_A]: [
      {
        y: 0,
        cells: [
          {x: 0, y: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST, level: 0},
        ],
      },
    ],
    [Game.PLAYER_B]: [
      {
        y: 0,
        cells: [
          {x: 0, y: 0, player: Game.PLAYER_B, worker: Game.WORKER_FIRST, level: 0},
        ],
      },
    ],
  };

  isCellAvailable = () => {
    return false;
  };

  isCellUndoable = () => {
    return false;
  };

  render() {
    const {small, medium, player, settings, allowControl} = this.props;

    return (
      <BoardBackground
        small={small}
        medium={medium}
        rowsAndColumns={this.constructor.colours[player]}
        undoable={false}
        isCellAvailable={this.isCellAvailable}
        isCellUndoable={this.isCellUndoable}
        settings={settings}
        allowControl={allowControl}
      />
    );
  }
}

PlayerColourBoard.propTypes = {
  settings: PropTypes.object.isRequired,
  player: PropTypes.oneOf(Game.PLAYERS).isRequired,
  allowControl: PropTypes.array.isRequired,
  small: PropTypes.bool.isRequired,
  medium: PropTypes.bool.isRequired,
};

PlayerColourBoard.defaultProps = {
  small: false,
  medium: false,
};

export default PlayerColourBoard;
