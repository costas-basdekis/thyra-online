import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Grid, Icon, Label, Menu, Modal, Responsive, Segment, Tab} from "semantic-ui-react";
import { createSelector } from 'reselect';

import {withClient} from "../client/withClient";
import Game from "../game/game";
import Play from "./Play";
import {NavLink, Route, Switch, withRouter} from "react-router-dom";
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
      tournamentsInfo: {byId: tournamentsById},
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

    const gamesNode = (
      <Segment>
        <GameList
          user={user}
          selectLiveGame={selectLiveGame}
          games={myLiveGames}
          usersById={usersById}
          tournamentsById={tournamentsById}
          terse
          live
          currentGameId={game ? game.id : null}
        />
        {otherLiveGames.length ? (
          <GameList
            user={user}
            selectLiveGame={selectLiveGame}
            games={otherLiveGames}
            usersById={usersById}
            tournamentsById={tournamentsById}
            terse
            live
            currentGameId={game ? game.id : null}
          />
        ) : null}
      </Segment>
    );

    return (
      <Fragment>
        <Settings/>
        <Grid centered>
          <Grid.Row>
            <Menu stackable size={'massive'} inverted items={[
              {key: 'close', content: 'Close', icon: 'x', onClick: this.close, color: 'red', active: true},
              {key: 'share', content: 'Share Game', icon: 'share', onClick: this.shareGame, as: NavLink,
                to: location.pathname, color: 'green', active: true,
                title: navigator.share ? 'Click to open the sharing menu' : 'Click to copy URL to game'},
              {key: 'edit', content: 'Edit position', icon: 'edit', as: NavLink,
                to: `/hotseat?position=${gameGame.compressedFullNotation}`, color: 'green', active: true,
                title: 'Click to open hotseat with this game', target: '_blank'},
            ]} />
          </Grid.Row>
          <Grid.Row>
            <Menu stackable size={'massive'} items={[
              {key: 'player-a', content: (
                <Fragment>
                  {isUserPlayerA ? <Label color={'green'} icon={"user"} content={'Me'} /> : null}
                  <OnlineGamePlayer game={game} player={playerA} />
                </Fragment>
              ), color: isUserPlayerA ? 'green' : undefined},
              {key: 'player-b', content: (
                <Fragment>
                  {isUserPlayerB ? <Label color={'green'} icon={"user"} content={'Me'} /> : null}
                  <OnlineGamePlayer game={game} player={playerB} />
                </Fragment>
              ), color: isUserPlayerB ? 'green' : undefined},
            ]}/>
          </Grid.Row>
        </Grid>
        <Responsive as={Fragment} maxWidth={800}>
          {gamesNode}
        </Responsive>
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
        >
          <Responsive as={Grid.Row} minWidth={800}>
            {gamesNode}
          </Responsive>
        </Play>
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
  tournamentsInfo: PropTypes.object.isRequired,
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
    const {
      selectLiveGame, game, user, usersInfo: {byId}, gamesInfo: {myLive, otherLive, myFinished, otherFinished},
      tournamentsInfo: {byId: tournamentsById},
    } = this.props;
    if (!Object.values(byId).length) {
      return null;
    }
    const gameGame = this.gameGame;
    return (
      <Switch>
        <Route exact path={this.props.match.path}>
          <Segment>
            <Tab menu={{pointing: true}} panes={[
              {key: 'my-live', label: "My Live games", items: myLive, color: 'green'},
              {key: 'other-live', label: "Other Live games", items: otherLive, color: 'green'},
              {key: 'my-past', label: "My Past games", items: myFinished},
              {key: 'other-past', label: "Other Past games", items: otherFinished},
            ].filter(({items}) => items.length).map(({key, label, items, color}) => (
              {menuItem: {key, content: <Fragment>{label} <Label content={items.length} color={color} /></Fragment>}, render: () => (
                <GameList user={user} usersById={byId} tournamentsById={tournamentsById} games={items} selectLiveGame={selectLiveGame} />
              )}
            ))} />
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
  tournamentsInfo: PropTypes.object.isRequired,
  selectLiveGame: PropTypes.func.isRequired,
};

export default withRouter(withClient(OnlineGame));
