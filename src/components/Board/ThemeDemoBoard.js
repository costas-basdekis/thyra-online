import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Game from "../../game/game";
import BoardBackground from "./BoardBackground";

class ThemeDemoBoard extends Component {
  static demoRowsAndColumns = [
    {
      y: 0,
      cells: [
        {x: 0, y: 0, player: null, worker: null, level: 0},
        {x: 1, y: 0, player: null, worker: null, level: 1},
        {x: 2, y: 0, player: null, worker: null, level: 2},
        {x: 3, y: 0, player: null, worker: null, level: 3},
        {x: 4, y: 0, player: null, worker: null, level: 4},
        {x: 5, y: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST, level: 0},
        {x: 6, y: 0, player: Game.PLAYER_B, worker: Game.WORKER_FIRST, level: 0},
      ],
    },
  ];

  isCellAvailable = () => {
    return false;
  };

  isCellUndoable = () => {
    return false;
  };

  render() {
    const {small, medium, settings} = this.props;
    return (
      <BoardBackground
        small={small}
        medium={medium}
        allowControl={[Game.PLAYER_A, Game.PLAYER_B]}
        rowsAndColumns={this.constructor.demoRowsAndColumns}
        undoable={false}
        isCellAvailable={this.isCellAvailable}
        isCellUndoable={this.isCellUndoable}
        settings={settings}
      />
    );
  }
}

ThemeDemoBoard.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]).isRequired,
  small: PropTypes.bool.isRequired,
  medium: PropTypes.bool.isRequired,
  settings: PropTypes.object.isRequired,
};

ThemeDemoBoard.defaultProps = {
  className: '',
  small: false,
  medium: false,
};

export default ThemeDemoBoard;
