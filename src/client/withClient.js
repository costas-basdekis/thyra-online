import React, {Component} from 'react';
import {client} from "./client";

class ClientWatcher extends Component {
  static SubComponent = null;

  static forComponent(Component) {
    class ClientWatcherForComponent extends this {
      static SubComponent = Component;
    }

    return ClientWatcherForComponent;
  }

  state = {
    user: client.user,
    username: client.user ? client.user.name : null,
    usersInfo: client.usersInfo,
    gamesInfo: client.gamesInfo,
  };

  componentDidMount() {
    client.subscribe({
      onUser: this.gotUser,
      onUsers: this.gotUsers,
      onGames: this.gotGames,
    });
  }

  componentWillUnmount() {
    client.unsubscribe({
      onUser: this.gotUser,
      onUsers: this.gotUsers,
      onGames: this.gotGames,
    });
  }

  gotUser = user => {
    this.setState({user});
  };

  gotUsers = usersInfo => {
    this.setState({usersInfo});
  };

  gotGames = gamesInfo => {
    this.setState({gamesInfo});
  };

  render() {
    const {user, usersInfo, gamesInfo} = this.state;
    const SubComponent = this.constructor.SubComponent;
    return (
      <SubComponent
        {...this.props}
        client={client}
        user={user}
        usersInfo={usersInfo}
        gamesInfo={gamesInfo}
      />
    )
  }
}

export const withClient = Component => {
  return ClientWatcher.forComponent(Component);
};
