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

  render() {
    const {user, usersById, challenge, currentChallengeId} = this.props;

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
          <Board
            className={'ui image floated right mini'}
            game={Game.fromCompressedPositionNotation(challenge.startingPosition.position)}
            small
            settings={user ? user.settings : undefined}
          />
          <Card.Header>
            {challenge.options.type === 'mate'
              ? `Find mate in ${challenge.options.typeOptions.mateIn}`
              : 'Unknown challenge'}
          </Card.Header>
          <Card.Meta>
            <Label icon={{name: 'star', color: 'yellow'}} content={`${challenge.meta.difficulty}/${challenge.meta.maxDifficulty}`} />
            <Label icon={'user'} content={usersById[challenge.userId].name} />
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
        <Card.Group style={{maxHeight: '300px', overflowY: 'auto'}}>
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
