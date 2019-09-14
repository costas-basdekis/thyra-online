import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Game from "../../game/game";
import BoardBackground from "./BoardBackground";

class Board extends PureComponent {
  makeMove = (cell) => {
    this.props.makeMove(this.props.game.makeMove({x: cell.x, y: cell.y}));
  };

  undo = () => {
    this.props.makeMove(this.props.game.canUndo ? this.props.game.undo() : this.props.game.takeMoveBack());
  };

  onSelect = () => {
    this.props.onSelect(this.props.game);
  };

  isCellAvailable = cell => {
    return this.props.game.isMoveAvailable(cell);
  };

  isCellUndoable = cell => {
    if (this.props.minChainCount === undefined || this.props.minChainCount === null) {
      if (!this.props.game.canUndo) {
        return false;
      }
    } else {
      if (this.props.game.chainCount <= this.props.minChainCount) {
        return false;
      }
    }
    const lastMove = this.props.game.lastMove;
    if (!lastMove) {
      return false;
    }
    return lastMove.x === cell.x && lastMove.y === cell.y;
  };

  isGameUndoable() {
    return !!this.props.game.rowsAndColumns.find(row => row.cells.find(cell => this.isCellUndoable(cell)));
  }

  render() {
    const {game, allowControl, onSelect, makeMove, animated} = this.props;

    return (
      <BoardBackground
        {...this.props}
        isCellAvailable={animated ? this.isCellAvailable : () => false}
        isCellUndoable={animated ? this.isCellUndoable : () => false}
        clickable={allowControl.includes(game.nextPlayer)}
        undoable={animated ? this.isGameUndoable() : false}
        onSelect={onSelect ? this.onSelect : null}
        makeMove={makeMove ? this.makeMove : null}
        undo={makeMove ? this.undo : null}
        rowsAndColumns={game.rowsAndColumns}
        animated={animated}
      />
    );
  }
}

Board.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]).isRequired,
  game: PropTypes.instanceOf(Game).isRequired,
  makeMove: PropTypes.func,
  minChainCount: PropTypes.number,
  small: PropTypes.bool.isRequired,
  medium: PropTypes.bool.isRequired,
  onSelect: PropTypes.func,
  selected: PropTypes.bool.isRequired,
  allowControl: PropTypes.array.isRequired,
  settings: PropTypes.object.isRequired,
  animated: PropTypes.bool.isRequired,
};

Board.defaultProps = {
  className: '',
  small: false,
  medium: false,
  selected: false,
  allowControl: [Game.PLAYER_A, Game.PLAYER_B],
  animated: false,
};

export default Board;
