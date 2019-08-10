import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Icon, Label, Segment, Statistic} from "semantic-ui-react";
import { createSelector } from 'reselect';

import {withClient} from "../client/withClient";
import Game from "../game/game";
import Play from "./Play";
import {Route, Switch, withRouter} from "react-router-dom";

class ChosenOnlineGame extends Component {
  gameSelector = createSelector([
    props => props.match.params.id,
    props => props.gamesInfo.byId,
  ], (gameId, gamesById) => gamesById[gameId]);

  get game() {
    return this.gameSelector(this.props);
  }

  gameGameSelector = createSelector([
    () => this.game,
  ], game => game ? Game.deserialize(game.game) : null);

  get gameGame() {
    return this.gameGameSelector(this.props);
  }

  submit = moves => {
    this.props.client.submitGameMove(this.props.game, moves);
  };

  componentDidMount() {
    const game = this.game;
    if (game) {
      this.props.selectLiveGame(game);
    }
  }

  componentDidUpdate() {
    const game = this.game;
    if (game) {
      this.props.selectLiveGame(game);
    }
  }

  render() {
    const {user, usersInfo: {byId: usersById}} = this.props;
    const {game, gameGame} = this;

    if (!gameGame) {
      return "This game cannot be found";
    }

    const playerA = usersById[game.userIds[0]];
    const playerB = usersById[game.userIds[1]];
    const isUserPlayerA = user ? playerA.id === user.id : false;
    const isUserPlayerB = user ? playerB.id === user.id : false;
    const userPlayer = isUserPlayerA ? Game.PLAYER_A : isUserPlayerB ? Game.PLAYER_B : null;
    return (
      <Fragment>
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
      </Fragment>
    );
  }
}

ChosenOnlineGame.propTypes = {
  match: PropTypes.object.isRequired,
  client: PropTypes.object.isRequired,
  user: PropTypes.object,
  usersInfo: PropTypes.object.isRequired,
  selectLiveGame: PropTypes.func.isRequired,
};

ChosenOnlineGame = withRouter(withClient(ChosenOnlineGame));

class OnlineGame extends Component {
  gameGameSelector = createSelector([
    props => props.game,
  ], game => game ? Game.deserialize(game.game) : null);

  get gameGame() {
    return this.gameGameSelector(this.props);
  }

  render() {
    const {selectLiveGame} = this.props;
    const gameGame = this.gameGame;
    return (
      <Switch>
        <Route exact path={this.props.match.path}>Choose a game from the lobby</Route>
        <Route path={`${this.props.match.path}/:id`}><ChosenOnlineGame gameGame={gameGame} selectLiveGame={selectLiveGame} /></Route>
      </Switch>
    );
  }
}

OnlineGame.propTypes = {
  match: PropTypes.object.isRequired,
  game: PropTypes.object,
  client: PropTypes.object.isRequired,
  user: PropTypes.object,
  usersInfo: PropTypes.object.isRequired,
  selectLiveGame: PropTypes.func.isRequired,
};

export default withRouter(withClient(OnlineGame));
