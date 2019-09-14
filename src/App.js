import React, {Component} from 'react';
import PropTypes from 'prop-types';
import 'fomantic-ui-css/semantic.css';
import {Container, Header, Segment, Tab} from 'semantic-ui-react';
import './styles/App.css';
import {client} from "./client/client";
import NavigationalTab from "./components/NavigationalTab";
import {withRouter} from "react-router-dom";
import Hotseat from "./components/Hotseat";
import Lobby from "./components/Lobby";
import OnlineGame from "./components/OnlineGame";
import {withClient} from "./client/withClient";
import services from "./services";
import SvgBoardBackground from "./components/Board/SvgBoardBackground";

class App extends Component {
  state = {
    liveGame: null,
  };

  getLiveGameUrl(game) {
    return `${this.props.match.url.endsWith('/') ? this.props.match.url.slice(0, -1) : this.props.match.url}/game/${game.id}`;
  }

  selectLiveGame = liveGame => {
    let gameUrl;
    if (liveGame) {
      gameUrl = this.getLiveGameUrl(liveGame);
    } else {
      gameUrl = `${this.props.match.url.endsWith('/') ? this.props.match.url.slice(0, -1) : this.props.match.url}/lobby`;
    }
    if (gameUrl !== this.props.location.pathname) {
      this.props.history.push(gameUrl);
    }
    if (this.state.liveGame === liveGame) {
      return;
    }
    this.setState({liveGame});
  };

  componentDidUpdate(prevProps) {
    this.askForNotificationPermissionOnWaitForGame(prevProps);
    this.navigateToMyNewGame(prevProps);
    this.notifyAboutMyMove(prevProps);
  }

  askForNotificationPermissionOnWaitForGame(prevProps) {
    const user = this.props.user;
    if (!user) {
      return;
    }
    if ((!prevProps.user || !prevProps.user.readyToPlay) && (user && user.readyToPlay) && user.settings.enableNotifications) {
      services.notifications.requestPermission();
    }
  }

  navigateToMyNewGame(prevProps) {
    const user = this.props.user;
    if (!user) {
      return
    }

    if (prevProps.gamesInfo.myLive === this.props.gamesInfo.myLive) {
      return;
    }

    if (this.state.liveGame && !this.state.liveGame.finished) {
      return;
    }

    const previousMyLiveGameIds = new Set(prevProps.gamesInfo.myLive.map(game => game.id));
    const myLiveGameIds = this.props.gamesInfo.myLive.map(game => game.id);
    const newMyLiveGameIds = myLiveGameIds.filter(id => !previousMyLiveGameIds.has(id));
    if (newMyLiveGameIds.length !== 1) {
      return;
    }

    const newGame = this.props.gamesInfo.byId[newMyLiveGameIds[0]];
    if (newGame.move === 1) {
      const otherUserId = newGame.userIds[0] === user.id ? newGame.userIds[1] : (newGame.userIds[1] === user.id ? newGame.userIds[0] : null);
      const otherUser = this.props.usersInfo.byId[otherUserId];
      services.notifications.notify(otherUser ? `New game vs ${otherUser.name} started` : `New game started`);
    }
    if (newGame.move === 1) {
      this.selectLiveGame(newGame);
    }
  }

  notifyAboutMyMove(prevProps) {
    const user = this.props.user;
    if (!user) {
      return;
    }
    if (!this.props.gamesInfo.myLive.length) {
      return;
    }
    const gamesThatChangedToMyTurn = this.props.gamesInfo.myLive
      .filter(game => game.nextUserId === user.id)
      .filter(game => {
        const prevGame = prevProps.gamesInfo.byId[game.id];
        return prevGame && prevGame.nextUserId !== user.id;
      });
    if (!gamesThatChangedToMyTurn.length) {
      return;
    }

    const otherUsers = gamesThatChangedToMyTurn.map(game => {
      const otherUserId = game.userIds[0] === user.id ? game.userIds[1] : (game.userIds[1] === user.id ? game.userIds[0] : null);
      const otherUser = this.props.usersInfo.byId[otherUserId];
      return otherUser;
    });
    const otherUser = otherUsers.length === 1 ? otherUsers[0] : null;
    services.notifications.notify(otherUser ? `Your turn at game vs ${otherUser.name}` : `It's your turn to play in ${gamesThatChangedToMyTurn.length}`, {
      tag: 'your-turn',
      body: `It's your turn to play in ${gamesThatChangedToMyTurn.length} games`,
    });
  }

  render() {
    const {liveGame} = this.state;
    const {user, usersInfo: {byId: usersById}} = this.props;
    const playerA = liveGame ? usersById[liveGame.userIds[0]] : null;
    const playerB = liveGame ? usersById[liveGame.userIds[1]] : null;
    const isUserPlayerA = (user && playerA) ? playerA.id === user.id : false;
    const isUserPlayerB = (user && playerB) ? playerB.id === user.id : false;
    const isMyGame = isUserPlayerA || isUserPlayerB;
    const onlineGameLabel = (liveGame && playerA && playerB)
      ? (liveGame.finished
        ? `Review ${isUserPlayerA ? 'you' : playerA.name} vs ${isUserPlayerB ? 'you' : playerB.name}`
        : (isMyGame
          ? `Live Play ${isUserPlayerA ? 'you' : playerA.name} vs ${isUserPlayerB ? 'you' : playerB.name}`
          : `Spectate ${isUserPlayerA ? 'you' : playerA.name} vs ${isUserPlayerB ? 'you' : playerB.name}`))
      : 'Live Play/Spectate/Review';
    return (
      <Container>
        <SvgBoardBackground.Definitions />
        <Segment textAlign={"center"}>
          <Header as={"h1"}>Thyra Online</Header>
        </Segment>
          <NavigationalTab menu={{pointing: true, attached: false}} panes={[
            client.available ? {menuItem: 'Lobby', path: 'lobby', render: () => (
              <Tab.Pane><Lobby selectLiveGame={this.selectLiveGame} /></Tab.Pane>
            )} : null,
            client.available ? {menuItem: onlineGameLabel, path: 'game', navigate: liveGame ? `game/${liveGame.id}` : 'game', render: () => (
              <Tab.Pane><OnlineGame game={liveGame} selectLiveGame={this.selectLiveGame} /></Tab.Pane>
            )} : null,
            {menuItem: 'Hotseat', path: 'hotseat', render: () => (
              <Tab.Pane><Hotseat /></Tab.Pane>
            )},
          ]} />
          <Header as={"h6"} style={{color: '#dddddd'}}>{process.env.REACT_APP_VERSION || '?'}</Header>
      </Container>
    );
  }
}

App.propTypes = {
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  user: PropTypes.object,
  usersInfo: PropTypes.object.isRequired,
};

export default withRouter(withClient(App));
