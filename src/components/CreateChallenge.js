import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Card, Form, Grid, Header, Icon, Input, Segment} from "semantic-ui-react";
import Game from "../game/game";
import _ from "lodash";
import Board from "./Board";
import {withClient} from "../client/withClient";

class CreateChallenge extends Component {
  state = {
    challenge: null,
    path: null,
  };

  onCreateChallenge = challenge => {
    this.setState({challenge, path: []});
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

  onBoardSelect = game => {

  };

  render() {
    const {user, client} = this.props;
    const {challenge} = this.state;
    const settings = user ? user.settings : client.settings;

    if (!challenge) {
      return (
        <ChallengeEditor onCreateChallenge={this.onCreateChallenge} />
      )
    }
    const challengePrompt = challenge.type === 'mate' ? `Find mate in ${challenge.options.mateIn}` : 'Unknown challenge';

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
        </Grid>
        <Segment>
          <Card.Group style={{/*maxHeight: '300px', */overflowY: 'auto', flexWrap: 'unset'}}>
            <Card>
              <Board
                medium onSelect={this.onBoardSelect}
                settings={settings}
                game={challenge.game}
              />
            </Card>
          </Card.Group>
        </Segment>
      </Fragment>
    );
  }
}

class ChallengeEditor extends Component {
  getNewChallenge() {
    return {
      challenge: {
        position: '',
        initialPlayer: Game.PLAYER_A,
        type: 'mate',
        options: {
          mateIn: 1,
        },
        meta: {
          source: '',
          difficulty: 1,
          maxDifficulty: 5,
        },
      },
      error: {
        position: null,
      },
    };
  }

  state = {
    ...this.getNewChallenge(),
  };

  setValue = (e, {name, value}) => {
    this.setState(state => {
      const challenge = {
        ...state.challenge,
      };
      let newChallengeToChange = challenge;
      const parts = name.split('.');
      for (const part of parts.slice(0, parts.length - 1)) {
        newChallengeToChange = newChallengeToChange[part] || {};
      }
      newChallengeToChange[parts[parts.length - 1]] = value;
      return {challenge};
    });
    this.onValueSet(name, value);
  };

  onValueSet = name => {
    if (name === 'position') {
      this.setState(state => ({
        error: {
          ...state.error,
          position: !state.challenge.position || Game.isValidCompressedPositionNotation(state.challenge.position)
            ? null : 'This is not a valid position',
        },
      }));
    }
  };

  createChallenge = () => {
    const {challenge, error} = this.state;
    if (error.position) {
      return;
    }
    this.props.onCreateChallenge({
      ...challenge,
      responses: [],
      game: Game.fromCompressedPositionNotation(challenge.position),
    });
  };

  render() {
    const {challenge, error} = this.state;

    return (
      <Fragment>
        <Header>Create a chanllenge</Header>
        <Segment>
          <Form onSubmit={this.createChallenge}>
            <Form.Group>
              <Form.Field
                name={'position'}
                control={Input}
                label={'Initial position'}
                placeholder={'Game position'}
                onChange={this.setValue}
                value={challenge.position}
                required
                error={error.position}
              />
            </Form.Group>
            <Form.Group inline>
              <label>Starting player</label>
              <Form.Radio
                name={'initialPlayer'}
                label={'Player A'}
                onChange={this.setValue}
                value={Game.PLAYER_A}
                checked={challenge.initialPlayer === Game.PLAYER_A}
              />
              <Form.Radio
                name={'initialPlayer'}
                label={'Player B'}
                onChange={this.setValue}
                value={Game.PLAYER_B}
                checked={challenge.initialPlayer === Game.PLAYER_B}
              />
            </Form.Group>
            <Form.Select
              options={[
                {key: 'mate', value: 'mate', text: 'Mate'},
              ]}
              name={'type'}
              label={'Type'}
              onChange={this.setValue}
              value={challenge.type}
            />
            <Form.Group>
              <Form.Field
                control={Input}
                type={'range'}
                label={`Mate In: ${challenge.options.mateIn}`}
                min={1}
                max={10}
                name={'options.mateIn'}
                onChange={this.setValue}
                value={challenge.options.mateIn}
              />
            </Form.Group>
            <Form.Group>
              <Form.Field
                control={Input}
                label={'Source'}
                name={'meta.source'}
                onChange={this.setValue}
                value={challenge.meta.source}
              />
              <Form.Field
                control={Input}
                type={'range'}
                label={`Difficulty: ${challenge.meta.difficulty}/${challenge.meta.maxDifficulty}`}
                min={1}
                max={challenge.meta.maxDifficulty}
                name={'meta.difficulty'}
                onChange={this.setValue}
                value={challenge.meta.difficulty}
              />
            </Form.Group>
            <Form.Button content='Create' />
          </Form>
        </Segment>
      </Fragment>
    );
  }
}

ChallengeEditor.propTypes = {
  onCreateChallenge: PropTypes.func.isRequired,
};

export default withClient(CreateChallenge);
