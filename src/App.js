import React, {Component, Fragment} from 'react';
import 'fomantic-ui-css/semantic.css';
import {Button, Checkbox, Container, Header, Icon, Input, Label, List, Segment, Tab} from 'semantic-ui-react';
import './styles/App.css';
import Game from "./game/game";
import Play from "./components/play";
import {client} from "./client/client";

class App extends Component {
  state = {
    game: Game.create(),
    user: client.user,
    username: client.user ? client.user.name : null,
    users: client.users,
    usersById: client.usersById,
    games: client.games,
  };

  componentDidMount() {
    client.onUser = user => {
      this.setState({user, username: user ? user.name : null});
    };
    client.onUsers = (users, usersById) => {
      if (this.state.user) {
        const myIndex = users.findIndex(user => user.id === this.state.user.id);
        if (myIndex >= 0) {
          users = [users[myIndex], ...users.slice(0, myIndex), ...users.slice(myIndex + 1)];
        }
      }
      this.setState({users, usersById});
    };
    client.onGames = games => {
      this.setState({games});
    };
  }

  componentWillUnmount() {
    client.onUser = null;
    client.onUsers = null;
    client.onGames = null;
  }

  makeMove = newGame => {
    this.setState({game: newGame});
  };

  changeUsername = ({target: {value}}) => {
    this.setState({username: value});
  };

  updateUsername = () => {
    client.changeUsername(this.state.username);
  };

  changeReadyToPlay = (e, {checked}) => {
    client.changeReadyToPlay(checked);
  };

  render() {
    const {game, user, username, users, usersById, games} = this.state;
    return (
      <Container text>
        <Segment textAlign={"center"}>
          <Header as={"h1"}>Thyra Online</Header>
        </Segment>
        <Tab menu={{pointing: true}} panes={[
          { menuItem: 'Live Play', render: () => (
            <Tab.Pane attached={false}>
              {user ? (
                <Fragment>
                  Welcome
                  <Input value={username} onChange={this.changeUsername} />
                  <Button onClick={this.updateUsername}>Change</Button>
                  <br />
                  <Checkbox label={"Ready to play?"} checked={user.readyToPlay} onChange={this.changeReadyToPlay} />
                  <Tab menu={{pointing: true}} panes={[
                    {menuItem: `${users.length} users`, render: () => (
                      <List bulleted>
                        {users.map(otherUser => (
                          <List.Item key={otherUser.id}>
                            {otherUser.name}
                            {otherUser.id === user.id ? <Label><Icon name={"user"} />Me</Label> : null}
                            {otherUser.readyToPlay ? <Label><Icon name={"checkmark"} color={"green"} />Ready to play</Label> : null}
                          </List.Item>
                        ))}
                      </List>
                    )},
                    {menuItem: `${games.length} games`, render: () => (
                        <List bulleted>
                          {games.map(game => (
                            <List.Item key={game.id}>
                              {usersById[game.userIds[0]].name} {usersById[game.userIds[0]].id === user.id ? <Label><Icon name={"user"} />Me</Label> : null}
                              {" vs "}
                              {usersById[game.userIds[1]].name}
                            </List.Item>
                          ))}
                        </List>
                    )}
                  ]} />
                </Fragment>
              ) : "Connecting to server..."}
            </Tab.Pane>
          ) },
          { menuItem: 'Hotseat', render: () => <Tab.Pane attached={false}><Play game={game} makeMove={this.makeMove} /></Tab.Pane> },
        ]} />
      </Container>
    );
  }
}

export default App;
