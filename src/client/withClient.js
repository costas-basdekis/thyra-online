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
    connected: client.connected,
    available: client.available,
    disconnected: client.disconnected,
    user: client.user,
    username: client.user ? client.user.name : null,
    usersInfo: client.usersInfo,
    gamesInfo: client.gamesInfo,
    tournamentsInfo: client.tournamentsInfo,
    puzzlesInfo: client.puzzlesInfo,
  };

  componentDidMount() {
    client.subscribe({
      onConnect: this.connectionChanged,
      onDisconnect: this.connectionChanged,
      onUser: this.gotUser,
      onUsers: this.gotUsers,
      onGames: this.gotGames,
      onTournaments: this.gotTournaments,
      onPuzzles: this.gotPuzzles,
    });
  }

  componentWillUnmount() {
    client.unsubscribe({
      onUser: this.gotUser,
      onUsers: this.gotUsers,
      onGames: this.gotGames,
      onTournaments: this.gotTournaments,
      onPuzzles: this.gotPuzzles,
    });
  }

  connectionChanged = connected => {
    this.setState({connected, disconnected: client.disconnected, available: client.available});
  };

  gotUser = user => {
    this.setState({user});
  };

  gotUsers = usersInfo => {
    this.setState({usersInfo});
  };

  gotGames = gamesInfo => {
    this.setState({gamesInfo});
  };

  gotTournaments = tournamentsInfo => {
    this.setState({tournamentsInfo});
  };

  gotPuzzles = puzzlesInfo => {
    this.setState({puzzlesInfo});
  };

  render() {
    const {connected, disconnected, available, user, usersInfo, gamesInfo, tournamentsInfo, puzzlesInfo} = this.state;
    const SubComponent = this.constructor.SubComponent;
    return (
      <SubComponent
        {...this.props}
        connected={connected}
        disconnected={disconnected}
        available={available}
        client={client}
        user={user}
        usersInfo={usersInfo}
        gamesInfo={gamesInfo}
        tournamentsInfo={tournamentsInfo}
        puzzlesInfo={puzzlesInfo}
      />
    )
  }
}

export const withClient = Component => {
  return ClientWatcher.forComponent(Component);
};
