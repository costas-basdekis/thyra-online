import React, {Component, Fragment} from 'react';
import 'fomantic-ui-css/semantic.css';
import {Button, Checkbox, Container, Header, Icon, Input, Label, List, Statistic, Segment, Tab} from 'semantic-ui-react';
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
    liveGame: null,
    liveGameGame: null,
  };

  componentDidMount() {
    client.onUser = user => {
      this.setState({user, username: user ? user.name : null});
      if (!user) {
        this.setState({users: [], usersById: {}, games: [], liveGame: null, liveGameGame: null});
      }
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
      if (this.state.liveGame) {
        const newLiveGame = this.state.games.find(game => game.id === this.state.liveGame.id);
        console.log('got games', this.state.liveGame, newLiveGame);
        if (!newLiveGame) {
          this.setState({liveGame: null, liveGameGame: null});
        } else if (newLiveGame.chainCount !== this.state.liveGame.chainCount || newLiveGame.finished !== this.state.liveGame.finished) {
          this.setState({liveGame: newLiveGame, liveGameGame: Game.deserialize(newLiveGame.game)});
        }
      }
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

  selectLiveGame = game => {
    this.setState({liveGame: game, liveGameGame: Game.deserialize(game.game)});
  };

  submit = moves => {
    client.submitGameMove(this.state.liveGame, moves);
  };

  render() {
    const {game, user, username, users, usersById, games, liveGame, liveGameGame} = this.state;
    const onlineUsers = users.filter(user => user.online);
    const liveGames = games.filter(game => !game.finished);
    const pastGames = games.filter(game => game.finished);
    return (
      <Container text>
        <Segment textAlign={"center"}>
          <Header as={"h1"}>Thyra Online</Header>
        </Segment>
        <Tab menu={{pointing: true}} panes={[
          client.available ? { menuItem: 'Lobby', render: () => (
            <Tab.Pane attached={false}>
              {user ? (
                <Fragment>
                  Welcome
                  <Input value={username} onChange={this.changeUsername} />
                  <Button onClick={this.updateUsername}>Change</Button>
                  <br />
                  <Checkbox label={"Ready to play?"} checked={user.readyToPlay} onChange={this.changeReadyToPlay} />
                  <Tab menu={{pointing: true}} panes={[
                    {menuItem: `${onlineUsers.length} users online`, render: () => (
                      <List bulleted>
                        {onlineUsers.map(otherUser => (
                          <List.Item key={otherUser.id}>
                            {otherUser.name}
                            {otherUser.id === user.id ? <Label><Icon name={"user"} />Me</Label> : null}
                            {otherUser.readyToPlay ? <Label><Icon name={"checkmark"} color={"green"} />Ready to play</Label> : null}
                          </List.Item>
                        ))}
                      </List>
                    )},
                    {menuItem: `${liveGames.length} live games`, render: () => (
                      <List bulleted>
                        {liveGames.map(otherGame => {
                          const playerA = usersById[otherGame.userIds[0]];
                          const playerB = usersById[otherGame.userIds[1]];
                          const isUserPlayerA = playerA.id === user.id;
                          const isUserPlayerB = playerB.id === user.id;
                          const isMyGame = isUserPlayerA || isUserPlayerB;
                          return (
                            <List.Item key={otherGame.id}>
                              {playerA.name} {isUserPlayerA ? <Label><Icon name={"user"} />Me</Label> : null}
                              {" vs "}
                              {playerB.name} {isUserPlayerB ? <Label><Icon name={"user"} />Me</Label> : null}
                              <Button onClick={() => this.selectLiveGame(otherGame)}>{isMyGame ? "Play" : "Spectate"}</Button>
                            </List.Item>
                          );
                        })}
                      </List>
                    )},
                    {menuItem: `${pastGames.length} past games`, render: () => (
                      <List bulleted>
                        {pastGames.map(otherGame => {
                          const playerA = usersById[otherGame.userIds[0]];
                          const playerB = usersById[otherGame.userIds[1]];
                          const isUserPlayerA = playerA.id === user.id;
                          const isUserPlayerB = playerB.id === user.id;
                          return (
                            <List.Item key={otherGame.id}>
                              {playerA.name}
                              {isUserPlayerA ? <Label><Icon name={"user"} />Me</Label> : null}
                              {otherGame.finished && isUserPlayerA && otherGame.winnerUserId === user.id ? <Label><Icon name={"trophy"} />Winner</Label> : null}
                              {" vs "}
                              {playerB.name}
                              {isUserPlayerB ? <Label><Icon name={"user"} />Me</Label> : null}
                              {otherGame.finished && isUserPlayerA && otherGame.winnerUserId === user.id ? <Label><Icon name={"trophy"} />Winner</Label> : null}
                              <Button onClick={() => this.selectLiveGame(otherGame)}>Review</Button>
                            </List.Item>
                          );
                        })}
                      </List>
                    )},
                  ]} />
                </Fragment>
              ) : "Connecting to server..."}
            </Tab.Pane>
          ) } : null,
          client.available ? {menuItem: liveGame ? (liveGame.finished ? 'Review' : (user && liveGame.userIds.includes(user.id) ? 'Live Play' : 'Spectate')) : 'Live Play/Spectate/Review', render: () => {
            if (!liveGame || !user) {
              return <Segment>Choose a game from the lobby</Segment>;
            }
            const playerA = usersById[liveGame.userIds[0]];
            const playerB = usersById[liveGame.userIds[1]];
            const isUserPlayerA = playerA.id === user.id;
            const isUserPlayerB = playerB.id === user.id;
            const userPlayer = isUserPlayerA ? Game.PLAYER_A : isUserPlayerB ? Game.PLAYER_B : null;
            return (
              <Fragment>
                <Segment>
                  <Statistic.Group widths={"three"} size={"tiny"}>
                    <Statistic value={playerA.name} label={isUserPlayerA ? <Label><Icon name={"user"} />Me</Label> : null} color={isUserPlayerA ? "green" : undefined}/>
                    <Statistic label={"vs"}/>
                    <Statistic value={playerB.name} label={isUserPlayerB ? <Label><Icon name={"user"} />Me</Label> : null} color={isUserPlayerB ? "green" : undefined}/>
                  </Statistic.Group>
                </Segment>
                <Play
                  game={liveGameGame}
                  names={{[Game.PLAYER_A]: playerA.name, [Game.PLAYER_B]: playerB.name}}
                  allowControl={[userPlayer].filter(player => player)}
                  submit={this.submit}
                />
              </Fragment>
            );
          }} : null,
          { menuItem: 'Hotseat', render: () => <Tab.Pane attached={false}><Play game={game} makeMove={this.makeMove} /></Tab.Pane> },
        ].filter(pane => pane)} />
      </Container>
    );
  }
}

export default App;
