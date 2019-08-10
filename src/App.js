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

class App extends Component {
  state = {
    liveGame: null,
  };

  selectLiveGame = liveGame => {
    if (this.state.liveGame === liveGame) {
      return;
    }
    this.setState({liveGame});
    if (liveGame) {
      const gameUrl = `/game/${liveGame.id}`;
      if (gameUrl !== this.props.location.pathname) {
        this.props.history.push(gameUrl);
      }
    }
  };

  render() {
    const {user, liveGame} = this.state;
    const onlineGameLabel = liveGame
      ? (liveGame.finished
        ? 'Review'
        : (user && liveGame.userIds.includes(user.id)
          ? 'Live Play'
          : 'Spectate'))
      : 'Live Play/Spectate/Review';
    return (
      <Container text>
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
};

export default withRouter(App);
