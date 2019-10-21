import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Label, Card, Grid, Pagination} from "semantic-ui-react";

import Game from "../game/game";
import Board from "./Board";
import {NavLink} from "react-router-dom";
import {withClient} from "../client/withClient";

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
    const {user, usersById, challenge, currentChallengeId} = this.props;
    const userChallenge = this.userChallenge;

    const creator = usersById[challenge.userId];
    return (
      <Card
        as={NavLink}
        to={`/challenge/${challenge.id}`}
        onClick={this.selectChallenge}
        style={{
          ...(challenge.id === currentChallengeId ? {backgroundColor: 'lightgreen'} : {}),
        }}
      >
        <Card.Content>
          <Card.Header>
            {challenge.options.type === 'mate'
              ? `Find mate in ${challenge.options.typeOptions.mateIn}`
              : 'Unknown challenge'}
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
            {userChallenge && userChallenge.meta.started && !userChallenge.meta.won ? (
              <Label icon={{name: 'play', color: 'green'}} content={'Started'} />
            ) : null}
            {userChallenge && userChallenge.meta.won ? (
              <Label icon={{name: 'trophy', color: 'green'}} content={'Solved'} />
            ) : null}
            {userChallenge && userChallenge.meta.mistakes ? (
              <Label icon={{name: 'exclamation', color: 'red'}} content={`${userChallenge.meta.mistakes} mistakes`} />
            ) : null}
            {user && challenge.userId === user.id ? (
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
            <Board
              game={Game.fromCompressedPositionNotation(challenge.startingPosition.position)}
              medium
              settings={user ? user.settings : undefined}
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
  challenge: PropTypes.object.isRequired,
  selectChallenge: PropTypes.func.isRequired,
  currentChallengeId: PropTypes.string,
};

class ChallengeList extends Component {
  state = {
    activePage: 1,
  };

  onPageChange = (e, {activePage}) => {
    this.setState({activePage});
  };

  render() {
    const {user, usersInfo: {byId: usersById}, challenges, selectChallenge, currentChallengeId, pageSize} = this.props;
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
              challenge={challenge}
              selectChallenge={selectChallenge}
              currentChallengeId={currentChallengeId}
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
