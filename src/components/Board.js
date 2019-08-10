import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Game from "../game/game";

class Board extends Component {
  makeMove = (cell) => {
    this.props.makeMove(this.props.game.makeMove({x: cell.x, y: cell.y}));
  };

  onSelect = () => {
    this.props.onSelect(this.props.game);
  };

  render() {
    let {className, game, small, makeMove, onSelect, selected, allowControl} = this.props;
    const clickable = allowControl.includes(game.nextPlayer);

    return (
      <div
        className={classNames("background", {'small-board': small, editable: !!makeMove && clickable, selectable: !!onSelect, selected}, className)}
        onClick={onSelect ? this.onSelect : null}
      >
        {game.rowsAndColumns.map(row => (
          <div key={`row-${row.y}`} className={"row"}>
            {row.cells.map(cell => {
              const available = game.availableMoves[cell.y][cell.x];
              return (
                <div
                  key={`row-${cell.x}-${cell.y}`}
                  className={classNames("cell", `level-${cell.level}`, {available})}
                  onClick={this.props.makeMove && available && clickable ? () => this.makeMove(cell) : null}
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
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]).isRequired,
  game: PropTypes.instanceOf(Game).isRequired,
  makeMove: PropTypes.func,
  small: PropTypes.bool.isRequired,
  onSelect: PropTypes.func,
  selected: PropTypes.bool.isRequired,
  allowControl: PropTypes.array.isRequired,
};

Board.defaultProps = {
  className: '',
  small: false,
  selected: false,
  allowControl: [Game.PLAYER_A, Game.PLAYER_B],
};

export default Board;
