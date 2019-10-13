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
    challengesInfo: client.challengesInfo,
  };

  componentDidMount() {
    client.subscribe({
      onConnect: this.connectionChanged,
      onDisconnect: this.connectionChanged,
      onUser: this.gotUser,
      onUsers: this.gotUsers,
      onGames: this.gotGames,
      onTournaments: this.gotTournaments,
      onChallenges: this.gotChallenges,
    });
  }

  componentWillUnmount() {
    client.unsubscribe({
      onUser: this.gotUser,
      onUsers: this.gotUsers,
      onGames: this.gotGames,
      onTournaments: this.gotTournaments,
      onChallenges: this.gotChallenges,
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

  gotChallenges = challengesInfo => {
    this.setState({challengesInfo});
  };

  render() {
    const {connected, disconnected, available, user, usersInfo, gamesInfo, tournamentsInfo, challengesInfo} = this.state;
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
        challengesInfo={challengesInfo}
      />
    )
  }
}

export const withClient = Component => {
  return ClientWatcher.forComponent(Component);
};
