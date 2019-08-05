class Client {
  constructor() {
    this.socket = window.io("http://localhost:4000");
    this.socket.on('disconnect', () => {
      this.gotUser(null);
      this.gotUsers([]);
    });

    this.user = null;
    this.onUser = null;
    this.socket.on("user", this.gotUser);

    this.users = [];
    this.onUsers = null;
    this.socket.on("users", this.gotUsers);

    this.getUser();
  }

  getUser() {
    this.socket.emit("create-user");
  }

  gotUser = user => {
    this.user = user;
    if (this.onUser) {
      this.onUser(user);
    }
  };

  changeUsername(name) {
    this.socket.emit("change-username", name);
  }

  gotUsers = users => {
    this.users = users;
    if (this.onUsers) {
      this.onUsers(users);
    }
  };
}

export const client = new Client();

export default Client;
