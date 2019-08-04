class Game {
  static PLAYER_A = 'player-a';
  static PLAYER_B = 'player-b';
  static PLAYERS = [
    this.PLAYER_A,
    this.PLAYER_B,
  ];

  static WORKER_FIRST = 'first-worker';
  static WORKER_SECOND = 'second-worker';

  static MOVE_TYPE_PLACE_FIRST_WORKER = 'place-first-worker';
  static MOVE_TYPE_PLACE_SECOND_WORKER = 'place-second-worker';
  static MOVE_TYPE_MOVE_WORKER = 'move-worker';
  static MOVE_TYPE_BUILD_AROUND_FIRST_WORKER = 'build-around-first-worker';
  static MOVE_TYPE_BUILD_AROUND_SECOND_WORKER = 'build-around-second-worker';

  constructor() {
    this.rows = Array.from({length: 5}, (value, index) => index);
    this.columns = Array.from({length: 5}, (value, index) => index);

    this.rowsAndColumns = this.rows.map(y => ({
      y,
      cells: this.columns.map(x => ({
        x, y,
        cell: {
          x, y,
          player: null,
          worker: null,
          level: 0,
        },
      })),
    }));

    this.cells = {};
    for (const row of this.rowsAndColumns) {
      this.cells[row.y] = {};
      for (const cell of row.cells) {
        this.cells[cell.y][cell.x] = cell;
      }
    }

    this.nextPlayer = this.constructor.PLAYER_A;
    this.moveType = this.constructor.MOVE_TYPE_PLACE_FIRST_WORKER;
    this.finished = false;
    this.winner = null;

    this.availableMoves = this.rows.map(() => this.columns.map(() => true));
  }
}

export default Game;
