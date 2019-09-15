import _ from "lodash";

const appVersion = 3;

class Client {
  static getDefaultSettings() {
    return JSON.parse(JSON.stringify({
      autoSubmitMoves: false,
      enableNotifications: false,
      theme: {pieces: 'king', scheme: '', rotateOpponent: true, numbers: ''},
    }));
  }

  scriptIoReloadInterval = null;

  constructor() {
    this.id = localStorage.getItem('user-id') || null;
    this.username = localStorage.getItem('user-name') || null;
    const password = localStorage.getItem('user-password') || null;
    localStorage.removeItem('user-password');
    this.token = localStorage.getItem('user-token') || password;
    const localSettings = localStorage.getItem('user-settings') || 'null';
    try {
      this.settings = JSON.parse(localSettings);
    } catch (e) {
      this.settings = null;
    }
    if (!this.settings) {
      this.settings = this.constructor.getDefaultSettings();
    }
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

    this.bindSocket();
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

    this.gamesInfo = this.prepareGames([]);
    this.socket.on("games", this.gotGames);

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
    for (const name of ['onConnect', 'onDisconnect', 'onUser', 'onUsers', 'onGames']) {
      const callback = callbacks[name];
      if (callback) {
        this[name].push(callback);
      }
    }
  }

  unsubscribe(callbacks) {
    for (const name of ['onConnect', 'onDisconnect', 'onUser', 'onUsers', 'onGames']) {
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
      this.settings = user.settings;
      localStorage.setItem('user-id', this.id);
      localStorage.setItem('user-name', this.username);
      localStorage.setItem('user-token', this.token);
      localStorage.setItem('user-settings', JSON.stringify(this.settings));
    }
    this.user = user;
    this.onUser.map(callback => callback(user));
    this.gotUsers(this.usersInfo.users);
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
    games = _.orderBy(games, ['startDatetime', 'id'], ['desc', 'desc']);
    this.gamesInfo = this.prepareGames(games);
    this.onGames.map(callback => callback(this.gamesInfo));
  };

  prepareGames(games) {
    const live = games.filter(game => !game.finished);
    return {
      games,
      byId: _.fromPairs(games.map(game => [game.id, game])),
      live,
      myLive: this.user ? live.filter(game => game.userIds.includes(this.user.id)) : [],
      otherLive: this.user ? live.filter(game => !game.userIds.includes(this.user.id)) : live,
      finished: games.filter(game => game.finished),
      mine: this.user ? games.filter(game => game.userIds.includes(this.user.id)) : [],
    };
  }

  submitGameMove(game, moves) {
    this.socket.emit("submit-game-moves", {id: game.id, moves});
  }
}

export const client = new Client();

export default Client;
