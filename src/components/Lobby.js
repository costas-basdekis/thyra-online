import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Tab, Button, Checkbox, Icon, Input, Label, Card} from "semantic-ui-react";

import {withClient} from "../client/withClient";
import Game from "../game/game";
import jdenticon from "jdenticon";
import Board from "./Board";
import classNames from "classnames";

class HashedIcon extends Component {
  ref = React.createRef();

  componentDidMount() {
    this.updateIcon();
  }

  updateIcon() {
    if (this.ref.current) {
      jdenticon.update(this.ref.current);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.hash !== this.props) {
      this.updateIcon();
    }
  }

  render() {
    const {hash, floated, size} = this.props;
    return (
      <svg
        ref={this.ref}
        className={classNames(["ui", "mini", "right", "floated", "image"], {floated: !!floated, [floated]: !!floated, [size]: !!size})}
        data-jdenticon-value={hash}
      />
    );
  }
}

HashedIcon.propTypes = {
  hash: PropTypes.string.isRequired,
  floated: PropTypes.oneOf(['left', 'right']),
  size: PropTypes.oneOf(['mini', 'tiny', 'small', 'medium', 'large', 'big', 'huge', 'massive']),
};

class UserList extends Component {
  render() {
    const {user, users} = this.props;
    return (
      <Card.Group>
        {users.map(otherUser => (
          <Card key={otherUser.id}>
            <Card.Content>
              <HashedIcon floated={'right'} size={'mini'} hash={otherUser.id} />
              <Card.Header>
                {otherUser.name}
              </Card.Header>
              <Card.Meta>
                {user && otherUser.id === user.id ? <Label><Icon name={"user"} color={"green"} />Me</Label> : null}
                {" "}
                {otherUser.readyToPlay ? <Label><Icon name={"checkmark"} color={"green"} />Ready to play</Label> : null}
                {" "}
                {otherUser.online ? <Label><Icon name={"circle"} color={"green"} />Online</Label> : null}
              </Card.Meta>
              <Card.Description>

              </Card.Description>
            </Card.Content>
          </Card>
        ))}
      </Card.Group>
    );
  }
}

UserList.propTypes = {
  user: PropTypes.object,
  users: PropTypes.array.isRequired,
};

class GameList extends Component {
  render() {
    const {user, usersById, games} = this.props;
    return (
      <Card.Group>
        {games.map(game => {
          const playerA = usersById[game.userIds[0]];
          const playerB = usersById[game.userIds[1]];
          const nextPlayerUser = game.nextPlayer === Game.PLAYER_A ? playerA : playerB;
          const isUserPlayerA = user ? playerA.id === user.id : false;
          const isUserPlayerB = user ? playerB.id === user.id : false;
          const winnerUser = game.finished ? (game.winner === Game.PLAYER_A ? playerA : playerB) : null;
          const isMyGame = isUserPlayerA || isUserPlayerB;
          const gameGame = Game.deserialize(game.game);

          return (
            <Card key={game.id} onClick={() => this.props.selectLiveGame(game)}>
              <Card.Content>
                <Board className={'ui image floated right mini'} game={gameGame} small />
                {/*<Image floated='right' size='mini' src='/images/avatar/large/steve.jpg' />*/}
                <Card.Header>
                  <Label color={winnerUser === playerA ? 'green' : undefined} >
                    {winnerUser === playerA ? <Icon name={'trophy'}/> : null}
                    {nextPlayerUser === playerA ? <Icon name={'caret right'}/> : null}
                    {playerA.name}
                  </Label>
                  {" vs "}
                  <Label color={winnerUser === playerB ? 'green' : undefined} >
                    {winnerUser === playerB ? <Icon name={'trophy'}/> : null}
                    {nextPlayerUser === playerB ? <Icon name={'caret right'} color={"green"}/> : null}
                    {playerB.name}
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
  state = {
    user: null,
    username: null,
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

  changeReadyToPlay = (e, {checked}) => {
    this.props.client.changeReadyToPlay(checked);
  };

  render() {
    const {username} = this.state;
    const {user, usersInfo: {byId: usersById, online, offline}, gamesInfo: {live, finished}, selectLiveGame} = this.props;

    if (!user) {
      return <Tab.Pane>Connecting to server...</Tab.Pane>;
    }

    return (
      <Tab.Pane>
        Welcome
        <Input value={username} onChange={this.changeUsername} />
        <Button onClick={this.updateUsername}>Change</Button>
        <br />
        <Checkbox label={"Ready to play?"} checked={user.readyToPlay} onChange={this.changeReadyToPlay} />
        <Tab menu={{pointing: true}} panes={[
          {menuItem: `${online.length} users online`, render: () => (
            <UserList users={online} user={user}/>
          )},
          {menuItem: `${offline.length} users offline`, render: () => (
            <UserList users={offline} user={user}/>
          )},
          {menuItem: `${live.length} live games`, render: () => (
            <GameList user={user} usersById={usersById} games={live} selectLiveGame={selectLiveGame} />
          )},
          {menuItem: `${finished.length} past games`, render: () => (
            <GameList user={user} usersById={usersById} games={finished} selectLiveGame={selectLiveGame} />
          )},
        ]} />
      </Tab.Pane>
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
