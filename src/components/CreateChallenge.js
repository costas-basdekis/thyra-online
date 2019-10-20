import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Button, Form, Grid, Header, Icon, Input, Segment} from "semantic-ui-react";
import Game from "../game/game";
import _ from "lodash";
import Board from "./Board";
import {withClient} from "../client/withClient";
import Play from "./Play";

class CreateChallenge extends Component {
  state = {
    challenge: null,
    currentStep: null,
    tree: null,
    game: null,
  };

  onCreateChallenge = challenge => {
    this.setState({
      challenge,
      currentStep: challenge.startingPosition,
      tree: this.getTree(challenge.startingPosition),
      game: challenge.startingPosition.game,
    });
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

  makeMove = newGame => {
    this.setState({game: newGame});
  };

  getExistingResponse(newGame) {
    const {currentStep} = this.state;
    if (currentStep.playerResponses) {
      return currentStep.playerResponses
        .find(response => response.position === newGame.positionNotation);
    } else {
      if (currentStep.challengeResponse && currentStep.challengeResponse.position === newGame.positionNotation) {
        return currentStep.challengeResponse;
      }
    }

    return null;
  }

  getPathIndexes() {
    const {currentStep, tree} = this.state;
    let treePath = tree.find(treePath => treePath.find(treePathStep => treePathStep === currentStep));
    treePath = treePath.slice(0, treePath.findIndex(treePathStep => treePathStep === currentStep) + 1);
    const pathIndexes = treePath.map((treePathStep, index) =>
      index === 0
        ? ['challenge', 'startingPosition']
        : (
          treePath[index - 1].playerResponses
            ? ['playerResponses', treePath[index - 1].playerResponses.indexOf(treePathStep)]
            : ['challengeResponse']
        )
    );

    return pathIndexes;
  }

  duplicateChallenge(pathIndexes) {
    const {challenge} = this.state;

    const newChallenge = {
      ...challenge,
      startingPosition: {...challenge.startingPosition},
    };
    let newModifyingStep = newChallenge.startingPosition;
    for (const index of _.flatten(pathIndexes.slice(1))) {
      const oldStep = newModifyingStep[index];
      const newStep = Array.isArray(oldStep) ? oldStep.slice() : {...oldStep};
      newModifyingStep[index] = newStep;
      newModifyingStep = newStep;
    }

    return {newChallenge, newModifyingStep};
  }

  addGameToStep(newModifyingStep, newGame) {
    let newStep = null;
    if (newModifyingStep.playerResponses) {
      newModifyingStep.playerResponses = newModifyingStep.playerResponses.slice();
      newModifyingStep = newModifyingStep.playerResponses;
      newStep = {
        position: newGame.positionNotation,
        moves: newGame.lastMovesInHistory,
        game: newGame,
        challengeResponse: null,
      };
      newModifyingStep.push(newStep);
    } else {
      newStep = {
        position: newGame.positionNotation,
        moves: newGame.lastMovesInHistory,
        game: newGame,
        playerResponses: [],
      };
      newModifyingStep.challengeResponse = newStep;
    }

    return newStep;
  }

  removeStep(newModifyingStep, step) {
    if (newModifyingStep.playerResponses) {
      newModifyingStep.playerResponses = newModifyingStep.playerResponses.filter(response => response !== step);
    } else {
      newModifyingStep.challengeResponse = null;
    }

    return newModifyingStep;
  }

  submit = moves => {
    const {currentStep} = this.state;
    const newGame = currentStep.game.makeMoves(moves);

    const existingResponse = this.getExistingResponse(newGame);
    if (existingResponse) {
      this.setState({
        currentStep: existingResponse,
        game: existingResponse.game,
      });
      return;
    }

    const pathIndexes = this.getPathIndexes();
    let {newChallenge, newModifyingStep} = this.duplicateChallenge(pathIndexes);
    let newStep = this.addGameToStep(newModifyingStep, newGame);
    this.setState({
      challenge: newChallenge,
      currentStep: newStep,
      tree: this.getTree(newChallenge.startingPosition),
      game: newStep.game,
    });
  };

  getTree(startingPosition = this.state.challenge.startingPosition) {
    let tree = [[startingPosition]];
    while (tree !== (tree = this.getNextTree(tree))) {}

    return tree;
  }

  getNextTree(tree) {
    const nextTree = _.flatten(tree.map(this.getNextTreePath));
    if (nextTree.length !== tree.length) {
      return nextTree;
    }
    if (tree.find((treePath, index) => treePath !== nextTree[index])) {
      return nextTree;
    }

    return tree;
  }

  getNextTreePath = treePath => {
    const lastTreeStep = treePath[treePath.length - 1];
    if (lastTreeStep.playerResponses) {
      if (lastTreeStep.playerResponses.length) {
        return lastTreeStep.playerResponses.map(nextStep => treePath.concat(nextStep));
      } else {
        return [treePath];
      }
    } else {
      if (lastTreeStep.challengeResponse) {
        return [treePath.concat(lastTreeStep.challengeResponse)];
      } else {
        return [treePath];
      }
    }
  };

  deleteCurrentStep = () => {
    const {currentStep} = this.state;
    const pathIndexes = this.getPathIndexes().slice(0, -1);
    let {newChallenge, newModifyingStep} = this.duplicateChallenge(pathIndexes);
    let newStep = this.removeStep(newModifyingStep, currentStep);
    this.setState({
      challenge: newChallenge,
      currentStep: newStep,
      tree: this.getTree(newChallenge.startingPosition),
      game: newStep.game,
    });
  };

  createChallenge = () => {
    const cleanedChallenge = JSON.parse(JSON.stringify(this.state.challenge, (key, value) => {
      if (value instanceof Game) {
        return undefined;
      } else {
        return value;
      }
    }));
    this.props.client.createChallenge(cleanedChallenge);
  };

  discardChallenge = () => {
    this.setState({
      challenge: null,
      currentStep: null,
      tree: null,
      game: null,
    });
  };

  render() {
    const {user, client} = this.props;
    const {challenge, game, tree, currentStep} = this.state;
    const settings = user ? user.settings : client.settings;

    if (!challenge) {
      return (
        <ChallengeForm onCreateChallenge={this.onCreateChallenge} />
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
          <Grid.Row>
            <Button positive onClick={this.createChallenge}>Create</Button>
            <Button negative onClick={this.discardChallenge}>Discard</Button>
          </Grid.Row>
        </Grid>
        <Segment>
          <Header as={'h3'}>Tree</Header>
          <table>
            <tbody>
            {tree.map((treePath, rowIndex) => (
              <tr key={rowIndex}>
                {treePath.map((treePathStep, columnIndex) => (
                  <td key={columnIndex}>
                    {rowIndex === 0 || treePathStep !== tree[rowIndex - 1][columnIndex] ? (
                      <Board
                        small
                        selected={game === treePathStep.game}
                        onSelect={() => {
                          this.setState({
                            currentStep: treePathStep,
                            game: treePathStep.game,
                          });
                        }}
                        settings={settings}
                        game={treePathStep.game}
                      />
                    ) : null}
                  </td>
                ))}
              </tr>
            ))}
            </tbody>
          </table>
        </Segment>
        {currentStep.game ? <Segment>
          <Header as={'h3'}>Current step</Header>
          <Play
            user={user}
            defaultSettings={client.settings}
            changeSettings={this.changeSettings}
            game={game}
            matchGame={currentStep.game}
            allowControl={[currentStep.game.nextPlayer]}
            names={{[challenge.initialPlayer]: 'Player', [Game.OTHER_PLAYER[challenge.initialPlayer]]: 'Challenge'}}
            submit={this.submit}
            onDisplayPositionChange={this.onDisplayPositionChange}
            makeMove={this.makeMove}
          >
            <Button negative disabled={currentStep === challenge} onClick={this.deleteCurrentStep}>
              <Icon name={'delete'}/>Delete response
            </Button>
          </Play>
        </Segment> : null}
      </Fragment>
    );
  }
}

class ChallengeForm extends Component {
  getNewChallenge() {
    return {
      challenge: {
        options: {
          initialPlayer: null,
          type: 'mate',
          typeOptions: {
            mateIn: 1,
          },
        },
        meta: {
          source: '',
          difficulty: 1,
          maxDifficulty: 3,
        },
        startingPosition: {
          position: '',
          game: null,
          playerResponses: [],
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
    if (name === 'startingPosition.position') {
      this.setState(state => {
        const position = state.challenge.startingPosition.position;
        const isPositionValid = position
          ? Game.isValidCompressedPositionNotation(position) : false;
        const game = isPositionValid ? Game.fromCompressedPositionNotation(position) : null;
        return {
          error: {
            ...state.error,
            position: !position || isPositionValid ? null : 'This is not a valid position',
          },
          challenge: {
            ...state.challenge,
            options: {
              ...state.challenge.options,
              initialPlayer: game ? game.nextPlayer : null,
            },
            startingPosition: {
              ...state.challenge.startingPosition,
              game,
            }
          },
        };
      });
    }
  };

  createChallenge = () => {
    const {challenge, error} = this.state;
    if (error.position) {
      return;
    }
    this.props.onCreateChallenge(challenge);
  };

  render() {
    const {user, client} = this.props;
    const {challenge, error} = this.state;
    const settings = user ? user.settings : client.settings;

    return (
      <Fragment>
        <Header>Create a challenge</Header>
        <Segment>
          <Form onSubmit={this.createChallenge}>
            <Form.Group>
              <Form.Field
                name={'startingPosition.position'}
                control={Input}
                label={'Initial position'}
                placeholder={'Game position'}
                onChange={this.setValue}
                value={challenge.startingPosition.position}
                required
                error={error.position}
              />
            </Form.Group>
            <Form.Group inline>
              <label>Starting player</label>
              <Form.Radio
                name={'options.initialPlayer'}
                label={'Player A'}
                onChange={this.setValue}
                value={Game.PLAYER_A}
                checked={challenge.options.initialPlayer === Game.PLAYER_A}
                disabled={challenge.options.initialPlayer !== Game.PLAYER_A}
              />
              <Form.Radio
                name={'options.initialPlayer'}
                label={'Player B'}
                onChange={this.setValue}
                value={Game.PLAYER_B}
                checked={challenge.options.initialPlayer === Game.PLAYER_B}
                disabled={challenge.options.initialPlayer !== Game.PLAYER_B}
              />
            </Form.Group>
            {challenge.startingPosition.game ? (
              <Board
                medium
                settings={settings}
                game={challenge.startingPosition.game}
              />
            ) : null}
            <Form.Select
              options={[
                {key: 'mate', value: 'mate', text: 'Mate'},
              ]}
              name={'options.type'}
              label={'Type'}
              onChange={this.setValue}
              value={challenge.options.type}
            />
            <Form.Group>
              <Form.Field
                control={Input}
                type={'range'}
                label={`Mate In: ${challenge.options.typeOptions.mateIn}`}
                min={1}
                max={10}
                name={'options.typeOptions.mateIn'}
                onChange={this.setValue}
                value={challenge.options.typeOptions.mateIn}
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

ChallengeForm.propTypes = {
  onCreateChallenge: PropTypes.func.isRequired,
  user: PropTypes.object,
  client: PropTypes.object.isRequired,
};

ChallengeForm = withClient(ChallengeForm);

export default withClient(CreateChallenge);