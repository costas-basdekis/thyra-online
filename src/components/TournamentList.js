import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Label, Card, Grid, Pagination} from "semantic-ui-react";
import moment from 'moment';
import {NavLink} from "react-router-dom";

class TournamentCard extends Component {
  selectLiveTournament = () => {
    this.props.selectLiveTournament(this.props.tournament);
  };

  render() {
    const {user, usersById, currentTournamentId, tournament, terse} = this.props;

    const isMyTournament = user ? tournament.userIds.includes(user.id) : false;
    const didUserCreated = user ? tournament.creatorUserId === user.id : false;
    const didUserWin = tournament.finished ? tournament.winnerUserId === user.id : false;
    const creator = usersById[tournament.creatorUserId];

    const statusLabel = (
      <Label
        content={tournament.started ? (tournament.finished ? 'Finished' : `Round ${tournament.round}/${tournament.rounds}`) : 'Waiting'}
        icon={{
          name: tournament.started ? (tournament.finished ? 'trophy' : 'play') : 'hourglass',
          colour: tournament.started ? 'green' : undefined,
        }}
      />
    );

    return (
      <Card
        as={NavLink}
        to={`/tournament/${tournament.id}`}
        // onClick={this.selectLiveTournament}
        style={{
          ...(!terse ? {} : {width: 'auto'}),
          ...(tournament.id === currentTournamentId ? {backgroundColor: 'lightgreen'} : {}),
        }}
      >
        <Card.Content>
          <Card.Header>
            <Label content={tournament.name} /> by
            <Label color={didUserCreated ? 'green' : undefined} content={creator.name} />
            {terse ? statusLabel : null}
          </Card.Header>
          {!terse ? (
            <Card.Meta>
              {isMyTournament ? <Label icon={{name: 'user', color: 'green'}} content={'Participating'} /> : null}
              {" "}
              {didUserWin ? <Label icon={{name: 'trophy', color: 'yellow'}} content={'Won'} /> : (
                tournament.finished ? (
                  <Label icon={'trophy'} content={usersById[tournament.winnerUserId] ? usersById[tournament.winnerUserId].name : tournament.winnerUserId} />
                ) : null
              )}
              {" "}
              {tournament.started && !tournament.finished ? <Label icon={{name: 'circle', color: 'green'}} content={'Live'} /> : null}
              {" "}
              {statusLabel}
              {" "}
              <Label content={`${tournament.userIds.length} players`} icon={'users'} />
              {" "}
              <Label content={moment(tournament.endDatetime || tournament.startDatetime || tournament.createdDate).from()} icon={'calendar'} />
            </Card.Meta>
          ) : null}
        </Card.Content>
      </Card>
    );
  }
}

TournamentCard.propTypes = {
  user: PropTypes.object,
  usersById: PropTypes.object.isRequired,
  tournament: PropTypes.object.isRequired,
  currentTournamentId: PropTypes.string,
  selectLiveTournament: PropTypes.func.isRequired,
  terse: PropTypes.bool.isRequired,
};

TournamentCard.defaultProps = {
  terse: false,
};

class TournamentList extends Component {
  state = {
    activePage: 1,
  };

  onPageChange = (e, {activePage}) => {
    this.setState({activePage});
  };

  render() {
    const {user, usersById, tournaments, terse, selectLiveTournament, currentTournamentId, pageSize} = this.props;
    if (!Object.values(usersById).length) {
      return null;
    }
    let {activePage} = this.state;

    const totalPages = Math.ceil(tournaments.length / pageSize);
    if (activePage > totalPages) {
      activePage = totalPages;
    }
    const visibleTournaments = tournaments
      .slice((totalPages - activePage) * pageSize, (totalPages - activePage) * pageSize + pageSize)
      .reverse();

    return (
      <Fragment>
        <Card.Group style={{maxHeight: '300px', overflowY: 'auto', flexWrap: !terse ? undefined : 'unset'}}>
          {visibleTournaments.map(tournament => (
            <TournamentCard
              key={tournament.id}
              user={user}
              usersById={usersById}
              tournament={tournament}
              currentTournamentId={currentTournamentId}
              selectLiveTournament={selectLiveTournament}
              terse={terse}
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

TournamentList.propTypes = {
  user: PropTypes.object,
  usersById: PropTypes.object.isRequired,
  tournaments: PropTypes.array.isRequired,
  selectLiveTournament: PropTypes.func.isRequired,
  terse: PropTypes.bool.isRequired,
  currentTournamentId: PropTypes.string,
  pageSize: PropTypes.number.isRequired,
};

TournamentList.defaultProps = {
  terse: false,
  pageSize: 10,
};

export default TournamentList;
