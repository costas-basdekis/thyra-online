import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Label, Card, Grid, Pagination} from "semantic-ui-react";

import Game from "../game/game";
import Board from "./Board";
import {NavLink} from "react-router-dom";
import {withClient} from "../client/withClient";
import * as utils from "../utils";
import {createSelector} from "reselect";

export class PuzzleCard extends Component {
  positionGameSelector = createSelector([
    props => props.puzzle.startingPosition.position,
  ], position => Game.Classic.fromCompressedPositionNotation(position));

  get positionGame() {
    return this.positionGameSelector(this.props);
  }

  selectPuzzle = () => {
    this.props.selectPuzzle(this.props.puzzle);
  };

  get userPuzzle() {
    const {user, puzzle} = this.props;
    if (!user) {
      return null;
    }
    if (!puzzle) {
      return null;
    }
    return user.puzzles[puzzle.id] || null;
  }

  render() {
    const {user, applicableSettings, usersById, gamesById, puzzle, currentPuzzleId} = this.props;
    const positionGame = this.positionGame;
    const userPuzzle = this.userPuzzle;

    const creator = usersById[puzzle.userId];
    const userIsCreator = !!user && puzzle.userId === user.id;
    const game = gamesById[puzzle.meta.gameId];
    const playerA = game ? usersById[game.userIds[0]] : null;
    const playerB = game ? usersById[game.userIds[1]] : null;
    const userInProgress = !!userPuzzle && userPuzzle.meta.started && !userPuzzle.meta.won;
    const userSolvedPuzzle = !!userPuzzle && userPuzzle.meta.won;
    const userMadeMistakes = !!userPuzzle && !!userPuzzle.meta.mistakes;
    return (
      <Card
        as={NavLink}
        to={`/puzzle/${puzzle.id}`}
        onClick={this.selectPuzzle}
        style={{
          ...(puzzle.id === currentPuzzleId ? {backgroundColor: 'lightgreen'} : {}),
        }}
      >
        <Card.Content>
          <Card.Header>
            {utils.getPuzzleTitle(puzzle)}
          </Card.Header>
          <Card.Meta>
            <Label
              icon={{
                name: {1: 'smile outline', 2: 'meh outline', 3: 'frown outline'}[puzzle.meta.difficulty],
                color: {1: 'green', 2: 'orange', 3: 'red'}[puzzle.meta.difficulty],
              }}
              content={`${puzzle.meta.difficulty}/${puzzle.meta.maxDifficulty}`}
              title={{1: 'Easy', 2: 'Medium', 3: 'Hard'}[puzzle.meta.difficulty]}
            />
            <Label icon={'user'} content={`By ${creator.name}`} />
            {userInProgress ? (
              <Label
                  icon={{name: 'play', color: userMadeMistakes ? 'orange' : 'green'}}
                  content={userMadeMistakes ? `Started (${userPuzzle.meta.mistakes} mistakes)` : 'Started'}
              />
            ) : userSolvedPuzzle ? (
              <Label
                  icon={{name: 'trophy', color: userMadeMistakes ? 'orange' : 'green'}}
                  content={userMadeMistakes ?`Solved with ${userPuzzle.meta.mistakes} mistakes` : 'Perfect'}
              />
            ) : userMadeMistakes ? (
              <Label
                  icon={{name: 'exclamation', color: 'orange'}}
                  content={`${userPuzzle.meta.mistakes} mistakes`}
              />
            ) : null}
            {user && puzzle.isMyPuzzle ? (
              <Label
                icon={(
                  puzzle.meta.public && puzzle.meta.publishDatetime.isSameOrBefore()
                    ? {name: 'check', color: 'green'} : (
                      puzzle.meta.public
                        ? {name: 'pause', color: 'yellow'} : {name: 'x', color: 'red'}
                    ))}
                content={(
                  puzzle.meta.public && puzzle.meta.publishDatetime.isSameOrBefore()
                    ? puzzle.meta.publishDatetime.fromNow() : (
                      puzzle.meta.public
                        ? puzzle.meta.publishDatetime.toNow() : "Private"
                    ))}
              />
            ) : (
              <Label
                icon={'calendar'}
                content={puzzle.meta.publishDatetime.fromNow()}
              />
            )}
            {puzzle.usersStats && puzzle.usersStats.attempted ? (
              <Label
                icon={'user'}
                content={`${puzzle.usersStats.averagePerfectScore !== null ? puzzle.usersStats.averagePerfectScore : 'No perfect solve'} (${puzzle.usersStats.perfect}/${puzzle.usersStats.imperfect}/${puzzle.usersStats.attempted})`}
                title={`${puzzle.usersStats.averagePerfectScore !== null ? `${puzzle.usersStats.averagePerfectScore} average user score` : 'No perfect solve'} (${puzzle.usersStats.perfect} perfect solves, out of ${puzzle.usersStats.imperfect} solves, out of ${puzzle.usersStats.attempted} attempts)`}
              />
            ) : null}
            {game ? (
              userSolvedPuzzle || userIsCreator ? (
                <Label
                  icon={'play'}
                  content={`${playerA ? playerA.name : 'Unknown'} vs ${playerB ? playerB.name : 'Unknown'}`}
                  title={`From game between ${playerA ? playerA.name : 'Unknown'} vs ${playerB ? playerB.name : 'Unknown'}`}
                />
              ) : (
                <Label icon={'play'} content={'Solve to see game'} />
              )
            ) : null}
            <Board
              game={positionGame}
              medium
              settings={applicableSettings}
            />
          </Card.Meta>
        </Card.Content>
      </Card>
    );
  }
}

PuzzleCard.propTypes = {
  user: PropTypes.object,
  usersById: PropTypes.object.isRequired,
  gamesById: PropTypes.object.isRequired,
  puzzle: PropTypes.object.isRequired,
  selectPuzzle: PropTypes.func.isRequired,
  currentPuzzleId: PropTypes.string,
  applicableSettings: PropTypes.object.isRequired,
};

class PuzzleList extends Component {
  state = {
    activePage: 1,
  };

  onPageChange = (e, {activePage}) => {
    this.setState({activePage});
  };

  render() {
    const {
      client, user, usersInfo: {byId: usersById}, gamesInfo: {byId: gamesById},
      puzzles, selectPuzzle, currentPuzzleId, pageSize,
    } = this.props;
    if (!Object.values(usersById).length) {
      return null;
    }
    let {activePage} = this.state;

    const totalPages = Math.ceil(puzzles.length / pageSize);
    if (activePage > totalPages) {
      activePage = totalPages;
    }
    const visiblePuzzles = puzzles
      .slice((totalPages - activePage) * pageSize, (totalPages - activePage) * pageSize + pageSize)
      .reverse();

    return (
      <Fragment>
        <Card.Group style={{maxHeight: '400px', overflowY: 'auto'}}>
          {visiblePuzzles.map(puzzle => (
            <PuzzleCard
              key={puzzle.id}
              user={user}
              usersById={usersById}
              gamesById={gamesById}
              puzzle={puzzle}
              selectPuzzle={selectPuzzle}
              currentPuzzleId={currentPuzzleId}
              applicableSettings={client.applicableSettings}
            />
          ))}
        </Card.Group>
        {totalPages > 1 ? (
          <Grid centered>
            <Grid.Row>
              <Pagination
                totalPages={totalPages}
                activePage={activePage}
                onPageChange={this.onPageChange}
                pointing
                secondary
              />
            </Grid.Row>
          </Grid>
        ) : null}
      </Fragment>
    );
  }
}

PuzzleList.propTypes = {
  user: PropTypes.object,
  usersInfo: PropTypes.object.isRequired,
  puzzles: PropTypes.array.isRequired,
  selectPuzzle: PropTypes.func.isRequired,
  currentPuzzleId: PropTypes.string,
  pageSize: PropTypes.number.isRequired,
};

PuzzleList.defaultProps = {
  pageSize: 10,
};

export default withClient(PuzzleList);
