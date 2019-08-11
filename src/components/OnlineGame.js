import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Button, Grid, Icon, Label, Modal, Segment, Statistic} from "semantic-ui-react";
import { createSelector } from 'reselect';

import {withClient} from "../client/withClient";
import Game from "../game/game";
import Play from "./Play";
import {Route, Switch, withRouter} from "react-router-dom";
import * as utils from "../utils";
import HashedIcon from "./HashedIcon";
import Settings from "./Settings";

class ChosenOnlineGame extends Component {
  gameSelector = createSelector([
    props => props.match.params.id,
    props => props.gamesInfo.byId,
  ], (gameId, gamesById) => gamesById[gameId]);

  get game() {
    return this.gameSelector(this.props);
  }

  playersInfoSelector = createSelector([
    props => props.user,
    props => props.usersInfo,
    () => this.game,
  ], (user, {byId: usersById}, game) => {
    const playerA = usersById[game.userIds[0]];
    const playerB = usersById[game.userIds[1]];
    const isUserPlayerA = user ? playerA.id === user.id : false;
    const isUserPlayerB = user ? playerB.id === user.id : false;
    const userPlayer = isUserPlayerA ? Game.PLAYER_A : isUserPlayerB ? Game.PLAYER_B : null;

    return {
      playerA, playerB,
      isUserPlayerA, isUserPlayerB,
      userPlayer,
    };
  });

  get playersInfo() {
    return this.playersInfoSelector(this.props);
  }

  gameGameSelector = createSelector([
    () => this.game,
  ], game => game ? Game.deserialize(game.game) : null);

  get gameGame() {
    return this.gameGameSelector(this.props);
  }

  dismissUrlGameError = () => {
    this.props.selectLiveGame(null);
  };

  submit = moves => {
    this.props.client.submitGameMove(this.game, moves);
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

  close = () => {
    this.props.selectLiveGame(null);
  };

  changeSettings = settings => {
    this.props.client.updateSettings(settings);
  };

  share = e => {
    const url = this.props.location.pathname;
    if (navigator.share) {
      const game = this.game;
      const {playerA, playerB} = this.playersInfo;
      navigator.share({
        title: `Thyra Online - ${game.finished ? 'Review' : 'Live'} ${playerA.name} vs ${playerB.name}`,
        text: `${game.finished? 'Review finished': 'Watch live'} Santorini game between ${playerA.name} and ${playerB.name}`,
        url,
      }).catch(() => {
        utils.copyToClipboard(url);
        alert('Link copied to clipboard');
      });
    } else {
      utils.copyToClipboard(url);
      alert('Link copied to clipboard');
    }
    e.preventDefault();
  };

  render() {
    const {location, user} = this.props;
    const {gameGame} = this;

    if (!gameGame) {
      return (
        <Fragment>
          <Modal
            open={true}
            size={'mini'}
            onClose={this.dismissUrlGameError}
            header={'Could not find game'}
            content={'This game cannot be found. Please check that you copied the full URL'}
            actions={[{key: 'ok', content: 'OK', positive: true}]}
          />
          Could not find game
        </Fragment>
      );
    }

    const {playerA, playerB, isUserPlayerA, isUserPlayerB, userPlayer} = this.playersInfo;
    if (!playerA || !playerB) {
      return null;
    }
    return (
      <Fragment>
        <Settings/>
        <Segment>
          <Statistic.Group widths={"three"} size={"tiny"}>
            <Statistic
              value={<Statistic.Value>{playerA.name}<HashedIcon floated={'right'} size={'mini'} hash={playerA.id} /></Statistic.Value>}
              label={isUserPlayerA ? <Label><Icon name={"user"} />Me</Label> : null}
              color={isUserPlayerA ? "green" : undefined}
            />
            <Statistic label={"vs"}/>
            <Statistic
              value={<Statistic.Value>{playerB.name}<HashedIcon floated={'right'} size={'mini'} hash={playerB.id} /></Statistic.Value>}
              label={isUserPlayerB ? <Label><Icon name={"user"} />Me</Label> : null}
              color={isUserPlayerB ? "green" : undefined}
            />
          </Statistic.Group>
          <Grid columns={'equal'}>
            <Grid.Column textAlign={'left'}><Button negative onClick={this.close}>Close</Button></Grid.Column>
            <Grid.Column>
              <Button
                positive
                icon
                onClick={this.share}
                style={{width: '100%'}}
                as={'a'}
                href={location.pathname}
                title={navigator.share ? 'Click to open the sharing menu' : 'Click to copy URL to game'}
              >
                <Icon name={'share'}/> Share
              </Button>
            </Grid.Column>
          </Grid>
        </Segment>
        <Play
          user={user}
          changeSettings={this.changeSettings}
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
  location: PropTypes.object.isRequired,
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
    const {selectLiveGame, usersInfo: {byId}} = this.props;
    if (!Object.values(byId).length) {
      return null;
    }
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
