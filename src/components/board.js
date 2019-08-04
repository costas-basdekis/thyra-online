import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Game from "../game";

class Board extends Component {
  render() {
    let {game} = this.props;

    return (
      <div className={"background"}>
        {game.rowsAndColumns.map(row => (
          <div key={`row-${row.y}`} className={"row"}>
            {row.cells.map(cell => (
              <div key={`row-${cell.x}-${cell.y}`} className={classNames({cell: true, available: game.availableMoves[cell.x][cell.y]})}>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
}

Board.propTypes = {
  game: PropTypes.instanceOf(Game).isRequired,
};

export default Board;
