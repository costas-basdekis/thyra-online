import _ from "lodash";
import moment from "moment";
import * as utils from "../utils";

const appVersion = 14;

class Client {
  static getDefaultSettings() {
    return {
      autoSubmitMoves: false,
      confirmSubmitMoves: true,
      enableNotifications: false,
      theme: {
        useTopicalTheme: true,
        cells: 'original',
        pieces: 'king',
        scheme: '',
        rotateOpponent: true,
        animations: true,
        arrows: true,
        numbers: 'obvious',
      },
    };
  }

  scriptIoReloadInterval = null;

  constructor() {
    this.id = localStorage.getItem('user-id') || null;
    this.username = localStorage.getItem('user-name') || null;
    const password = localStorage.getItem('user-password') || null;
    localStorage.removeItem('user-password');
    this.token = localStorage.getItem('user-token') || password;
    const localSettings = localStorage.getItem('user-settings') || 'null';
    let settings;
    try {
      settings = JSON.parse(localSettings);
    } catch (e) {
      settings = null;
    }
    this.updateApplicableSettingsTimeout = null;
    this.setSettings(settings);
    if (!window.io) {
      window.io = () => ({
        on: () => console.warn("Socket script was missing"),
        emit: () => console.warn("Socket script was missing"),
        unavailable: true,
      });
      window.io.unavailable = true;
      this.scriptIoReloadInterval = setInterval(this.reloadScriptIo, 1000);
    }

    this.disconnected = false;

    this.onConnect = [];
    this.onDisconnect = [];
    this.onUser = [];
    this.onUsers = [];
    this.onGames = [];
    this.onTournaments = [];
    this.onPuzzles = [];

    this.bindSocket();
  }

  setSettings(settings) {
    if (settings) {
      this.settings = _.merge(this.constructor.getDefaultSettings(), settings);
    } else {
      this.settings = this.constructor.getDefaultSettings();
    }
    const {applicableSettings, nextUpdatedDate, override, name} = utils.getApplicableSettingsAndNextUpdateDate(this.settings);
    this.applicableSettings = applicableSettings;
    this.applicableSettingsName = name;
    this.applicableSettingsOverride = override;
    if (this.updateApplicableSettingsTimeout) {
      clearTimeout(this.updateApplicableSettingsTimeout);
      this.updateApplicableSettingsTimeout = null;
    }
    if (nextUpdatedDate) {
      const millisecondsUntilUpdate = nextUpdatedDate.diff(moment());
      this.updateApplicableSettingsTimeout = setTimeout(() => {
        this.setSettings(this.settings);
        this.onUser.map(callback => callback(this.user));
      }, millisecondsUntilUpdate);
    }
  }

  bindSocket() {
    this.socket = window.io(process.env.REACT_APP_SERVER_URL);
    this.available = !this.socket.unavailable;
    this.connected = false;
    this.socket.on('connect', this.justConnected);
    this.socket.on('disconnect', this.justDisconnected);
    this.socket.on("reload", this.reload);

    this.user = null;
    this.socket.on("user", this.gotUser);

    this.usersInfo = this.prepareUsers([]);
    this.socket.on("users", this.gotUsers);

    this.openingsDatabase = null;
    this.gamesInfo = this.prepareGames([]);
    this.socket.on("games", this.gotGames);
    this.socket.on("game", this.gotGame);
    this.socket.on("deleted-game", this.gotDeletedGame);
    this.socket.on("openings-database", this.gotOpeningsDatabase);

    this.tournamentsInfo = this.prepareTournaments([]);
    this.socket.on("tournaments", this.gotTournaments);

    this.puzzlesInfo = this.preparePuzzles([]);
    this.socket.on("puzzles", this.gotNonPersonalPuzzles);
    this.socket.on("personal-puzzles", this.gotPersonalPuzzles);

    this.getUser();
  }

  reloadScriptIo = () => {
    if (!window.io.unavailable) {
      clearInterval(this.scriptIoReloadInterval);
      this.scriptIoReloadInterval = null;
      this.bindSocket();
      console.log('Loaded script.io!');
      return;
    }
    const oldScriptEl = document.getElementById('socket-io-script');
    const newScriptEl = document.createElement('script');
    newScriptEl.id = oldScriptEl.id;
    newScriptEl.type = oldScriptEl.type;
    newScriptEl.src = oldScriptEl.src;
    oldScriptEl.remove();
    document.head.append(newScriptEl);
    console.warn('Retrying socket.io script download...');
  };

  subscribe(callbacks) {
    for (const name of ['onConnect', 'onDisconnect', 'onUser', 'onUsers', 'onGames', 'onTournaments', 'onPuzzles']) {
      const callback = callbacks[name];
      if (callback) {
        this[name].push(callback);
      }
    }
  }

  unsubscribe(callbacks) {
    for (const name of ['onConnect', 'onDisconnect', 'onUser', 'onUsers', 'onGames', 'onPuzzles']) {
      const callback = callbacks[name];
      if (callback) {
        _.pull(this[name], callback);
      }
    }
  }

  getUser() {
    this.socket.emit("create-user", {
      appVersion,
      id: this.id,
      name: this.username,
      token: this.token,
      settings: this.settings,
    });
  }

  logIn(name, password, mergeUsers) {
    this.socket.emit("log-in", {appVersion, name, password, mergeUsers});
  }

  logOut() {
    this.socket.emit("log-out");
  }

  reload = () => {
    window.location.reload(true);
  };

  justConnected = () => {
    this.getUser();
    this.connected = true;
    this.onConnect.map(callback => callback(this.connected));
  };

  justDisconnected = () => {
    this.connected = false;
    this.disconnected = true;
    this.onDisconnect.map(callback => callback(this.connected));
  };

  gotUser = user => {
    if (user) {
      this.id = user.id;
      this.username = user.name;
      this.token = user.token;
      this.setSettings(user.settings);
      localStorage.setItem('user-id', this.id);
      localStorage.setItem('user-name', this.username);
      localStorage.setItem('user-token', this.token);
      localStorage.setItem('user-settings', JSON.stringify(this.settings));
    }
    this.user = user;
    this.onUser.map(callback => callback(user));
    this.gotUsers(this.usersInfo.users);
    this.gotPuzzles(this.puzzlesInfo.puzzles);
  };

  changeUsername(name) {
    this.socket.emit("change-username", name);
  }

  changePassword(password) {
    this.socket.emit("change-password", password);
  }

  updateSettings(settings) {
    this.socket.emit("update-settings", settings);
  }

  changeReadyToPlay(readyToPlay) {
    this.socket.emit("change-ready-to-play", readyToPlay);
  }

  gotUsers = users => {
    users = _.orderBy(users, [user => user.isUserRatingProvisional ? 1 : 0, 'score', 'maxScore'], ['asc', 'desc', 'desc']);
    users.forEach((user, index) => {
      user.rank = index + 1;
    });
    this.usersInfo = this.prepareUsers(users);
    this.onUsers.map(callback => callback(this.usersInfo));
  };

  prepareUsers(users) {
    let otherUsers;
    if (this.user) {
      const myIndex = users.findIndex(user => user.id === this.user.id);
      if (myIndex >= 0) {
        otherUsers = users.slice(0, myIndex).concat(users.slice(myIndex + 1));
        users = [users[myIndex], ...otherUsers];
      } else {
        otherUsers = users;
      }
    } else {
      otherUsers = users;
    }
    const byId = _.fromPairs(users.map(user => [user.id, user]));
    const online = users.filter(user => user.online);
    const readyToPlay = online.filter(user => [true, this.user ? this.user.id : true].includes(user.readyToPlay));
    return {
      users,
      byId,
      other: otherUsers,
      online,
      offline: users.filter(user => !user.online),
      readyToPlay,
      readyToPlayMe: readyToPlay.filter(user => this.user && this.user.id === user.readyToPlay),
      challengedUser: this.user ? (byId[this.user.readyToPlay] || null ): null,
    };
  }

  gotGames = games => {
    games = _.sortBy(games, ['startDatetime', 'id'], ['desc', 'desc']);
    this.gamesInfo = this.prepareGames(games);
    this.onGames.map(callback => callback(this.gamesInfo));
  };

  gotGame = game => {
    const games = this.gamesInfo.games.filter(oldGame => oldGame.id !== game.id).concat([game]);
    client.gotGames(games);
  };

  gotDeletedGame = gameId => {
    const games = this.gamesInfo.games.filter(oldGame => oldGame.id !== gameId);
    client.gotGames(games);
  };

  gotOpeningsDatabase = openingsDatabase => {
    this.openingsDatabase = openingsDatabase;
    this.gamesInfo = {
      ...this.gamesInfo,
      openingsDatabase: this.openingsDatabase,
    };
    this.onGames.map(callback => callback(this.gamesInfo));
  };

  prepareGames(games) {
    const live = games.filter(game => !game.finished);
    const finished = games.filter(game => game.finished);
    return {
      games,
      byId: _.fromPairs(games.map(game => [game.id, game])),
      live,
      myLive: this.user ? live.filter(game => game.userIds.includes(this.user.id)) : [],
      otherLive: this.user ? live.filter(game => !game.userIds.includes(this.user.id)) : live,
      finished,
      myFinished: this.user ? finished.filter(game => game.userIds.includes(this.user.id)) : [],
      otherFinished: this.user ? finished.filter(game => !game.userIds.includes(this.user.id)) : live,
      mine: this.user ? games.filter(game => game.userIds.includes(this.user.id)) : [],
      openingsDatabase: this.openingsDatabase,
    };
  }

  submitGameMove(game, moves) {
    this.socket.emit("submit-game-moves", {id: game.id, moves});
  }

  createTournament(data) {
    this.socket.emit("create-tournament", data);
  }

  joinTournament(tournament) {
    this.socket.emit("join-tournament", tournament.id);
  }

  leaveTournament(tournament) {
    this.socket.emit("leave-tournament", tournament.id);
  }

  startTournament(tournament) {
    this.socket.emit("start-tournament", tournament.id);
  }

  abortTournament(tournament) {
    this.socket.emit("abort-tournament", tournament.id);
  }

  gotTournaments = tournaments => {
    tournaments = _.sortBy(tournaments, ['startDatetime', 'endDatetime', 'createdDatetime', 'id'], ['desc', 'desc', 'desc', 'desc']);
    this.tournamentsInfo = this.prepareTournaments(tournaments);
    this.onTournaments.map(callback => callback(this.tournamentsInfo));
  };

  prepareTournaments(tournaments) {
    const future = tournaments.filter(tournament => !tournament.started);
    const live = tournaments.filter(tournament => tournament.started && !tournament.finished);
    const futureAndLive = future.concat(live);
    const finished = tournaments.filter(tournament => tournament.finished);
    return {
      tournaments,
      byId: _.fromPairs(tournaments.map(game => [game.id, game])),
      future, live, futureAndLive, finished,
      myFuture: this.user ? future.filter(tournament => tournament.userIds.includes(this.user.id)) : [],
      myLive: this.user ? live.filter(tournament => tournament.userIds.includes(this.user.id)) : [],
      myFutureAndLive: this.user ? futureAndLive.filter(tournament => tournament.userIds.includes(this.user.id)) : [],
      myFinished: this.user ? finished.filter(tournament => tournament.userIds.includes(this.user.id)) : [],
      otherFuture: this.user ? live.filter(tournament => !tournament.userIds.includes(this.user.id)) : live,
      otherLive: this.user ? future.filter(tournament => !tournament.userIds.includes(this.user.id)) : future,
      otherFutureAndLive: this.user ? futureAndLive.filter(tournament => !tournament.userIds.includes(this.user.id)) : future,
      otherFinished: this.user ? finished.filter(tournament => !tournament.userIds.includes(this.user.id)) : finished,
      mine: this.user ? tournaments.filter(tournament => tournament.userIds.includes(this.user.id)) : [],
    };
  }

  createPuzzle(puzzle) {
    this.socket.emit('create-puzzle', puzzle);
  }

  updatePuzzle(puzzle) {
    this.socket.emit('update-puzzle', puzzle);
  }

  submitPuzzleMove(puzzle, path) {
    this.socket.emit("submit-puzzle-moves", {id: puzzle.id, path});
  }

  gotPuzzles = puzzles => {
    for (const puzzle of puzzles) {
      puzzle.meta.publishDatetime = puzzle.meta.publishDatetime ? moment(puzzle.meta.publishDatetime) : null;
      puzzle.meta.createdDatetime = puzzle.meta.createdDatetime ? moment(puzzle.meta.createdDatetime) : null;
    }
    puzzles = _.sortBy(puzzles, [
      puzzle => puzzle.meta.publishDatetime ? puzzle.meta.publishDatetime.toISOString() : null,
      puzzle => puzzle.meta.createdDatetime ? puzzle.meta.createdDatetime.toISOString() : null,
      'id',
    ], ['desc', 'desc', 'desc']);
    this.puzzlesInfo = this.preparePuzzles(puzzles);
    this.onPuzzles.map(callback => callback(this.puzzlesInfo));
  };

  gotNonPersonalPuzzles = nonPersonalPuzzles => {
    const personalPuzzlesIds = this.puzzlesInfo.mine.map(puzzle => puzzle.id);
    this.gotPuzzles(nonPersonalPuzzles.filter(puzzle => !personalPuzzlesIds.includes(puzzle.id)).concat(this.puzzlesInfo.mine));
  };

  gotPersonalPuzzles = personalPuzzles => {
    const personalPuzzlesIds = personalPuzzles.map(puzzle => puzzle.id);
    this.gotPuzzles(personalPuzzles.concat(this.puzzlesInfo.other.filter(puzzle => !personalPuzzlesIds.includes(puzzle.id))));
  };

  preparePuzzles(puzzles) {
    const otherPuzzles = this.user ? puzzles.filter(puzzle => puzzle.userId !== this.user.id) : puzzles;
    const myPuzzles = this.user ? puzzles.filter(puzzle => puzzle.userId === this.user.id) : [];
    return {
      puzzles,
      public: puzzles.filter(puzzle => puzzle.meta.public && puzzle.meta.publishDatetime.isSameOrBefore()),
      private: puzzles.filter(puzzle => !puzzle.meta.public || puzzle.meta.publishDatetime.isAfter()),
      byId: _.fromPairs(puzzles.map(game => [game.id, game])),
      byGameId: this.user ? _.groupBy(puzzles.filter(puzzle => (
        puzzle.meta.gameId
        && (puzzle.userId === this.user.id || (this.user.puzzlesStats[puzzle.id] && this.user.puzzlesStats[puzzle.id].meta.won))
      )), puzzle => puzzle.meta.gameId) : {},
      mine: myPuzzles,
      myPublic: myPuzzles.filter(puzzle => puzzle.meta.public && puzzle.meta.publishDatetime.isSameOrBefore()),
      myPublicUnattempted: myPuzzles.filter(puzzle => puzzle.meta.public && puzzle.meta.publishDatetime.isSameOrBefore() && !puzzle.usersStats.attempted),
      myPrivate: myPuzzles.filter(puzzle => !puzzle.meta.public || puzzle.meta.publishDatetime.isAfter()),
      other: otherPuzzles,
      otherSolved: this.user ? otherPuzzles.filter(puzzle => this.user.puzzles[puzzle.id] && this.user.puzzles[puzzle.id].meta.won) : [],
      otherUnsolved: this.user ? otherPuzzles.filter(puzzle => !this.user.puzzles[puzzle.id] || !this.user.puzzles[puzzle.id].meta.won) : otherPuzzles,
      otherStarted: this.user ? otherPuzzles.filter(puzzle => this.user.puzzles[puzzle.id] && this.user.puzzles[puzzle.id].meta.started && !this.user.puzzles[puzzle.id].meta.won) : [],
      otherNotStarted: this.user ? otherPuzzles.filter(puzzle => !this.user.puzzles[puzzle.id] || !this.user.puzzles[puzzle.id].meta.started) : otherPuzzles,
    };
  }
}

export const client = new Client();
window.client = client;

export default Client;
