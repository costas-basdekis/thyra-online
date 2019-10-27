import Game from "../../../game/game";

export const cellSize = 100;
export const pieceStrokeWidth = 0.8 * cellSize;
export const borderWidth = 5;
export const pieceScaling = 0.1;

export const translate = (gameType, point) => {
  return getTranslate(gameType)(point);
};

export const getTranslate = gameType => {
  if (gameType === Game.Classic) {
    return getTranslateClassic;
  } else if (gameType === Game.Hex) {
    return getTranslateHex;
  }

  throw new Error(`Unknown game type of type '${gameType ? gameType.constructor.name : gameType}'`);
};

export const getTranslateClassic = point => {
  return ({
    x: point.x * cellSize,
    y: point.y * cellSize,
  });
};

export const getTranslateHex = point => {
  return ({
    x: point.x * cellSize,
    y: (point.y + (point.x % 2 === 0 ? 0.25 : -0.25)) * cellSize,
  });
};
