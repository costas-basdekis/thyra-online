import _ from "lodash";
import chalk from 'chalk';

class InvalidMoveError extends Error {}

class Game {
  static PLAYER_A = 'player-a';
  static PLAYER_B = 'player-b';
  static PLAYERS = [
    this.PLAYER_A,
    this.PLAYER_B,
  ];
  static OTHER_PLAYER = {
    [this.PLAYER_A]: this.PLAYER_B,
    [this.PLAYER_B]: this.PLAYER_A,
  };

  static WORKER_FIRST = 'first-worker';
  static WORKER_SECOND = 'second-worker';

  static MOVE_TYPE_PLACE_FIRST_WORKER = 'place-first-worker';
  static MOVE_TYPE_PLACE_SECOND_WORKER = 'place-second-worker';
  static MOVE_TYPE_SELECT_WORKER_TO_MOVE = 'select-worker-to-move';
  static MOVE_TYPE_MOVE_FIRST_WORKER = 'move-first-worker';
  static MOVE_TYPE_MOVE_SECOND_WORKER = 'move-second-worker';
  static MOVE_TYPE_BUILD_AROUND_WORKER = 'build-around-worker';

  static MOVE_TYPES_PLACE_WORKER = [this.MOVE_TYPE_PLACE_FIRST_WORKER, this.MOVE_TYPE_PLACE_SECOND_WORKER];
  static MOVE_TYPES_MOVE_WORKER = [this.MOVE_TYPE_MOVE_FIRST_WORKER, this.MOVE_TYPE_MOVE_SECOND_WORKER];
  static MOVE_TYPES_MOVE_OR_BUILD = [...this.MOVE_TYPES_MOVE_WORKER, this.MOVE_TYPE_BUILD_AROUND_WORKER];

  static ROWS = Array.from({length: 5}, (value, index) => index);
  static COLUMNS = Array.from({length: 5}, (value, index) => index);
  static MOVE_NOTATION = this.ROWS.map(y => this.COLUMNS.map(x =>
    `${['A', 'B', 'C', 'D', 'E'][x]}${['1', '2', '3', '4', '5'][y]}`));
  static RESIGNED_NOTATION = {
    [this.PLAYER_A]: 'RA',
    [this.PLAYER_B]: 'RB',
  };
  static REVERSE_NOTATION = {
    ..._.fromPairs(_.flatten(this.ROWS.map(y => this.COLUMNS.map(x =>
      [`${['A', 'B', 'C', 'D', 'E'][x]}${['1', '2', '3', '4', '5'][y]}`, {x, y}])))),
    'RA': [{resign: this.PLAYER_A}],
    'RB': [{resign: this.PLAYER_B}],
  };
  static NOTATION_COMPRESSION = _.fromPairs(Object.keys(this.REVERSE_NOTATION).sort().map((value, index) =>
    [value, String.fromCharCode(index < 26 ? 65 + index : 48 + (index - 26))]));
  static NOTATION_DECOMPRESSION = _.fromPairs(Object.keys(this.REVERSE_NOTATION).sort().map((value, index) =>
    [String.fromCharCode(index < 26 ? 65 + index : 48 + (index - 26)), this.REVERSE_NOTATION[value]]));

  static create() {
    const cells = this.getInitialCells();
    const status = this.getInitialStatus();
    return new this(cells, status, null, null, false);
  }

  static fromMoves(moves) {
    let game = this.create();
    for (const move of moves) {
      game = game.makeMove(move);
    }

    return game;
  }

  static fromNotation(fullNotation) {
    const moves = fullNotation
      .split('')
      .map(part => this.REVERSE_NOTATION[part]);
    if (moves.filter(move => !move).length) {
      return null;
    }

    return this.fromMoves(moves);
  }

  static fromCompressedNotation(compressedFullNotation) {
    const moves = compressedFullNotation
      .split('')
      .map(part => this.NOTATION_DECOMPRESSION[part]);
    if (moves.filter(move => !move).length) {
      return null;
    }

    return this.fromMoves(moves);
  }

  createStep(cells, status, lastMove) {
    return new this.constructor(cells, status, this, lastMove, false);
  }

  createNext(cells, status, lastMove) {
    return new this.constructor(cells, status, this, lastMove, true);
  }

  constructor(cells, status, previous, lastMove, isNextMove) {
    if (!cells || !status) {
      throw new Error("You need to pass cells, status, and previous game");
    }
    this.previous = previous;
    this.history = (this.previous ? this.previous.history : [])
      .filter(game => !game.canUndo)
      .concat([this]);
    this.previousInHistory = this.history[this.history.length - 2];
    this.fullHistory = (this.previous ? this.previous.fullHistory : []).concat(this);
    this.isNextMove = isNextMove;
    this.moveCount = this.previous ? (isNextMove ? this.previous.moveCount + 1 : this.previous.moveCount) : 1;
    this.chainCount = this.previous ? this.previous.chainCount + 1 : 0;
    this.lastMove = lastMove ? lastMove : (status.resignedPlayer ? {resign: status.resignedPlayer} : lastMove);
    this.moves = this.previous ? this.previous.moves.concat([this.lastMove]) : [];

    this.cells = cells;
    this.allCells = Object.values(this.cells)
      .map(row => Object.values(row))
      .reduce((total, current) => total.concat(current));
    this.rowsAndColumns = this.constructor.ROWS.map(y => ({
      y,
      cells: this.constructor.COLUMNS.map(x => this.cells[y][x]),
    }));

    const {nextPlayer, moveType, availableMovesMatrix, canUndo, resignedPlayer} = status;
    this.thisPlayer = previous ? previous.nextPlayer : Game.PLAYER_A;
    this.nextPlayer = nextPlayer;
    this.thisMoveType = previous ? previous.moveType : null;
    this.moveType = moveType;
    this.availableMovesMatrix = availableMovesMatrix;
    this.canUndo = canUndo;
    this.canTakeMoveBack = !!this.previous;
    this.resignedPlayer = resignedPlayer;
    this.moveNotation = resignedPlayer
      ? this.constructor.RESIGNED_NOTATION[resignedPlayer]
      : (lastMove
        ? this.constructor.MOVE_NOTATION[lastMove.y][lastMove.x]
        : '');
    this.fullNotation = `${this.previous ? this.previous.fullNotation : ''}${this.moveNotation}`;
    this.compressedFullNotation = this.fullNotation
      .split(/(..)/)
      .filter(part => part)
      .map(part => this.constructor.NOTATION_COMPRESSION[part])
      .join('');

    this.winner = this.getWinner();
    if (this.winner) {
      this.finished = true;
    } else if (!this.hasAvailableMove(this.availableMovesMatrix)) {
      this.finished = true;
      this.winner = this.constructor.OTHER_PLAYER[this.nextPlayer];
    } else {
      this.finished = false;
    }

    if (this.finished) {
      this.availableMovesMatrix = this.constructor.noMovesAreAvailable();
    }
  }

  getAvailableMoves(availableMovesMatrix = this.availableMovesMatrix) {
    return _.flatten(availableMovesMatrix
      .map((row, y) => row
        .map((available, x) => available ? {x, y} : null)))
      .filter(move => move);
  }

  serialize() {
    return this.serializeCompact();
  }

  serializeCompact() {
    return {
      moves: this.moves,
    };
  }

  serializeVerbose() {
    return {
      cells: this.cells,
      status: {
        nextPlayer: this.nextPlayer,
        moveType: this.moveType,
        availableMovesMatrix: this.availableMovesMatrix,
        canUndo: this.canUndo,
        resignedPlayer: this.resignedPlayer,
      },
      previous: this.previous ? this.previous.serialize() : null,
      lastMove: this.lastMove,
      isNextMove: this.isNextMove,
    };
  }

  static deserialize(serialized) {
    if (serialized.moves) {
      return this.deserializeCompact(serialized);
    } else {
      return this.deserializeVerbose(serialized);
    }
  }

  static deserializeCompact({moves}) {
    return this.fromMoves(moves);
  }

  static deserializeVerbose({cells, status, previous, lastMove, isNextMove}) {
    if (previous) {
      previous = this.deserialize(previous);
    }
    return new this(cells, status, previous, lastMove, isNextMove);
  }

  static getInitialCells() {
    const cells = {};
    for (const y of this.ROWS) {
      cells[y] = {};
      for (const x of this.COLUMNS) {
        cells[y][x] = {
          x, y,
          player: null,
          worker: null,
          level: 0,
        };
      }
    }

    return cells;
  }

  static getInitialStatus() {
    return  {
      nextPlayer: this.PLAYER_A,
      moveType: this.MOVE_TYPE_PLACE_FIRST_WORKER,
      finished: false,
      winner: null,
      availableMovesMatrix: this.allMovesAreAvailableMatrix(),
      canUndo: false,
    };
  }

  getPrintout() {
    /* eslint-disable no-useless-computed-key */
    const printMap = {
      [Game.PLAYER_A]: {[0]: 'a', [1]: chalk.bgWhite('b'), [2]: chalk.bgYellow('c'), [3]: chalk.bgRed('d')},
      [Game.PLAYER_B]: {[0]: 'w', [1]: chalk.bgWhite('x'), [2]: chalk.bgYellow('y'), [3]: chalk.bgRed('z')},
      [null]: {[0]: ' ', [1]: chalk.bgWhite(' '), [2]: chalk.bgYellow(' '), [3]: chalk.bgRed(' '), [4]: chalk.bgBlue(' ')},
    };
    /* eslint-enable no-useless-computed-key */
    const cellsPrintout = this.rowsAndColumns
      .map(row => row.cells
        .map(cell => printMap[cell.player][cell.level])
        .join(''))
      .join('\n');
    const nextPlayerMap = {
      [Game.PLAYER_A]: 'A', [Game.PLAYER_B]: 'B',
    };
    const nextPlayerPrintout = nextPlayerMap[this.nextPlayer];
    const winnerMap = {
      [Game.PLAYER_A]: 'A', [Game.PLAYER_B]: 'B', [null]: '+',
    };
    const winnerPrintout = winnerMap[this.winner];
    return (
      `${nextPlayerPrintout}-----${winnerPrintout}\n`
      + cellsPrintout.split('\n').map(row => `|${chalk.black(row)}|`).join('\n')
      + '\n+-----+'
    );
  }

  checkCoordinatesAreValid({x, y}) {
    if (Math.floor(x) !== x || Math.floor(y) !== y) {
      throw new InvalidMoveError(`Coordinates '${JSON.stringify({x, y})}' are not valid`);
    }
    if (this.availableMovesMatrix[y] === undefined || this.availableMovesMatrix[y][x] === undefined) {
      throw new InvalidMoveError(`Coordinates '${JSON.stringify({x, y})}' are out of bounds`);
    }
  }

  hasAvailableMove(availableMovesMatrix = this.availableMovesMatrix) {
    return this.getAvailableMoves(availableMovesMatrix).length > 0;
  }

  isMoveAvailable({x, y}) {
    return this.availableMovesMatrix[y][x];
  }

  getWinner() {
    if (this.resignedPlayer) {
      return this.constructor.OTHER_PLAYER[this.resignedPlayer];
    }

    const winningCell = this.allCells.find(cell => cell.player && cell.level === 3);
    if (!winningCell) {
      return null;
    }

    return winningCell.player;
  }

  static allMovesAreAvailableMatrix() {
    return this.ROWS.map(() => this.COLUMNS.map(() => true));
  }

  static noMovesAreAvailable() {
    return this.ROWS.map(() => this.COLUMNS.map(() => false));
  }

  getEmptyCellsAvailableMovesMatrix(cells) {
    return this.constructor.ROWS.map(y => this.constructor.COLUMNS.map(x => !cells[y][x].player));
  }

  getPlayerAvailableMovesMatrix(cells, player) {
    return this.constructor.ROWS.map(y => this.constructor.COLUMNS.map(x => {
      if (cells[y][x].player !== player) {
        return false;
      }

      return this.hasAvailableMove(this.getMovableAvailableMovesMatrix(cells, {x, y}));
    }));
  }

  getMovableAvailableMovesMatrix(cells, coordinates) {
    const cell = cells[coordinates.y][coordinates.x];
    const maximumLevel = cell.level + 1;
    return this.constructor.ROWS.map(y => this.constructor.COLUMNS.map(x => (
      Math.abs(x - coordinates.x) <= 1
      && Math.abs(y - coordinates.y) <= 1
      && !cells[y][x].player
      && cells[y][x].level <= 3
      && cells[y][x].level <= maximumLevel
    )));
  }

  getBuildableAvailableMovesMatrix(cells, coordinates) {
    return this.constructor.ROWS.map(y => this.constructor.COLUMNS.map(x => (
      Math.abs(x - coordinates.x) <= 1
      && Math.abs(y - coordinates.y) <= 1
      && !cells[y][x].player
      && cells[y][x].level < 4
    )));
  }

  checkCanMakeMove(expectedMoveType, coordinates, targetCoordinates) {
    if (this.finished) {
      throw new InvalidMoveError("The game has already finished");
    }
    if (this.moveType !== expectedMoveType) {
      throw new InvalidMoveError(`You cannot perform move of type "${expectedMoveType}": you need to perform "${this.moveType}"`);
    }
    this.checkCoordinatesAreValid(coordinates);
    if (targetCoordinates) {
      this.checkCoordinatesAreValid(targetCoordinates);
    }
    if (!this.availableMovesMatrix[coordinates.y][coordinates.x]) {
      throw new Error(`Move ${JSON.stringify(coordinates)} is not one of the available ones`);
    }
  }

  resign(player) {
    return this.createStep(this.cells, {
      nextPlayer: this.nextPlayer,
      moveType: this.moveType,
      availableMovesMatrix: this.availableMovesMatrix,
      canUndo: false,
      resignedPlayer: player,
    }, {resign: player});
  }

  makeMove(coordinates) {
    if (coordinates.resign) {
      return this.resign(coordinates.resign);
    }
    const makeMoveMethods = {
      [this.constructor.MOVE_TYPE_PLACE_FIRST_WORKER]: this.placeFirstWorker,
      [this.constructor.MOVE_TYPE_PLACE_SECOND_WORKER]: this.placeSecondWorker,
      [this.constructor.MOVE_TYPE_SELECT_WORKER_TO_MOVE]: this.selectWorkerToMove,
      [this.constructor.MOVE_TYPE_MOVE_FIRST_WORKER]: this.moveFirstWorker,
      [this.constructor.MOVE_TYPE_MOVE_SECOND_WORKER]: this.moveSecondWorker,
      [this.constructor.MOVE_TYPE_BUILD_AROUND_WORKER]: this.buildAroundWorker,
    };
    const makeMoveMethod = makeMoveMethods[this.moveType];
    if (!makeMoveMethod) {
      throw new InvalidMoveError(`Don't know how to perform move of type "${this.moveType}"`);
    }
    return makeMoveMethod.bind(this)(coordinates);
  }

  undo() {
    if (!this.canUndo) {
      throw new Error("Cannot undo");
    }

    return this.previous;
  }

  takeMoveBack() {
    if (!this.canTakeMoveBack) {
      throw new Error("Cannot take move back");
    }

    return this.previous;
  }

  placeFirstWorker({x, y}) {
    this.checkCanMakeMove(this.constructor.MOVE_TYPE_PLACE_FIRST_WORKER, {x, y});

    const cells = {
      ...this.cells,
      [y]: {
        ...this.cells[y],
        [x]: {
          ...this.cells[y][x],
          player: this.nextPlayer,
          worker: this.constructor.WORKER_FIRST,
        },
      },
    };
    return this.createStep(cells, {
      nextPlayer: this.nextPlayer,
      moveType: this.constructor.MOVE_TYPE_PLACE_SECOND_WORKER,
      availableMovesMatrix: this.getEmptyCellsAvailableMovesMatrix(cells),
      canUndo: true,
      resignedPlayer: null,
    }, {x, y});
  }

  placeSecondWorker({x, y}) {
    this.checkCanMakeMove(this.constructor.MOVE_TYPE_PLACE_SECOND_WORKER, {x, y});

    const cells = {
      ...this.cells,
      [y]: {
        ...this.cells[y],
        [x]: {
          ...this.cells[y][x],
          player: this.nextPlayer,
          worker: this.constructor.WORKER_SECOND,
        },
      },
    };
    const nextPlayer = this.constructor.OTHER_PLAYER[this.nextPlayer];
    return this.createNext(cells, {
      nextPlayer: nextPlayer,
      moveType: nextPlayer === this.constructor.PLAYER_A
        ? this.constructor.MOVE_TYPE_SELECT_WORKER_TO_MOVE
        : this.constructor.MOVE_TYPE_PLACE_FIRST_WORKER,
      availableMovesMatrix: nextPlayer === this.constructor.PLAYER_A
        ? this.getPlayerAvailableMovesMatrix(cells, nextPlayer)
        : this.getEmptyCellsAvailableMovesMatrix(cells),
      canUndo: false,
      resignedPlayer: null,
    }, {x, y});
  }

  selectWorkerToMove({x, y}) {
    this.checkCanMakeMove(this.constructor.MOVE_TYPE_SELECT_WORKER_TO_MOVE, {x, y});

    const cell = this.cells[y][x];
    return this.createStep(this.cells, {
      nextPlayer: this.nextPlayer,
      moveType: cell.worker === this.constructor.WORKER_FIRST
        ? this.constructor.MOVE_TYPE_MOVE_FIRST_WORKER
        : this.constructor.MOVE_TYPE_MOVE_SECOND_WORKER,
      availableMovesMatrix: this.getMovableAvailableMovesMatrix(this.cells, {x, y}),
      canUndo: true,
      resignedPlayer: null,
    }, {x, y});
  }

  moveWorker(to, worker) {
    const fromCell = this.allCells.find(cell => cell.player === this.nextPlayer && cell.worker === worker);
    const toCell = this.cells[to.y][to.x];
    let cells = {
      ...this.cells,
      [fromCell.y]: {
        ...this.cells[fromCell.y],
        [fromCell.x]: {
          ...fromCell,
          player: null,
          worker: null,
        },
      },
    };
    cells = {
      ...cells,
      [to.y]: {
        ...cells[to.y],
        [to.x]: {
          ...toCell,
          player: fromCell.player,
          worker: fromCell.worker,
        },
      },
    };
    return this.createStep(cells, {
      nextPlayer: this.nextPlayer,
      moveType: this.constructor.MOVE_TYPE_BUILD_AROUND_WORKER,
      availableMovesMatrix: this.getBuildableAvailableMovesMatrix(cells, to),
      canUndo: true,
      resignedPlayer: null,
    }, {x: to.x, y: to.y});
  }

  moveFirstWorker({x, y}) {
    this.checkCanMakeMove(this.constructor.MOVE_TYPE_MOVE_FIRST_WORKER, {x, y});

    return this.moveWorker({x, y}, this.constructor.WORKER_FIRST)
  }

  moveSecondWorker({x, y}) {
    this.checkCanMakeMove(this.constructor.MOVE_TYPE_MOVE_SECOND_WORKER, {x, y});

    return this.moveWorker({x, y}, this.constructor.WORKER_SECOND)
  }

  buildAroundWorker({x, y}) {
    this.checkCanMakeMove(this.constructor.MOVE_TYPE_BUILD_AROUND_WORKER, {x, y});

    const cells = {
      ...this.cells,
      [y]: {
        ...this.cells[y],
        [x]: {
          ...this.cells[y][x],
          level: this.cells[y][x].level + 1,
        },
      },
    };
    const nextPlayer = this.constructor.OTHER_PLAYER[this.nextPlayer];
    return this.createNext(cells, {
      nextPlayer: nextPlayer,
      moveType: this.constructor.MOVE_TYPE_SELECT_WORKER_TO_MOVE,
      availableMovesMatrix: this.getPlayerAvailableMovesMatrix(cells, nextPlayer),
      canUndo: false,
      resignedPlayer: null,
    }, {x, y});
  }
}

export {
  InvalidMoveError,
};

export default Game;
