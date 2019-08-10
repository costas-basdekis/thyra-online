import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Tab, List, Button, Checkbox, Icon, Input, Label} from "semantic-ui-react";

import {withClient} from "../client/withClient";

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
    const {user, usersInfo: {byId: usersById, online}, gamesInfo: {live, finished}} = this.props;

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
            <List bulleted>
              {online.map(otherUser => (
                <List.Item key={otherUser.id}>
                  {otherUser.name}
                  {otherUser.id === user.id ? <Label><Icon name={"user"} />Me</Label> : null}
                  {otherUser.readyToPlay ? <Label><Icon name={"checkmark"} color={"green"} />Ready to play</Label> : null}
                </List.Item>
              ))}
            </List>
          )},
          {menuItem: `${live.length} live games`, render: () => (
            <List bulleted>
              {live.map(otherGame => {
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
                    <Button onClick={() => this.props.selectLiveGame(otherGame)}>{isMyGame ? "Play" : "Spectate"}</Button>
                  </List.Item>
                );
              })}
            </List>
          )},
          {menuItem: `${finished.length} past games`, render: () => (
            <List bulleted>
              {finished.map(otherGame => {
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
                    <Button onClick={() => this.props.selectLiveGame(otherGame)}>Review</Button>
                  </List.Item>
                );
              })}
            </List>
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
