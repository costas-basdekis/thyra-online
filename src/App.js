import React, {Component, Fragment} from 'react';
import 'fomantic-ui-css/semantic.css';
import {Button, Container, Header, Input, List, Segment, Tab} from 'semantic-ui-react';
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
  };

  componentDidMount() {
    client.onUser = user => {
      this.setState({user, username: user ? user.name : null});
    };
    client.onUsers = users => {
      if (this.state.user) {
        const myIndex = users.findIndex(user => user.id === this.state.user.id);
        if (myIndex >= 0) {
          users = [users[myIndex], ...users.slice(0, myIndex), ...users.slice(myIndex + 1)];
        }
      }
      this.setState({users: users});
    };
  }

  componentWillUnmount() {
    client.onUser = null;
    client.onUsers = null;
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

  render() {
    const {game, user, username, users} = this.state;
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
                  <List bulleted>
                    {users.map(otherUser => (
                      <List.Item key={otherUser.id}>{otherUser.name} {otherUser.id === user.id ? "(me)" : null}</List.Item>
                    ))}
                  </List>
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
