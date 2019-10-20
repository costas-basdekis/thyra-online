import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Tab, Button, Icon, Input, Label, Card, Segment, Modal, Checkbox} from "semantic-ui-react";

import {withClient} from "../client/withClient";
import HashedIcon from "./HashedIcon";
import GameList from "./GameList";
import CreateTournament from "./CreateTournament";
import TournamentList from "./TournamentList";
import ChallengeList, {ChallengeCard} from "./ChallengeList";

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
        } else if (!otherUser.online) {
          playButtonLabel = null;
          playButtonOnClick = null;
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
            <Label
              title={`${otherUser.isUserRatingProvisional ? 'Provisional - ' : ''}Won ${otherUser.winCount} out of ${otherUser.gameCount}`}
              color={{1: 'yellow', 2: 'grey', 3: 'brown'}[otherUser.rank]}
            >
              <Icon
                name={otherUser.isUserRatingProvisional ? "question" : "star outline"}
                color={otherUser.isUserRatingProvisional ? "orange" : undefined}
              />
              {" "}{otherUser.score}
            </Label>
            {" "}
            <Label icon={'trophy'} content={` ${otherUser.winCount}/${otherUser.gameCount}`} />
            {" "}
            {otherUser.tournamentWinCount ? (
              <Label
                icon={{name: 'sitemap', color: 'yellow'}}
                content={otherUser.tournamentWinCount}
                title={`Won ${otherUser.tournamentWinCount}/${otherUser.tournamentCount} tournaments entered`}
              />
              ) : null}
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

export class LogIn extends Component {
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
        trigger={<Label as={'a'} icon={'sign in'} content={'Log In'} float={'left'} />}
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

export class LogOut extends Component {
  logOut = () => {
    this.props.client.logOut();
  };

  render() {
    return (
      <Label as={'a'} icon={'log out'} content={'Log Out'} onClick={this.logOut} />
    );
  }
}

LogOut.propTypes = {
  client: PropTypes.object.isRequired,
};

class Lobby extends Component {
  changeReadyToPlay = () => {
    this.props.client.changeReadyToPlay(!this.props.user.readyToPlay);
  };

  render() {
    const {
      client, user,
      usersInfo: {byId: usersById, users, online, offline, challengedUser, readyToPlay, readyToPlayMe},
      gamesInfo: {myLive, otherLive, myFinished, otherFinished}, selectLiveGame, selectLiveTournament,
      challengesInfo: {otherUnsolved, challenges, otherStarted, otherNotStarted, otherSolved},
      tournamentsInfo,
    } = this.props;
    const {byId: tournamentsById} = tournamentsInfo;

    if (!user) {
      return <Tab.Pane>Connecting to server...</Tab.Pane>;
    }

    return (
      <Fragment>
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
          {otherUnsolved.length ? (
            <ChallengeCard
              user={user}
              usersById={usersById}
              challenge={otherUnsolved[0]}
              selectChallenge={this.props.selectLiveChallenge}
              currentChallengeId={null}
            />
          ) : null}
        </Card.Group>
        <Segment>
          <Tab menu={{pointing: true}} panes={[
            {key: 'my-live', label: "My Live games", items: myLive, color: 'green'},
            {key: 'other-live', label: "Other Live games", items: otherLive, color: 'green'},
            {key: 'my-past', label: "My Past games", items: myFinished},
            {key: 'other-past', label: "Other Past games", items: otherFinished},
          ].filter(({items}) => items.length).map(({key, label, items, color}) => (
            {menuItem: {key, content: <Fragment>{label} <Label content={items.length} color={color} /></Fragment>}, render: () => (
              <GameList user={user} usersById={usersById} tournamentsById={tournamentsById} games={items} selectLiveGame={selectLiveGame} />
            )}
          ))} />
        </Segment>
        {challenges ? (<Segment>
          <Tab menu={{pointing: true}} panes={(() => {
            let challengesList = [
              {key: 'other-started', label: "Started Challenges", items: otherStarted, color: 'green'},
              {key: 'other-not-started', label: "New Challenges", items: otherNotStarted},
              {key: 'other-solved', label: "Solved Challenges", items: otherSolved},
            ].filter(({items}) => items.length);
            if (!challengesList.length) {
              challengesList = [
                {key: 'challenges', label: "Challenges", items: challenges},
              ];
            }
            return challengesList;
          })().map(({key, label, items, color}) => (
              {menuItem: {key, content: <Fragment>{label} <Label content={items.length} color={color} /></Fragment>}, render: () => (
                  <ChallengeList selectChallenge={this.props.selectLiveChallenge} challenges={items} />
                )}
            ))
          } />
        </Segment>) : null}
        <Segment>
          <CreateTournament />
          <br/><br/>
          <Tab menu={{pointing: true}} panes={[
            {key: 'my-live', label: "My Future & Running tournaments", items: tournamentsInfo.myFutureAndLive, color: 'green'},
            {key: 'other-live', label: "Other Future and Running tournaments", items: tournamentsInfo.otherFutureAndLive, color: 'green'},
            {key: 'my-past', label: "My Past tournaments", items: tournamentsInfo.myFinished},
            {key: 'other-past', label: "Other Past tournaments", items: tournamentsInfo.otherFinished},
          ].filter(({items}) => items.length).map(({key, label, items, color}) => (
            {menuItem: {key, content: <Fragment>{label} <Label content={items.length} color={color} /></Fragment>}, render: () => (
              <TournamentList
                user={user}
                usersById={usersById}
                tournaments={items}
                selectLiveTournament={selectLiveTournament}
              />
            )}
          ))} />
        </Segment>
        <Segment>
          <Tab menu={{pointing: true}} panes={[
            {key: 'online', label: "Online Users", items: online, color: 'green'},
            {key: 'offline', label: "Offline Users", items: offline},
            {key: 'all', label: "All Users", items: users},
          ].filter(({items}) => items.length).map(({key, label, items, color}) => (
            {menuItem: {key, content: <Fragment>{label} <Label content={items.length} color={color} /></Fragment>}, render: () => (
              <UserList
                client={client}
                users={items}
                user={user}
                challengedUser={challengedUser}
                readyToPlayUsers={readyToPlay}
                readyToPlayMeUsers={readyToPlayMe}
              />
            )}
          ))} />
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
  tournamentsInfo: PropTypes.object.isRequired,
  selectLiveGame: PropTypes.func.isRequired,
  selectLiveTournament: PropTypes.func.isRequired,
  selectLiveChallenge: PropTypes.func.isRequired,
};

export default withClient(Lobby);
