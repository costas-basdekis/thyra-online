import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import Game from "../game/game";
import {Grid, Header, Icon, Message, Modal, Segment} from "semantic-ui-react";
import Play from "./Play";
import {withClient} from "../client/withClient";
import _ from 'lodash';
import "../styles/challenges.css";
import ChallengeList from "./ChallengeList";
import {Route, Switch, withRouter} from "react-router-dom";

class Challenges extends Component {
  render() {
    const {challengesInfo: {challenges}} = this.props;

    return (
      <Switch>
        <Route exact path={this.props.match.path}>
          <ChallengeList selectChallenge={this.props.selectLiveChallenge} challenges={challenges} />
        </Route>
        <Route path={`${this.props.match.path}/:id`}>
          <ChallengePlayer selectLiveChallenge={this.props.selectLiveChallenge}
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
  selectLiveChallenge: PropTypes.func.isRequired,
};

class ChallengePlayer extends Component {
  state = {
    game: this.challenge ? Game.fromCompressedPositionNotation(this.challenge.startingPosition.position) : null,
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

  componentDidMount() {
    const challenge = this.challenge;

    if (challenge) {
      this.props.selectLiveChallenge(challenge);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const challenge = this.challenge;

    if (challenge) {
      this.props.selectLiveChallenge(challenge);
      if (!this.state.game) {
        this.setState({
          game: Game.fromCompressedPositionNotation(challenge.startingPosition.position),
          submittedGame: null,
          path: [],
          wrongMove: false,
          won: false,
        });
      }
      if (this.props.user && this.state.submittedGame) {
        this.updateChallenge(this.state.submittedGame, {askServer: false});
      }
    }
  }

  submit = (moves, newGame) => {
    if (this.state.won) {
      return;
    }

    this.updateChallenge(newGame, {askServer: true});
  };

  updateChallenge(gameToUpdate, {askServer = true} = {}) {
    const {user} = this.props;
    if (!user) {
      return;
    }
    const challenge = this.challenge;
    const userChallenge = user.challenges[challenge.id] || {
      invalidPlayerPositions: [],
      playerResponses: [],
    };

    const history = gameToUpdate.history;
    let userChallengeStep = userChallenge;
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

    const {user, client} = this.props;
    const challengePrompt = challenge.options.type === 'mate'
      ? `Find mate in ${challenge.options.typeOptions.mateIn}`
      : 'Unknown challenge';
    const message = (
      wrongMove ? (
        <Message error icon={'warning'} content={"That's not the right answer"} />
      ) : won ? (
        <Message success icon={'check'} content={"Correct! You solved it!"} />
      ) : (
        <Message content={challengePrompt} />
      )
    );
    return (
      <Fragment>
        <Grid centered>
          <Grid.Row>
            <Segment>
              <Header as={'h1'}>{challengePrompt}</Header>
              <Header as={'h4'} className={'difficulty-header'}>{this.getDifficultyStars(challenge.meta.difficulty, challenge.meta.maxDifficulty)}</Header>
              <Header as={'h4'}>{challenge.meta.source}</Header>
            </Segment>
          </Grid.Row>
          <Grid.Row>
            {message}
          </Grid.Row>
        </Grid>
        <Play
          user={user}
          defaultSettings={client.settings}
          changeSettings={this.changeSettings}
          game={game}
          matchGame={game}
          allowControl={[challenge.options.initialPlayer]}
          names={{[challenge.options.initialPlayer]: 'You', [Game.OTHER_PLAYER[challenge.options.initialPlayer]]: 'Challenge'}}
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
  selectLiveChallenge: PropTypes.func.isRequired
};

ChallengePlayer = withRouter(withClient(ChallengePlayer));

export default withRouter(withClient(Challenges));
