import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import Game from "../game/game";
import {Grid, Header, Icon, Message, Segment} from "semantic-ui-react";
import Play from "./Play";
import {withClient} from "../client/withClient";
import _ from 'lodash';
import "../styles/challenges.css";

class Challenges extends Component {
  static challenges = [
    {
      position: 'AABMAAAJAIAAEFMAJADMADAAD',
      player: Game.PLAYER_B,
      type: 'mate',
      options: {
        mateIn: 5,
      },
      meta: {
        source: 'From the first tournament on Thyra Online, Tommy vs Costas',
        difficulty: 4,
        maxDifficulty: 5,
      },
      playerResponses: [
        {
          playerMoves: [
            'AABMDAAJCGAAEFMAJADMADAAD',
          ],
          response: [{x: 2, y: 0}, {x: 1, y: 1}, {x: 1, y: 2}],
          playerResponses: [
            {
              playerMoves: [
                'AAAMGABJCIADEDMAJADMADAAD',
              ],
              response: [{x: 1, y: 1}, {x: 0, y: 2}, {x: 1, y: 2}],
              playerResponses: [
                {
                  playerMoves: [
                    'AAAMGAAMCGBGEFMAJADMADAAD',
                    'AAAMGAAMAIBGEFMAJADMADAAD',
                  ],
                  response: [{x: 2, y: 2}, {x: 1, y: 2}, {x: 1, y: 1}],
                  playerResponses: [
                    {
                      playerMoves: [
                        'AAAMGADMAIBHFDMAMADMADAAD',
                        'AAAMGADMAGBHFFMAMADMADAAD',
                      ],
                      response: [{x: 0, y: 2}, {x: 0, y: 1}, {x: 1, y: 1}],
                      playerResponses: [
                        {
                          playerMoves: [
                            'AAAMJBGMAIAHFDMAMADMADAAD',
                          ],
                        },
                        {
                          playerMoves: [
                            'AAAMJBGMCIAHDDMAMADMADAAD',
                          ],
                        },
                        {
                          playerMoves: [
                            'AAAMIBGMAJAHFDMAMADMADAAD',
                          ],
                        },
                      ],
                    },
                  ],
                }
              ],
            },
          ],
        },
      ],
    },
  ];

  state = {
    challenge: this.constructor.challenges[0],
    challengePlayerResponses: this.constructor.challenges[0].playerResponses,
    game: Game.fromCompressedPositionNotation(this.constructor.challenges[0].position),
    wrongMove: false,
    won: false,
  };

  submit = (moves, newGame) => {
    const {challengePlayerResponses, won} = this.state;
    if (won) {
      return;
    }
    const playerResponse = challengePlayerResponses.find(
      playerResponse => playerResponse.playerMoves.includes(newGame.positionNotation));
    if (!playerResponse) {
      console.log(_.flatten(challengePlayerResponses.map(pR => pR.playerMoves)), newGame.positionNotation);
      this.setState({wrongMove: true});
      return;
    }
    const challengeResponse = playerResponse.response ? newGame.makeMoves(playerResponse.response) : newGame;
    this.setState({
      game: challengeResponse,
      challengePlayerResponses: playerResponse.playerResponses || null,
      wrongMove: false,
      won: !playerResponse.response,
    });
  };

  onDisplayPositionChange = () => {
    if (this.state.wrongMove) {
      this.setState({wrongMove: false});
    }
  };

  getDifficultyStars(difficulty, maxDifficulty) {
    return _.range(maxDifficulty).map(index => (
      <Icon
        key={index}
        name={difficulty > index ? 'star' : 'star outline'}
        color={'yellow'}
      />
    ));
  }

  render() {
    const {challenge, game, wrongMove, won} = this.state;
    const {user, client} = this.props;
    return (
      <Fragment>
        <Grid centered>
          <Grid.Row>
            <Segment>
              <Header as={'h1'}>{challenge.type === 'mate' ? `Find mate in ${challenge.options.mateIn}` : 'Unknown challenge'}</Header>
              <Header as={'h4'} className={'difficulty-header'}>{this.getDifficultyStars(challenge.meta.difficulty, challenge.meta.maxDifficulty)}</Header>
              <Header as={'h4'}>{challenge.meta.source}</Header>
            </Segment>
          </Grid.Row>
          {wrongMove || won ? (
            <Grid.Row>
              {wrongMove ? <Message error icon={'warning'} content={"That's not the right answer"} /> : null}
              {won ? <Message success icon={'check'} content={"Correct! You solved it!"} /> : null}
            </Grid.Row>
          ) : null}
        </Grid>
        <Play
          user={user}
          defaultSettings={client.settings}
          changeSettings={this.changeSettings}
          game={game}
          matchGame={game}
          allowControl={[challenge.player]}
          names={{[challenge.player]: 'You', [Game.OTHER_PLAYER[challenge.player]]: 'Challenge'}}
          submit={this.submit}
          onDisplayPositionChange={this.onDisplayPositionChange}
        >
          {wrongMove ? (
            <Message error icon={'warning'} content={"That's not the right answer"} />
          ) : null}
          {won ? (
            <Message success icon={'check'} content={"Correct! You solved it!"} />
          ) : null}
        </Play>
      </Fragment>
    );
  }
}

Challenges.propTypes = {
  user: PropTypes.object,
  client: PropTypes.object.isRequired,
};

export default withClient(Challenges);
