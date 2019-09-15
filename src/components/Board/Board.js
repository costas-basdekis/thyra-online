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
    // rowsAndColumns => this.transformCoordinates(rowsAndColumns, (rowCount, columnCount) => ({
    //   newXs: _.range(columnCount),
    //   newYs: _.range(rowCount),
    //   getOldCoordinates: ({newX, newY}) => ({
    //     oldX: newX,
    //     oldY: newY,
    //   }),
    // })),
    '1,false': rowsAndColumns => this.transformCoordinates(rowsAndColumns, (rowCount, columnCount) => ({
      newXs: _.range(rowCount),
      newYs: _.range(columnCount),
      getOldCoordinates: ({newX, newY}) => ({
        oldX: newY,
        oldY: columnCount - 1 - newX,
      }),
    })),
    '2,false': rowsAndColumns => this.transformCoordinates(rowsAndColumns, (rowCount, columnCount) => ({
      newXs: _.range(columnCount),
      newYs: _.range(rowCount),
      getOldCoordinates: ({newX, newY}) => ({
        oldX: columnCount - 1 - newX,
        oldY: rowCount - 1 - newY,
      }),
    })),
    '3,false': rowsAndColumns => this.transformCoordinates(rowsAndColumns, (rowCount, columnCount) => ({
      newXs: _.range(rowCount),
      newYs: _.range(columnCount),
      getOldCoordinates: ({newX, newY}) => ({
        oldX: rowCount -1 - newY,
        oldY: newX,
      }),
    })),
    '0,true': rowsAndColumns => this.transformCoordinates(rowsAndColumns, (rowCount, columnCount) => ({
      newXs: _.range(columnCount),
      newYs: _.range(rowCount),
      getOldCoordinates: ({newX, newY}) => ({
        oldX: columnCount - 1 - newX,
        oldY: newY,
      }),
    })),
    '1,true': rowsAndColumns => this.transformCoordinates(rowsAndColumns, (rowCount, columnCount) => ({
      newXs: _.range(rowCount),
      newYs: _.range(columnCount),
      getOldCoordinates: ({newX, newY}) => ({
        oldX: rowCount - 1 - newY,
        oldY: columnCount - 1 - newX,
      }),
    })),
    '2,true': rowsAndColumns => this.transformCoordinates(rowsAndColumns, (rowCount, columnCount) => ({
      newXs: _.range(columnCount),
      newYs: _.range(rowCount),
      getOldCoordinates: ({newX, newY}) => ({
        oldX: newX,
        oldY: rowCount - 1 - newY,
      }),
    })),
    '3,true': rowsAndColumns => this.transformCoordinates(rowsAndColumns, (rowCount, columnCount) => ({
      newXs: _.range(rowCount),
      newYs: _.range(columnCount),
      getOldCoordinates: ({newX, newY}) => ({
        oldX: newY,
        oldY: newX,
      }),
    })),
  };

  static transformCoordinates(rowsAndColumns, getNewXsAndYs) {
    const rowCount = rowsAndColumns.length;
    const columnCount = Math.max(...rowsAndColumns.map(row => row.cells.length)) || 0;
    const {newXs, newYs, getOldCoordinates} = getNewXsAndYs(rowCount, columnCount);
    return newYs.map(newY => ({
      y: newY,
      cells: newXs.map(newX => {
        const {oldX, oldY} = getOldCoordinates({newX, newY});
        return {
        ...rowsAndColumns[oldY].cells[oldX],
          x: newX, y: newY,
        };
      }),
    }));
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
