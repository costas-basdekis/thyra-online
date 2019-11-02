import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Game from "../../game/game";
import BoardBackground from "./BoardBackground";
import {Menu} from "semantic-ui-react";

class Board extends PureComponent {
  makeMove = (cell) => {
    const {game: {rowsAndColumns}, transformation} = this.props;
    if (transformation) {
      cell = transformation.coordinates(rowsAndColumns, cell);
    }
    this.props.makeMove(this.props.game.makeMove({x: cell.x, y: cell.y}));
  };

  undo = () => {
    this.props.makeMove(this.props.game.canUndo ? this.props.game.undo() : this.props.game.takeMoveBack());
  };

  onSelect = () => {
    this.props.onSelect(this.props.game);
  };

  isCellAvailable = cell => {
    const {game: {rowsAndColumns}, transformation} = this.props;
    if (transformation) {
      cell = transformation.coordinates(rowsAndColumns, cell);
    }
    return this.props.game.isMoveAvailable(cell);
  };

  isCellUndoable = cell => {
    const {game: {rowsAndColumns}, transformation} = this.props;
    if (transformation) {
      cell = transformation.coordinates(rowsAndColumns, cell);
    }
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
    return !!this.props.game.findCell(this.isCellUndoable);
  }

  render() {
    const {game, transformation, allowControl, onSelect, makeMove, animated} = this.props;
    let rowsAndColumns = game.rowsAndColumns;
    if (transformation) {
      rowsAndColumns = transformation(rowsAndColumns);
    }

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
        rowsAndColumns={rowsAndColumns}
        transformation={transformation}
        game={game}
        gameType={game.constructor}
        animated={animated}
      />
    );
  }
}

Board.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]).isRequired,
  game: PropTypes.instanceOf(Game).isRequired,
  transformation: PropTypes.func,
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

class BoardTransformation extends PureComponent {
  state = {
    rotations: 0,
    flippedHorizontally: false,
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.gameType !== this.props.gameType) {
      this.reset();
    }
  }

  updateOrientation = method => {
     this.setState(method, () => {
       if (this.props.onChange) {
         const {rotations, flippedHorizontally} = this.state;
         const transformation = this.props.gameType.transformationMap
           ? this.props.gameType.transformationMap[`${rotations},${flippedHorizontally}`]
           : null;
         this.props.onChange({rotations, flippedHorizontally, transformation});
       }
     });
   };

  rotateCounterClockwise = () => {
    this.updateOrientation(state => ({
      rotations: (state.rotations + this.props.gameType.transformationMaxRotations - 1) % this.props.gameType.transformationMaxRotations,
    }));
  };

  rotateClockwise = () => {
    this.updateOrientation(state => ({
      rotations: (state.rotations + 1) % this.props.gameType.transformationMaxRotations,
    }));
  };

  flipHorizontally = () => {
    this.updateOrientation(state => ({
      flippedHorizontally: !state.flippedHorizontally,
    }));
  };

  flipVertically = () => {
    this.updateOrientation(state => ({
      rotations: (state.rotations + this.props.gameType.transformationMaxRotations / 2) % this.props.gameType.transformationMaxRotations,
      flippedHorizontally: !state.flippedHorizontally,
    }));
  };

  reset = () => {
    this.updateOrientation(state => ({
      rotations: 0,
      flippedHorizontally: false,
    }));
  };

  render() {
    const {rotations, flippedHorizontally} = this.state;
    const {gameType} = this.props;

    if (!gameType.transformationMap) {
      return null;
    }

    return (
      <Menu size={'massive'} items={[
        {key: 'rotate-counter-clockwise', icon: 'undo', onClick: this.rotateCounterClockwise},
        {key: 'rotate-clockwise', icon: 'redo', onClick: this.rotateClockwise},
        {key: 'flip-horizontal', icon: 'arrows alternate horizontal', onClick: this.flipHorizontally},
        {key: 'flip-vertical', icon: 'arrows alternate vertical', onClick: this.flipVertically},
        {key: 'home', icon: 'home', onClick: this.reset, disabled: !rotations && !flippedHorizontally},
      ]} />
    );
  }
}

BoardTransformation.propTypes = {
  onChange: PropTypes.func,
  gameType: PropTypes.oneOf(Game.GAME_TYPES).isRequired,
};

export {
  BoardTransformation,
};

export default Board;
