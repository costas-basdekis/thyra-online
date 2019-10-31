import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import Game from "../game/game";
import {Button, Grid, Header, Icon, Label, Menu, Message, Modal, Segment, Tab} from "semantic-ui-react";
import Play from "./Play";
import {withClient} from "../client/withClient";
import _ from 'lodash';
import "../styles/challenges.css";
import ChallengeList from "./ChallengeList";
import {Link, NavLink, Route, Switch, withRouter} from "react-router-dom";
import CreateChallenge from "./CreateChallenge";
import EditChallenge from "./EditChallenge";
import * as utils from "../utils";
import {GameCard} from "./GameList";

class Challenges extends Component {
  render() {
    const {user, challengesInfo: {otherStarted, otherNotStarted, otherSolved, myPublic, myPrivate}} = this.props;

    return (
      <Switch>
        <Route exact path={this.props.match.path}>
          <Fragment>
            {(user && user.admin) ? (
              <Segment>
                <Link to={`${this.props.match.path}/create`}><Button content={'Create Puzzle'} /></Link>
              </Segment>
            ) : null}
            <Tab menu={{pointing: true}} panes={[
              {key: 'other-started', label: "Started Puzzles", items: otherStarted, color: 'green'},
              {key: 'other-not-started', label: "New Puzzles", items: otherNotStarted},
              {key: 'other-solved', label: "Solved Puzzles", items: otherSolved},
              {key: 'my-public', label: "My Public Puzzles", items: myPublic},
              {key: 'my-private', label: "My Private Puzzles", items: myPrivate},
            ].filter(({items}) => items.length).map(({key, label, items, color}) => (
              {menuItem: {key, content: <Fragment>{label} <Label content={items.length} color={color} /></Fragment>}, render: () => (
                <ChallengeList selectChallenge={this.props.selectLiveChallenge} challenges={items} />
              )}
            ))} />
          </Fragment>
        </Route>
        {(user && user.admin) ? (
          <Route exact path={`${this.props.match.path}/create`}>
            <CreateChallenge />
          </Route>
        ) : null}
        {(user && user.admin) ? (
          <Route exact path={`${this.props.match.path}/:id/edit`}>
            <EditChallenge />
          </Route>
        ) : null}
        <Route exact path={`${this.props.match.path}/:id`}>
          <ChallengePlayer
            selectLiveGame={this.props.selectLiveGame}
            selectLiveChallenge={this.props.selectLiveChallenge}
          />
        </Route>
      </Switch>
    );
  }
}

Challenges.propTypes = {
  user: PropTypes.object,
  client: PropTypes.object.isRequired,
  liveChallenge: PropTypes.object,
  selectLiveGame: PropTypes.func.isRequired,
  selectLiveChallenge: PropTypes.func.isRequired,
};

class ChallengePlayer extends Component {
  state = {
    challengeId: this.challenge ? this.challenge.id : null,
    game: this.getResumedChallengeGame(),
    submittedGame: null,
    path: this.challenge ? [] : null,
    wrongMove: false,
    won: false,
  };

  get challenge() {
    const {match, challengesInfo: {byId}} = this.props;
    const challenge = byId[match.params.id];
    return challenge;
  }

  get userChallenge() {
    const challenge = this.challenge;
    if (!challenge) {
      return null;
    }
    const {user} = this.props;
    return user.challenges[challenge.id] || {
      meta: {
        started: false,
        mistakes: 0,
        won: false,
      },
      startingPosition: {
        position: challenge.startingPosition.position,
        invalidPlayerPositions: [],
        playerResponses: [],
      },
    };
  }

  componentDidMount() {
    const challenge = this.challenge;

    if (challenge) {
      this.props.selectLiveChallenge(challenge);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const challenge = this.challenge;

    if (challenge && prevState.challengeId !== challenge.id) {
      this.props.selectLiveChallenge(challenge);
      this.setState({
        challengeId: challenge.id,
        game: this.getResumedChallengeGame(),
        submittedGame: null,
        path: [],
        wrongMove: false,
        won: false,
      });
    }
    if (!challenge && this.state.challengeId) {
      this.setState({
          challengeId: null,
          game: null,
          submittedGame: null,
          path: [],
          wrongMove: false,
          won: false,
      });
    }
    if (challenge && this.props.user && this.state.submittedGame) {
      this.updateChallenge(this.state.submittedGame, {askServer: false});
    }
  }

  submit = (moves, newGame) => {
    if (this.state.won) {
      return;
    }

    this.updateChallenge(newGame, {askServer: true});
  };

  getResumedChallengeGame() {
    const userChallenge = this.userChallenge;
    if (!userChallenge) {
      return null;
    }
    let resultingGame = Game.Classic.fromCompressedPositionNotation(userChallenge.startingPosition.position);
    let userChallengeStep = userChallenge.startingPosition;
    while (userChallengeStep) {
      const lastPlayerResponse = userChallengeStep.playerResponses[userChallengeStep.playerResponses.length - 1];
      if (!lastPlayerResponse) {
        break;
      }
      resultingGame = resultingGame.makeMoves(lastPlayerResponse.moves);
      if (!lastPlayerResponse.challengeResponse) {
        break;
      }
      resultingGame = resultingGame.makeMoves(lastPlayerResponse.challengeResponse.moves);
      userChallengeStep = lastPlayerResponse.challengeResponse;
    }

    return resultingGame;
  }

  updateChallenge(gameToUpdate, {askServer = true} = {}) {
    const {user} = this.props;
    if (!user) {
      return;
    }
    const challenge = this.challenge;
    const userChallenge = this.userChallenge;

    const history = gameToUpdate.history;
    let userChallengeStep = userChallenge.startingPosition;
    let remainingHistory = history.slice(1).filter((game, index) => index % 2 === 0);
    if (!remainingHistory.length) {
      return;
    }
    while (remainingHistory.length) {
      const historyGame = remainingHistory.shift();
      if (userChallengeStep.invalidPlayerPositions.includes(historyGame.positionNotation)) {
        this.setState({
          wrongMove: true,
          won: false,
          submittedGame: null,
        });
        return;
      }
      const validPlayerResponse = userChallengeStep.playerResponses
        .find(response => response.position === historyGame.positionNotation);
      if (!validPlayerResponse) {
        if (askServer) {
          this.props.client.submitChallengeMove(challenge, gameToUpdate.path.filter((item, index) => index % 2 === 0));
          this.setState({submittedGame: gameToUpdate});
        }
        return;
      }
      if (!validPlayerResponse.challengeResponse) {
        this.setState({
          wrongMove: false,
          won: true,
          game: historyGame.positionNotation !== this.state.game.positionNotation ? historyGame : this.state.game,
          submittedGame: null,
        });
        return;
      }
      userChallengeStep = validPlayerResponse.challengeResponse;
    }

    this.setState({
      game: gameToUpdate.makeMoves(userChallengeStep.moves),
      wrongMove: false,
      won: false,
      submittedGame: null,
    });
  }

  onDisplayPositionChange = () => {
    if (this.state.wrongMove) {
      this.setState({wrongMove: false, submittedGame: null});
    }
  };

  getDifficultyStars(difficulty, maxDifficulty) {
    return _.range(maxDifficulty).map(index => (
      <Icon
        key={index}
        name={difficulty > index ? 'star' : 'star outline'}
        color={'yellow'}
      />
    ));
  }

  dismissUrlChallengeError = () => {
    this.props.selectLiveChallenge(null);
  };

  close = () => {
    this.props.selectLiveChallenge(null);
  };

  shareChallenge = e => {
    const url = window.location.href;
    if (navigator.share) {
      const challenge = this.challenge;
      navigator.share({
        title: `Thyra Online - Solve puzzle ${utils.getChallengeTitle(challenge)}`,
        text: `Solve Santorini puzzle`,
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
    if (!this.props.user) {
      return null;
    }
    const challenge = this.challenge;
    if (!challenge) {
      return (
        <Fragment>
          <Modal
            open={true}
            size={'mini'}
            onClose={this.dismissUrlChallengeError}
            header={'Could not find challenge'}
            content={'This challenge cannot be found. Please check that you copied the full URL, or perhaps the challenge was removed'}
            actions={[{key: 'ok', content: 'OK', positive: true}]}
          />
          Could not find challenge
        </Fragment>
      );
    }

    const {game, wrongMove, won} = this.state;
    if (!game) {
      return null;
    }

    const {
      client, user,
      usersInfo: {byId: usersById}, gamesInfo: {byId: gamesById}, tournamentsInfo: {byId: tournamentsById},
      location, selectLiveGame,
    } = this.props;
    const message = (
      wrongMove ? (
        <Message error icon={'warning'} content={"That's not the right answer"} />
      ) : won ? (
        <Message success icon={'check'} content={"Correct! You solved it!"} />
      ) : (
        <Message content={utils.getChallengeTitle(challenge)} />
      )
    );
    return (
      <Fragment>
        <Grid centered>
          <Grid.Row>
            <Menu stackable size={'massive'} inverted items={[
              {key: 'close', content: 'Close', icon: 'x', onClick: this.close, color: 'red', active: true},
              {key: 'share', content: 'Share Game', icon: 'share', onClick: this.shareChallenge, as: NavLink,
                to: location.pathname, color: 'green', active: true,
                title: navigator.share ? 'Click to open the sharing menu' : 'Click to copy URL to challenge'},
              (challenge.isMyChallenge ? {key: 'edit', content: 'Edit puzzle', icon: 'edit', as: NavLink,
                to: `/puzzle/${challenge.id}/edit`, color: 'green', active: true,
                title: 'Click to edit the puzzle'} : null),
            ].filter(item => item)} />
          </Grid.Row>
          <Grid.Row>
            <Segment>
              <Header as={'h1'}>{utils.getChallengeTitle(challenge)}</Header>
              <Header as={'h4'} className={'difficulty-header'}>{this.getDifficultyStars(challenge.meta.difficulty, challenge.meta.maxDifficulty)}</Header>
              {challenge.meta.source ? <Header as={'h4'}>{challenge.meta.source}</Header> : null}
              {challenge.meta.gameId ? (
                <Header as={'h4'}>
                  From
                  <GameCard
                    user={null}
                    usersById={usersById}
                    tournamentsById={tournamentsById}
                    game={gamesById[challenge.meta.gameId]}
                    selectLiveGame={selectLiveGame}
                    terse
                    live
                    applicableSettings={client.applicableSettings}
                  />
                </Header>
              ) : null}
            </Segment>
          </Grid.Row>
          <Grid.Row>
            {message}
          </Grid.Row>
        </Grid>
        <Play
          user={user}
          changeSettings={this.changeSettings}
          game={game}
          allowControl={[challenge.options.initialPlayer]}
          names={{[challenge.options.initialPlayer]: 'You', [Game.OTHER_PLAYER[challenge.options.initialPlayer]]: 'Puzzle'}}
          submit={this.submit}
          onDisplayPositionChange={this.onDisplayPositionChange}
        >
          {message}
        </Play>
      </Fragment>
    );
  }
}

ChallengePlayer.propTypes = {
  user: PropTypes.object,
  client: PropTypes.object.isRequired,
  usersInfo: PropTypes.object.isRequired,
  gamesInfo: PropTypes.object.isRequired,
  tournamentsInfo: PropTypes.object.isRequired,
  selectLiveGame: PropTypes.func.isRequired,
  selectLiveChallenge: PropTypes.func.isRequired,
};

ChallengePlayer = withRouter(withClient(ChallengePlayer));

export default withRouter(withClient(Challenges));
