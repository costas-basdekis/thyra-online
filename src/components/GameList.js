import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Icon, Label, Card} from "semantic-ui-react";

import Game from "../game/game";
import Board from "./Board";
import HashedIcon from "./HashedIcon";
import classNames from "classnames";

class GameCard extends Component {
  selectLiveGame = () => {
    this.props.selectLiveGame(this.props.game);
  };

  render() {
    const {user, usersById, game, terse, live, currentGameId} = this.props;

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
        onClick={this.selectLiveGame}
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
              {isMyGame ? <Label><Icon name={"user"} color={"green"} />My game</Label> : null}
              {" "}
              {!game.finished ? <Label><Icon name={"circle"} color={"green"} />Live</Label> : null}
              {" "}
              <Label content={`Move ${game.move}`} />
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
  render() {
    const {user, usersById, games, terse, live, selectLiveGame, currentGameId} = this.props;
    if (!Object.values(usersById).length) {
      return null;
    }

    return (
      <Card.Group style={{maxHeight: '300px', overflowY: 'auto', flexWrap: !terse ? undefined : 'unset'}}>
        {games.map(game => (
          <GameCard
            key={game.id}
            user={user}
            usersById={usersById}
            game={game}
            selectLiveGame={selectLiveGame}
            terse={terse}
            live={live}
            currentGameId={currentGameId}
          />
        ))}
      </Card.Group>
    );
  }
}

GameList.propTypes = {
  user: PropTypes.object,
  usersById: PropTypes.object.isRequired,
  games: PropTypes.array.isRequired,
  selectLiveGame: PropTypes.func.isRequired,
  terse: PropTypes.bool.isRequired,
  live: PropTypes.bool.isRequired,
  currentGameId: PropTypes.string,
};

GameList.defaultProps = {
  terse: false,
  live: false,
};

export default GameList;
