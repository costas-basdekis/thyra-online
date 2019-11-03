import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {withClient} from "../client/withClient";
import {Card, Grid, Header, Label, Progress} from "semantic-ui-react";
import Board from "./Board";
import Game from "../game/game";
import GameList from "./GameList";
import {createSelector} from "reselect";

class OpeningDatabase extends Component {
  state = {
    step: this.props.gamesInfo.openingDatabase,
    path: [],
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.gamesInfo.openingDatabase !== this.props.gamesInfo.openingDatabase) {
      this.setState({step: this.props.gamesInfo.openingDatabase, path: this.getPathForNewOpeningDatabase()});
    }
  }

  getPathForNewOpeningDatabase() {
    let step = this.props.gamesInfo.openingDatabase;
    const path = [];
    for (const oldStep of this.state.path.slice(1)) {
      step = step.next.find(nextStep => nextStep.position === oldStep.position);
      if (!step) {
        break;
      }
      path.push(step);
    }
    return path;
  }

  selectStep = step => {
    this.setState(state => ({step, path: [...state.path, step]}));
  };

  selectStepIndex = index => {
    this.setState(state => ({step: state.path[index - 1] || this.props.gamesInfo.openingDatabase, path: state.path.slice(0, index)}));
  };

  render() {
    const {
      client,
      usersInfo: {byId: usersById}, gamesInfo: {games, openingDatabase}, tournamentsInfo: {byId: tournamentsById},
      puzzlesInfo: {byId: puzzlesByGameId},
      selectLiveGame,
    } = this.props;
    const {step, path} = this.state;

    if (!step) {
      return null;
    }

    return (
      <Fragment>
        <Grid centered>
          <Grid.Row>
            {path.map((step, index) => [step, index]).reverse().map(([step, index]) => (
              <OpeningDatabaseHistoryCard
                key={index}
                step={step}
                index={index}
                applicableSettings={client.applicableSettings}
                selectStepIndex={this.selectStepIndex}
              />
            ))}
          </Grid.Row>
        </Grid>
        <Header as={'h2'}>{step.next.length} Continuations</Header>
        <Card.Group>
          {step.next.map(nextStep => (
            <OpeningDatabaseCard
              key={nextStep.displayPosition}
              openingDatabase={openingDatabase}
              step={step}
              nextStep={nextStep}
              applicableSettings={client.applicableSettings}
              selectStep={this.selectStep}
            />
          ))}
        </Card.Group>
        <Header as={'h2'}>{step.gameIds.length} Games</Header>
        <GameList
          puzzlesByGameId={puzzlesByGameId}
          tournamentsById={tournamentsById}
          selectLiveGame={selectLiveGame}
          games={games.filter(game => step.gameIds.includes(game.id))}
          applicableSettings={client.applicableSettings}
          usersById={usersById}
        />
      </Fragment>
    );
  }
}

OpeningDatabase.propTypes = {
  client: PropTypes.object.isRequired,
  usersInfo: PropTypes.object.isRequired,
  gamesInfo: PropTypes.object.isRequired,
  tournamentsInfo: PropTypes.object.isRequired,
  puzzlesInfo: PropTypes.object.isRequired,
  selectLiveGame: PropTypes.func.isRequired,
};

class OpeningDatabaseCard extends Component {
  static winPercentageColours = [
    [25, 'red'],
    [45, 'orange'],
    [55, 'yellow'],
    [75, 'olive'],
    [100, 'green'],
  ];

  static winDiffPercentageColours = [
    [-20, 'red'],
    [-5, 'orange'],
    [5, 'yellow'],
    [20, 'olive'],
    [35, 'green'],
  ];

  static winDiffPercentageIcons = [
    [-20, 'angle double down'],
    [-5, 'angle down'],
    [5, 'angle right'],
    [20, 'angle up'],
    [35, 'angle double up'],
  ];

  gameSelector = createSelector([
    props => props.step,
    props => props.nextStep,
  ], (step, nextStep) => (
    nextStep.moves
      ? Game.Classic.fromCompressedPositionNotation(step.displayPosition).makeMoves(nextStep.moves)
      : Game.Classic.fromCompressedPositionNotation(nextStep.displayPosition)
  ));

  get game() {
    return this.gameSelector(this.props);
  }

  onClick = () => {
    this.props.selectStep(this.props.nextStep)
  };

  winPercentageColourSelector = createSelector([
    props => props.nextStep,
  ], nextStep => {
    const playerAWinPercentage = 100 * nextStep.winCount[Game.PLAYER_A] / nextStep.gameIds.length;
    return this.getPercentageColour(playerAWinPercentage, this.constructor.winPercentageColours);
  });

  get winPercentageColour() {
    return this.winPercentageColourSelector(this.props);
  }

  winDiffPercentageIconSelector = createSelector([
    props => props.step,
    props => props.nextStep,
  ], (step, nextStep) => {
    const previousPlayerAWinPercentage = 100 * step.winCount[Game.PLAYER_A] / step.gameIds.length;
    const playerAWinPercentage = 100 * nextStep.winCount[Game.PLAYER_A] / nextStep.gameIds.length;
    const playerAWinDiffPercentage = playerAWinPercentage - previousPlayerAWinPercentage;
    return this.getPercentageColour(playerAWinDiffPercentage, this.constructor.winDiffPercentageIcons);
  });

  get winDiffPercentageIcon() {
    return this.winDiffPercentageIconSelector(this.props);
  }

  winDiffPercentageColourSelector = createSelector([
    props => props.step,
    props => props.nextStep,
  ], (step, nextStep) => {
    const previousPlayerAWinPercentage = 100 * step.winCount[Game.PLAYER_A] / step.gameIds.length;
    const playerAWinPercentage = 100 * nextStep.winCount[Game.PLAYER_A] / nextStep.gameIds.length;
    const playerAWinDiffPercentage = playerAWinPercentage - previousPlayerAWinPercentage;
    return this.getPercentageColour(playerAWinDiffPercentage, this.constructor.winDiffPercentageColours);
  });

  get winDiffPercentageColour() {
    return this.winDiffPercentageColourSelector(this.props);
  }

  getPercentageColour(percentage, percentageColours) {
    for (const [maxPercentage, colour] of percentageColours) {
      if (percentage <= maxPercentage) {
        return colour;
      }
    }
    const [, lastColour] = percentageColours[percentageColours.length - 1];
    return lastColour;
  }

  render() {
    const {openingDatabase, step, nextStep, applicableSettings} = this.props;
    const game = this.game;

    const previousPlayerAWinPercentage = 100 * step.winCount[Game.PLAYER_A] / step.gameIds.length;
    const playerAWinPercentage = 100 * nextStep.winCount[Game.PLAYER_A] / nextStep.gameIds.length;
    const playerAWinDiffPercentage = playerAWinPercentage - previousPlayerAWinPercentage;
    const playerBWinPercentage = 100 * nextStep.winCount[Game.PLAYER_B] / nextStep.gameIds.length;
    let winPercentageColour = this.winPercentageColour;
    let winDiffPercentageIcon = this.winDiffPercentageIcon;
    let winDiffPercentageColour = this.winDiffPercentageColour;
    return (
      <Card onClick={this.onClick}>
        <Card.Content>
          <Card.Meta>
            <Label icon={'play'} content={
              `${nextStep.gameIds.length} games`
              + ` (${(100 * nextStep.gameIds.length / step.gameIds.length).toFixed()}%`
              + `, ${(100 * nextStep.gameIds.length / openingDatabase.gameIds.length).toFixed()}% tot.)`
            } />
            <Label
              icon={{name: 'chess king', color: 'grey'}}
              content={`${playerAWinPercentage.toFixed()}%`}
            />
            <Label
              icon={{name: 'chess king', color: 'black'}}
              content={`${playerBWinPercentage.toFixed()}%`}
            />
            <Label
              icon={{name: winDiffPercentageIcon, color: winDiffPercentageColour}}
              content={`${playerAWinDiffPercentage > 0 ? '+' : ''}${playerAWinDiffPercentage.toFixed()}%`}
            />
            <Progress percent={playerAWinPercentage.toFixed()} color={winPercentageColour} progress={'percent'} />
            <Board
              game={game}
              medium
              settings={applicableSettings}
              showArrows={applicableSettings.theme.arrows}
            />
          </Card.Meta>
        </Card.Content>
      </Card>
    );
  }
}

OpeningDatabaseCard.propTypes = {
  openingDatabase: PropTypes.object.isRequired,
  step: PropTypes.object.isRequired,
  nextStep: PropTypes.object.isRequired,
  applicableSettings: PropTypes.object.isRequired,
  selectStep: PropTypes.func.isRequired,
};

class OpeningDatabaseHistoryCard extends Component {
  gameSelector = createSelector([
    props => props.step.displayPosition,
  ], displayPosition => Game.Classic.fromCompressedPositionNotation(displayPosition));

  get game() {
    return this.gameSelector(this.props);
  }

  onSelect = () => {
    this.props.selectStepIndex(this.props.index);
  };

  render() {
    const {applicableSettings} = this.props;
    const game = this.game;

    return (
      <Board
        game={game}
        small
        onSelect={this.onSelect}
        settings={applicableSettings}
      />
    );
  }
}

OpeningDatabaseHistoryCard.propTypes = {
  step: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  applicableSettings: PropTypes.object.isRequired,
  selectStepIndex: PropTypes.func.isRequired,
};

export default withClient(OpeningDatabase);
