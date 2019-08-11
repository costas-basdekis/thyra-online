import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Tab, Button, Icon, Input, Label, Card, Segment, Modal, Header} from "semantic-ui-react";

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
              <EditUserName client={client} user={user} trigger={<Label as={'a'} icon={'edit'} content={'Rename'}/>} />
            ) : null}
          </Card.Header>
          <Card.Meta>
            {user && otherUser.id === user.id ? <Label><Icon name={"user"} color={"green"} />Me</Label> : null}
            {" "}
            {otherUser.readyToPlay ? <Label><Icon loading name={"circle notch"} color={"green"} />Ready</Label> : null}
            {" "}
            {otherUser.online ? <Label><Icon name={"circle"} color={"green"} />Online</Label> : null}
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

class EditUserName extends Component {
  state = {
    user: this.props.user,
    username: this.props.user.name,
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

  updateUsername = () => {
    this.props.client.changeUsername(this.state.username);
  };

  render() {
    const {username} = this.state;
    const {trigger} = this.props;

    return (
      <Modal
        trigger={trigger}
        size={'mini'}
        header={'Change name'}
        content={(
          <Segment>
            <Input label={'Name'} value={username} onChange={this.changeUsername} />
          </Segment>
        )}
        actions={[
          {key: 'cancel', negative: true, content: 'Cancel'},
          {key: 'change', positive: true, content: 'Change', onClick: this.updateUsername},
        ]}
      />
    );
  }
}

EditUserName.propTypes = {
  client: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  trigger: PropTypes.node.isRequired,
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

  componentDidUpdate(prevProps) {
    if (prevProps.gamesInfo.myLive !== this.props.gamesInfo.myLive) {
      const previousMyLiveGameIds = new Set(prevProps.gamesInfo.myLive.map(game => game.id));
      const myLiveGameIds = this.props.gamesInfo.myLive.map(game => game.id);
      const newMyLiveGameIds = myLiveGameIds.filter(id => !previousMyLiveGameIds.has(id));
      if (newMyLiveGameIds.length === 1) {
        const newGame = this.props.gamesInfo.byId[newMyLiveGameIds[0]];
        this.props.selectLiveGame(newGame);
      }
    }
  }

  render() {
    const {client, user, usersInfo: {byId: usersById, online, offline, challengedUser, readyToPlay, readyToPlayMe}, gamesInfo: {live, myLive, finished}, selectLiveGame} = this.props;

    if (!user) {
      return <Tab.Pane>Connecting to server...</Tab.Pane>;
    }

    return (
      <Fragment>
        <Settings/>
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
