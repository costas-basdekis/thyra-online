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

	state = {
	  previousLevel: this.props.level,
	  currentLevel: this.props.level,
  };

	levelsAnimate = [0, 1, 2, 3, 4].map(i => React.createRef());

	static getDerivedStateFromProps(props, state) {
    if (props.animated && props.level !== state.level) {
      return {previousLevel: state.currentLevel, currentLevel: props.level};
    }

    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.animated && this.state.currentLevel !== this.state.previousLevel) {
      setTimeout(() => {
        this.levelsAnimate
          .filter((levelAnimate, i) => (
            (this.state.previousLevel <= i && i <= this.state.currentLevel)
            || (this.state.currentLevel <= i && i <= this.state.previousLevel)
          ))
          .map(levelAnimate => levelAnimate.current.beginElement());
      }, 0);
    }
  }

	render() {
  	const {x, y, available, undoable, level, player, theme: {pieces = 'king', rotateOpponent = true, numbers}, onClick, animated = false} = this.props;
  	const {previousLevel, currentLevel} = this.state;
  	return (
    	<g transform={`translate(${x * 100},${y * 100})`}>
        <use
          xlinkHref={`#cell-border`}
          className={classNames({available, undoable})}
          onClick={onClick}
        />
        <g className={'cell-contents'}>
          {animated ? ([0, 1, 2, 3, 4].map(i => (
            <use key={i} xlinkHref={`${this.constructor.levelMap[i]}`} opacity={i <= level ? 1 : 0}>
              <animate
                ref={this.levelsAnimate[i]}
                attributeName={'opacity'}
                attributeType={'XML'}
                type={'translate'}
                from={previousLevel < i ? 0 : 1}
                to={currentLevel < i ? 0 : 1}
                dur={'0.2s'}
                repeatCount={1}
                fill={'freeze'}
              />
            </use>
          ))) : ([0, 1, 2, 3, 4].filter(i => i <= level).map(i => (
            <use key={i} xlinkHref={`${this.constructor.levelMap[i]}`} />
          )))}
          {player === Game.PLAYER_A ? <Piece style={pieces} colour={'white'} /> : null}
          {player === Game.PLAYER_B ? <Piece style={pieces} colour={'black'} rotated={rotateOpponent} /> : null}
          {numbers ? <LevelIndicator level={level} type={numbers} /> : null}
        </g>
      </g>
    );
  }
}

export default Cell;
