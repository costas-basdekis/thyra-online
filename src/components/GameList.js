import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Icon, Label, Card} from "semantic-ui-react";

import Game from "../game/game";
import Board from "./Board";
import HashedIcon from "./HashedIcon";

class GameList extends Component {
  render() {
    const {user, usersById, games} = this.props;
    if (!Object.values(usersById).length) {
      return null;
    }

    return (
      <Card.Group style={{maxHeight: '300px', overflowY: 'auto'}}>
        {games.map(game => {
          const gameGame = Game.deserialize(game.game);
          const playerA = usersById[game.userIds[0]];
          const playerB = usersById[game.userIds[1]];
          const nextPlayerUser = gameGame.nextPlayer === Game.PLAYER_A ? playerA : playerB;
          const isUserPlayerA = user ? playerA.id === user.id : false;
          const isUserPlayerB = user ? playerB.id === user.id : false;
          const winnerUser = game.finished ? (game.winner === Game.PLAYER_A ? playerA : playerB) : null;
          const isMyGame = isUserPlayerA || isUserPlayerB;

          return (
            <Card key={game.id} onClick={() => this.props.selectLiveGame(game)}>
              <Card.Content>
                <Board className={'ui image floated right mini'} game={gameGame} small settings={user ? user.settings : undefined} />
                {/*<Image floated='right' size='mini' src='/images/avatar/large/steve.jpg' />*/}
                <Card.Header>
                  <Label color={winnerUser === playerA ? 'green' : undefined} >
                    {winnerUser === playerA ? <Icon name={'trophy'}/> : null}
                    {nextPlayerUser === playerA ? <Icon name={'caret right'}/> : null}
                    {playerA.name}
                    <HashedIcon floated={'right'} size={'mini'} textSized hash={playerA.id} />
                  </Label>
                  {" vs "}
                  <Label color={winnerUser === playerB ? 'green' : undefined} >
                    {winnerUser === playerB ? <Icon name={'trophy'}/> : null}
                    {nextPlayerUser === playerB ? <Icon name={'caret right'} color={"green"}/> : null}
                    {playerB.name}
                    <HashedIcon floated={'right'} size={'mini'} textSized hash={playerB.id} />
                  </Label>
                </Card.Header>
                <Card.Meta>
                  {isMyGame ? <Label><Icon name={"user"} color={"green"} />My game</Label> : null}
                  {" "}
                  {!game.finished ? <Label><Icon name={"circle"} color={"green"} />Live</Label> : null}
                  {" "}
                  <Label content={`Move ${game.move}`} />
                </Card.Meta>
              </Card.Content>
            </Card>
          );
        })}
      </Card.Group>
    );
  }
}

GameList.propTypes = {
  user: PropTypes.object,
  usersById: PropTypes.object.isRequired,
  games: PropTypes.array.isRequired,
  selectLiveGame: PropTypes.func.isRequired,
};

export default GameList;
