import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Game from "../game/game";

class BoardBackground extends Component {
  render() {
    let {
      className, clickable, undoable, isCellAvailable, isCellUndoable, small, medium, makeMove, onSelect, selected,
      allowControl, settings, children, rowsAndColumns,
    } = this.props;
    const {theme: {scheme, rotated, rounded, numbers}} = settings;

    className = classNames("background", {
      'small-board': small,
      'medium-board': medium,
      editable: !!makeMove && (clickable || undoable),
      selectable: !!onSelect,
      selected,
      'theme-subtle': scheme === 'subtle',
      'theme-pastel': scheme === 'pastel',
      'theme-green': scheme === 'green',
      'theme-rotated': rotated,
      'theme-rounded': rounded,
      'numbered-levels': ['obvious', 'subtle', 'very-subtle'].includes(numbers),
      'obvious-levels': numbers === 'obvious',
      'subtle-levels': numbers === 'subtle',
      'very-subtle-levels': numbers === 'very-subtle',
    }, className);
    if (!children) {
      children = (
        rowsAndColumns.map(row => (
          <div key={`row-${row.y}`} className={"row"}>
            {row.cells.map(cell => (
              <BoardCell
                key={`${cell.x}-${cell.y}`}
                cell={cell}
                clickable={clickable || (undoable && isCellUndoable(cell))}
                available={isCellAvailable(cell)}
                undoable={isCellUndoable(cell)}
                allowControl={allowControl}
                settings={settings}
                makeMove={this.props.makeMove}
                undo={this.props.undo}
              />
            ))}
          </div>
        ))
      );
    }
    return (
      <div className={className} onClick={onSelect}>{children}</div>
    );
  }
}

BoardBackground.propTypes = {
  children: PropTypes.node,
  rowsAndColumns: PropTypes.array,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]).isRequired,
  makeMove: PropTypes.func,
  undo: PropTypes.func,
  small: PropTypes.bool.isRequired,
  medium: PropTypes.bool.isRequired,
  clickable: PropTypes.bool.isRequired,
  undoable: PropTypes.bool.isRequired,
  onSelect: PropTypes.func,
  selected: PropTypes.bool.isRequired,
  isCellAvailable: PropTypes.func.isRequired,
  isCellUndoable: PropTypes.func.isRequired,
  allowControl: PropTypes.array.isRequired,
  settings: PropTypes.object.isRequired,
};

BoardBackground.defaultProps = {
  className: '',
  small: false,
  medium: false,
  clickable: false,
  selected: false,
  allowControl: [Game.PLAYER_A, Game.PLAYER_B],
};

class BoardCell extends Component {
  makeMove = () => {
    if (this.props.available && this.props.makeMove) {
      this.props.makeMove(this.props.cell);
    } else if (this.props.undoable && this.props.undo) {
      this.props.undo();
    }
  };

  render() {
    let {cell, clickable, available, undoable, settings: {theme: {numbers}}, makeMove, undo} = this.props;
    const displayLevel = (
      ['obvious', 'subtle', 'very-subtle'].includes(numbers)
      && cell.level > 0
      && cell.level <4
    ) ? cell.level : null;
    return (
      <div
        key={`row-${cell.x}-${cell.y}`}
        className={classNames("cell", `level-${cell.level}`, {available, undoable})}
        onClick={((makeMove && available) || (undo && undoable)) && clickable ? this.makeMove : null}
      >
        <div className={classNames("level", "level-1")}>
          <div className={classNames("level", "level-2")}>
            <div className={classNames("level", "level-3")}>
              {cell.player ? (
                <div className={classNames("worker", `player-${cell.player}`)}>
                  {displayLevel}
                </div>
              ) : cell.level === 4 ? (
                <div className={classNames("level", "level-4")} />
              ) : displayLevel}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

BoardCell.propTypes = {
  cell: PropTypes.object.isRequired,
  clickable: PropTypes.bool.isRequired,
  available: PropTypes.bool.isRequired,
  undoable: PropTypes.bool.isRequired,
  settings: PropTypes.object.isRequired,
  makeMove: PropTypes.func,
  undo: PropTypes.func,
};

BoardCell.defaultProps = {
  clickable: false,
  available: false,
  undoable: false,
};

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
  settings: {
    theme: {
      scheme: '',
      rotated: false,
      rounded: false,
      numbers: '',
    },
  },
};

class Board extends Component {
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
    return this.props.game.availableMoves[cell.y][cell.x];
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
    let {game, allowControl, onSelect, makeMove} = this.props;

    return (
      <BoardBackground
        {...this.props}
        isCellAvailable={this.isCellAvailable}
        isCellUndoable={this.isCellUndoable}
        clickable={allowControl.includes(game.nextPlayer)}
        undoable={this.isGameUndoable()}
        onSelect={onSelect ? this.onSelect : null}
        makeMove={makeMove ? this.makeMove : null}
        undo={makeMove ? this.undo : null}
        rowsAndColumns={game.rowsAndColumns}
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
};

Board.defaultProps = {
  className: '',
  small: false,
  medium: false,
  selected: false,
  allowControl: [Game.PLAYER_A, Game.PLAYER_B],
  settings: {
    theme: {
      scheme: '',
      rotated: false,
      rounded: false,
      numbers: '',
    },
  },
};

export {
  ThemeDemoBoard,
};

export default Board;
