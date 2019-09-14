import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import * as constants from './constants';

class LevelIndicatorVerySubtle extends PureComponent {
	render() {
    const {level} = this.props;
    if (!level) {
      return null;
    }
  	return (
    	<g transform={`translate(${constants.cellSize / 10},${constants.cellSize / 10})`}>
        <text
          dominantBaseline={"central"}
          textAnchor={"middle"}
          style={{fontSize: `${constants.cellSize * 0.15}px`}}
        >{level}</text>
      </g>
    );
  }
}

LevelIndicatorVerySubtle.propTypes = {
  level: PropTypes.oneOf([0, 1, 2, 3, 4]).isRequired,
};

class LevelIndicatorSubtle extends PureComponent {
	render() {
  	const {level} = this.props;
    if (!level) {
      return null;
    }
  	return (
    	<g transform={`translate(22,22)`}>
        <circle r={constants.cellSize * 0.15} fill={'#bbb'} stroke={'#111'} strokeWidth={2} />
        <text
          dominantBaseline={"central"}
          textAnchor={"middle"}
          style={{fontSize: `${constants.cellSize * 0.25}px`}}
        >{level}</text>
      </g>
    );
  }
}

LevelIndicatorSubtle.propTypes = {
  level: PropTypes.oneOf([0, 1, 2, 3, 4]).isRequired,
};

class LevelIndicatorObvious extends PureComponent {
	render() {
  	const {level} = this.props;
    if (!level) {
      return null;
    }
  	return (
    	<g transform={`translate(${constants.cellSize / 2},${constants.cellSize / 2})`}>
        <text
          dominantBaseline={"central"}
          textAnchor={"middle"}
          stroke={'#eee'}
          strokeWidth={constants.cellSize * 0.06}
          paintOrder={'stroke'}
          style={{fontSize: `${constants.cellSize * 0.45}px`}}
        >{level}</text>
      </g>
    );
  }
}

LevelIndicatorObvious.propTypes = {
  level: PropTypes.oneOf([0, 1, 2, 3, 4]).isRequired,
};

class LevelIndicator extends PureComponent {
	static indicatorMap = {
    'very-subtle': LevelIndicatorVerySubtle,
    'subtle': LevelIndicatorSubtle,
    'obvious': LevelIndicatorObvious,
  };

	render() {
  	const {level, type} = this.props;
    const Indicator = this.constructor.indicatorMap[type];
    if (!Indicator) {
    	return null;
    }
  	return (
    	<Indicator level={level} />
    );
  }
}

LevelIndicator.propTypes = {
  type: PropTypes.oneOf(['very-subtle', 'subtle', 'obvious']).isRequired,
  level: PropTypes.oneOf([0, 1, 2, 3, 4]).isRequired,
};


export default LevelIndicator;
