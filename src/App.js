import React, {Component} from 'react';
import 'fomantic-ui-css/semantic.css';
import {Container, Header, Segment, Tab} from 'semantic-ui-react';
import './styles/App.css';
import {client} from "./client/client";
import NavigationalTab from "./components/NavigationalTab";
import {Route, BrowserRouter, Switch} from "react-router-dom";
import Hotseat from "./components/Hotseat";
import Lobby from "./components/Lobby";
import OnlineGame from "./components/OnlineGame";

class App extends Component {
  state = {
    liveGame: null,
  };

  selectLiveGame = liveGame => {
    this.setState({liveGame});
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
        <BrowserRouter>
          <Switch>
            <Route path={''}>
              <NavigationalTab menu={{pointing: true, attached: false}} panes={[
                client.available ? {menuItem: 'Lobby', path: 'lobby', render: () => (
                  <Tab.Pane><Lobby selectLiveGame={this.selectLiveGame} /></Tab.Pane>
                )} : null,
                client.available ? {menuItem: onlineGameLabel, path: 'game', render: () => (
                  <Tab.Pane><OnlineGame game={liveGame} /></Tab.Pane>
                )} : null,
                {menuItem: 'Hotseat', path: 'hotseat', render: () => (
                  <Tab.Pane><Hotseat /></Tab.Pane>
                )},
              ]} />
            </Route>
          </Switch>
        </BrowserRouter>
      </Container>
    );
  }
}

export default App;
