import React, {Fragment, PureComponent} from "react";
import PropTypes from 'prop-types';
import * as constants from "./constants";

class ArrowDefinition extends PureComponent {
  static dimensions = {x: 261.5, y: 532};
  static offset = {x: 100, y: 125};

  render() {
    const {dimensions, offset} = this.constructor;

    return (
      <Fragment>
        <path
          id={"arrow-base"}
          d={"M168 345.941V44c0-6.627-5.373-12-12-12h-56c-6.627 0-12 5.373-12 12v301.941H41.941c-21.382 0-32.09 25.851-16.971 40.971l86.059 86.059c9.373 9.373 24.569 9.373 33.941 0l86.059-86.059c15.119-15.119 4.411-40.971-16.971-40.971H168z"}
          transform={[
            `translate(${constants.cellSize / 2},${constants.cellSize / 2})`,
            `scale(${(constants.pieceScaling)},${(constants.pieceScaling)})`,
            `translate(${-dimensions.x / 2 + offset.x},${-dimensions.y / 2 + offset.y})`,
          ].join(',')}
        />
        <g id={"arrow-white"}>
          <use xlinkHref={"#arrow-base"} strokeWidth={constants.pieceStrokeWidth} stroke={"#111"} />
          <use xlinkHref={"#arrow-base"} fill={'white'} />
        </g>
        <g id={"arrow-black"}>
          <use xlinkHref={"#arrow-base"} strokeWidth={constants.pieceStrokeWidth} stroke={"#bbb"} />
          <use xlinkHref={"#arrow-base"} fill={'black'} />
        </g>
      </Fragment>
    );
  }
}

class Arrow extends PureComponent {
  static Definition = ArrowDefinition;

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
    const {from, to, colour} = this.props;
    const diff = {x: to.x - from.x, y: to.y - from.y};
    const rotation = this.constructor.rotationMap[`${diff.x},${diff.y}`];

    return (
      <use
        xlinkHref={`#arrow-${colour}`}
        transform={[
          `translate(${constants.cellSize * from.x},${constants.cellSize * from.y})`,
          `rotate(${rotation},${constants.cellSize / 2},${constants.cellSize / 2})`,
          `translate(0,${constants.cellSize / 2})`,
        ].join(',')}
      />
    );
  }
}

Arrow.propTypes = {
  from: PropTypes.object.isRequired,
  to: PropTypes.object.isRequired,
  colour: PropTypes.oneOf(['white', 'black']).isRequired,
};

export default Arrow;
