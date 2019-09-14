import React, {Fragment, PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Game from "../../../game/game";
import * as constants from './constants';
import Cell from "./Cell";
import Piece from "./Piece";
import '../../../styles/svg-board.css';

class SvgBoardBackground extends PureComponent {
  render() {
    let {
      className, clickable, undoable, isCellAvailable, isCellUndoable, small, medium, makeMove, onSelect, selected,
      allowControl, settings, rowsAndColumns,
    } = this.props;
    const {theme} = settings;

    className = classNames("board", "svg-board", `board-theme-${theme.scheme || 'default'}`, {
      'small-board': small,
      'medium-board': medium,
      editable: !!makeMove && (clickable || undoable),
      selectable: !!onSelect,
      selected,
    }, className);
    const rowCount = rowsAndColumns.length;
    const columnCount= Math.max(...rowsAndColumns.map(row => row.cells.length)) || 0;

    return (
      <svg
        className={className}
        viewBox={`0 0 ${constants.cellSize * columnCount} ${constants.cellSize * rowCount}`}
        style={{'--column-count': columnCount, '--row-count': rowCount}}
        preserveAspectRatio={"xMinYMin meet"}
        onClick={onSelect}
      >
        {rowsAndColumns.map(row => (
          <g key={`row-${row.y}`}>
            {row.cells.map(cell => (
              <SvgBoardCell
                key={`${cell.x}-${cell.y}`}
                cell={cell}
                clickable={clickable || (undoable && isCellUndoable(cell))}
                available={isCellAvailable(cell)}
                undoable={isCellUndoable(cell)}
                allowControl={allowControl}
                settings={settings}
                makeMove={this.props.makeMove}
                undo={this.props.undo}
                theme={theme}
              />
            ))}
          </g>
        ))}
      </svg>
    );
  }
}

SvgBoardBackground.propTypes = {
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

SvgBoardBackground.defaultProps = {
  className: '',
  small: false,
  medium: false,
  clickable: false,
  selected: false,
  allowControl: [Game.PLAYER_A, Game.PLAYER_B],
};

class SvgBoardBackgroundDefinitions extends PureComponent {
  render() {
    return (
      <Fragment>
        <svg className={classNames('board', 'svg-board')} style={{display: 'none'}}>
          <defs>
            <Cell.Definitions />
            <Piece.Definitions />
          </defs>
        </svg>
      </Fragment>
    );
  }
}
SvgBoardBackground.Definitions = SvgBoardBackgroundDefinitions;

class SvgBoardCell extends PureComponent {
  makeMove = () => {
    if (this.props.available && this.props.makeMove) {
      this.props.makeMove(this.props.cell);
    } else if (this.props.undoable && this.props.undo) {
      this.props.undo();
    }
  };

  render() {
    let {cell, clickable, available, undoable, settings: {theme}, makeMove, undo} = this.props;
    return (
      <Cell
        x={cell.x}
        y={cell.y}
        available={available}
        undoable={undoable}
        level={cell.level}
        player={cell.player}
        theme={theme}
        onClick={((makeMove && available) || (undo && undoable)) && clickable ? this.makeMove : null}
      />
    );
  }
}

SvgBoardCell.propTypes = {
  cell: PropTypes.object.isRequired,
  clickable: PropTypes.bool.isRequired,
  available: PropTypes.bool.isRequired,
  undoable: PropTypes.bool.isRequired,
  settings: PropTypes.object.isRequired,
  makeMove: PropTypes.func,
  undo: PropTypes.func,
};

SvgBoardCell.defaultProps = {
  clickable: false,
  available: false,
  undoable: false,
};

export default SvgBoardBackground;
