import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import classNames from 'classnames';
import {Button, Grid, Icon, Label, Menu, Modal, Segment, Statistic, Tab, Table} from "semantic-ui-react";

import {withClient} from "../client/withClient";
import {NavLink, Route, Switch, withRouter} from "react-router-dom";
import * as utils from "../utils";
import HashedIcon from "./HashedIcon";
// import TournamentList from "./TournamentList";
import {GameCard} from "./GameList";
import {createSelector} from "reselect";
import '../styles/tournament.css';
import CreateTournament from "./CreateTournament";
import TournamentList from "./TournamentList";

class ChosenOnlineTournament extends Component {
  tournamentSelector = createSelector([
    props => props.match.params.id,
    props => props.tournamentsInfo.byId,
  ], (tournamentId, tournamentsById) => tournamentsById[tournamentId]);

  get tournament() {
    return this.tournamentSelector(this.props);
  }

  dismissUrlTournamentError = () => {
    this.props.selectLiveTournament(null);
  };

  componentDidMount() {
    const {tournament} = this;
    if (tournament) {
      this.props.selectLiveTournament(tournament);
    }
  }

  componentDidUpdate() {
    const {tournament} = this;
    if (tournament) {
      this.props.selectLiveTournament(tournament);
    }
  }

  close = () => {
    this.props.selectLiveTournament(null);
  };

  shareTournament = e => {
    const url = window.location.href;
    if (navigator.share) {
      const {tournament} = this;
      navigator.share({
        title: `Thyra Online - ${tournament.started ? (tournament.finished ? 'Past' : 'Live') : 'Future'} tournament ${tournament.name}`,
        text: `${tournament.started ? (tournament.finished ? 'Review Past' : 'Watch Live') : 'Future'} Santorini tournament ${tournament.name}`,
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

  toggleParticipation = () => {
    const {tournament} = this;
    this.props.toggleParticipation(tournament);
  };

  startTournament = () => {
    const {tournament} = this;
    this.props.startTournament(tournament);
  };

  abortTournament = () => {
    const {tournament} = this;
    this.props.abortTournament(tournament);
  };

  render() {
    const {
      location, client, user, selectLiveGame,
      usersInfo: {byId: usersById}, gamesInfo: {byId: gamesById}, tournamentsInfo,
      puzzlesInfo: {byGameId: puzzlesByGameId},
    } = this.props;
    const {byId: tournamentsById} = tournamentsInfo;
    const {tournament} = this;

    if (!tournament) {
      return (
        <Fragment>
          <Modal
            open={true}
            size={'mini'}
            onClose={this.dismissUrlTournamentError}
            header={'Could not find tournament'}
            content={'This tournament cannot be found. Please check that you copied the full URL, or perhaps the tournament was aborted'}
            actions={[{key: 'ok', content: 'OK', positive: true}]}
          />
          Could not find tournament
        </Fragment>
      );
    }

    const players = _.orderBy(tournament.userIds.map(otherUserId => usersById[otherUserId]), [
      user => tournament.userStats ? tournament.userStats[user.id].points : 0,
      user => tournament.userStats ? tournament.userStats[user.id].initialScore.score : 0,
      'id',
    ], ['desc', 'desc', 'desc']);
    const isMyTournament = user ? tournament.userIds.includes(user.id) : false;
    const didUserCreated = user ? tournament.creatorUserId === user.id : false;

    return (
      <Fragment>
        <Grid centered>
          <Grid.Row>
            <Menu stackable size={'massive'} inverted items={[
              {key: 'close', content: 'Close', icon: 'x', onClick: this.close, color: 'red', active: true},
              {key: 'share', content: 'Share Tournament', icon: 'share', onClick: this.shareTournament, as: NavLink,
                to: location.pathname, color: 'green', active: true,
                title: navigator.share ? 'Click to open the sharing menu' : 'Click to copy URL to tournament'},
            ]} />
          </Grid.Row>
        </Grid>
        <Segment>
          <Statistic.Group widths={"three"} size={"tiny"}>
            <Statistic
              value={tournament.started ? (tournament.finished ? 'Finished' : `${tournament.round}/${tournament.rounds}`) : 'Waiting'}
              label={tournament.started ? (tournament.finished ? 'Status' : 'Rounds') : 'Status'}
            />
            <Statistic
              value={tournament.userIds.length}
              label={'Users'}
            />
            <Statistic
              value={tournament.gameCount}
              label={'Games between each pair'}
            />
          </Statistic.Group>
          <Grid columns={'equal'}>
            <Grid.Column textAlign={'left'}><Button negative onClick={this.close}>Close</Button></Grid.Column>
            <Grid.Column>
              <Button
                positive
                icon
                onClick={this.shareTournament}
                style={{width: '100%'}}
                as={NavLink}
                to={location.pathname}
                title={navigator.share ? 'Click to open the sharing menu' : 'Click to copy URL to tournament'}
              >
                <Icon name={'share'}/> Share Tournament
              </Button>
            </Grid.Column>
          </Grid>
        </Segment>
        {!tournament.started ? (
          <Segment>
            <Grid columns={'equal'}>
              <Grid.Column textAlign={'left'}>
                <Button
                  disabled={tournament.started}
                  style={{width: '100%'}}
                  color={isMyTournament ? 'yellow' : 'green'}
                  onClick={this.toggleParticipation}
                >
                  {tournament.started ? null : <Icon name={isMyTournament ? 'hourglass' : 'play'} />}
                  {isMyTournament ? 'Participating' : (
                    tournament.started ? (
                      tournament.finished ? 'Tournament finished' : 'Tournament started'
                    ) : 'Join the tournament'
                  )}
                </Button>
              </Grid.Column>
              <Grid.Column>
                <Button
                  disabled={!didUserCreated || players.length < 2 || tournament.started}
                  positive
                  icon
                  onClick={this.startTournament}
                  style={{width: '100%'}}
                  color={players.length >= 2 ? (didUserCreated ? 'green' : 'yellow') : 'yellow'}
                >
                  {tournament.finished  ? null : (
                    <Icon name={players.length >= 2 ? (didUserCreated ? 'play' : 'hourglass') : 'play'}/>
                  )}
                  {tournament.started ? (
                    tournament.finished ? 'Finished' : 'Started'
                  ) : (
                    players.length >= 2 ? (
                      didUserCreated ? 'Start tournament' : 'Waiting for tournament to start'
                    ) : 'Needs at least participants'
                  )}
                </Button>
              </Grid.Column>
            </Grid>
          </Segment>
        ) : null }
        <Segment>
          {tournament.started ? (
            <Tab menu={{pointing: true, attached: false}} panes={[
              {menuItem: 'Rankings', render: () => (
                <Table celled collapsing unstackable>
                  <Table.Header>
                    <Table.Row>
                      {tournament.finished ? <Table.HeaderCell> </Table.HeaderCell> : null}
                      <Table.HeaderCell>Rank</Table.HeaderCell>
                      <Table.HeaderCell>User</Table.HeaderCell>
                      <Table.HeaderCell>Score (TB)</Table.HeaderCell>
                      <Table.HeaderCell>Expected Score</Table.HeaderCell>
                      {tournament.started && !tournament.finished ? <Table.HeaderCell>Game</Table.HeaderCell> : null}
                      {tournament.finished ? <Table.HeaderCell>Score difference</Table.HeaderCell> : null}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {players.map(player => {
                      const stats = tournament.userStats[player.id];
                      return (
                        <Table.Row key={player.id}>
                          {tournament.finished ? (
                            <Table.Cell>{stats.rank <= 3 ? (
                              <Icon
                                name={{1: 'trophy', 2: 'certificate', 3: 'certificate'}[stats.rank]}
                                color={{1: 'yellow', 2: 'grey', 3: 'brown'}[stats.rank]}
                              />
                            ) : null}</Table.Cell>
                          ) : null}
                          <Table.Cell>{stats.rank}</Table.Cell>
                          <Table.Cell>
                            <HashedIcon floated={'left'} size={'mini'} hash={player.id} />
                            {player.name}
                          </Table.Cell>
                          <Table.Cell>{stats.points === stats.ratedPoints ? stats.points : `${stats.ratedPoints} (${stats.points})`}</Table.Cell>
                          <Table.Cell>{stats.initialScore.expectedPoints.toFixed(1)}</Table.Cell>
                          {tournament.started && !tournament.finished ? (
                            <Table.Cell>{stats.waitingForNextRound ? 'Waiting for next round' : (
                              stats.currentGameId ? (
                                <GameCard
                                  user={null}
                                  usersById={usersById}
                                  tournamentsById={tournamentsById}
                                  puzzlesByGameId={puzzlesByGameId}
                                  game={gamesById[stats.currentGameId]}
                                  selectLiveGame={selectLiveGame}
                                  terse
                                  live
                                  applicableSettings={client.applicableSettings}
                                />
                              ) : 'Finished'
                            )}</Table.Cell>
                          ) : null}
                          {tournament.finished ? (
                            <Table.Cell>{stats.scoreDifference > 0 ? `+${stats.scoreDifference}` : stats.scoreDifference}</Table.Cell>
                          ) : null}
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table>
              )},
              {menuItem: 'Games', render: () => (
                <Table celled collapsing unstackable>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell colSpan={2}>White</Table.HeaderCell>
                      <Table.HeaderCell colSpan={2}>Black</Table.HeaderCell>
                      <Table.HeaderCell>Game</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  {tournament.schedule.map((round, roundIndex) => (
                    <Fragment key={roundIndex}>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell colSpan={5}>{round.type === 'playoff' ? 'Playoffs - ' : null}Round {round.round}</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {round.pairings.map(({userIds: [playerAId, playerBId], gameId}, gameIndex) => {
                          const game = gamesById[gameId];
                          const playerAWon = game && game.finished && game.winnerUserId === playerAId;
                          const playerBWon = game && game.finished && game.winnerUserId === playerBId;
                          return (
                            <Table.Row key={gameIndex}>
                              <Table.Cell className={classNames('tournament-game', 'player-a', {'player-a-won': playerAWon, 'player-b-won': playerBWon})}>
                                {playerAId ? (
                                  <Fragment>
                                    <HashedIcon floated={'left'} size={'mini'} hash={playerAId} />
                                    {usersById[playerAId].name}
                                  </Fragment>
                                ) : 'Sitting out this round'}
                              </Table.Cell>
                              <Table.Cell className={classNames('tournament-game', 'player-a', {'player-a-won': playerAWon, 'player-b-won': playerBWon})}>
                                {game && game.finished ? (game.winnerUserId === playerAId ? '1' : '0') : '-'}
                              </Table.Cell>
                              <Table.Cell className={classNames('tournament-game', 'player-b', {'player-a-won': playerAWon, 'player-b-won': playerBWon})}>
                                {playerBId ? (
                                  <Fragment>
                                    <HashedIcon floated={'left'} size={'mini'} hash={playerBId} />
                                    {usersById[playerBId].name}
                                  </Fragment>
                                ) : 'Sitting out this round'}
                              </Table.Cell>
                              <Table.Cell className={classNames('tournament-game', 'player-b', {'player-a-won': playerAWon, 'player-b-won': playerBWon})}>
                                {game && game.finished ? (game.winnerUserId === playerBId ? '1' : '0') : '-'}
                              </Table.Cell>
                              <Table.Cell>
                                {playerAId && playerBId ? (
                                  game ? (
                                    <GameCard
                                      user={null}
                                      usersById={usersById}
                                      tournamentsById={tournamentsById}
                                      puzzlesByGameId={puzzlesByGameId}
                                      game={game}
                                      selectLiveGame={selectLiveGame}
                                      terse
                                      live
                                      applicableSettings={client.applicableSettings}
                                    />
                                  ) : 'Not started yet'
                                ) : null}
                              </Table.Cell>
                            </Table.Row>
                          )
                        })}
                      </Table.Body>
                    </Fragment>
                  ))}
                </Table>
              )},
            ]} />
          ) : (
            <Table celled collapsing unstackable>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>User</Table.HeaderCell>
                  <Table.HeaderCell>Rating</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {players.map(player => (
                  <Table.Row key={player.id}>
                    <Table.Cell>
                      <HashedIcon floated={'left'} size={'mini'} hash={player.id} />
                      {player.name}
                    </Table.Cell>
                    <Table.Cell>{player.score}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Segment>
        {didUserCreated && !tournament.started ? (
          <Segment>
            <Grid columns={'equal'}>
              <Grid.Column textAlign={'left'}>
              </Grid.Column>
              <Grid.Column>
                <Modal
                  size={'mini'}
                  trigger={
                    <Button
                      disabled={!didUserCreated}
                      negative
                      icon
                      style={{width: '100%'}}
                    >
                      <Icon name={'stop'}/>
                      {'Abort tournament'}
                    </Button>
                  }
                  header={'Abort tournament'}
                  content={'Are you sure you want to abort the tournament?'}
                  actions={[
                    {key: 'yes', content: 'Abort', onClick: this.abortTournament, negative: true},
                    {key: 'no', content: 'No, keep tournament', secondary: true},
                  ]}
                />
              </Grid.Column>
            </Grid>
          </Segment>
        ) : null}
      </Fragment>
    );
  }
}

ChosenOnlineTournament.propTypes = {
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  client: PropTypes.object.isRequired,
  user: PropTypes.object,
  usersInfo: PropTypes.object.isRequired,
  gamesInfo: PropTypes.object.isRequired,
  puzzlesInfo: PropTypes.object.isRequired,
  selectLiveGame: PropTypes.func.isRequired,
  selectLiveTournament: PropTypes.func.isRequired,
  tournament: PropTypes.object,
  toggleParticipation: PropTypes.func.isRequired,
  startTournament: PropTypes.func.isRequired,
  abortTournament: PropTypes.func.isRequired,
};

ChosenOnlineTournament = withRouter(withClient(ChosenOnlineTournament));

class OnlineTournament extends Component {
  render() {
    const {
      selectLiveGame, selectLiveTournament, toggleParticipation, startTournament, abortTournament, tournament, user,
      usersInfo: {byId: usersById}, tournamentsInfo,
    } = this.props;
    if (!Object.values(usersById).length) {
      return null;
    }
    return (
      <Switch>
        <Route exact path={this.props.match.path}>
          <Segment>
            <CreateTournament />
            <br/><br/>
            <Tab menu={{pointing: true}} panes={[
              {key: 'my-live', label: "My Future & Running tournaments", items: tournamentsInfo.myFutureAndLive, color: 'green'},
              {key: 'other-live', label: "Other Future and Running tournaments", items: tournamentsInfo.otherFutureAndLive, color: 'green'},
              {key: 'my-past', label: "My Past tournaments", items: tournamentsInfo.myFinished},
              {key: 'other-past', label: "Other Past tournaments", items: tournamentsInfo.otherFinished},
            ].filter(({items}) => items.length).map(({key, label, items, color}) => (
              {menuItem: {key, content: <Fragment>{label} <Label content={items.length} color={color} /></Fragment>}, render: () => (
                <TournamentList
                  user={user}
                  usersById={usersById}
                  tournaments={items}
                  selectLiveTournament={selectLiveTournament}
                />
              )}
            ))} />
          </Segment>
        </Route>
        <Route path={`${this.props.match.path}/:id`}>
          <ChosenOnlineTournament
            tournament={tournament}
            selectLiveGame={selectLiveGame}
            selectLiveTournament={selectLiveTournament}
            toggleParticipation={toggleParticipation}
            startTournament={startTournament}
            abortTournament={abortTournament}
          />
        </Route>
      </Switch>
    );
  }
}

OnlineTournament.propTypes = {
  match: PropTypes.object.isRequired,
  tournament: PropTypes.object,
  client: PropTypes.object.isRequired,
  user: PropTypes.object,
  usersInfo: PropTypes.object.isRequired,
  gamesInfo: PropTypes.object.isRequired,
  tournamentsInfo: PropTypes.object.isRequired,
  selectLiveGame: PropTypes.func.isRequired,
  selectLiveTournament: PropTypes.func.isRequired,
  toggleParticipation: PropTypes.func.isRequired,
  startTournament: PropTypes.func.isRequired,
  abortTournament: PropTypes.func.isRequired,
};

export default withRouter(withClient(OnlineTournament));
