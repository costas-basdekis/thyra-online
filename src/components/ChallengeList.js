import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Label, Card, Grid, Pagination} from "semantic-ui-react";

import Game from "../game/game";
import Board from "./Board";
import {NavLink} from "react-router-dom";
import {withClient} from "../client/withClient";
import * as utils from "../utils";

export class ChallengeCard extends Component {
  selectChallenge = () => {
    this.props.selectChallenge(this.props.challenge);
  };

  get userChallenge() {
    const {user, challenge} = this.props;
    if (!user) {
      return null;
    }
    if (!challenge) {
      return null;
    }
    return user.challenges[challenge.id] || null;
  }

  render() {
    const {user, applicableSettings, usersById, gamesById, challenge, currentChallengeId} = this.props;
    const userChallenge = this.userChallenge;

    const creator = usersById[challenge.userId];
    const userIsCreator = !!user && challenge.userId === user.id;
    const game = gamesById[challenge.meta.gameId];
    const playerA = game ? usersById[game.userIds[0]] : null;
    const playerB = game ? usersById[game.userIds[1]] : null;
    const userInProgress = !!userChallenge && userChallenge.meta.started && !userChallenge.meta.won;
    const userSolvedChallenge = !!userChallenge && userChallenge.meta.won;
    const userMadeMistakes = !!userChallenge && !!userChallenge.meta.mistakes;
    return (
      <Card
        as={NavLink}
        to={`/puzzle/${challenge.id}`}
        onClick={this.selectChallenge}
        style={{
          ...(challenge.id === currentChallengeId ? {backgroundColor: 'lightgreen'} : {}),
        }}
      >
        <Card.Content>
          <Card.Header>
            {utils.getChallengeTitle(challenge)}
          </Card.Header>
          <Card.Meta>
            <Label
              icon={{
                name: {1: 'smile outline', 2: 'meh outline', 3: 'frown outline'}[challenge.meta.difficulty],
                color: {1: 'green', 2: 'orange', 3: 'red'}[challenge.meta.difficulty],
              }}
              content={`${challenge.meta.difficulty}/${challenge.meta.maxDifficulty}`}
              title={{1: 'Easy', 2: 'Medium', 3: 'Hard'}[challenge.meta.difficulty]}
            />
            <Label icon={'user'} content={`By ${creator.name}`} />
            {userInProgress ? (
              <Label
                  icon={{name: 'play', color: userMadeMistakes ? 'orange' : 'green'}}
                  content={userMadeMistakes ? `Started (${userChallenge.meta.mistakes} mistakes)` : 'Started'}
              />
            ) : userSolvedChallenge ? (
              <Label
                  icon={{name: 'trophy', color: userMadeMistakes ? 'orange' : 'green'}}
                  content={userMadeMistakes ?`Solved with ${userChallenge.meta.mistakes} mistakes` : 'Perfect'}
              />
            ) : userMadeMistakes ? (
              <Label
                  icon={{name: 'exclamation', color: 'orange'}}
                  content={`${userChallenge.meta.mistakes} mistakes`}
              />
            ) : null}
            {user && challenge.isMyChallenge ? (
              <Label
                icon={(
                  challenge.meta.public && challenge.meta.publishDatetime.isSameOrBefore()
                    ? {name: 'check', color: 'green'} : (
                      challenge.meta.public
                        ? {name: 'pause', color: 'yellow'} : {name: 'x', color: 'red'}
                    ))}
                content={(
                  challenge.meta.public && challenge.meta.publishDatetime.isSameOrBefore()
                    ? challenge.meta.publishDatetime.fromNow() : (
                      challenge.meta.public
                        ? challenge.meta.publishDatetime.toNow() : "Private"
                    ))}
              />
            ) : (
              <Label
                icon={'calendar'}
                content={challenge.meta.publishDatetime.fromNow()}
              />
            )}
            {challenge.usersStats && challenge.usersStats.attempted ? (
              <Label
                icon={'user'}
                content={`${challenge.usersStats.averagePerfectScore !== null ? challenge.usersStats.averagePerfectScore : 'No perfect solve'} (${challenge.usersStats.perfect}/${challenge.usersStats.imperfect}/${challenge.usersStats.attempted})`}
                title={`${challenge.usersStats.averagePerfectScore !== null ? `${challenge.usersStats.averagePerfectScore} average user score` : 'No perfect solve'} (${challenge.usersStats.perfect} perfect solves, out of ${challenge.usersStats.imperfect} solves, out of ${challenge.usersStats.attempted} attempts)`}
              />
            ) : null}
            {game ? (
              userSolvedChallenge || userIsCreator ? (
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
              game={Game.Classic.fromCompressedPositionNotation(challenge.startingPosition.position)}
              medium
              settings={applicableSettings}
            />
          </Card.Meta>
        </Card.Content>
      </Card>
    );
  }
}

ChallengeCard.propTypes = {
  user: PropTypes.object,
  usersById: PropTypes.object.isRequired,
  gamesById: PropTypes.object.isRequired,
  challenge: PropTypes.object.isRequired,
  selectChallenge: PropTypes.func.isRequired,
  currentChallengeId: PropTypes.string,
  applicableSettings: PropTypes.object.isRequired,
};

class ChallengeList extends Component {
  state = {
    activePage: 1,
  };

  onPageChange = (e, {activePage}) => {
    this.setState({activePage});
  };

  render() {
    const {
      client, user, usersInfo: {byId: usersById}, gamesInfo: {byId: gamesById},
      challenges, selectChallenge, currentChallengeId, pageSize,
    } = this.props;
    if (!Object.values(usersById).length) {
      return null;
    }
    let {activePage} = this.state;

    const totalPages = Math.ceil(challenges.length / pageSize);
    if (activePage > totalPages) {
      activePage = totalPages;
    }
    const visibleChallenges = challenges
      .slice((totalPages - activePage) * pageSize, (totalPages - activePage) * pageSize + pageSize)
      .reverse();

    return (
      <Fragment>
        <Card.Group style={{maxHeight: '400px', overflowY: 'auto'}}>
          {visibleChallenges.map(challenge => (
            <ChallengeCard
              key={challenge.id}
              user={user}
              usersById={usersById}
              gamesById={gamesById}
              challenge={challenge}
              selectChallenge={selectChallenge}
              currentChallengeId={currentChallengeId}
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

ChallengeList.propTypes = {
  user: PropTypes.object,
  usersInfo: PropTypes.object.isRequired,
  challenges: PropTypes.array.isRequired,
  selectChallenge: PropTypes.func.isRequired,
  currentChallengeId: PropTypes.string,
  pageSize: PropTypes.number.isRequired,
};

ChallengeList.defaultProps = {
  pageSize: 10,
};

export default withClient(ChallengeList);
