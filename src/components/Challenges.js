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
      initialPlayer: Game.PLAYER_B,
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
    const challengePrompt = challenge.type === 'mate' ? `Find mate in ${challenge.options.mateIn}` : 'Unknown challenge';
    const message = (
      wrongMove ? (
        <Message error icon={'warning'} content={"That's not the right answer"} />
      ) : won ? (
        <Message success icon={'check'} content={"Correct! You solved it!"} />
      ) : (
        <Message content={challengePrompt} />
      )
    );
    return (
      <Fragment>
        <Grid centered>
          <Grid.Row>
            <Segment>
              <Header as={'h1'}>{challengePrompt}</Header>
              <Header as={'h4'} className={'difficulty-header'}>{this.getDifficultyStars(challenge.meta.difficulty, challenge.meta.maxDifficulty)}</Header>
              <Header as={'h4'}>{challenge.meta.source}</Header>
            </Segment>
          </Grid.Row>
          <Grid.Row>
            {message}
          </Grid.Row>
        </Grid>
        <Play
          user={user}
          defaultSettings={client.settings}
          changeSettings={this.changeSettings}
          game={game}
          matchGame={game}
          allowControl={[challenge.initialPlayer]}
          names={{[challenge.initialPlayer]: 'You', [Game.OTHER_PLAYER[challenge.initialPlayer]]: 'Challenge'}}
          submit={this.submit}
          onDisplayPositionChange={this.onDisplayPositionChange}
        >
          {message}
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
