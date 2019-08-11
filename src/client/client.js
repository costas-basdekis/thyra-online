import _ from "lodash";

const appVersion = 1;

class Client {
  constructor() {
    this.id = localStorage.getItem('user-id') || null;
    this.password = localStorage.getItem('user-password') || null;
    if (!window.io) {
      window.io = () => ({
        on: () => console.warn("Socket script was missing"),
        emit: () => console.warn("Socket script was missing"),
        unavailable: true,
      });
    }
    this.socket = window.io(process.env.REACT_APP_SERVER_URL);
    this.available = !this.socket.unavailable;
    this.socket.on('connect', () => {
      this.getUser();
    });
    this.socket.on('disconnect', () => {
      this.gotUser(null);
      this.gotUsers([]);
    });
    this.socket.on("reload", this.reload);

    this.user = null;
    this.onUser = [];
    this.socket.on("user", this.gotUser);

    this.usersInfo = this.prepareUsers([]);
    this.onUsers = [];
    this.socket.on("users", this.gotUsers);

    this.gamesInfo = this.prepareGames([]);
    this.onGames = [];
    this.socket.on("games", this.gotGames);

    this.getUser();
  }

  subscribe(callbacks) {
    for (const name of ['onUser', 'onUsers', 'onGames']) {
      const callback = callbacks[name];
      if (callback) {
        this[name].push(callback);
      }
    }
  }

  unsubscribe(callbacks) {
    for (const name of ['onUser', 'onUsers', 'onGames']) {
      const callback = callbacks[name];
      if (callback) {
        _.pull(this[name], callback);
      }
    }
  }

  getUser() {
    this.socket.emit("create-user", {appVersion, id: this.id, password: this.password});
  }

  reload = () => {
    window.location.reload(true);
  };

  gotUser = user => {
    if (user) {
      this.id = user.id;
      this.password = user.password;
      localStorage.setItem('user-id', this.id);
      localStorage.setItem('user-password', this.password);
    }
    this.user = user;
    this.onUser.map(callback => callback(user));
    this.gotUsers(this.usersInfo.users);
  };

  changeUsername(name) {
    this.socket.emit("change-username", name);
  }

  updateSettings(settings) {
    this.socket.emit("update-settings", settings);
  }

  changeReadyToPlay(checked) {
    this.socket.emit("change-ready-to-play", !!checked);
  }

  gotUsers = users => {
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
    return {
      users,
      byId: _.fromPairs(users.map(user => [user.id, user])),
      other: otherUsers,
      online: users.filter(user => user.online),
      offline: users.filter(user => !user.online),
    };
  }

  gotGames = games => {
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
