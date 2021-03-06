import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {withClient} from "../client/withClient";
import {Card, Grid, Header, Label, Progress} from "semantic-ui-react";
import Board from "./Board";
import Game from "../game/game";
import GameList from "./GameList";
import {createSelector} from "reselect";
import {NavLink} from "react-router-dom";

class OpeningsDatabase extends Component {
  state = {
    step: this.props.gamesInfo.openingsDatabase,
    path: [],
    urlError: null,
  };

  static getGameAndErrorFromUrlPosition() {
    const params = new URLSearchParams(window.location.search);
    const position = params.get('position');
    if (position) {
      let game, error;
      try {
        game = Game.Classic.fromCompressedMoveNotation(position);
        if (!game) {
          error = 'The position was not valid';
        } else {
          error = null;
        }
      } catch (e) {
        game = null;
        error = 'The series of moves where not valid';
      }
      if (!game) {
        return {game: Game.Classic.create(), error};
      }
      return {game, error: false};
    } else {
      return {game: null, error: false};
    }
  }

  componentDidMount() {
    this.selectPathFromUrlPosition();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.gamesInfo.openingsDatabase !== this.props.gamesInfo.openingsDatabase) {
      const path = this.getPathForNewOpeningsDatabase();
      this.setState({
        step: path.length ? path[path.length - 1] : this.props.gamesInfo.openingsDatabase,
        path: path,
      });
    }
  }

  selectPathFromUrlPosition() {
    const {game, error} = this.constructor.getGameAndErrorFromUrlPosition();
    if (error) {
      this.setState({urlError: error});
    } else if (game) {
      const path = game.history.map(pastGame => ({
        position: pastGame.normalisedPositionNotation,
        displayPosition: pastGame.normalisedPositionNotation,
      }));
      if (this.props.gamesInfo.openingsDatabase) {
        this.setState({path: this.getPathForPositions(path)});
      } else {
        this.setState({path, urlError: null});
      }
    }
  }

  getPathForNewOpeningsDatabase() {
    return this.getPathForPositions(this.state.path.map(step => step.position));
  }

  getPathForPositions(positions) {
    let step = this.props.gamesInfo.openingsDatabase;
    const path = [];
    for (const position of positions) {
      step = step.next.find(nextStep => nextStep.position === position);
      if (!step) {
        break;
      }
      path.push(step);
    }
    return path;
  }

  selectStep = step => {
    this.setState(state => ({step, path: [...state.path.slice(0, state.path.indexOf(state.step) + 1), step]}));
  };

  selectStepIndex = index => {
    this.setState(state => ({step: state.path[index] || this.props.gamesInfo.openingsDatabase}));
  };

  goToStart = () => {
    this.setState({step: this.props.gamesInfo.openingsDatabase});
  };

  render() {
    const {
      client,
      usersInfo: {byId: usersById}, gamesInfo: {games, openingsDatabase}, tournamentsInfo: {byId: tournamentsById},
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
            {path.map((pathStep, index) => [pathStep, index]).reverse().map(([pathStep, index]) => (
              <OpeningsDatabaseHistoryCard
                key={index}
                step={pathStep}
                index={index}
                applicableSettings={client.applicableSettings}
                selectStepIndex={this.selectStepIndex}
                selected={pathStep === step}
              />
            ))}
            <Label icon={'play'} color={'green'} content={'Initial'} onClick={this.goToStart} as={'a'} />
          </Grid.Row>
        </Grid>
        <Header as={'h2'}>{step.next.length} Continuations</Header>
        <Card.Group>
          {step.next.map(nextStep => (
            <OpeningsDatabaseCard
              key={nextStep.displayPosition}
              openingsDatabase={openingsDatabase}
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

OpeningsDatabase.propTypes = {
  client: PropTypes.object.isRequired,
  usersInfo: PropTypes.object.isRequired,
  gamesInfo: PropTypes.object.isRequired,
  tournamentsInfo: PropTypes.object.isRequired,
  puzzlesInfo: PropTypes.object.isRequired,
  selectLiveGame: PropTypes.func.isRequired,
};

class OpeningsDatabaseCard extends Component {
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

  static gameCountSizes = [
    [4, 'tiny'],
    [14, 'small'],
    [34, 'medium'],
    [35, 'large'],
  ];

  gameSelector = createSelector([
    props => props.step,
    props => props.nextStep,
  ], (step, nextStep) => (
    nextStep.allMoves
      ? Game.Classic.fromMoves(nextStep.allMoves)
      : nextStep.moves
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
    return this.getValueByLevel(playerAWinPercentage, this.constructor.winPercentageColours);
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
    return this.getValueByLevel(playerAWinDiffPercentage, this.constructor.winDiffPercentageIcons);
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
    return this.getValueByLevel(playerAWinDiffPercentage, this.constructor.winDiffPercentageColours);
  });

  get winDiffPercentageColour() {
    return this.winDiffPercentageColourSelector(this.props);
  }

  gameCountSizesSelector = createSelector([
    props => props.nextStep.gameIds.length,
  ], gameCount => {
    return this.getValueByLevel(gameCount, this.constructor.gameCountSizes);
  });

  get gameCountSize() {
    return this.gameCountSizesSelector(this.props);
  }

  getValueByLevel(value, levels) {
    for (const [maxValue, level] of levels) {
      if (value <= maxValue) {
        return level;
      }
    }
    const [, lastLevel] = levels[levels.length - 1];
    return lastLevel;
  }

  render() {
    const {openingsDatabase, step, nextStep, applicableSettings} = this.props;
    const game = this.game;

    const previousPlayerAWinPercentage = 100 * step.winCount[Game.PLAYER_A] / step.gameIds.length;
    const playerAWinPercentage = 100 * nextStep.winCount[Game.PLAYER_A] / nextStep.gameIds.length;
    const playerAWinDiffPercentage = playerAWinPercentage - previousPlayerAWinPercentage;
    const playerBWinPercentage = 100 * nextStep.winCount[Game.PLAYER_B] / nextStep.gameIds.length;
    let winPercentageColour = this.winPercentageColour;
    let winDiffPercentageIcon = this.winDiffPercentageIcon;
    let winDiffPercentageColour = this.winDiffPercentageColour;
    let gameCountSize = this.gameCountSize;
    return (
      <Card as={NavLink} to={`/openings-database?position=${game.compressedFullNotation}`} onClick={this.onClick}>
        <Card.Content>
          <Card.Meta>
            <Label icon={'play'} content={
              `${nextStep.gameIds.length} games`
              + ` (${(100 * nextStep.gameIds.length / step.gameIds.length).toFixed()}%`
              + `, ${(100 * nextStep.gameIds.length / openingsDatabase.gameIds.length).toFixed()}% tot.)`
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
            <Progress
              percent={playerAWinPercentage.toFixed()}
              color={winPercentageColour}
              progress={'percent'}
              size={gameCountSize}
            />
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

OpeningsDatabaseCard.propTypes = {
  openingsDatabase: PropTypes.object.isRequired,
  step: PropTypes.object.isRequired,
  nextStep: PropTypes.object.isRequired,
  applicableSettings: PropTypes.object.isRequired,
  selectStep: PropTypes.func.isRequired,
};

class OpeningsDatabaseHistoryCard extends Component {
  gameSelector = createSelector([
    props => props.step.displayPosition,
    props => props.step.allMoves,
  ], (displayPosition, allMoves) => (
    allMoves
      ? Game.Classic.fromMoves(allMoves)
      : Game.Classic.fromCompressedPositionNotation(displayPosition)
  ));

  get game() {
    return this.gameSelector(this.props);
  }

  onSelect = () => {
    this.props.selectStepIndex(this.props.index);
  };

  render() {
    const {selected, applicableSettings} = this.props;
    const game = this.game;

    return (
      <NavLink to={`/openings-database?position=${game.compressedFullNotation}`}>
        <Board
          game={game}
          small
          onSelect={this.onSelect}
          selected={selected}
          settings={applicableSettings}
        />
      </NavLink>
    );
  }
}

OpeningsDatabaseHistoryCard.propTypes = {
  step: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  applicableSettings: PropTypes.object.isRequired,
  selectStepIndex: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
};

export default withClient(OpeningsDatabase);
