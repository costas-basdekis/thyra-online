import React, {Fragment, PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import * as constants from './constants';
import LevelIndicator from "./LevelIndicator";
import Piece from "./Piece";
import Game from "../../../game/game";

class BaseCellDefinitions extends PureComponent {
  static defaultBorder = (
    <g>
      <rect
        fill={"transparent"}
        width={constants.cellSize}
        height={constants.cellSize}
      />
      <path className={"border"} d={`M0,0h${constants.cellSize}v${constants.cellSize}h-${constants.cellSize}z M${constants.borderWidth},${constants.borderWidth}v${constants.cellSize - constants.borderWidth * 2}h${constants.cellSize - constants.borderWidth * 2}v-${constants.cellSize - constants.borderWidth * 2}z`} />
    </g>
  );
  static defaultBorderHex = (
    <g>
      <rect
        fill={"transparent"}
        width={constants.cellSize}
        height={constants.cellSize}
      />
      <path className={"border"} d={`
        M ${(() => {
          const center = {x: 0, y: 0};
          return [0, 1, 2, 3, 4, 5]
            .map(index => index / 6 * Math.PI * 2)
            .map(angle => {
              const radius = constants.cellSize * 1.5 / 2;
              const x = center.x + Math.cos(angle) * radius;
              const y = center.y + Math.sin(angle) * radius;
              return `${x},${y}`;
            })
            .join('L');
        })()} z 
        M ${[0, 1, 2, 3, 4, 5].reverse().map(index => index / 6 * Math.PI * 2).map(angle => `${Math.cos(angle) * (constants.cellSize - constants.borderWidth * 2) * 1.5 / 2},${Math.sin(angle) * (constants.cellSize - constants.borderWidth * 2) * 1.5 / 2}`).concat('L')} z 
      `} />
    </g>
  );

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
  border: BaseCellDefinitions.defaultBorder,
  level0: (
    <rect
      className={'border fill'}
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

const HalloweenCellDefinitions = defineCellDefinitions('HalloweenCellDefinitions', 'halloween', {
  border: BaseCellDefinitions.defaultBorder,
  level0: (
    <path className={"fill"} transform={"scale(0.21)"} d={"m475.484375 292.628906h18.285156c8.34375.027344 15.640625-5.609375 17.71875-13.691406 2.074219-8.082031-1.605469-16.539062-8.933593-20.53125.082031-.433594.132812-.875.148437-1.316406.09375-.339844.164063-.683594.210937-1.035156v-171.820313c6.503907-11.746094 9.664063-25.046875 9.140626-38.464844 0-27.902343-10.832032-45.7148435-18.285157-45.7148435-7.449219 0-18.285156 17.8125005-18.285156 45.7148435-.523437 13.417969 2.636719 26.71875 9.144531 38.464844v109.511719c-11.957031-32.042969-32.140625-60.375-58.515625-82.148438-4.039062-3.027344-9.769531-2.210937-12.800781 1.828125-3.027344 4.042969-2.210938 9.773438 1.828125 12.800781 49.691406 37.265626 67 117.863282 69.332031 129.828126h-27.273437c0-2.53125-.492188-62.117188-43.492188-72.867188-3.179687-.820312-6.550781.125-8.839843 2.476562-2.289063 2.355469-3.140626 5.753907-2.230469 8.90625.90625 3.15625 3.4375 5.578126 6.625 6.355469 29.121093 7.277344 29.652343 54.527344 29.652343 55.128907h-173.488281c2.828125-12.214844 22.457031-88.640626 77.449219-120.0625 4.253906-2.566407 5.679688-8.054688 3.21875-12.363282-2.464844-4.3125-7.917969-5.871094-12.285156-3.507812-33.832032 19.34375-55.425782 52.480468-68.574219 81.003906v-116.890625c6.492187-11.75 9.640625-25.050781 9.105469-38.464844 0-27.902343-10.832032-45.7148435-18.285156-45.7148435-7.449219 0-18.285157 17.8125005-18.285157 45.7148435-.523437 13.417969 2.640625 26.71875 9.144531 38.464844v120.339844c-15.261718-33.203125-38.578124-62.0625-67.832031-83.960938-4.109375-2.933593-9.820312-1.980469-12.753906 2.128907-2.933594 4.113281-1.980469 9.824218 2.128906 12.757812 55.167969 39.402344 75.054688 108.496094 78.171875 120.554688h-173.429687c0-.601563.53125-47.851563 29.648437-55.128907 4.867188-1.257812 7.804688-6.203125 6.585938-11.074219-1.222656-4.875-6.144532-7.851562-11.027344-6.664062-43 10.75-43.492188 70.335938-43.492188 72.867188h-27.429687c.714844-7.988282 9.4375-91.675782 60.34375-129.828126 2.613281-1.960937 3.980469-5.164062 3.589844-8.40625-.390625-3.242187-2.480469-6.03125-5.484375-7.316406-3.003906-1.28125-6.464844-.863281-9.078125 1.09375-22.324219 17.949219-39.382813 41.597656-49.371094 68.445313v-95.808594c6.503906-11.746094 9.667969-25.046875 9.144531-38.464844 0-27.902343-10.835937-45.7148435-18.289062-45.7148435-7.449219 0-18.2851565 17.8125005-18.2851565 45.7148435-.5234375 13.417969 2.6406245 26.71875 9.1445315 38.464844v171.820313c.054687.488281.152343.96875.292969 1.4375 0 .292968 0 .601562.109374.914062-7.320312 3.988281-11 12.433594-8.9375 20.507812 2.0625 8.078126 9.34375 13.722657 17.675782 13.714844h54.859375c20.199219 0 36.570312 16.371094 36.570312 36.570313s-16.371093 36.570312-36.570312 36.570312h-36.570313c-10.101562 0-18.289062 8.1875-18.289062 18.285157 0 10.101562 8.1875 18.285156 18.289062 18.285156h128c20.195313 0 36.570313 16.375 36.570313 36.574218 0 20.195313-16.375 36.570313-36.570313 36.570313h-118.859375c-10.097656 0-18.285156 8.1875-18.285156 18.285156 0 10.101563 8.1875 18.285157 18.285156 18.285157h448c10.101563 0 18.285157-8.183594 18.285157-18.285157 0-10.097656-8.183594-18.285156-18.285157-18.285156h-36.570312c-20.199219 0-36.570313-16.375-36.570313-36.570313 0-20.199218 16.371094-36.574218 36.570313-36.574218h36.570312c10.101563 0 18.285157-8.183594 18.285157-18.285156 0-10.097657-8.183594-18.285157-18.285157-18.285157h-18.285156c-20.199219 0-36.570313-16.371093-36.570313-36.570312s16.371094-36.570313 36.570313-36.570313zm-338.285156 0c0-5.050781 4.09375-9.144531 9.140625-9.144531h64c5.050781 0 9.144531 4.09375 9.144531 9.144531 0 5.046875-4.09375 9.140625-9.144531 9.140625h-64c-5.046875 0-9.140625-4.09375-9.140625-9.140625zm27.429687 54.855469c-5.050781 0-9.144531-4.09375-9.144531-9.144531 0-5.046875 4.09375-9.140625 9.144531-9.140625h228.570313c5.050781 0 9.140625 4.09375 9.140625 9.140625 0 5.050781-4.089844 9.144531-9.140625 9.144531zm27.425782 36.570313c0-5.046876 4.09375-9.140626 9.144531-9.140626h54.855469c5.050781 0 9.144531 4.09375 9.144531 9.140626 0 5.050781-4.09375 9.144531-9.144531 9.144531h-54.855469c-5.050781 0-9.144531-4.09375-9.144531-9.144531zm182.859374 36.574218c5.046876 0 9.140626 4.09375 9.140626 9.140625 0 5.050781-4.09375 9.144531-9.140626 9.144531h-118.859374c-5.046876 0-9.140626-4.09375-9.140626-9.144531 0-5.046875 4.09375-9.140625 9.140626-9.140625zm-64 64h-91.429687c-5.050781 0-9.144531-4.09375-9.144531-9.144531s4.09375-9.144531 9.144531-9.144531h91.429687c5.046876 0 9.140626 4.09375 9.140626 9.144531s-4.09375 9.144531-9.140626 9.144531zm91.425782 0h-54.855469c-5.050781 0-9.144531-4.09375-9.144531-9.144531s4.09375-9.144531 9.144531-9.144531h54.855469c5.050781 0 9.144531 4.09375 9.144531 9.144531s-4.09375 9.144531-9.144531 9.144531zm0-91.429687h-109.710938c-5.050781 0-9.144531-4.09375-9.144531-9.144531 0-5.046876 4.09375-9.140626 9.144531-9.140626h109.710938c5.050781 0 9.144531 4.09375 9.144531 9.140626 0 5.050781-4.09375 9.144531-9.144531 9.144531zm0-91.429688h-82.285156c-5.046876 0-9.140626-4.09375-9.140626-9.140625 0-5.050781 4.09375-9.144531 9.140626-9.144531h82.285156c5.050781 0 9.144531 4.09375 9.144531 9.144531 0 5.046875-4.09375 9.140625-9.144531 9.140625zm0 0"}/>
  ),
  level1: (
    <g className={"fill"} transform={"translate(-1,6),scale(0.33,0.33)"}>
      <path d={"m221.30057,128.34535c12.80287,-11.57301 -2.64389,-25.9934 -18.36703,-22.82862l0,25.57096c6.54166,1.048 13.26984,1.86747 18.36703,-2.74234z"}/>
      <path d={"m93.457,105.28936l0,25.57096c0.99929,0.01039 1.99722,0.02424 2.99378,0.04617c28.4062,0.00115 25.51589,-30.25349 -2.99378,-25.61713z"}/>
      <path d={"m293.79936,235.06243l-11.83898,0l0,-128.90859c0,-24.37754 -9.70018,-46.83105 -25.9992,-64.75208l-16.21053,4.32127l6.92695,16.52446l0.57452,1.36309l-1.0905,0.93835l-16.29357,14.03835c-0.7447,0.64288 -1.96318,0.64981 -2.72286,0.01962c-0.72428,-0.60826 -0.7624,-1.59162 -0.09666,-2.23681l14.16839,-13.73365l-8.82342,-17.69134l-1.16402,-2.33261l3.00195,-1.29038l15.20988,-6.53499c-22.90876,-21.37089 -55.95607,-34.78713 -92.6983,-34.78713c-33.69535,0 -64.27712,11.28562 -86.78289,29.63716l17.7258,7.61877l1.78892,0.76869l0.22327,1.34347l5.65265,33.75875c0.15112,0.89218 -0.58269,1.71743 -1.63508,1.84554c-1.00473,0.12004 -1.93867,-0.44667 -2.15106,-1.27537l-7.9698,-31.65929l-21.21922,-5.65551c-19.20839,18.65855 -30.84997,43.06264 -30.84997,69.77278l0,128.90859l-11.84034,0c-7.51917,0 -13.61428,5.16729 -13.61428,11.54185l0,11.33871c0,6.37225 6.09511,11.54185 13.61428,11.54185l274.11544,0c7.51917,0 13.61428,-5.16959 13.61428,-11.54185l0,-11.33871c-0.00136,-6.37456 -6.09648,-11.543 -13.61565,-11.543zm-101.81034,-133.28526c3.95223,-0.16851 8.04196,-0.34279 12.17934,-0.34279c9.85402,0 21.99796,0.86795 28.49333,7.63147c0.00272,0.00231 0.00545,0.00462 0.00817,0.00693l0.00545,0.00923c0.00272,0.00346 0.00817,0.00693 0.01089,0.01039c0.00545,0.00462 0.01089,0.00923 0.01361,0.015c0.00272,0.00346 0.00545,0.00693 0.01089,0.01154c4.77589,5.01262 6.0461,9.59705 3.77524,13.62631c-3.80519,6.75891 -16.68022,10.40728 -26.8569,10.40728c-2.31851,0 -6.42866,-0.53554 -6.42866,-0.53554s-3.21569,22.27115 1.58198,26.64436c1.07961,0.98106 2.3825,1.68973 3.89641,2.12255l-23.31446,0c7.6662,-2.70079 11.13512,-16.16551 11.13512,-29.52174c0,-13.55013 -3.47164,-27.20991 -11.14601,-29.83799c2.0966,-0.0554 4.32254,-0.15004 6.6356,-0.247zm-42.01232,0.28855l24.65955,0c-2.65615,0.93489 -5.59002,3.41408 -7.84183,9.17692c-2.05576,5.26077 -2.19598,12.3844 -2.19598,20.06319c0,13.1831 2.44921,27.26762 9.9289,30.0769l-24.665,0c2.64526,-0.93374 5.57641,-3.41177 7.8146,-9.17692c2.0435,-5.25616 2.21232,-12.38094 2.21232,-20.05512c0.00272,-13.18772 -2.46419,-27.27454 -9.91256,-30.08498zm-74.04537,-0.03116c2.59216,-0.04617 5.27281,-0.14196 8.06782,-0.24122c4.0557,-0.14312 8.24345,-0.29201 12.36994,-0.29201c8.22711,0 14.43114,0.61749 19.52288,1.9448c7.82821,2.0406 12.16028,6.56385 11.88527,12.4121c-0.33763,7.19634 -7.44021,13.9137 -16.51821,15.62535c-0.42068,0.07848 -0.76648,0.3301 -0.9176,0.67058c-0.15112,0.33933 -0.0953,0.72252 0.15656,1.01799l14.97027,17.63479c4.45187,5.26539 9.00585,9.12383 16.06622,10.57464l-15.28476,0l-24.16808,-28.29946c-0.24778,-0.29201 -0.65212,-0.45706 -1.08234,-0.44667c-1.22801,0.0404 -2.68338,0.08195 -4.16733,0.08195c-1.18853,0 -2.26814,-0.02539 -3.29738,-0.08079c-0.3458,-0.01731 -0.69705,0.08656 -0.95436,0.29085c-0.25595,0.20544 -0.40162,0.49053 -0.40162,0.78946c0,1.49813 -0.16201,3.37945 -0.32674,5.37158c-0.59767,7.04399 -1.34237,15.80656 3.45394,20.174c1.07689,0.9799 2.37705,1.68742 3.8896,2.11908l-23.29132,0c7.69752,-2.70079 11.17869,-16.16667 11.17869,-29.52405c0,-13.5282 -3.473,-27.16489 -11.15146,-29.82298z"}/>
    </g>
  ),
  level2: (
    <path className={"fill"} transform={"translate(9,7),scale(0.3,0.3)"} d={"M245.928,84.493c-13.393-16.435-27.768-24.637-43.139-24.637c-10.873,0-21.072,4.354-30.619,13.117   c-6.626-5.045-13.782-8.627-21.478-10.745c-1.591-20.661-10.733-35.643-27.436-44.942l-17.491,12.351   c11.39,7.412,18.021,17.745,19.876,31c-11.398,1.33-22.001,5.568-31.811,12.713c-9.802-9.005-20.275-13.495-31.403-13.495   c-15.644,0-29.696,8.202-42.15,24.637C6.755,101.449,0,121.479,0,144.535c0,5.828,0.532,11.684,1.583,17.498   c3.978,23.857,15.116,44.676,33.402,62.42c16.434,16.184,31.681,24.263,45.731,24.263c0.332,0,0.674-0.012,1.016-0.035   c16.083-4.937,33.156-7.599,50.857-7.599c14.784,0,29.134,1.858,42.833,5.346l-0.074-0.098l0.323,0.16   c2.618,0.67,5.21,1.404,7.78,2.193c0.348,0.021,0.696,0.033,1.043,0.033c14.053,0,29.154-8.079,45.328-24.263v-0.001   c17.755-17.744,29.156-38.562,34.189-62.42c1.34-6.616,1.99-13.117,1.99-19.48C266.002,120.274,259.306,100.924,245.928,84.493z"}/>
  ),
  level3: (
    <path className={"fill"} transform={"translate(18,10),scale(0.13,0.13)"} d={"M403.886,427.092c31.805-31.675,51.156-72.843,51.156-117.982c0-39.184-14.643-75.351-39.282-104.954  c2.02-6.265,3.149-12.751,3.149-19.456c0-37.186-32.559-68.257-83.059-85.193l28.483-65.848c5.268-12.211-0.35-26.389-12.568-31.673  c-12.2-5.284-26.376,0.345-31.663,12.554l-32.024,74.065c-13.741-1.849-28.121-2.939-43.145-2.939  c-99.2,0-173.995,42.572-173.995,99.034c0,6.705,1.129,13.191,3.15,19.456c-24.64,29.604-39.289,65.771-39.289,104.954  c0,45.14,19.371,86.317,51.175,117.988l-17.909,24.225c-7.902,10.695-5.643,25.775,5.053,33.689  c4.297,3.184,9.314,4.721,14.299,4.721c7.374,0,14.668-3.379,19.39-9.772l17.154-23.22c34.224,20.78,75.895,33.1,120.973,33.1  c45.072,0,86.731-12.32,120.935-33.09l17.155,23.21c4.74,6.393,12.016,9.772,19.401,9.772c4.974,0,9.99-1.537,14.306-4.715  c10.696-7.911,12.968-22.99,5.065-33.695L403.886,427.092z"}/>
  ),
  level4: (
    <path className={"fill"} transform={"translate(15,0),scale(0.25)"} d={"M277.531,179.745c-0.045-10.481-9.676-33.631-92.951-35.979l-31.034-68.857l42.085,17.586 l-63.13-67.928c-8.62-6.047-37.77,80.794-49.648,117.583l0,0c-8.354,1.318-34.706,6.113-55.001,16.797 c-19.8,10.395-30.244,19.572-27.386,32.326c-2.076,14.357,3.17,56.896,135.987,62.381 C179.174,255.423,285.918,226.942,277.531,179.745z M144.93,182.741c-67.228,4.734-72.835-13.954-72.835-13.954l6.106-13.264 c0,0,18.403,12.415,56.083,11.763c37.68-0.659,53.318-17.423,53.318-17.423l9.927,12.077 C195.098,177.688,144.93,182.741,144.93,182.741z"}/>
  ),
});

class CellDefinitions extends PureComponent {
  static cellDefinitionsStyleMap = {
    'original': OriginalCellDefinitions,
    'halloween': HalloweenCellDefinitions,
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
  	  x, y, available, undoable, level, player, onClick, animated, allowControl, gameType,
      theme: {cells = 'original', pieces = 'king', rotateOpponent = true, numbers},
    } = this.props;
  	const {previousLevel, currentLevel} = this.state;
  	const isPlayerAOpponent = !allowControl.includes(Game.PLAYER_A) && allowControl.includes(Game.PLAYER_B);
  	const isPlayerBOpponent = !isPlayerAOpponent;
    const translate = constants.translate(gameType, {x, y});
    return (
    	<g transform={`translate(${translate.x},${translate.y})`}>
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
        <use
          xlinkHref={`#cell-${cells}-border`}
          className={classNames({available, undoable})}
          onClick={onClick}
        />
      </g>
    );
  }
}

Cell.propTypes = {
  gameType: PropTypes.oneOf(Game.GAME_TYPES).isRequired,
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
