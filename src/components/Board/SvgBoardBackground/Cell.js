import React, {Fragment, PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import * as constants from './constants';
import LevelIndicator from "./LevelIndicator";
import Piece from "./Piece";
import Game from "../../../game/game";

class BaseCellDefinitions extends PureComponent {
	render() {
	  const {name, paths} = this.props;
  	return (
    	<Fragment>
        <g id={`cell-${name}-border`} className={"cell-border"}>
          {paths.border}
        </g>
        <g id={`cell-${name}-0`} className={"cell-0"}>
          {paths.level0}
        </g>
        <g id={`cell-${name}-1`} className={"cell-1"}>
          {paths.level1}
        </g>
        <g id={`cell-${name}-2`} className={"cell-2"}>
          {paths.level2}
        </g>
        <g id={`cell-${name}-3`} className={"cell-3"}>
          {paths.level3}
        </g>
        <g id={`cell-${name}-4`} className={"cell-4"}>
          {paths.level4}
        </g>
      </Fragment>
    );
  }
}

BaseCellDefinitions.propTypes = {
  name: PropTypes.string.isRequired,
  paths: PropTypes.shape({
    border: PropTypes.node.isRequired,
    level0: PropTypes.node.isRequired,
    level1: PropTypes.node.isRequired,
    level2: PropTypes.node.isRequired,
    level3: PropTypes.node.isRequired,
    level4: PropTypes.node.isRequired,
  }).isRequired,
};

const defineCellDefinitions = (className, name, paths) => {
  class CellDefinitionsFor extends PureComponent {
    render() {
      return (
        <BaseCellDefinitions name={name} paths={paths} />
      );
    }
  }
  CellDefinitionsFor.displayName = className;

  return CellDefinitionsFor;
};

const OriginalCellDefinitions = defineCellDefinitions('OriginalCellDefinitions', 'original', {
  border: (
    <rect
      width={constants.cellSize}
      height={constants.cellSize}
    />
  ),
  level0: (
    <rect
      width={constants.cellSize - constants.borderWidth * 2}
      height={constants.cellSize - constants.borderWidth * 2}
      transform={`translate(${(constants.borderWidth)},${(constants.borderWidth)})`}
    />
  ),
  level1: (
    <g>
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
  ),
  level2: (
    <g>
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
  ),
  level3: (
    <g>
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
  ),
  level4: (
    <g>
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
  ),
});

class CellDefinitions extends PureComponent {
  static cellDefinitionsStyleMap = {
    'original': OriginalCellDefinitions,
  };

	render() {
  	return Object.values(this.constructor.cellDefinitionsStyleMap)
    	.map(CellDefinitionsStyle =>
        <CellDefinitionsStyle key={CellDefinitionsStyle.displayName || CellDefinitionsStyle.name} />);
  }
}

class Cell extends PureComponent {
  static Definitions = CellDefinitions;

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
          .filter(levelAnimate => levelAnimate.current)
          .map(levelAnimate => levelAnimate.current.beginElement());
      }, 0);
    }
  }

	render() {
  	const {
  	  x, y, available, undoable, level, player, onClick, animated, allowControl,
      theme: {cells = 'original', pieces = 'king', rotateOpponent = true, numbers},
    } = this.props;
  	const {previousLevel, currentLevel} = this.state;
  	const isPlayerAOpponent = !allowControl.includes(Game.PLAYER_A) && allowControl.includes(Game.PLAYER_B);
  	const isPlayerBOpponent = !isPlayerAOpponent;
  	return (
    	<g transform={`translate(${x * 100},${y * 100})`}>
        <use
          xlinkHref={`#cell-${cells}-border`}
          className={classNames({available, undoable})}
          onClick={onClick}
        />
        <g className={'cell-contents'}>
          {animated ? ([0, 1, 2, 3, 4].map(i => (
            <use key={i} xlinkHref={`#cell-${cells}-${i}`} opacity={i <= level ? 1 : 0}>
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
            <Fragment key={i}>
              <use xlinkHref={`#cell-${cells}-${i}`} />
              {player === Game.PLAYER_A ? <Piece style={pieces} colour={'white'} rotated={rotateOpponent && isPlayerAOpponent} /> : null}
              {player === Game.PLAYER_B ? <Piece style={pieces} colour={'black'} rotated={rotateOpponent && isPlayerBOpponent} /> : null}
            </Fragment>
          )))}
          {numbers ? <LevelIndicator level={level} type={numbers} /> : null}
        </g>
      </g>
    );
  }
}

Cell.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  available: PropTypes.bool.isRequired,
  undoable: PropTypes.bool.isRequired,
  level: PropTypes.number.isRequired,
  player: PropTypes.string,
  onClick: PropTypes.func,
  animated: PropTypes.bool.isRequired,
  allowControl: PropTypes.array.isRequired,
  theme: PropTypes.object.isRequired,
};

Cell.defaultProps = {
  animated: false,
};

export default Cell;
