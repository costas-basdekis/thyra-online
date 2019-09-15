import React, {Fragment, PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from "lodash";
import Game from "../../../game/game";
import * as constants from './constants';
import Cell from "./Cell";
import Piece from "./Piece";
import '../../../styles/svg-board.css';
import Arrow from "./Arrow";

class SvgBoardBackground extends PureComponent {
  render() {
    let {
      className, clickable, undoable, isCellAvailable, isCellUndoable, small, medium, makeMove, onSelect, selected,
      allowControl, settings, rowsAndColumns, animated, game,
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
          <SvgBoardPieces rowsAndColumns={rowsAndColumns} theme={theme} allowControl={allowControl} />
        ) : null}
        {animated ? (
          <SvgBoardArrows game={game} />
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
  game: PropTypes.instanceOf(Game),
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
            <Arrow.Definition />
          </defs>
        </svg>
      </Fragment>
    );
  }
}
SvgBoardBackground.Definitions = SvgBoardBackgroundDefinitions;

class SvgBoardArrows extends PureComponent {
  getPlayerMoves() {
    const {player, relevantHistory} = this.getRelevantHistory();
    const gameWithPieceMove = relevantHistory
      .find(game => Game.MOVE_TYPES_MOVE_WORKER.includes(game.thisMoveType));
    const gameWithBuildMove = relevantHistory
      .find(game => game.thisMoveType === Game.MOVE_TYPE_BUILD_AROUND_WORKER);

    return {
      player,
      move: gameWithPieceMove ? {
        from: gameWithPieceMove.previous.lastMove,
        to: gameWithPieceMove.lastMove,
      } : null,
      build: gameWithBuildMove ? {
        from: gameWithBuildMove.previous.lastMove,
        to: gameWithBuildMove.lastMove,
      }: null,
    };
  }

  getRelevantHistory() {
    const {game} = this.props;

    const relevantHistory = [game];
    const player = game.thisPlayer;
    let iteratingGame = game;
    while (iteratingGame.previous) {
      iteratingGame = iteratingGame.previous;
      if (iteratingGame.thisPlayer !== player) {
        break;
      }
      relevantHistory.push(iteratingGame);
    }

    return {player, relevantHistory};
  }

  render() {
    const {game} = this.props;
    if (!game) {
      return null;
    }

    const {player, move, build} = this.getPlayerMoves();
    if (!move && !build) {
      return null;
    }
    const colour = player === Game.PLAYER_A ? 'white' : 'black';

    let moveArrow = null, buildArrow = null;
    if (move) {
      moveArrow = <Arrow key={'move'} from={move.from} to={move.to} colour={colour} />;
    }
    if (build) {
      buildArrow = <Arrow key={'build'} from={build.from} to={build.to} colour={colour} />;
    }

    return [moveArrow, buildArrow];
  }
}

SvgBoardArrows.propTypes = {
  game: PropTypes.instanceOf(Game),
};

class SvgBoardPieces extends PureComponent {
  render() {
    const {rowsAndColumns, theme, allowControl} = this.props;

    const pieces = _.sortBy(_.flatten(rowsAndColumns.map(row => row.cells.filter(cell => cell.player))), ['player', 'worker']);

    return (
      <g data-key={'pieces'} style={{pointerEvents: 'none'}}>
        {pieces.map(cell => (
          <SvgBoardPiece
            key={`${cell.player}-${cell.worker}`}
            cell={cell}
            theme={theme}
            allowControl={allowControl}
          />
        ))}
      </g>
    );
  }
}

SvgBoardPieces.propTypes = {
  rowsAndColumns: PropTypes.array.isRequired,
  theme: PropTypes.object.isRequired,
  allowControl: PropTypes.array.isRequired,
};

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
    const {cell, theme, allowControl} = this.props;
    const {previousPosition, position} = this.state;
  	const isPlayerAOpponent = !allowControl.includes(Game.PLAYER_A) && allowControl.includes(Game.PLAYER_B);
  	const isPlayerBOpponent = !isPlayerAOpponent;
    return (
      <g transform={`translate(${position.x * 100},${position.y * 100})`}>
        <Piece
          style={theme.pieces || 'king'}
          colour={cell.player === Game.PLAYER_A ? 'white' : 'black'}
          rotated={theme.rotateOpponent && (cell.player === Game.PLAYER_A ? isPlayerAOpponent : isPlayerBOpponent)}
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

SvgBoardPiece.propTypes = {
  cell: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  allowControl: PropTypes.array.isRequired,
};

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
        player={cell.player}
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
