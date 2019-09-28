import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Icon, Label, Card, Grid, Pagination} from "semantic-ui-react";
import moment from 'moment';

import Game from "../game/game";
import Board from "./Board";
import HashedIcon from "./HashedIcon";
import classNames from "classnames";
import {NavLink} from "react-router-dom";

export class GameCard extends Component {
  selectLiveGame = () => {
    this.props.selectLiveGame(this.props.game);
  };

  render() {
    const {user, usersById, tournamentsById, game, terse, live, currentGameId} = this.props;

    const tournament = tournamentsById[game.tournamentId];

    const gameGame = Game.deserialize(game.game);
    const playerA = usersById[game.userIds[0]];
    const playerB = usersById[game.userIds[1]];
    const nextPlayerUser = gameGame.nextPlayer === Game.PLAYER_A ? playerA : playerB;
    const playerAToPlay = nextPlayerUser === playerA;
    const playerBToPlay = nextPlayerUser === playerB;
    const isUserPlayerA = user ? playerA.id === user.id : false;
    const isUserPlayerB = user ? playerB.id === user.id : false;
    const winnerUser = game.finished ? (game.winner === Game.PLAYER_A ? playerA : playerB) : null;
    const isMyGame = isUserPlayerA || isUserPlayerB;
    const isMyTurn = (isUserPlayerA && playerAToPlay) || (isUserPlayerB && playerBToPlay);
    const showPlayerA = !terse || !isMyGame || isUserPlayerB;
    const showPlayerB = !terse || !isMyGame || isUserPlayerA;

    return (
      <Card
        as={NavLink}
        to={`/game/${game.id}`}
        // onClick={this.selectLiveGame}
        style={{
          ...(!terse ? {} : {width: 'auto'}),
          ...(game.id === currentGameId ? {backgroundColor: 'lightgreen'} : {}),
        }}
        className={classNames({attention: live && isMyTurn})}
      >
        <Card.Content>
          {!terse ? (
            <Board
              className={'ui image floated right mini'}
              game={gameGame}
              small
              settings={user ? user.settings : undefined}
            />
          ) : null}
          <Card.Header>
            {!(showPlayerA && showPlayerB) ? " vs " : null}
            {showPlayerA ? (
              <Label color={winnerUser === playerA || isMyTurn ? 'green' : undefined} >
                {winnerUser === playerA ? <Icon name={'trophy'}/> : null}
                {playerAToPlay ? <Icon name={'caret right'}/> : null}
                {playerA.name}
                <HashedIcon floated={'right'} size={'mini'} textSized hash={playerA.id} />
              </Label>
            ) : null}
            {showPlayerA && showPlayerB ? " vs " : null}
            {showPlayerB ? (
              <Label color={winnerUser === playerB || isMyTurn ? 'green' : undefined} >
                {winnerUser === playerB ? <Icon name={'trophy'}/> : null}
                {playerBToPlay ? <Icon name={'caret right'} color={"green"}/> : null}
                {playerB.name}
                <HashedIcon floated={'right'} size={'mini'} textSized hash={playerB.id} />
              </Label>
            ) : null}
          </Card.Header>
          {!terse ? (
            <Card.Meta>
              {isMyGame ? <Label icon={{name: 'user', color: 'green'}} content={'My game'} /> : null}
              {" "}
              {!game.finished ? <Label icon={{name: 'circle', color: 'green'}} content={'Live'} /> : null}
              {" "}
              <Label content={`Move ${game.move}`} icon={'play'} />
              {" "}
              <Label content={moment(game.endDatetime || game.startDatetime).from()} icon={'calendar'} />
              {" "}
              {tournament ? <Label content={tournament.name} icon={'sitemap'} /> : null}
            </Card.Meta>
          ) : null}
        </Card.Content>
      </Card>
    );
  }
}

GameCard.propTypes = {
  user: PropTypes.object,
  usersById: PropTypes.object.isRequired,
  tournamentsById: PropTypes.object.isRequired,
  game: PropTypes.object.isRequired,
  selectLiveGame: PropTypes.func.isRequired,
  terse: PropTypes.bool.isRequired,
  live: PropTypes.bool.isRequired,
  currentGameId: PropTypes.string,
};

GameCard.defaultProps = {
  terse: false,
  live: false,
};

class GameList extends Component {
  state = {
    activePage: 1,
  };

  onPageChange = (e, {activePage}) => {
    this.setState({activePage});
  };

  render() {
    const {user, usersById, tournamentsById, games, terse, live, selectLiveGame, currentGameId, pageSize} = this.props;
    if (!Object.values(usersById).length) {
      return null;
    }
    let {activePage} = this.state;

    const totalPages = Math.ceil(games.length / pageSize);
    if (activePage > totalPages) {
      activePage = totalPages;
    }
    const visibleGames = games
      .slice((totalPages - activePage) * pageSize, (totalPages - activePage) * pageSize + pageSize)
      .reverse();

    return (
      <Fragment>
        <Card.Group style={{maxHeight: '300px', overflowY: 'auto', flexWrap: !terse ? undefined : 'unset'}}>
          {visibleGames.map(game => (
            <GameCard
              key={game.id}
              user={user}
              usersById={usersById}
              tournamentsById={tournamentsById}
              game={game}
              selectLiveGame={selectLiveGame}
              terse={terse}
              live={live}
              currentGameId={currentGameId}
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

GameList.propTypes = {
  user: PropTypes.object,
  usersById: PropTypes.object.isRequired,
  tournamentsById: PropTypes.object.isRequired,
  games: PropTypes.array.isRequired,
  selectLiveGame: PropTypes.func.isRequired,
  terse: PropTypes.bool.isRequired,
  live: PropTypes.bool.isRequired,
  currentGameId: PropTypes.string,
  pageSize: PropTypes.number.isRequired,
};

GameList.defaultProps = {
  terse: false,
  live: false,
  pageSize: 10,
};

export default GameList;
