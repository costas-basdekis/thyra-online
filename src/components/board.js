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
            {row.cells.map(cell => {
              const available = game.availableMoves[cell.y][cell.x];
              return (
                <div
                  key={`row-${cell.x}-${cell.y}`}
                  className={classNames("cell", `level-${cell.level}`, {available})}
                  onClick={this.props.makeMove && available ? () => this.makeMove(cell) : null}
                >
                  <div className={classNames("level", "level-1")}>
                    <div className={classNames("level", "level-2")}>
                      <div className={classNames("level", "level-3")}>
                        {cell.player ? (
                          <div className={classNames("worker", `player-${cell.player}`)} />
                        ) : cell.level === 4 ? (
                          <div className={classNames("level", "level-4")} />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
