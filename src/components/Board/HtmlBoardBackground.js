import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Game from "../../game/game";
import "../../styles/html-board.css";

class HtmlBoardBackground extends Component {
  render() {
    let {
      className, clickable, undoable, isCellAvailable, isCellUndoable, small, medium, makeMove, onSelect, selected,
      allowControl, settings, rowsAndColumns,
    } = this.props;
    const {theme: {scheme, numbers}} = settings;

    className = classNames("board", "html-board", {
      'small-board': small,
      'medium-board': medium,
      editable: !!makeMove && (clickable || undoable),
      selectable: !!onSelect,
      selected,
      'board-theme-default': scheme === '',
      'board-theme-subtle': scheme === 'subtle',
      'board-theme-pastel': scheme === 'pastel',
      'board-theme-green': scheme === 'green',
      'numbered-levels': ['obvious', 'subtle', 'very-subtle'].includes(numbers),
      'obvious-levels': numbers === 'obvious',
      'subtle-levels': numbers === 'subtle',
      'very-subtle-levels': numbers === 'very-subtle',
    }, className);

    return (
      <div className={className} onClick={onSelect}>
        {rowsAndColumns.map(row => (
          <div key={`row-${row.y}`} className={"row"}>
            {row.cells.map(cell => (
              <HtmlBoardCell
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
        ))}
      </div>
    );
  }
}

HtmlBoardBackground.propTypes = {
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
  animated: PropTypes.bool.isRequired,
};

HtmlBoardBackground.defaultProps = {
  className: '',
  small: false,
  medium: false,
  clickable: false,
  selected: false,
  allowControl: [Game.PLAYER_A, Game.PLAYER_B],
  animated: false,
};

class HtmlBoardCell extends Component {
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

HtmlBoardCell.propTypes = {
  cell: PropTypes.object.isRequired,
  clickable: PropTypes.bool.isRequired,
  available: PropTypes.bool.isRequired,
  undoable: PropTypes.bool.isRequired,
  settings: PropTypes.object.isRequired,
  makeMove: PropTypes.func,
  undo: PropTypes.func,
};

HtmlBoardCell.defaultProps = {
  clickable: false,
  available: false,
  undoable: false,
};

export default HtmlBoardBackground;
