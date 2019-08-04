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
    console.log("game", game);

    return (
      <div className={"background"}>
        {game.rowsAndColumns.map(row => (
          <div key={`row-${row.y}`} className={"row"}>
            {row.cells.map(cell => {
              const playerNode = cell.player ? (
                <div className={classNames("worker", `player-${cell.player}`)}>
                </div>
              ) : null;
              let levelAndPlayerNode = null;
              if (cell.level === 1) {
                levelAndPlayerNode = (
                  <div className={classNames("level", "level-1")}>
                    {playerNode}
                  </div>
                );
              } else {
                levelAndPlayerNode = playerNode;
              }
              const available = game.availableMoves[cell.y][cell.x];
              return (
                <div
                  key={`row-${cell.x}-${cell.y}`}
                  className={classNames({cell: true, available})}
                  onClick={this.props.makeMove && available ? () => this.makeMove(cell) : null}
                >
                  {levelAndPlayerNode}
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
