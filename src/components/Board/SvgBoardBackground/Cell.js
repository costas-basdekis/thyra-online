import React, {PureComponent} from 'react';
import classNames from 'classnames';
import * as constants from './constants';
import LevelIndicator from "./LevelIndicator";
import Piece from "./Piece";
import Game from "../../../game/game";

class CellDefinitions extends PureComponent {
	render() {
  	return (
    	<React.Fragment>
        <rect
          id={`cell-border`}
          width={constants.cellSize}
          height={constants.cellSize}
        />
        <rect
          id={`cell-0`}
          width={constants.cellSize - constants.borderWidth * 2}
          height={constants.cellSize - constants.borderWidth * 2}
          transform={`translate(${(constants.borderWidth)},${(constants.borderWidth)})`}
        />
        <g id={`cell-1`}>
          <use xlinkHref={`#cell-0`} />
          <rect
            className={'border'}
            width={constants.cellSize - constants.borderWidth * 2}
            height={constants.cellSize - constants.borderWidth * 2}
            transform={`translate(${(constants.borderWidth)},${(constants.borderWidth)})`}
          />
          <rect
            className={'fill'}
            width={constants.cellSize - constants.borderWidth * 4}
            height={constants.cellSize - constants.borderWidth * 4}
            transform={`translate(${constants.borderWidth * 2},${constants.borderWidth * 2})`}
          />
        </g>
        <g id={`cell-2`}>
          <use xlinkHref={`#cell-1`} />
          <rect
            className={'border'}
            width={constants.cellSize - constants.borderWidth * 4}
            height={constants.cellSize - constants.borderWidth * 4}
            transform={`translate(${constants.borderWidth * 2},${constants.borderWidth * 2})`}
          />
          <rect
            className={'fill'}
            width={constants.cellSize - constants.borderWidth * 6}
            height={constants.cellSize - constants.borderWidth * 6}
            transform={`translate(${constants.borderWidth * 3},${constants.borderWidth * 3})`}
          />
        </g>
        <g id={`cell-3`}>
          <use xlinkHref={`#cell-2`} />
          <rect
            className={'border'}
            width={constants.cellSize - constants.borderWidth * 6}
            height={constants.cellSize - constants.borderWidth * 6}
            transform={`translate(${constants.borderWidth * 3},${constants.borderWidth * 3})`}
          />
          <rect
            className={'fill'}
            width={constants.cellSize - constants.borderWidth * 8}
            height={constants.cellSize - constants.borderWidth * 8}
            transform={`translate(${constants.borderWidth * 4},${constants.borderWidth * 4})`}
          />
        </g>
        <g id={`cell-4`}>
          <use xlinkHref={`#cell-3`} />
          <rect
            className={'border'}
            width={constants.cellSize - constants.borderWidth * 8}
            height={constants.cellSize - constants.borderWidth * 8}
            transform={`translate(${constants.borderWidth * 4},${constants.borderWidth * 4})`}
          />
          <rect
            className={'fill'}
            width={constants.cellSize - constants.borderWidth * 10}
            height={constants.cellSize - constants.borderWidth * 10}
            transform={`translate(${constants.borderWidth * 5},${constants.borderWidth * 5})`}
          />
        </g>
      </React.Fragment>
    );
  }
}

class Cell extends PureComponent {
  static Definitions = CellDefinitions;

	static levelMap = {
    0: '#cell-0',
    1: '#cell-1',
    2: '#cell-2',
    3: '#cell-3',
    4: '#cell-4',
  };

	render() {
  	const {x, y, available, undoable, level, player, theme: {pieces = 'king', rotateOpponent, numbers}, onClick} = this.props;
  	return (
    	<g transform={`translate(${x * 100},${y * 100})`}>
        <use
          xlinkHref={`#cell-border`}
          className={classNames({available, undoable})}
          onClick={onClick}
        />
        <g className={'cell-contents'}>
          <use xlinkHref={`${this.constructor.levelMap[level]}`} />
          {player === Game.PLAYER_A ? <Piece style={pieces} colour={'white'} /> : null}
          {player === Game.PLAYER_B ? <Piece style={pieces} colour={'black'} rotated={rotateOpponent} /> : null}
          {numbers ? <LevelIndicator level={level} type={numbers} /> : null}
        </g>
      </g>
    );
  }
}

export default Cell;
