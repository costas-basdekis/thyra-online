class Client {
  constructor() {
    this.id = localStorage.getItem('user-id') || null;
    this.password = localStorage.getItem('user-password') || null;
    this.socket = window.io("http://localhost:4000");
    this.socket.on('connect', () => {
      this.getUser();
    });
    this.socket.on('disconnect', () => {
      this.gotUser(null);
      this.gotUsers([]);
    });

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
    this.socket.emit("create-user", {id: this.id, password: this.password});
  }

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
}

export const client = new Client();

export default Client;
