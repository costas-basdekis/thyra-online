import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Tab, Button, Icon, Input, Label, Card, Segment, Modal, Header, Checkbox} from "semantic-ui-react";

import {withClient} from "../client/withClient";
import Game from "../game/game";
import Board from "./Board";
import HashedIcon from "./HashedIcon";
import Settings from "./Settings";

class UserList extends Component {
  render() {
    const {client, user, users, challengedUser, readyToPlayUsers, readyToPlayMeUsers} = this.props;
    return (
      <Card.Group style={{maxHeight: '300px', overflowY: 'auto'}}>
        {users.map(otherUser => (
          <UserCard
            key={otherUser.id}
            client={client}
            user={user}
            otherUser={otherUser}
            challengedUser={challengedUser}
            readyToPlayUsers={readyToPlayUsers}
            readyToPlayMeUsers={readyToPlayMeUsers}
          />
        ))}
      </Card.Group>
    );
  }
}

UserList.propTypes = {
  client: PropTypes.object,
  user: PropTypes.object,
  users: PropTypes.array.isRequired,
  challengedUser: PropTypes.object,
  readyToPlayUsers: PropTypes.array,
  readyToPlayMeUsers: PropTypes.array,
};

class UserCard extends Component {
  changeReadyToPlay = () => {
    this.props.client.changeReadyToPlay(!this.props.user.readyToPlay);
  };

  challengeUser = () => {
    this.props.client.changeReadyToPlay(this.props.user.readyToPlay === this.props.otherUser.id ? false : this.props.otherUser.id);
  };

  render() {
    const {client, user, otherUser, challengedUser, readyToPlayUsers, readyToPlayMeUsers} = this.props;
    let playButtonColour, playButtonAttention, playButtonIcon, playButtonOnClick, playButtonLabel;
    if (client && user) {
      if (user.id === otherUser.id) {
        playButtonOnClick = this.changeReadyToPlay;
        if (user.readyToPlay) {
          playButtonColour = 'green';
          playButtonIcon = {loading: true, name: 'circle notch'};
          if (challengedUser) {
            playButtonLabel = `Waiting for ${challengedUser.name}...`;
          } else {
            playButtonLabel = 'Waiting for opponent...';
          }
        } else {
          playButtonColour = 'yellow';
          playButtonIcon = {name: 'play'};
          if (readyToPlayMeUsers && readyToPlayMeUsers.length) {
            if (readyToPlayMeUsers.length === 1) {
              playButtonLabel = `${readyToPlayMeUsers[0].name} has challenged you`;
              playButtonAttention = true;
            } else {
              playButtonLabel = `${readyToPlayMeUsers.length} users have challenged you`;
              playButtonAttention = true;
            }
          } else if (readyToPlayUsers && readyToPlayUsers.length) {
            if (readyToPlayUsers.length === 1) {
              playButtonLabel = `Play ${readyToPlayUsers[0].name}`;
            } else {
              playButtonLabel = `${readyToPlayUsers.length} users ready to play`;
            }
          } else {
            playButtonLabel = 'Play';
          }
        }
      } else {
        playButtonOnClick = this.challengeUser;
        if (challengedUser && challengedUser.id === otherUser.id) {
          playButtonColour = 'green';
          playButtonIcon = {loading: true, name: 'circle notch'};
          playButtonLabel = `Waiting for ${otherUser.name}...`;
        } else {
          playButtonColour = 'yellow';
          playButtonIcon = {name: 'play'};
          if (otherUser.readyToPlay === user.id) {
            playButtonLabel = `${otherUser.name} has challenged you`;
            playButtonAttention = true;
          } else if (otherUser.readyToPlay === true) {
            playButtonLabel = `${otherUser.name} is ready to Play`;
          } else {
            playButtonLabel = `Challenge ${otherUser.name}`;
          }
        }
      }
    }

    return (
      <Card>
        <Card.Content>
          <HashedIcon floated={'right'} size={'mini'} hash={otherUser.id} />
          <Card.Header>
            {otherUser.name}
            {" "}
            {client && user && user.id === otherUser.id ? (
              <EditUser client={client} user={user} trigger={<Label as={'a'} icon={'edit'} content={'Edit'}/>} />
            ) : null}
          </Card.Header>
          <Card.Meta>
            {user && otherUser.id === user.id ? <Label><Icon name={"user"} color={"green"} />Me</Label> : null}
            {" "}
            {user && otherUser.id === user.id ? <EditUser client={client} user={user} trigger={<Label as={'a'}><Icon name={"lock"} color={user.hasPassword ? "green" : "red"} />{user.hasPassword ? '' : 'No password'}</Label>} /> : null}
            {" "}
            {otherUser.readyToPlay ? <Label><Icon loading name={"circle notch"} color={"green"} />Ready</Label> : null}
            {" "}
            {otherUser.online ? <Label><Icon name={"circle"} color={"green"} />Online</Label> : null}
            {" "}
            <Label><Icon name={otherUser.isUserRatingProvisional ? "question" : "star outline"} color={otherUser.isUserRatingProvisional ? "orange" : undefined} />{otherUser.score}</Label>
          </Card.Meta>
        </Card.Content>
        {playButtonLabel ? <Card.Content extra>
          <div className='ui two buttons'>
            <Button className={classNames({attention: playButtonAttention})} color={playButtonColour} onClick={playButtonOnClick}>
              <Icon {...playButtonIcon} />
              {playButtonLabel}
            </Button>
          </div>
        </Card.Content> : null}
      </Card>
    );
  }
}

UserCard.propTypes = {
  client: PropTypes.object,
  user: PropTypes.object,
  otherUser: PropTypes.object.isRequired,
  changeReadyToPlay: PropTypes.func,
  challengedUser: PropTypes.object,
  readyToPlayUsers: PropTypes.array,
  readyToPlayMeUsers: PropTypes.array,
};

class EditUser extends Component {
  state = {
    user: this.props.user,
    username: this.props.user.name,
    password: '',
  };

  static getDerivedStateFromProps(props, state) {
    if (props.user !== state.user) {
      return {
        user: props.user,
        username: props.user ? props.user.name : null,
      };
    }

    return null;
  }

  changeUsername = ({target: {value}}) => {
    this.setState({username: value});
  };

  changePassword = ({target: {value}}) => {
    this.setState({password: value});
  };

  updateUsername = () => {
    this.props.client.changeUsername(this.state.username);
  };

  updatePassword = () => {
    this.props.client.changePassword(this.state.password);
    this.setState({password: ''});
  };

  render() {
    const {username, password} = this.state;
    const {user, trigger} = this.props;

    return (
      <Modal
        trigger={trigger}
        size={'small'}
        header={'Edit user'}
        content={(
          <Segment>
            <Input label={'Name'} value={username} onChange={this.changeUsername} action={{content: 'Change', onClick: this.updateUsername}} />
            <br />
            <Input label={{content: user.hasPassword ? 'Password is set' : 'Set a password', color: user.hasPassword ? 'green' : 'red'}} value={password} onChange={this.changePassword} action={{content: 'Change', color: user.hasPassword ? undefined : 'green', onClick: this.updatePassword}} />
          </Segment>
        )}
        actions={[
          {key: 'cancel', negative: true, content: 'Cancel'},
        ]}
      />
    );
  }
}

EditUser.propTypes = {
  client: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  trigger: PropTypes.node.isRequired,
};

class LogIn extends Component {
  state = {
    username: '',
    password: '',
    mergeUsers: false,
  };

  changeUsername = ({target: {value}}) => {
    this.setState({username: value});
  };

  changePassword = ({target: {value}}) => {
    this.setState({password: value});
  };

  changeMergeUsers = ({target: {checked}}) => {
    this.setState({mergeUsers: checked});
  };

  logIn = () => {
    this.props.client.logIn(this.state.username, this.state.password, this.mergeUsers);
    this.setState({username: '', password: ''});
  };

  render() {
    const {username, password, mergeUsers} = this.state;

    return (
      <Modal
        ref={this.modal}
        trigger={<Label as={'a'} icon={'sign in'} content={'Log In'} />}
        size={'small'}
        header={'Log In'}
        content={(
          <Segment>
            <Input label={'Name'} value={username} onChange={this.changeUsername}/>
            <br />
            <Input label={'Password'} value={password} onChange={this.changePassword} />
            <br />
            <Checkbox
              label={'Merge users'}
              checked={mergeUsers}
              onChange={this.changeMergeUsers}
            />
          </Segment>
        )}
        actions={[
          {key: 'cancel', negative: true, content: 'Cancel'},
          {key: 'logIn', positive: true, content: 'Log In', onClick: this.logIn},
        ]}
      />
    );
  }
}

LogIn.propTypes = {
  client: PropTypes.object.isRequired,
};

class GameList extends Component {
  render() {
    const {user, usersById, games} = this.props;
    if (!Object.values(usersById).length) {
      return null;
    }

    return (
      <Card.Group style={{maxHeight: '300px', overflowY: 'auto'}}>
        {games.map(game => {
          const gameGame = Game.deserialize(game.game);
          const playerA = usersById[game.userIds[0]];
          const playerB = usersById[game.userIds[1]];
          const nextPlayerUser = gameGame.nextPlayer === Game.PLAYER_A ? playerA : playerB;
          const isUserPlayerA = user ? playerA.id === user.id : false;
          const isUserPlayerB = user ? playerB.id === user.id : false;
          const winnerUser = game.finished ? (game.winner === Game.PLAYER_A ? playerA : playerB) : null;
          const isMyGame = isUserPlayerA || isUserPlayerB;

          return (
            <Card key={game.id} onClick={() => this.props.selectLiveGame(game)}>
              <Card.Content>
                <Board className={'ui image floated right mini'} game={gameGame} small settings={user ? user.settings : undefined} />
                {/*<Image floated='right' size='mini' src='/images/avatar/large/steve.jpg' />*/}
                <Card.Header>
                  <Label color={winnerUser === playerA ? 'green' : undefined} >
                    {winnerUser === playerA ? <Icon name={'trophy'}/> : null}
                    {nextPlayerUser === playerA ? <Icon name={'caret right'}/> : null}
                    {playerA.name}
                    <HashedIcon floated={'right'} size={'mini'} textSized hash={playerA.id} />
                  </Label>
                  {" vs "}
                  <Label color={winnerUser === playerB ? 'green' : undefined} >
                    {winnerUser === playerB ? <Icon name={'trophy'}/> : null}
                    {nextPlayerUser === playerB ? <Icon name={'caret right'} color={"green"}/> : null}
                    {playerB.name}
                    <HashedIcon floated={'right'} size={'mini'} textSized hash={playerB.id} />
                  </Label>
                </Card.Header>
                <Card.Meta>
                  {isMyGame ? <Label><Icon name={"user"} color={"green"} />My game</Label> : null}
                  {" "}
                  {!game.finished ? <Label><Icon name={"circle"} color={"green"} />Live</Label> : null}
                  {" "}
                  <Label content={`Move ${game.move}`} />
                </Card.Meta>
              </Card.Content>
            </Card>
          );
        })}
      </Card.Group>
    );
  }
}

GameList.propTypes = {
  user: PropTypes.object,
  usersById: PropTypes.object.isRequired,
  games: PropTypes.array.isRequired,
  selectLiveGame: PropTypes.func.isRequired,
};

class Lobby extends Component {
  changeReadyToPlay = () => {
    this.props.client.changeReadyToPlay(!this.props.user.readyToPlay);
  };

  render() {
    const {client, user, usersInfo: {byId: usersById, online, offline, challengedUser, readyToPlay, readyToPlayMe}, gamesInfo: {live, myLive, finished}, selectLiveGame} = this.props;

    if (!user) {
      return <Tab.Pane>Connecting to server...</Tab.Pane>;
    }

    return (
      <Fragment>
        <Settings/>
        <LogIn client={client} />
        <Card.Group centered>
          {user ? (
            <UserCard
              client={client}
              otherUser={user}
              user={user}
              challengedUser={challengedUser}
              readyToPlayUsers={readyToPlay}
              readyToPlayMeUsers={readyToPlayMe}
            />
          ) : null}
        </Card.Group>
        {myLive.length ? (
          <Segment>
            <Header as={'h2'}>My live games ({myLive.length})</Header>
            <GameList user={user} usersById={usersById} games={myLive} selectLiveGame={selectLiveGame} />
          </Segment>
        ) : null}
        <Segment>
          <Tab menu={{pointing: true}} panes={[
            {menuItem: `${live.length} live games`, render: () => (
              <GameList user={user} usersById={usersById} games={live} selectLiveGame={selectLiveGame} />
            )},
            {menuItem: `${finished.length} past games`, render: () => (
              <GameList user={user} usersById={usersById} games={finished} selectLiveGame={selectLiveGame} />
            )},
          ]} />
        </Segment>
        <Segment>
          <Tab menu={{pointing: true}} panes={[
            {menuItem: `${online.length} users online`, render: () => (
              <UserList
                client={client}
                users={online}
                user={user}
                challengedUser={challengedUser}
                readyToPlayUsers={readyToPlay}
                readyToPlayMeUsers={readyToPlayMe}
              />
            )},
            {menuItem: `${offline.length} users offline`, render: () => (
              <UserList users={offline} user={user} challengedUser={challengedUser} />
            )},
          ]} />
        </Segment>
      </Fragment>
    );
  }
}

Lobby.propTypes = {
  client: PropTypes.object.isRequired,
  user: PropTypes.object,
  usersInfo: PropTypes.object.isRequired,
  gamesInfo: PropTypes.object.isRequired,
  selectLiveGame: PropTypes.func.isRequired,
};

export default withClient(Lobby);
