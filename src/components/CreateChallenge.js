import React, {Component, Fragment} from 'react';
import {Form, Header, Input, Segment} from "semantic-ui-react";
import Game from "../game/game";

class CreateChallenge extends Component {
  getNewChallenge() {
    return {
      newChallenge: {
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
      newChallengeError: {
        position: null,
      },
    };
  }

  state = {
    challenge: null,
    ...this.getNewChallenge(),
  };

  setValue = (e, {name, value}) => {
    this.setState(state => {
      const newChallenge = {
        ...state.newChallenge,
      };
      let newChallengeToChange = newChallenge;
      const parts = name.split('.');
      for (const part of parts.slice(0, parts.length - 1)) {
        newChallengeToChange = newChallengeToChange[part] || {};
      }
      newChallengeToChange[parts[parts.length - 1]] = value;
      return {newChallenge};
    });
    this.onValueSet(name, value);
  };

  onValueSet = (name, value) => {
    if (name === 'position') {
      this.setState(state => ({
        newChallengeError: {
          ...state.newChallengeError,
          position: !state.newChallenge.position || Game.isValidCompressedPositionNotation(state.newChallenge.position)
            ? null : 'This is not a valid position',
        },
      }));
    }
  };

  createChallenge = () => {
    this.setState(state => {
      if (state.newChallengeError.position) {
        return null;
      }
      return {
        ...this.getNewChallenge(),
        challenge: state.newChallenge,
      };
    });
  };

  render() {
    const {challenge, newChallenge, newChallengeError} = this.state;

    if (!challenge) {
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
                  value={newChallenge.position}
                  required
                  error={newChallengeError.position}
                />
              </Form.Group>
              <Form.Group inline>
                <label>Starting player</label>
                <Form.Radio
                  name={'initialPlayer'}
                  label={'Player A'}
                  onChange={this.setValue}
                  value={Game.PLAYER_A}
                  checked={newChallenge.initialPlayer === Game.PLAYER_A}
                />
                <Form.Radio
                  name={'initialPlayer'}
                  label={'Player B'}
                  onChange={this.setValue}
                  value={Game.PLAYER_B}
                  checked={newChallenge.initialPlayer === Game.PLAYER_B}
                />
              </Form.Group>
              <Form.Select
                options={[
                  {key: 'mate', value: 'mate', text: 'Mate'},
                ]}
                name={'type'}
                label={'Type'}
                onChange={this.setValue}
                value={newChallenge.type}
              />
              <Form.Group>
                <Form.Field
                  control={Input}
                  type={'range'}
                  label={`Mate In: ${newChallenge.options.mateIn}`}
                  min={1}
                  max={10}
                  name={'options.mateIn'}
                  onChange={this.setValue}
                  value={newChallenge.options.mateIn}
                />
              </Form.Group>
              <Form.Group>
                <Form.Field
                  control={Input}
                  label={'Source'}
                  name={'meta.source'}
                  onChange={this.setValue}
                  value={newChallenge.meta.source}
                />
                <Form.Field
                  control={Input}
                  type={'range'}
                  label={`Difficulty: ${newChallenge.meta.difficulty}/${newChallenge.meta.maxDifficulty}`}
                  min={1}
                  max={newChallenge.meta.maxDifficulty}
                  name={'meta.difficulty'}
                  onChange={this.setValue}
                  value={newChallenge.meta.difficulty}
                />
              </Form.Group>
              <Form.Button content='Create' />
            </Form>
          </Segment>
        </Fragment>
      )
    }

    return (
      null
    );
  }
}

export default CreateChallenge;
