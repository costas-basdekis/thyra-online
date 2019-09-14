import React, {Fragment, PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from "lodash";
import Game from "../../../game/game";
import * as constants from './constants';
import Cell from "./Cell";
import Piece from "./Piece";
import '../../../styles/svg-board.css';

class SvgBoardBackground extends PureComponent {
  render() {
    let {
      className, clickable, undoable, isCellAvailable, isCellUndoable, small, medium, makeMove, onSelect, selected,
      allowControl, settings, rowsAndColumns, animated,
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
    const pieces = _.sortBy(_.flatten(rowsAndColumns.map(row => row.cells.filter(cell => cell.player))), ['player', 'worker']);

    return (
      <svg
        className={className}
        viewBox={`0 0 ${constants.cellSize * columnCount} ${constants.cellSize * rowCount}`}
        style={{'--column-count': columnCount, '--row-count': rowCount}}
        preserveAspectRatio={"xMinYMin meet"}
        onClick={onSelect}
      >
        <g data-key={'rows'}>
          {rowsAndColumns.map(row => (
            <g data-key={`row-${row.y}`} key={`row-${row.y}`}>
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
                  animated={animated}
                />
              ))}
            </g>
          ))}
        </g>
        {animated ? (
          <g data-key={'pieces'} style={{pointerEvents: 'none'}}>
            {pieces.map(cell => (
              <SvgBoardPiece key={`${cell.player}-${cell.worker}`} cell={cell} theme={theme} />
            ))}
          </g>
        ) : null}
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
  animated: PropTypes.bool.isRequired,
};

SvgBoardBackground.defaultProps = {
  className: '',
  small: false,
  medium: false,
  clickable: false,
  selected: false,
  allowControl: [Game.PLAYER_A, Game.PLAYER_B],
  animated: false,
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

class SvgBoardPiece extends PureComponent {
  state = {
    previousPosition: {x: this.props.cell.x, y: this.props.cell.y},
    position: {x: this.props.cell.x, y: this.props.cell.y},
  };

  animateTransform = React.createRef();

  static getDerivedStateFromProps(props, state) {
    if (props.cell.x !== state.position.x || props.cell.y !== state.position.y) {
      return {previousPosition: state.position, position: {x: props.cell.x, y: props.cell.y}};
    }

    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.position !== prevState.position) {
      setTimeout(() => this.animateTransform.current.beginElement(), 0);
    }
  }

  render() {
    const {cell, theme} = this.props;
    const {previousPosition, position} = this.state;
    return (
      <g transform={`translate(${position.x * 100},${position.y * 100})`}>
        <Piece
          style={theme.pieces || 'king'}
          colour={cell.player === Game.PLAYER_A ? 'white' : 'black'}
          rotated={cell.player === Game.PLAYER_B && theme.rotateOpponent}
        />
        <animateTransform
          ref={this.animateTransform}
          attributeName={'transform'}
          attributeType={'XML'}
          type={'translate'}
          from={`${previousPosition.x * 100} ${previousPosition.y * 100}`}
          to={`${position.x * 100} ${position.y * 100}`}
          dur={'0.1s'}
          repeatCount={1}
          fill={'freeze'}
        />
      </g>
    );
  }
}

class SvgBoardCell extends PureComponent {
  makeMove = () => {
    if (this.props.available && this.props.makeMove) {
      this.props.makeMove(this.props.cell);
    } else if (this.props.undoable && this.props.undo) {
      this.props.undo();
    }
  };

  render() {
    let {cell, clickable, available, undoable, settings: {theme}, makeMove, undo, animated, allowControl} = this.props;
    return (
      <Cell
        x={cell.x}
        y={cell.y}
        available={available}
        undoable={undoable}
        level={cell.level}
        player={animated ? undefined : cell.player}
        allowControl={allowControl}
        animated={animated}
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
  animated: PropTypes.bool.isRequired,
  allowControl: PropTypes.array.isRequired,
};

SvgBoardCell.defaultProps = {
  clickable: false,
  available: false,
  undoable: false,
  animated: false,
  allowControl: [Game.PLAYER_A, Game.PLAYER_B],
};

export default SvgBoardBackground;
