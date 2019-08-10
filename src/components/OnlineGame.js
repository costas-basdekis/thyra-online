import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Tab, Icon, Label, Segment, Statistic} from "semantic-ui-react";
import { createSelector } from 'reselect';

import {withClient} from "../client/withClient";
import Game from "../game/game";
import Play from "./play";

class OnlineGame extends Component {
  gameSelector = createSelector([
    props => props.game,
  ], game => game ? Game.deserialize(game.game) : null);

  get game() {
    return this.gameSelector(this.props);
  }

  submit = moves => {
    this.props.client.submitGameMove(this.state.liveGame, moves);
  };

  render() {
    const {user, game, usersInfo: {byId: usersById}} = this.props;
    const gameGame = this.game;
    if (!gameGame) {
      return <Tab.Pane>Choose a game from the lobby</Tab.Pane>;
    }

    const playerA = usersById[game.userIds[0]];
    const playerB = usersById[game.userIds[1]];
    const isUserPlayerA = user ? playerA.id === user.id : false;
    const isUserPlayerB = user ? playerB.id === user.id : false;
    const userPlayer = isUserPlayerA ? Game.PLAYER_A : isUserPlayerB ? Game.PLAYER_B : null;
    return (
      <Tab.Pane>
        <Segment>
          <Statistic.Group widths={"three"} size={"tiny"}>
            <Statistic
              value={playerA.name}
              label={isUserPlayerA ? <Label><Icon name={"user"} />Me</Label> : null}
              color={isUserPlayerA ? "green" : undefined}
            />
            <Statistic label={"vs"}/>
            <Statistic
              value={playerB.name}
              label={isUserPlayerB ? <Label><Icon name={"user"} />Me</Label> : null}
              color={isUserPlayerB ? "green" : undefined}
            />
          </Statistic.Group>
        </Segment>
        <Play
          game={gameGame}
          names={{[Game.PLAYER_A]: playerA.name, [Game.PLAYER_B]: playerB.name}}
          allowControl={[userPlayer].filter(player => player)}
          submit={this.submit}
        />
      </Tab.Pane>
    );
  }
}

OnlineGame.propTypes = {
  game: PropTypes.object,
  client: PropTypes.object.isRequired,
  user: PropTypes.object,
};

export default withClient(OnlineGame);
