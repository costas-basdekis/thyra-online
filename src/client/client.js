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
    this.onUser = null;
    this.socket.on("user", this.gotUser);

    this.users = [];
    this.usersById = {};
    this.onUsers = null;
    this.socket.on("users", this.gotUsers);

    this.games = [];
    this.onGames = null;
    this.socket.on("games", this.gotGames);

    this.getUser();
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
    if (this.onUser) {
      this.onUser(user);
    }
  };

  changeUsername(name) {
    this.socket.emit("change-username", name);
  }

  changeReadyToPlay(checked) {
    this.socket.emit("change-ready-to-play", !!checked);
  }

  gotUsers = users => {
    this.users = users;
    this.usersById = {};
    for (const user of this.users) {
      this.usersById[user.id] = user;
    }
    if (this.onUsers) {
      this.onUsers(users, this.usersById);
    }
  };

  gotGames = games => {
    this.games = games;
    if (this.onGames) {
      this.onGames(games);
    }
  };

  submitGameMove(game, moves) {
    this.socket.emit("submit-game-moves", {id: game.id, moves});
  }
}

export const client = new Client();

export default Client;
