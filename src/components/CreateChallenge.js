import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Button, Checkbox, Form, Grid, Header, Icon, Input, Segment} from "semantic-ui-react";
import Game from "../game/game";
import _ from "lodash";
import Board from "./Board";
import {withClient} from "../client/withClient";
import Play from "./Play";
import EditPosition from "./EditPosition";
import moment from "moment";
import * as utils from "../utils";

class CreateChallenge extends Component {
  state = {
    editing: true,
    challenge: null,
    currentStep: null,
    tree: null,
    game: null,
  };

  componentDidMount() {
    if (this.props.initialChallenge) {
      this.onCreateChallenge(this.fillGames(this.props.initialChallenge));
    }
  }

  fillGames(challengeStep) {
    challengeStep = {...challengeStep};
    if (!challengeStep.game && challengeStep.position) {
      challengeStep.game = Game.Classic.fromCompressedPositionNotation(challengeStep.position);
    }
    if (challengeStep.startingPosition) {
      challengeStep.startingPosition = this.fillGames(challengeStep.startingPosition);
    } else if (challengeStep.playerResponses) {
      challengeStep.playerResponses = challengeStep.playerResponses.map(nextStep => this.fillGames(nextStep));
    } else if ('challengeResponse' in challengeStep) {
      if (challengeStep.challengeResponse) {
        challengeStep.challengeResponse = this.fillGames(challengeStep.challengeResponse);
      }
    } else {
      throw new Error('Cannot find type of step');
    }

    return challengeStep;
  }

  onCreateChallenge = challenge => {
    this.setState({
      editing: false,
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

  editChallenge = () => {
    this.setState({editing: true});
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

  updateChallenge = () => {
    const cleanedChallenge = JSON.parse(JSON.stringify(this.state.challenge, (key, value) => {
      if (value instanceof Game) {
        return undefined;
      } else {
        return value;
      }
    }));
    this.props.client.updateChallenge(cleanedChallenge);
  };

  createOrUpdateChallenge = () => {
    if (this.state.challenge.id) {
      this.updateChallenge();
    } else {
      this.createChallenge();
    }
  };

  discardChallenge = () => {
    this.setState({
      editing: true,
      challenge: null,
      currentStep: null,
      tree: null,
      game: null,
    });
  };

  render() {
    const {user, client} = this.props;
    const {editing, challenge, game, tree, currentStep} = this.state;
    const settings = client.applicableSettings;

    if (editing && (!challenge || challenge.isMyChallenge)) {
      return (
        <ChallengeForm initialChallenge={challenge} onCreateChallenge={this.onCreateChallenge} />
      )
    }

    if (!challenge) {
      return null;
    }

    return (
      <Fragment>
        <Grid centered>
          <Grid.Row>
            <Segment>
              <Header as={'h1'}>{utils.getChallengeTitle(challenge)}</Header>
              <Header as={'h4'} className={'difficulty-header'}>{this.getDifficultyStars(challenge.meta.difficulty, challenge.meta.maxDifficulty)}</Header>
              <Header as={'h4'}>{challenge.meta.source}</Header>
            </Segment>
          </Grid.Row>
          <Grid.Row>
            <Button secondary onClick={this.editChallenge}>Edit</Button>
            <Button positive onClick={this.createOrUpdateChallenge}>{challenge.id ? 'Update' : 'Create'}</Button>
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
            changeSettings={this.changeSettings}
            game={game}
            allowControl={[currentStep.game.nextPlayer]}
            names={{[challenge.options.initialPlayer]: 'Player', [Game.OTHER_PLAYER[challenge.options.initialPlayer]]: 'Puzzle'}}
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

CreateChallenge.propTypes = {
  initialChallenge: PropTypes.object,
};

class ChallengeForm extends Component {
  static valueConversion = {
    'options.typeOptions.mateIn': parseInt,
    'meta.difficulty': parseInt,
    'meta.publishDatetime': timestamp => timestamp ? moment(timestamp) : null,
  };

  state = {
    challenge: this.props.initialChallenge || {
      isMyChallenge: true,
      options: {
        initialPlayer: Game.PLAYER_A,
        type: 'mate',
        typeOptions: {
          mateIn: 1,
        },
      },
      meta: {
        source: '',
        difficulty: 1,
        maxDifficulty: 3,
        public: true,
        publishDatetime: null,
      },
      startingPosition: {
        position: Game.Classic.create().positionNotation,
        game: Game.Classic.create(),
        playerResponses: [],
      },
    },
    error: {
      position: null,
    },
    editingPosition: false,
  };

  componentDidMount() {
    if (!this.props.initialChallenge) {
      const params = new URLSearchParams(window.location.search);
      const position = params.get('position');
      if (position) {
        this.setValue(null, {name: 'startingPosition.position', value: position});
      }
    }
  }

  setValue = (e, {name, value, checked}) => {
    if (value === undefined && typeof checked === typeof true) {
      value = checked;
    }
    let convertedValue = value;
    if (name in this.constructor.valueConversion) {
      convertedValue = this.constructor.valueConversion[name](convertedValue);
    }
    this.setState(state => {
      const challenge = {
        ...state.challenge,
      };
      let newChallengeToChange = challenge;
      const parts = name.split('.');
      for (const part of parts.slice(0, parts.length - 1)) {
        newChallengeToChange = newChallengeToChange[part] || {};
      }
      newChallengeToChange[parts[parts.length - 1]] = convertedValue;
      return {challenge};
    });
    this.onValueSet(name, convertedValue);
  };

  onValueSet = name => {
    if (name === 'startingPosition.position') {
      this.setState(state => {
        const position = state.challenge.startingPosition.position;
        const isPositionValid = position
          ? Game.Classic.isValidCompressedPositionNotation(position) : false;
        const game = isPositionValid ? Game.Classic.fromCompressedPositionNotation(position) : null;
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
    } else if (name === 'options.type') {
      this.setState(state => {
        switch (state.challenge.options.type) {
          case 'mate':
            return _.merge({}, {challenge: state.challenge}, {
              challenge: {
                options: {
                  typeOptions: {
                    mateIn: 1,
                  },
                },
              },
            });
          case 'avoidMate':
            return _.merge({}, {challenge: state.challenge}, {
              challenge: {
                options: {
                  typeOptions: {
                    mateIn: 1,
                  },
                },
              },
            });
          default:
            return null;
        }
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

  usePosition = positionNotation => {
    this.setState({
      editingPosition: false,
    });
    this.setValue(null, {name: 'startingPosition.position', value: positionNotation});
  };

  editPosition = () => {
    this.setState({editingPosition: true});
  };

  render() {
    const {client, initialChallenge} = this.props;
    const {editingPosition, challenge, error} = this.state;
    const settings = client.applicableSettings;

    if (editingPosition) {
      return (
        <EditPosition
          usePosition={this.usePosition}
          initialPositionNotation={challenge.startingPosition.position}
        />
      );
    }

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
              <Button
                content={'Edit position'}
                secondary
                onClick={this.editPosition}
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
                {key: 'avoidMate', value: 'avoidMate', text: 'Avoid Mate'},
              ]}
              name={'options.type'}
              label={'Type'}
              onChange={this.setValue}
              required
              value={challenge.options.type}
            />
            {challenge.options.type === 'mate' ? (
              <Form.Group>
                <Form.Field
                  control={Input}
                  type={'range'}
                  label={`Mate In: ${challenge.options.typeOptions.mateIn}`}
                  min={1}
                  max={10}
                  name={'options.typeOptions.mateIn'}
                  onChange={this.setValue}
                  required
                  value={challenge.options.typeOptions.mateIn}
                />
              </Form.Group>
            ) : challenge.options.type === 'avoidMate' ? (
              <Form.Group>
                <Form.Field
                  control={Input}
                  type={'range'}
                  label={`Avoid Mate In: ${challenge.options.typeOptions.mateIn}`}
                  min={1}
                  max={10}
                  name={'options.typeOptions.mateIn'}
                  onChange={this.setValue}
                  required
                  value={challenge.options.typeOptions.mateIn}
                />
              </Form.Group>
            ) : "Unknown challenge type"}
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
                required
                value={challenge.meta.difficulty}
              />
            </Form.Group>
            <Form.Group>
              <Form.Field
                control={Checkbox}
                label={'Public'}
                name={'meta.public'}
                onChange={this.setValue}
                checked={challenge.meta.public}
              />
              <Form.Field
                control={Input}
                type={'datetime-local'}
                label={'Publish On'}
                name={'meta.publishDatetime'}
                onChange={this.setValue}
                value={challenge.meta.publishDatetime ? challenge.meta.publishDatetime.format("YYYY-MM-DDTHH:mm") : ''}
              />
            </Form.Group>
            <Form.Button primary content={initialChallenge ? 'Update' : 'Create'} />
          </Form>
        </Segment>
      </Fragment>
    );
  }
}

ChallengeForm.propTypes = {
  initialChallenge: PropTypes.object,
  onCreateChallenge: PropTypes.func.isRequired,
  user: PropTypes.object,
  client: PropTypes.object.isRequired,
};

ChallengeForm = withClient(ChallengeForm);

export default withClient(CreateChallenge);
