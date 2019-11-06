import React, {Component} from 'react';
import PropTypes from 'prop-types';
import 'fomantic-ui-css/semantic.css';
import {Container, Header, Label, Message, Segment, Tab} from 'semantic-ui-react';
import './styles/App.css';
import './styles/semantic-ui.css';
import {client} from "./client/client";
import NavigationalTab from "./components/NavigationalTab";
import {withRouter} from "react-router-dom";
import Hotseat from "./components/Hotseat";
import Lobby, {EditUser, LogIn, LogOut} from "./components/Lobby";
import OnlineGame from "./components/OnlineGame";
import {withClient} from "./client/withClient";
import services from "./services";
import SvgBoardBackground from "./components/Board/SvgBoardBackground";
import OnlineTournament from "./components/OnlineTournament";
import Settings from "./components/Settings";
import LearnToPlay from "./components/LearnToPlay";
import Puzzles from "./components/Puzzles";
import * as utils from "./utils";
import OpeningsDatabase from "./components/OpeningsDatabase";
import moment from "moment";

class App extends Component {
  state = {
    liveGame: null,
    liveTournament: null,
    livePuzzle: null,
  };

  selectLiveGame = liveGame => {
    let gameUrl;
    if (liveGame) {
      gameUrl = `/game/${liveGame.id}`;
    } else {
      gameUrl = '/game';
    }
    if (gameUrl !== this.props.location.pathname) {
      this.props.history.push(gameUrl);
    }
    if (this.state.liveGame === liveGame) {
      return;
    }
    this.setState({liveGame});
  };

  selectLiveTournament = liveTournament => {
    let tournamentUrl;
    if (liveTournament) {
      tournamentUrl = `/tournament/${liveTournament.id}`;
    } else {
      tournamentUrl = `/tournament`;
    }
    if (tournamentUrl !== this.props.location.pathname) {
      this.props.history.push(tournamentUrl);
    }
    if (this.state.liveTournament === liveTournament) {
      return;
    }
    this.setState({liveTournament});
  };

  selectLivePuzzle = livePuzzle => {
    let puzzleUrl;
    if (livePuzzle) {
      puzzleUrl = `/puzzle/${livePuzzle.id}`;
    } else {
      puzzleUrl = `/puzzle`;
    }
    if (puzzleUrl !== this.props.location.pathname) {
      this.props.history.push(puzzleUrl);
    }
    if (this.state.livePuzzle === livePuzzle) {
      return;
    }
    this.setState({livePuzzle});
  };

  toggleParticipation = tournament => {
    const {user, client} = this.props;

    if (tournament.userIds.includes(user.id)) {
      client.leaveTournament(tournament);
    } else {
      client.joinTournament(tournament);
    }
  };

  startTournament = tournament => {
    const {client} = this.props;

    client.startTournament(tournament);
  };

  abortTournament = tournament => {
    const {client} = this.props;

    client.abortTournament(tournament);
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
    if (newGame.move === 1 && moment(newGame.startDatetime).isSameOrAfter(moment().subtract(10, 's'))) {
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
    const {liveGame, liveTournament, livePuzzle} = this.state;
    const {connected, disconnected, available, user, usersInfo: {byId: usersById}} = this.props;
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
    const isMyTournament = (liveTournament && user) ? liveTournament.userIds.includes(user.id) : false;
    const onlineTournamentLabel = liveTournament
      ? (liveTournament.finished
        ? `Review tournament ${liveTournament.name}`
        : (isMyTournament
          ? `Live tournament ${liveTournament.name}`
          : `Spectate tournament ${liveTournament.name}`))
      : 'Tournaments';
    return (
      <Container>
        <SvgBoardBackground.Definitions />
        <Segment textAlign={"center"}>
          <Header as={"h1"}>Thyra Online</Header>
          <Settings/>
          <LogIn client={client} />
          {user ? <EditUser client={client} user={user} trigger={<Label as={'a'} icon={'edit'} content={'Edit'}/>} /> : null}
          <LogOut client={client} />
        </Segment>
        {!connected ? (
          (disconnected || !available) ? (
            <Message
              negative
              header={'Trying to connect ot server...'}
              content={<p>The server seems to be experiencing problems, or maybe it's a bit slow. It will connect as soon as possible</p>}
            />
          ) : (
            <Message
              header={'Connecting to server...'}
              content={<p>Please sit tight as we're trying to connect to the server</p>}
            />
          )
        ) : null}
        <NavigationalTab menu={{pointing: true, attached: false, stackable: true}} panes={[
          client.available ? {menuItem: {icon: 'users', content: 'Lobby'}, path: 'lobby', render: () => (
            <Tab.Pane><Lobby selectLiveGame={this.selectLiveGame} selectLiveTournament={this.selectLiveTournament} selectLivePuzzle={this.selectLivePuzzle} /></Tab.Pane>
          )} : null,
          client.available ? {menuItem: {icon: 'play', content: onlineGameLabel}, path: 'game', navigate: liveGame ? `game/${liveGame.id}` : 'game', render: () => (
            <Tab.Pane><OnlineGame game={liveGame} selectLiveGame={this.selectLiveGame} /></Tab.Pane>
          )} : null,
          {menuItem: {icon: 'database', content: 'Openings Database'}, path: 'openings-database', render: () => (
            <Tab.Pane><OpeningsDatabase selectLiveGame={this.selectLiveGame} /></Tab.Pane>
          )},
          client.available ? {menuItem: {icon: 'sitemap', content: onlineTournamentLabel}, path: 'tournament', navigate: liveTournament ? `tournament/${liveTournament.id}` : 'tournament', render: () => (
            <Tab.Pane>
              <OnlineTournament
                tournament={liveTournament}
                selectLiveTournament={this.selectLiveTournament}
                selectLiveGame={this.selectLiveGame}
                toggleParticipation={this.toggleParticipation}
                startTournament={this.startTournament}
                abortTournament={this.abortTournament}
              />
            </Tab.Pane>
          )} : null,
          {menuItem: {icon: 'retweet', content: 'Hotseat'}, path: 'hotseat', render: () => (
            <Tab.Pane><Hotseat /></Tab.Pane>
          )},
          {menuItem: {icon: 'puzzle', content: livePuzzle ? utils.getPuzzleTitle(livePuzzle) : 'Puzzles'},
          path: 'puzzle',
          navigate: livePuzzle ? `puzzle/${livePuzzle.id}` : 'puzzle',
          render: () => (
            <Tab.Pane>
              <Puzzles
                puzzle={livePuzzle}
                selectLiveGame={this.selectLiveGame}
                selectLivePuzzle={this.selectLivePuzzle}
              />
            </Tab.Pane>
          )},
          {menuItem: {icon: 'book', content: 'Learn To Play'}, path: 'learn-to-play', render: () => (
            <Tab.Pane><LearnToPlay /></Tab.Pane>
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
