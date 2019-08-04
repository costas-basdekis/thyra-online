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
  static MOVE_TYPE_MOVE_WORKER = 'move-worker';
  static MOVE_TYPE_BUILD_AROUND_FIRST_WORKER = 'build-around-first-worker';
  static MOVE_TYPE_BUILD_AROUND_SECOND_WORKER = 'build-around-second-worker';

  constructor(cells, status) {
    if (cells && !status) {
      throw new Error("You need to pass initial status when passing initial Cells");
    }

    this.rows = Array.from({length: 5}, (value, index) => index);
    this.columns = Array.from({length: 5}, (value, index) => index);

    this.cells = this.getInitialCells();
    this.rowsAndColumns = this.rows.map(y => ({
      y,
      cells: this.columns.map(x => ({
        x, y,
        cell: this.cells[y][x],
      })),
    }));

    const {nextPlayer, moveType, finished, winner, availableMoves} = status || this.getInitialStatus();
    this.nextPlayer = nextPlayer;
    this.moveType = moveType;
    this.finished = finished;
    this.winner = winner;
    this.availableMoves = availableMoves;
  }

  getInitialCells() {
    const cells = {};
    for (const y of this.rows) {
      cells[y] = {};
      for (const x of this.columns) {
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

  getInitialStatus() {
    return  {
      nextPlayer: this.constructor.PLAYER_A,
      moveType: this.constructor.MOVE_TYPE_PLACE_FIRST_WORKER,
      finished: false,
      winner: null,
      availableMoves: this.allMovesAreAvailable(),
    };
  }

  checkCoordinatesAreValid({x, y}) {
    if (Math.floor(x) !== x || Math.floor(y) !== y) {
      throw new Error(`Coordinates '${JSON.stringify({x, y})}' are not valid`);
    }
    if (this.availableMoves[y] === undefined || this.availableMoves[y][x] === undefined) {
      throw new Error(`Coordinates '${JSON.stringify({x, y})}' are out of bounds`);
    }
  }

  allMovesAreAvailable() {
    return this.rows.map(() => this.columns.map(() => true));
  }

  removeAvailableMove(coordinates) {
    this.checkCoordinatesAreValid(coordinates);
    return this.availableMoves.map((row, y) => row.map((available, x) => (
      available && (coordinates.x !== x || coordinates.y !== y)
    )));
  }

  checkCanMakeMove(expectedMoveType, coordinates) {
    if (this.finished) {
      throw new Error("The game has already finished");
    }
    if (this.moveType !== expectedMoveType) {
      throw new Error(`You cannot perform move of type "${expectedMoveType}": you need to perform "${this.moveType}"`);
    }
    this.checkCoordinatesAreValid(coordinates);
  }

  makeMove(coordinates) {
    const makeMoveMethods = {
      [this.constructor.MOVE_TYPE_PLACE_FIRST_WORKER]: this.placeFirstWorker,
      [this.constructor.MOVE_TYPE_PLACE_SECOND_WORKER]: this.placeSecondWorker,
    };
    const makeMoveMethod = makeMoveMethods[this.moveType];
    if (!makeMoveMethod) {
      throw new Error(`Don't know how to perform move of type "${this.moveType}"`);
    }
    return makeMoveMethod.bind(this)(coordinates);
  }

  placeFirstWorker({x, y}) {
    this.checkCanMakeMove(this.constructor.MOVE_TYPE_PLACE_FIRST_WORKER, {x, y});

    return new this.constructor({
      ...this.cells,
      [y]: {
        ...this.cells[y],
        [x]: {
          ...this.cells[y][x],
          cell: {
            ...this.cells[y][x].cell,
            player: this.nextPlayer,
            worker: this.constructor.WORKER_FIRST,
          },
        },
      },
    }, {
      nextPlayer: this.nextPlayer,
      moveType: this.constructor.MOVE_TYPE_PLACE_SECOND_WORKER,
      finished: this.finished,
      winner: this.winner,
      availableMoves: this.removeAvailableMove({x, y}),
    });
  }

  placeSecondWorker({x, y}) {
    this.checkCanMakeMove(this.constructor.MOVE_TYPE_PLACE_SECOND_WORKER, {x, y});

    return new this.constructor({
      ...this.cells,
      [y]: {
        ...this.cells[y],
        [x]: {
          ...this.cells[y][x],
          cell: {
            ...this.cells[y][x].cell,
            player: this.nextPlayer,
            worker: this.constructor.WORKER_SECOND,
          },
        },
      },
    }, {
      nextPlayer: this.constructor.OTHER_PLAYER[this.nextPlayer],
      moveType: this.nextPlayer === this.constructor.PLAYER_A
        ? this.constructor.MOVE_TYPE_PLACE_FIRST_WORKER
        : this.constructor.MOVE_TYPE_MOVE_WORKER,
      finished: this.finished,
      winner: this.winner,
      availableMoves: this.removeAvailableMove({x, y}),
    });
  }
}

export default Game;
