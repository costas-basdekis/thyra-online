import React, {Fragment, PureComponent} from "react";
import PropTypes from 'prop-types';
import * as constants from "./constants";

class ArrowDefinition extends PureComponent {
  static arrowDimensions = {x: 215.81, y: 439.04};
  static arrowOffset = {x: -20, y: -15};
  static arrowScaling = 0.75;
  static hammerDimensions = {x: 564.48, y: 501.76};
  static hammerOffset = {x: 50, y: -50};
  static hammerScaling = 0.75 * 0.75;

  render() {
    const {arrowDimensions, arrowOffset, arrowScaling, hammerDimensions, hammerOffset, hammerScaling} = this.constructor;

    return (
      <Fragment>
        <path
          id={"arrow-move-base"}
          d={"M168 345.941V44c0-6.627-5.373-12-12-12h-56c-6.627 0-12 5.373-12 12v301.941H41.941c-21.382 0-32.09 25.851-16.971 40.971l86.059 86.059c9.373 9.373 24.569 9.373 33.941 0l86.059-86.059c15.119-15.119 4.411-40.971-16.971-40.971H168z"}
          transform={[
            `translate(${constants.cellSize / 2},${constants.cellSize / 2})`,
            `scale(${(constants.pieceScaling * arrowScaling)},${(constants.pieceScaling * arrowScaling)})`,
            `translate(${-arrowDimensions.x / 2 + arrowOffset.x},${-arrowDimensions.y / 2 + arrowOffset.y})`,
          ].join(',')}
        />
        <path
          id={"arrow-build-base"}
          d={"M571.31 193.94l-22.63-22.63c-6.25-6.25-16.38-6.25-22.63 0l-11.31 11.31-28.9-28.9c5.63-21.31.36-44.9-16.35-61.61l-45.25-45.25c-62.48-62.48-163.79-62.48-226.28 0l90.51 45.25v18.75c0 16.97 6.74 33.25 18.75 45.25l49.14 49.14c16.71 16.71 40.3 21.98 61.61 16.35l28.9 28.9-11.31 11.31c-6.25 6.25-6.25 16.38 0 22.63l22.63 22.63c6.25 6.25 16.38 6.25 22.63 0l90.51-90.51c6.23-6.24 6.23-16.37-.02-22.62zm-286.72-15.2c-3.7-3.7-6.84-7.79-9.85-11.95L19.64 404.96c-25.57 23.88-26.26 64.19-1.53 88.93s65.05 24.05 88.93-1.53l238.13-255.07c-3.96-2.91-7.9-5.87-11.44-9.41l-49.14-49.14z"}
          transform={[
            `translate(${constants.cellSize / 2},${constants.cellSize / 2})`,
            `scale(${(constants.pieceScaling * hammerScaling)},${(constants.pieceScaling * hammerScaling)})`,
            `rotate(135)`,
            `translate(${-hammerDimensions.x / 2 + hammerOffset.x},${-hammerDimensions.y / 2 + hammerOffset.y})`,
          ].join(',')}
        />
        <g id={"arrow-move-white"}>
          <use xlinkHref={"#arrow-move-base"} strokeWidth={constants.pieceStrokeWidth} stroke={"#111"} />
          <use xlinkHref={"#arrow-move-base"} fill={'white'} />
        </g>
        <g id={"arrow-move-black"}>
          <use xlinkHref={"#arrow-move-base"} strokeWidth={constants.pieceStrokeWidth} stroke={"#bbb"} />
          <use xlinkHref={"#arrow-move-base"} fill={'black'} />
        </g>
        <g id={"arrow-build-white"}>
          <use xlinkHref={"#arrow-build-base"} strokeWidth={constants.pieceStrokeWidth} stroke={"#111"} />
          <use xlinkHref={"#arrow-build-base"} fill={'white'} />
        </g>
        <g id={"arrow-build-black"}>
          <use xlinkHref={"#arrow-build-base"} strokeWidth={constants.pieceStrokeWidth} stroke={"#bbb"} />
          <use xlinkHref={"#arrow-build-base"} fill={'black'} />
        </g>
      </Fragment>
    );
  }
}

class Arrow extends PureComponent {
  static Definition = ArrowDefinition;
  static offsetX = constants.cellSize * 0.10;
  static smallScaling = 0.75;

  static rotationMap = {
    '0,1': 0,
    '-1,1': 45,
    '-1,0': 90,
    '-1,-1': 135,
    '0,-1': 180,
    '1,-1': -135,
    '1,0': -90,
    '1,1': -45,
  };

  render() {
    const {offsetX, smallScaling} = this.constructor;
    const {from, to, colour, type, small} = this.props;
    const diff = {x: to.x - from.x, y: to.y - from.y};
    const rotation = this.constructor.rotationMap[`${diff.x},${diff.y}`];
    const offsetYFactor = Math.sqrt(Math.abs(diff.x) + Math.abs(diff.y));

    return (
      <use
        xlinkHref={`#arrow-${type}-${colour}`}
        transform={[
          `translate(${constants.cellSize * from.x},${constants.cellSize * from.y})`,
          `rotate(${rotation},${constants.cellSize / 2},${constants.cellSize / 2})`,
          `translate(${offsetX},${constants.cellSize / 2 * offsetYFactor})`,
          ...(small ? [
            `translate(${constants.cellSize / 2},${constants.cellSize / 2})`,
            `scale(${smallScaling})`,
            `translate(${-constants.cellSize / 2},${-constants.cellSize / 2})`,
          ] : []),
        ].filter(transform => transform).join(',')}
      />
    );
  }
}

Arrow.propTypes = {
  from: PropTypes.object.isRequired,
  to: PropTypes.object.isRequired,
  colour: PropTypes.oneOf(['white', 'black']).isRequired,
  type: PropTypes.oneOf(['move', 'build']).isRequired,
  small: PropTypes.bool.isRequired,
};

Arrow.defaultProps = {
  small: false,
};

export default Arrow;
