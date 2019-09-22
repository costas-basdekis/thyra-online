import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Header, Tab} from "semantic-ui-react";
import TournamentList from "./TournamentList";
import CreateTournament from "./CreateTournament";

class TournamentsSegment extends Component{
  render() {
    const {user, usersById, chosenTournamentsInfo, selectLiveTournament, mine} = this.props;
    return (
      <Fragment>
        <Header as={'h2'}>
          {mine ? 'My' : 'All'} {[
            chosenTournamentsInfo.live.length ? `live (${chosenTournamentsInfo.live.length})` : null,
          chosenTournamentsInfo.future.length ? `upcoming (${chosenTournamentsInfo.future.length})` : null,
          ].filter(count => count).join(' and ')} tournaments
        </Header>
        {mine ? (
          <Fragment>
            <CreateTournament />
            <br/><br/>
          </Fragment>
        ) : null}
        <Tab menu={{pointing: true}} panes={[
          {menuItem: `${chosenTournamentsInfo.future.length} future tournaments`, render: () => (
            <TournamentList
              user={user}
              usersById={usersById}
              tournaments={chosenTournamentsInfo.future}
              selectLiveTournament={selectLiveTournament}
            />
          )},
          {menuItem: `${chosenTournamentsInfo.live.length} running tournaments`, render: () => (
            <TournamentList
              user={user}
              usersById={usersById}
              tournaments={chosenTournamentsInfo.live}
              selectLiveTournament={selectLiveTournament}
            />
          )},
          {menuItem: `${chosenTournamentsInfo.finished.length} past tournaments`, render: () => (
            <TournamentList
              user={user}
              usersById={usersById}
              tournaments={chosenTournamentsInfo.finished}
              selectLiveTournament={selectLiveTournament}
            />
          )},
        ]} />
      </Fragment>
    );
  }
}

TournamentsSegment.propTypes = {
  user: PropTypes.object,
  usersById: PropTypes.object.isRequired,
  chosenTournamentsInfo: PropTypes.object.isRequired,
  selectLiveTournament: PropTypes.func.isRequired,
  mine: PropTypes.bool.isRequired,
};

export default TournamentsSegment;
