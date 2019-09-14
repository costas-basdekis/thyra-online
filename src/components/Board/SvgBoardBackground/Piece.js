import React, {PureComponent} from 'react';
import * as constants from "./constants";

class BasePieceDefinition extends PureComponent {
	render() {
  	const {name, path, dimensions, offset} = this.props;
  	return (
    	<React.Fragment>
        <g id={`piece-${name}-base`} transform={[
      		`translate(${constants.cellSize / 2},${constants.cellSize / 2})`,
        	`scale(${(constants.pieceScaling)},${(constants.pieceScaling)})`,
        	`translate(${-dimensions.x / 2 + offset.x},${-dimensions.y / 2 + offset.y})`,
      	].join(',')}>{path}</g>
        <g id={`piece-${name}-white`}>
          <use xlinkHref={`#piece-${name}-base`} strokeWidth={constants.pieceStrokeWidth} stroke={"#111"} />
          <use xlinkHref={`#piece-${name}-base`} fill={'white'} />
        </g>
        <g id={`piece-${name}-black`}>
          <use xlinkHref={`#piece-${name}-base`} strokeWidth={constants.pieceStrokeWidth} stroke={"#bbb"} />
          <use xlinkHref={`#piece-${name}-base`} fill={'black'} />
        </g>
      </React.Fragment>
    );
  }
}

class BasePiece extends PureComponent {
	static rotateTransform =
  	`rotate(180,${constants.cellSize / 2},${constants.cellSize / 2})`;

	render() {
  	const {name, colour, rotated} = this.props;
  	return (
    	<use
        xlinkHref={`#piece-${name}-${colour}`}
        transform={rotated ? this.constructor.rotateTransform : undefined}
      />
    );
  }
}

const definePiece = (className, {path, dimensions, offset = {x: 0, y: 0}}) => {
  class PieceDefinitionFor extends PureComponent {
    render() {
      return (
        <BasePieceDefinition
          name={className}
          path={path}
          dimensions={dimensions}
          offset={offset}
          />
      );
    }
  }
  PieceDefinitionFor.displayName = `${className}Definition`;

  class PieceFor extends PureComponent {
    static Definition = PieceDefinitionFor;

    render() {
      const {colour, rotated} = this.props;
      return (
        <BasePiece
          name={className}
          colour={colour}
          rotated={rotated}
        />
      );
    }
  }
  PieceFor.displayName = className;

  return PieceFor;
};

const PiecePawn = definePiece('PiecePawn', {
  path: <path d="M105.1 224H80a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h16v5.49c0 44-4.14 86.6-24 122.51h176c-19.89-35.91-24-78.51-24-122.51V288h16a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16h-25.1c29.39-18.38 49.1-50.78 49.1-88a104 104 0 0 0-208 0c0 37.22 19.71 69.62 49.1 88zM304 448H16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h288a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z" />,
  dimensions: {x: 320, y: 480},
  offset: {x: 0, y: -38},
});

const PieceKing = definePiece('PieceKing', {
  path: <path d="M400 448H48a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h352a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm16-288H256v-48h40a8 8 0 0 0 8-8V56a8 8 0 0 0-8-8h-40V8a8 8 0 0 0-8-8h-48a8 8 0 0 0-8 8v40h-40a8 8 0 0 0-8 8v48a8 8 0 0 0 8 8h40v48H32a32 32 0 0 0-30.52 41.54L74.56 416h298.88l73.08-214.46A32 32 0 0 0 416 160z" />,
  dimensions: {x: 448, y: 512},
});

const PieceCircle = definePiece('PieceCircle', {
  path: <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z" />,
  dimensions: {x: 512, y: 512},
});

const PieceCertificate = definePiece('PieceCertificate', {
  path: <path d="M458.622 255.92l45.985-45.005c13.708-12.977 7.316-36.039-10.664-40.339l-62.65-15.99 17.661-62.015c4.991-17.838-11.829-34.663-29.661-29.671l-61.994 17.667-15.984-62.671C337.085.197 313.765-6.276 300.99 7.228L256 53.57 211.011 7.229c-12.63-13.351-36.047-7.234-40.325 10.668l-15.984 62.671-61.995-17.667C74.87 57.907 58.056 74.738 63.046 92.572l17.661 62.015-62.65 15.99C.069 174.878-6.31 197.944 7.392 210.915l45.985 45.005-45.985 45.004c-13.708 12.977-7.316 36.039 10.664 40.339l62.65 15.99-17.661 62.015c-4.991 17.838 11.829 34.663 29.661 29.671l61.994-17.667 15.984 62.671c4.439 18.575 27.696 24.018 40.325 10.668L256 458.61l44.989 46.001c12.5 13.488 35.987 7.486 40.325-10.668l15.984-62.671 61.994 17.667c17.836 4.994 34.651-11.837 29.661-29.671l-17.661-62.015 62.65-15.99c17.987-4.302 24.366-27.367 10.664-40.339l-45.984-45.004z" />,
  dimensions: {x: 512, y: 512},
});

const PieceSun = definePiece('PieceSun', {
  path: <path d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3c13-6.5 13-24.7.2-31.1zm-155.9 106c-49.9 49.9-131.1 49.9-181 0-49.9-49.9-49.9-131.1 0-181 49.9-49.9 131.1-49.9 181 0 49.9 49.9 49.9 131.1 0 181z" />,
  dimensions: {x: 512, y: 512},
});

const PieceRocket = definePiece('PieceRocket', {
  path: <path d="M505.05 19.1a15.89 15.89 0 0 0-12.2-12.2C460.65 0 435.46 0 410.36 0c-103.2 0-165.1 55.2-211.29 128H94.87A48 48 0 0 0 52 154.49l-49.42 98.8A24 24 0 0 0 24.07 288h103.77l-22.47 22.47a32 32 0 0 0 0 45.25l50.9 50.91a32 32 0 0 0 45.26 0L224 384.16V488a24 24 0 0 0 34.7 21.49l98.7-49.39a47.91 47.91 0 0 0 26.5-42.9V312.79c72.59-46.3 128-108.4 128-211.09.1-25.2.1-50.4-6.85-82.6zM384 168a40 40 0 1 1 40-40 40 40 0 0 1-40 40z" />,
  dimensions: {x: 512, y: 512},
});

const PieceBug = definePiece('PieceBug', {
  path: <path d="M511.988 288.9c-.478 17.43-15.217 31.1-32.653 31.1H424v16c0 21.864-4.882 42.584-13.6 61.145l60.228 60.228c12.496 12.497 12.496 32.758 0 45.255-12.498 12.497-32.759 12.496-45.256 0l-54.736-54.736C345.886 467.965 314.351 480 280 480V236c0-6.627-5.373-12-12-12h-24c-6.627 0-12 5.373-12 12v244c-34.351 0-65.886-12.035-90.636-32.108l-54.736 54.736c-12.498 12.497-32.759 12.496-45.256 0-12.496-12.497-12.496-32.758 0-45.255l60.228-60.228C92.882 378.584 88 357.864 88 336v-16H32.666C15.23 320 .491 306.33.013 288.9-.484 270.816 14.028 256 32 256h56v-58.745l-46.628-46.628c-12.496-12.497-12.496-32.758 0-45.255 12.498-12.497 32.758-12.497 45.256 0L141.255 160h229.489l54.627-54.627c12.498-12.497 32.758-12.497 45.256 0 12.496 12.497 12.496 32.758 0 45.255L424 197.255V256h56c17.972 0 32.484 14.816 31.988 32.9zM257 0c-61.856 0-112 50.144-112 112h224C369 50.144 318.856 0 257 0z" />,
  dimensions: {x: 512, y: 512},
});

const PieceEye = definePiece('PieceEye', {
  path: <path d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z" />,
  dimensions: {x: 512, y: 512},
});

const PieceUser = definePiece('PieceUser', {
  path: <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z" />,
  dimensions: {x: 512, y: 512},
});

class Piece extends PureComponent {
	static pieceStyleMap = {
    'pawn': PiecePawn,
    'king': PieceKing,
    'circle': PieceCircle,
    'certificate': PieceCertificate,
    'sun': PieceSun,
    'rocket': PieceRocket,
    'bug': PieceBug,
    'eye': PieceEye,
    'user': PieceUser,
  };

	render() {
  	const {style, colour, rotated} = this.props;
    const PieceStyle = this.constructor.pieceStyleMap[style];
  	return (
    	<PieceStyle colour={colour} rotated={rotated} />
    );
  }
}

class PieceDefinitions extends PureComponent {
	render() {
  	return Object.values(Piece.pieceStyleMap)
    	.map(PieceStyle => <PieceStyle.Definition key={PieceStyle.displayName || PieceStyle.name} />);
  }
}
Piece.Definitions = PieceDefinitions;

export default Piece;
