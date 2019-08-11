import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Game from "../game/game";

class BoardBackground extends Component {
  render() {
    let {className, clickable, isCellAvailable, small, medium, makeMove, onSelect, selected, allowControl, settings, children, rowsAndColumns} = this.props;
    const {theme: {scheme, rotated, rounded, numbers}} = settings;

    className = classNames("background", {
      'small-board': small,
      'medium-board': medium,
      editable: !!makeMove && clickable,
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
                clickable={clickable}
                available={isCellAvailable(cell)}
                allowControl={allowControl}
                settings={settings}
                makeMove={this.props.makeMove}
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
  small: PropTypes.bool.isRequired,
  medium: PropTypes.bool.isRequired,
  clickable: PropTypes.bool.isRequired,
  onSelect: PropTypes.func,
  selected: PropTypes.bool.isRequired,
  isCellAvailable: PropTypes.func.isRequired,
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
  render() {
    let {cell, clickable, available, settings: {theme: {numbers}}, makeMove} = this.props;
    const displayLevel = (
      ['obvious', 'subtle', 'very-subtle'].includes(numbers)
      && cell.level > 0
      && cell.level <4
    ) ? cell.level : null;
    return (
      <div
        key={`row-${cell.x}-${cell.y}`}
        className={classNames("cell", `level-${cell.level}`, {available})}
        onClick={makeMove && available && clickable ? () => makeMove(cell) : null}
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
  settings: PropTypes.object.isRequired,
  makeMove: PropTypes.func,
};

BoardCell.defaultProps = {
  clickable: false,
  available: false,
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

  render() {
    const {small, medium, settings} = this.props;
    return (
      <BoardBackground
        small={small}
        medium={medium}
        allowControl={[Game.PLAYER_A, Game.PLAYER_B]}
        rowsAndColumns={this.constructor.demoRowsAndColumns}
        isCellAvailable={this.isCellAvailable}
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

  onSelect = () => {
    this.props.onSelect(this.props.game);
  };

  isCellAvailable = cell => {
    return this.props.game.availableMoves[cell.y][cell.x];
  };

  render() {
    let {game, allowControl, onSelect, makeMove} = this.props;

    return (
      <BoardBackground
        {...this.props}
        isCellAvailable={this.isCellAvailable}
        clickable={allowControl.includes(game.nextPlayer)}
        onSelect={onSelect ? this.onSelect : null}
        makeMove={makeMove ? this.makeMove : null}
        rowsAndColumns={game.rowsAndColumns}
      />
    );
  }
}

Board.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]).isRequired,
  game: PropTypes.instanceOf(Game).isRequired,
  makeMove: PropTypes.func,
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
