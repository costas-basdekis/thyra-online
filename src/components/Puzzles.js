import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import Game from "../game/game";
import {Button, Grid, Header, Icon, Label, Menu, Message, Modal, Segment, Tab} from "semantic-ui-react";
import Play from "./Play";
import {withClient} from "../client/withClient";
import _ from 'lodash';
import "../styles/puzzles.css";
import PuzzleList from "./PuzzleList";
import {Link, NavLink, Route, Switch, withRouter} from "react-router-dom";
import CreatePuzzle from "./CreatePuzzle";
import EditPuzzle from "./EditPuzzle";
import * as utils from "../utils";
import {GameCard} from "./GameList";

class Puzzles extends Component {
  render() {
    const {user, puzzlesInfo: {otherStarted, otherNotStarted, otherSolved, myPublic, myPrivate}} = this.props;

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
                <PuzzleList selectPuzzle={this.props.selectLivePuzzle} puzzles={items} />
              )}
            ))} />
          </Fragment>
        </Route>
        {(user && user.admin) ? (
          <Route exact path={`${this.props.match.path}/create`}>
            <CreatePuzzle />
          </Route>
        ) : null}
        {(user && user.admin) ? (
          <Route exact path={`${this.props.match.path}/:id/edit`}>
            <EditPuzzle />
          </Route>
        ) : null}
        <Route exact path={`${this.props.match.path}/:id`}>
          <PuzzlePlayer
            selectLiveGame={this.props.selectLiveGame}
            selectLivePuzzle={this.props.selectLivePuzzle}
          />
        </Route>
      </Switch>
    );
  }
}

Puzzles.propTypes = {
  user: PropTypes.object,
  client: PropTypes.object.isRequired,
  livePuzzle: PropTypes.object,
  selectLiveGame: PropTypes.func.isRequired,
  selectLivePuzzle: PropTypes.func.isRequired,
};

class PuzzlePlayer extends Component {
  state = {
    puzzleId: this.puzzle ? this.puzzle.id : null,
    game: this.getResumedPuzzleGame(),
    submittedGame: null,
    path: this.puzzle ? [] : null,
    wrongMove: false,
    won: false,
  };

  get puzzle() {
    const {match, puzzlesInfo: {byId}} = this.props;
    const puzzle = byId[match.params.id];
    return puzzle;
  }

  get userPuzzle() {
    const puzzle = this.puzzle;
    if (!puzzle) {
      return null;
    }
    const {user} = this.props;
    return user.puzzles[puzzle.id] || {
      meta: {
        started: false,
        mistakes: 0,
        won: false,
      },
      startingPosition: {
        position: puzzle.startingPosition.position,
        invalidPlayerPositions: [],
        playerResponses: [],
      },
    };
  }

  componentDidMount() {
    const puzzle = this.puzzle;

    if (puzzle) {
      this.props.selectLivePuzzle(puzzle);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const puzzle = this.puzzle;

    if (puzzle && prevState.puzzleId !== puzzle.id) {
      this.props.selectLivePuzzle(puzzle);
      this.setState({
        puzzleId: puzzle.id,
        game: this.getResumedPuzzleGame(),
        submittedGame: null,
        path: [],
        wrongMove: false,
        won: false,
      });
    }
    if (!puzzle && this.state.puzzleId) {
      this.setState({
          puzzleId: null,
          game: null,
          submittedGame: null,
          path: [],
          wrongMove: false,
          won: false,
      });
    }
    if (puzzle && this.props.user && this.state.submittedGame) {
      this.updatePuzzle(this.state.submittedGame, {askServer: false});
    }
  }

  submit = (moves, newGame) => {
    if (this.state.won) {
      return;
    }

    this.updatePuzzle(newGame, {askServer: true});
  };

  getResumedPuzzleGame() {
    const userPuzzle = this.userPuzzle;
    if (!userPuzzle) {
      return null;
    }
    let resultingGame = Game.Classic.fromCompressedPositionNotation(userPuzzle.startingPosition.position);
    let userPuzzleStep = userPuzzle.startingPosition;
    while (userPuzzleStep) {
      const lastPlayerResponse = userPuzzleStep.playerResponses[userPuzzleStep.playerResponses.length - 1];
      if (!lastPlayerResponse) {
        break;
      }
      resultingGame = resultingGame.makeMoves(lastPlayerResponse.moves);
      if (!lastPlayerResponse.puzzleResponse) {
        break;
      }
      resultingGame = resultingGame.makeMoves(lastPlayerResponse.puzzleResponse.moves);
      userPuzzleStep = lastPlayerResponse.puzzleResponse;
    }

    return resultingGame;
  }

  updatePuzzle(gameToUpdate, {askServer = true} = {}) {
    const {user} = this.props;
    if (!user) {
      return;
    }
    const puzzle = this.puzzle;
    const userPuzzle = this.userPuzzle;

    const history = gameToUpdate.history;
    let userPuzzleStep = userPuzzle.startingPosition;
    let remainingHistory = history.slice(1).filter((game, index) => index % 2 === 0);
    if (!remainingHistory.length) {
      return;
    }
    while (remainingHistory.length) {
      const historyGame = remainingHistory.shift();
      if (userPuzzleStep.invalidPlayerPositions.includes(historyGame.positionNotation)) {
        this.setState({
          wrongMove: true,
          won: false,
          submittedGame: null,
        });
        return;
      }
      const validPlayerResponse = userPuzzleStep.playerResponses
        .find(response => response.position === historyGame.positionNotation);
      if (!validPlayerResponse) {
        if (askServer) {
          this.props.client.submitPuzzleMove(puzzle, gameToUpdate.path.filter((item, index) => index % 2 === 0));
          this.setState({submittedGame: gameToUpdate});
        }
        return;
      }
      if (!validPlayerResponse.puzzleResponse) {
        this.setState({
          wrongMove: false,
          won: true,
          game: historyGame.positionNotation !== this.state.game.positionNotation ? historyGame : this.state.game,
          submittedGame: null,
        });
        return;
      }
      userPuzzleStep = validPlayerResponse.puzzleResponse;
    }

    this.setState({
      game: gameToUpdate.makeMoves(userPuzzleStep.moves),
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

  dismissUrlPuzzleError = () => {
    this.props.selectLivePuzzle(null);
  };

  close = () => {
    this.props.selectLivePuzzle(null);
  };

  sharePuzzle = e => {
    const url = window.location.href;
    if (navigator.share) {
      const puzzle = this.puzzle;
      navigator.share({
        title: `Thyra Online - Solve puzzle ${utils.getPuzzleTitle(puzzle)}`,
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
    const puzzle = this.puzzle;
    if (!puzzle) {
      return (
        <Fragment>
          <Modal
            open={true}
            size={'mini'}
            onClose={this.dismissUrlPuzzleError}
            header={'Could not find puzzle'}
            content={'This puzzle cannot be found. Please check that you copied the full URL, or perhaps the puzzle was removed'}
            actions={[{key: 'ok', content: 'OK', positive: true}]}
          />
          Could not find puzzle
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
      puzzlesInfo: {byGameId: puzzlesByGameId},
      location, selectLiveGame,
    } = this.props;
    const userIsCreator = !puzzle.id || (!!user && puzzle.userId === user.id);
    const message = (
      wrongMove ? (
        <Message error icon={'warning'} content={"That's not the right answer"} />
      ) : won ? (
        <Message success icon={'check'} content={"Correct! You solved it!"} />
      ) : (
        <Message content={utils.getPuzzleTitle(puzzle)} />
      )
    );
    return (
      <Fragment>
        <Grid centered>
          <Grid.Row>
            <Menu stackable size={'massive'} inverted items={[
              {key: 'close', content: 'Close', icon: 'x', onClick: this.close, color: 'red', active: true},
              {key: 'share', content: 'Share Game', icon: 'share', onClick: this.sharePuzzle, as: NavLink,
                to: location.pathname, color: 'green', active: true,
                title: navigator.share ? 'Click to open the sharing menu' : 'Click to copy URL to puzzle'},
              (puzzle.isMyPuzzle ? {key: 'edit', content: 'Edit puzzle', icon: 'edit', as: NavLink,
                to: `/puzzle/${puzzle.id}/edit`, color: 'green', active: true,
                title: 'Click to edit the puzzle'} : null),
            ].filter(item => item)} />
          </Grid.Row>
          <Grid.Row>
            <Segment>
              <Header as={'h1'}>{utils.getPuzzleTitle(puzzle)}</Header>
              <Header as={'h4'} className={'difficulty-header'}>{this.getDifficultyStars(puzzle.meta.difficulty, puzzle.meta.maxDifficulty)}</Header>
              {puzzle.meta.source ? <Header as={'h4'}>{puzzle.meta.source}</Header> : null}
              {puzzle.meta.gameId ? (
                <Header as={'h4'}>
                  {won || userIsCreator ? (
                    <Fragment>
                      From{" "}
                      <GameCard
                        user={null}
                        usersById={usersById}
                        tournamentsById={tournamentsById}
                        puzzlesByGameId={puzzlesByGameId}
                        game={gamesById[puzzle.meta.gameId]}
                        selectLiveGame={selectLiveGame}
                        terse
                        live
                        applicableSettings={client.applicableSettings}
                      />
                    </Fragment>
                  ) : "Solve puzzle to see source game"}
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
          allowControl={[puzzle.options.initialPlayer]}
          names={{[puzzle.options.initialPlayer]: 'You', [Game.OTHER_PLAYER[puzzle.options.initialPlayer]]: 'Puzzle'}}
          submit={this.submit}
          onDisplayPositionChange={this.onDisplayPositionChange}
        >
          {message}
        </Play>
      </Fragment>
    );
  }
}

PuzzlePlayer.propTypes = {
  user: PropTypes.object,
  client: PropTypes.object.isRequired,
  usersInfo: PropTypes.object.isRequired,
  gamesInfo: PropTypes.object.isRequired,
  tournamentsInfo: PropTypes.object.isRequired,
  puzzlesInfo: PropTypes.object.isRequired,
  selectLiveGame: PropTypes.func.isRequired,
  selectLivePuzzle: PropTypes.func.isRequired,
};

PuzzlePlayer = withRouter(withClient(PuzzlePlayer));

export default withRouter(withClient(Puzzles));
