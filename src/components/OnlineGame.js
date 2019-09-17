import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Button, Grid, Header, Icon, Label, Modal, Segment, Statistic} from "semantic-ui-react";
import { createSelector } from 'reselect';

import {withClient} from "../client/withClient";
import Game from "../game/game";
import Play from "./Play";
import {Route, Switch, withRouter} from "react-router-dom";
import * as utils from "../utils";
import HashedIcon from "./HashedIcon";
import Settings from "./Settings";
import GameList from "./GameList";

class OnlineGamePlayer extends Component {
  render() {
    const {game, player} = this.props;
    let initialPlayer, resultingPlayerScore;
    if (game) {
      if (game.initialPlayerA.id === player.id) {
        initialPlayer = game.initialPlayerA;
        resultingPlayerScore = game.resultingPlayerAScore;
      } else if (game.initialPlayerB.id === player.id) {
        initialPlayer = game.initialPlayerB;
        resultingPlayerScore = game.resultingPlayerBScore;
      } else {
        initialPlayer = null;
        resultingPlayerScore = null;
      }
    } else {
      initialPlayer = null;
      resultingPlayerScore = null;
    }
    const isWinner = game && game.winnerUserId === player.id;
    return (
      <Fragment>
        {isWinner ? <Icon name={'trophy'} color={"green"} /> : null}{" "}
        <span style={isWinner ? {color: '#21BA45'} : undefined}>
          {player.name}
          {initialPlayer ? (
            <Fragment>
              {" "}({resultingPlayerScore ? (
                <Fragment>
                  {isWinner ? `+${initialPlayer.winPoints}` : initialPlayer.losePoints}
                  {" "}<Icon name={'long arrow alternate right'} />{" "}
                  {resultingPlayerScore}
                </Fragment>
              ) : (
                <Fragment>
                  {initialPlayer.score}
                  {" "}+{initialPlayer.winPoints}/{initialPlayer.losePoints}
                </Fragment>
              )})
            </Fragment>
          ) : null}
        </span>
        <HashedIcon floated={'right'} size={'mini'} hash={player.id} />
      </Fragment>
    );
  }
}

OnlineGamePlayer.propTypes = {
  game: PropTypes.object,
  player: PropTypes.object.isRequired,
};

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
    const otherUser = isUserPlayerA ? playerB : isUserPlayerB ? playerA : null;

    return {
      playerA, playerB,
      isUserPlayerA, isUserPlayerB,
      userPlayer, otherUser,
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

  shareGame = e => {
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

  challengeUser = () => {
    const {otherUser} = this.playersInfo;
    if (otherUser) {
      this.props.client.changeReadyToPlay(otherUser.id);
    }
  };

  stopChallengeUser = () => {
    this.props.client.changeReadyToPlay(false);
  };

  render() {
    const {
      location, user, client, game, selectLiveGame,
      usersInfo: {challengedUser, byId: usersById}, gamesInfo: {otherLive: otherLiveGames, myLive: myLiveGames},
    } = this.props;
    const {gameGame} = this;

    if (!gameGame) {
      return (
        <Fragment>
          <Modal
            open={true}
            size={'mini'}
            onClose={this.dismissUrlGameError}
            header={'Could not find game'}
            content={'This game cannot be found. Please check that you copied the full URL, or perhaps the game was aborted'}
            actions={[{key: 'ok', content: 'OK', positive: true}]}
          />
          Could not find game
        </Fragment>
      );
    }

    const {otherUser, playerA, playerB, isUserPlayerA, isUserPlayerB, userPlayer} = this.playersInfo;
    if (!playerA || !playerB) {
      return null;
    }
    return (
      <Fragment>
        <Settings/>
        <Segment>
          <Statistic.Group widths={"three"} size={"tiny"}>
            <Statistic
              value={<Statistic.Value><OnlineGamePlayer game={game} player={playerA} /></Statistic.Value>}
              label={isUserPlayerA ? <Label><Icon name={"user"} />Me</Label> : null}
              color={isUserPlayerA ? "green" : undefined}
            />
            <Statistic label={"vs"}/>
            <Statistic
              value={<Statistic.Value><OnlineGamePlayer game={game} player={playerB} /></Statistic.Value>}
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
                onClick={this.shareGame}
                style={{width: '100%'}}
                as={'a'}
                href={location.pathname}
                title={navigator.share ? 'Click to open the sharing menu' : 'Click to copy URL to game'}
              >
                <Icon name={'share'}/> Share Game
              </Button>
              <Button
                positive
                icon
                style={{width: '100%'}}
                as={'a'}
                href={`${process.env.REACT_APP_PAGE_BASE_PATH}${process.env.REACT_APP_PAGE_BASE_PATH.endsWith('/') ? '' : '/'}hotseat?position=${gameGame.compressedFullNotation}`}
                title={'Click to open hotseat with this game'}
                target={'_blank'}
              >
                <Icon name={'share'}/> Edit position
              </Button>
            </Grid.Column>
          </Grid>
        </Segment>
        <Segment>
          <GameList user={user} selectLiveGame={selectLiveGame} games={myLiveGames} usersById={usersById} terse live currentGameId={game ? game.id : null} />
          {otherLiveGames.length ? (
            <GameList user={user} selectLiveGame={selectLiveGame} games={otherLiveGames} usersById={usersById} terse live currentGameId={game ? game.id : null} />
          ) : null}
        </Segment>
        <Play
          user={user}
          defaultSettings={client.settings}
          otherUser={otherUser}
          changeSettings={this.changeSettings}
          game={gameGame}
          matchGame={game}
          names={{[Game.PLAYER_A]: playerA.name, [Game.PLAYER_B]: playerB.name}}
          allowControl={[userPlayer].filter(player => player)}
          submit={this.submit}
          challengeUser={this.challengeUser}
          stopChallengeUser={this.stopChallengeUser}
          challengedUser={challengedUser}
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
  gamesInfo: PropTypes.object.isRequired,
  selectLiveGame: PropTypes.func.isRequired,
  game: PropTypes.object,
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
    const {selectLiveGame, game, user, usersInfo: {byId}, gamesInfo: {live, myLive}} = this.props;
    if (!Object.values(byId).length) {
      return null;
    }
    const gameGame = this.gameGame;
    return (
      <Switch>
        <Route exact path={this.props.match.path}>
          <Segment>
            <Header as={'h2'}>My live games ({myLive.length})</Header>
            <GameList user={user} usersById={byId} games={myLive} selectLiveGame={selectLiveGame} />
          </Segment>
          <Segment>
            <Header as={'h2'}>Live games ({live.length})</Header>
            <GameList user={user} usersById={byId} games={live} selectLiveGame={selectLiveGame} />
          </Segment>
        </Route>
        <Route path={`${this.props.match.path}/:id`}>
          <ChosenOnlineGame game={game} gameGame={gameGame} selectLiveGame={selectLiveGame} />
        </Route>
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
  gamesInfo: PropTypes.object.isRequired,
  selectLiveGame: PropTypes.func.isRequired,
};

export default withRouter(withClient(OnlineGame));
