import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Game from "../game";

class Board extends Component {
  makeMove = (cell) => {
    this.props.makeMove(this.props.game.makeMove({x: cell.x, y: cell.y}));
  };

  render() {
    let {game} = this.props;

    return (
      <div className={"background"}>
        {game.rowsAndColumns.map(row => (
          <div key={`row-${row.y}`} className={"row"}>
            {row.cells.map(cell => (
              <div
                key={`row-${cell.x}-${cell.y}`}
                className={classNames({cell: true, available: game.availableMoves[cell.y][cell.x]})}
                onClick={this.props.makeMove ? () => this.makeMove(cell) : null}
              >
                {cell.player ? (
                  <div className={classNames("worker", `player-${cell.player}`)}>
                  </div>
                ) : null}
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
  makeMove: PropTypes.func,
};

export default Board;
