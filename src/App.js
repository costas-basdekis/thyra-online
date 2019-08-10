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

class App extends Component {
  state = {
    liveGame: null,
  };

  selectLiveGame = liveGame => {
    let gameUrl;
    if (liveGame) {
      gameUrl = `/game/${liveGame.id}`;
    } else {
      gameUrl = '/lobby';
    }
    if (gameUrl !== this.props.location.pathname) {
      this.props.history.push(gameUrl);
    }
    if (this.state.liveGame === liveGame) {
      return;
    }
    this.setState({liveGame});
  };

  render() {
    const {liveGame} = this.state;
    const {user, usersInfo: {byId: usersById}} = this.props;
    const playerA = liveGame ? usersById[liveGame.userIds[0]] : null;
    const playerB = liveGame ? usersById[liveGame.userIds[1]] : null;
    const isUserPlayerA = (user && playerA) ? playerA.id === user.id : false;
    const isUserPlayerB = (user && playerB) ? playerB.id === user.id : false;
    const isMyGame = isUserPlayerA || isUserPlayerB;
    const onlineGameLabel = liveGame
      ? (liveGame.finished
        ? `Review ${isUserPlayerA ? 'you' : playerA.name} vs ${isUserPlayerB ? 'you' : playerB.name}`
        : (isMyGame
          ? `Live Play ${isUserPlayerA ? 'you' : playerA.name} vs ${isUserPlayerB ? 'you' : playerB.name}`
          : `Spectate ${isUserPlayerA ? 'you' : playerA.name} vs ${isUserPlayerB ? 'you' : playerB.name}`))
      : 'Live Play/Spectate/Review';
    return (
      <Container>
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
