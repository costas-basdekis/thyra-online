import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import _  from 'lodash';
import Game from "../../game/game";
import BoardBackground from "./BoardBackground";
import {Menu} from "semantic-ui-react";

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
      if (this.props.allowControl.length === 2) {
        return true;
      }
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

  // noinspection JSSuspiciousNameCombination
  static transformationMap = {
    '0,false': null,
    // makeTransformRowsAndColumns({transpose:  false, flipX: false, flipY: false}),
    '1,false': this.makeTransformRowsAndColumns({transpose: true, flipX: false, flipY: true}),
    '2,false': this.makeTransformRowsAndColumns({transpose: false, flipX: true, flipY: true}),
    '3,false': this.makeTransformRowsAndColumns({transpose: true, flipX: true, flipY: false}),
    '0,true': this.makeTransformRowsAndColumns({transpose: false, flipX: true, flipY: false}),
    '1,true': this.makeTransformRowsAndColumns({transpose: true, flipX: true, flipY: true}),
    '2,true': this.makeTransformRowsAndColumns({transpose: false, flipX: false, flipY: true}),
    '3,true': this.makeTransformRowsAndColumns({transpose: true, flipX: false, flipY: false}),
  };

  static makeTransformRowsAndColumns(config) {
    const transformRowsAndColumns = rowsAndColumns => {
      return this.transformRowsAndColumns(rowsAndColumns, config);
    };
    // We can tell if the board is flipped (horizontally or vertically)
    const flipped = config.transpose ^ config.flipX ^ config.flipY;
    const reverseConfig = config.transpose && !flipped ? {
      transpose: config.transpose,
      flipX: !config.flipX,
      flipY: !config.flipY,
    } : config;
    transformRowsAndColumns.reverseCoordinates = (rowsAndColumns, coordinates) => {
      return this.reverseTransformCoordinates(rowsAndColumns, coordinates, reverseConfig);
    };

    return transformRowsAndColumns;
  }

  static transformRowsAndColumns(rowsAndColumns, config) {
    let {newRowCount, newColumnCount} = this.getNewRowAndColumnCount(rowsAndColumns, config);
    const newXs = _.range(newColumnCount);
    const newYs = _.range(newRowCount);

    return newYs.map(newY => ({
      y: newY,
      cells: newXs.map(newX => {
        let {oldX, oldY} = this.getOldCoordinates( {newX, newY}, {newRowCount, newColumnCount}, config);
        return {
        ...rowsAndColumns[oldY].cells[oldX],
          x: newX, y: newY,
        };
      }),
    }));
  }

  static reverseTransformCoordinates(rowsAndColumns, coordinates, config) {
    let {newRowCount, newColumnCount} = this.getNewRowAndColumnCount(rowsAndColumns, config);
    const {x: newX, y: newY} = coordinates;
    const {oldX, oldY} = this.getOldCoordinates( {newX, newY}, {newRowCount, newColumnCount}, config);

    return {x: oldX, y: oldY};
  }

  static getNewRowAndColumnCount(rowsAndColumns, config) {
    const rowCount = rowsAndColumns.length;
    const columnCount = Math.max(...rowsAndColumns.map(row => row.cells.length)) || 0;
    const {transpose} = config;
    let newRowCount, newColumnCount;
    if (transpose) {
      [newColumnCount, newRowCount] = [rowCount, columnCount];
    } else {
      [newColumnCount, newRowCount] = [columnCount, rowCount];
    }
    return {newRowCount, newColumnCount};
  }

  static getOldCoordinates({newX, newY}, {newColumnCount, newRowCount}, config) {
    const {transpose, flipX, flipY} = config;
    let oldX, oldY;
    if (transpose) {
      [oldX, oldY] = [newY, newX];
    } else {
      [oldX, oldY] = [newX, newY];
    }
    if (flipX) {
      oldX = newColumnCount - 1 - oldX;
    }
    if (flipY) {
      oldY = newRowCount - 1 - oldY;
    }
    return {oldX, oldY};
  }

   updateOrientation = method => {
     this.setState(method, () => {
       if (this.props.onChange) {
         const {rotations, flippedHorizontally} = this.state;
         const transformation = this.constructor.transformationMap[`${rotations},${flippedHorizontally}`];
         this.props.onChange({rotations, flippedHorizontally, transformation});
       }
     });
   };

  rotateCounterClockwise = () => {
    this.updateOrientation(state => ({
      rotations: (state.rotations + 3) % 4,
    }));
  };

  rotateClockwise = () => {
    this.updateOrientation(state => ({
      rotations: (state.rotations + 1) % 4,
    }));
  };

  flipHorizontally = () => {
    this.updateOrientation(state => ({
      flippedHorizontally: !state.flippedHorizontally,
    }));
  };

  flipVertically = () => {
    this.updateOrientation(state => ({
      rotations: (state.rotations + 2) % 4,
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
};

export {
  BoardTransformation,
};

export default Board;
