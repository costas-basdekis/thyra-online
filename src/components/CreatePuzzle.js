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
import {withRouter} from "react-router-dom";
import {PuzzleHeader} from "./Puzzles";

class CreatePuzzle extends Component {
  state = {
    editing: true,
    puzzle: null,
    currentStep: null,
    tree: null,
    game: null,
  };

  componentDidMount() {
    if (this.props.initialPuzzle) {
      this.onCreatePuzzle(this.fillGames(this.props.initialPuzzle));
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.puzzlesInfo.mine !== this.props.puzzlesInfo.mine) {
      if (this.state.puzzle && !this.state.puzzle.id) {
        const prevPuzzles = this.getMatchingPuzzles(prevProps.puzzlesInfo.mine);
        const puzzles = this.getMatchingPuzzles(this.props.puzzlesInfo.mine);
        if (prevPuzzles.length === 0 && puzzles.length === 1) {
          const [puzzle] = puzzles;
          this.props.history.push(`/puzzle/${puzzle.id}/edit`);
        }
      }
    }
  }

  getMatchingPuzzles(puzzles) {
    const {puzzle: newPuzzle} = this.state;
    return puzzles.filter(puzzle => (
      puzzle.isMyPuzzle
      && puzzle.startingPosition.position === newPuzzle.startingPosition.position
      && puzzle.options.type === newPuzzle.options.type
      && puzzle.meta.source === newPuzzle.meta.source
      && puzzle.meta.gameId === newPuzzle.meta.gameId
      && puzzle.meta.public === newPuzzle.meta.public
    ));
  }

  fillGames(puzzleStep, previousGame = null) {
    puzzleStep = {...puzzleStep};
    if (!puzzleStep.game && puzzleStep.position) {
      if (previousGame && puzzleStep.moves) {
        puzzleStep.game = previousGame.makeMoves(puzzleStep.moves);
      } else {
        puzzleStep.game = Game.Classic.fromCompressedPositionNotation(puzzleStep.position);
      }
    }
    if (puzzleStep.startingPosition) {
      puzzleStep.startingPosition = this.fillGames(puzzleStep.startingPosition, puzzleStep.game);
    } else if (puzzleStep.playerResponses) {
      puzzleStep.playerResponses = puzzleStep.playerResponses.map(nextStep => this.fillGames(nextStep, puzzleStep.game));
    } else if ('puzzleResponse' in puzzleStep) {
      if (puzzleStep.puzzleResponse) {
        puzzleStep.puzzleResponse = this.fillGames(puzzleStep.puzzleResponse, puzzleStep.game);
      }
    } else {
      throw new Error('Cannot find type of step');
    }

    return puzzleStep;
  }

  onCreatePuzzle = puzzle => {
    this.setState({
      editing: false,
      puzzle,
      currentStep: puzzle.startingPosition,
      tree: this.getTree(puzzle.startingPosition),
      game: puzzle.startingPosition.game,
    });
  };

  makeMove = newGame => {
    this.setState({game: newGame});
  };

  getExistingResponse(newGame) {
    const {currentStep} = this.state;
    if (currentStep.playerResponses) {
      return currentStep.playerResponses
        .find(response => response.position === newGame.positionNotation);
    } else {
      if (currentStep.puzzleResponse && currentStep.puzzleResponse.position === newGame.positionNotation) {
        return currentStep.puzzleResponse;
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
        ? ['puzzle', 'startingPosition']
        : (
          treePath[index - 1].playerResponses
            ? ['playerResponses', treePath[index - 1].playerResponses.indexOf(treePathStep)]
            : ['puzzleResponse']
        )
    );

    return pathIndexes;
  }

  duplicatePuzzle(pathIndexes) {
    const {puzzle} = this.state;

    const newPuzzle = {
      ...puzzle,
      startingPosition: {...puzzle.startingPosition},
    };
    let newModifyingStep = newPuzzle.startingPosition;
    for (const index of _.flatten(pathIndexes.slice(1))) {
      const oldStep = newModifyingStep[index];
      const newStep = Array.isArray(oldStep) ? oldStep.slice() : {...oldStep};
      newModifyingStep[index] = newStep;
      newModifyingStep = newStep;
    }

    return {newPuzzle, newModifyingStep};
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
        puzzleResponse: null,
      };
      newModifyingStep.push(newStep);
    } else {
      newStep = {
        position: newGame.positionNotation,
        moves: newGame.lastMovesInHistory,
        game: newGame,
        playerResponses: [],
      };
      newModifyingStep.puzzleResponse = newStep;
    }

    return newStep;
  }

  removeStep(newModifyingStep, step) {
    if (newModifyingStep.playerResponses) {
      newModifyingStep.playerResponses = newModifyingStep.playerResponses.filter(response => response !== step);
    } else {
      newModifyingStep.puzzleResponse = null;
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
    let {newPuzzle, newModifyingStep} = this.duplicatePuzzle(pathIndexes);
    let newStep = this.addGameToStep(newModifyingStep, newGame);
    this.setState({
      puzzle: newPuzzle,
      currentStep: newStep,
      tree: this.getTree(newPuzzle.startingPosition),
      game: newStep.game,
    });
  };

  getTree(startingPosition = this.state.puzzle.startingPosition) {
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
      if (lastTreeStep.puzzleResponse) {
        return [treePath.concat(lastTreeStep.puzzleResponse)];
      } else {
        return [treePath];
      }
    }
  };

  deleteCurrentStep = () => {
    const {currentStep} = this.state;
    const pathIndexes = this.getPathIndexes().slice(0, -1);
    let {newPuzzle, newModifyingStep} = this.duplicatePuzzle(pathIndexes);
    let newStep = this.removeStep(newModifyingStep, currentStep);
    this.setState({
      puzzle: newPuzzle,
      currentStep: newStep,
      tree: this.getTree(newPuzzle.startingPosition),
      game: newStep.game,
    });
  };

  editPuzzle = () => {
    this.setState({editing: true});
  };

  createPuzzle = () => {
    const cleanedPuzzle = JSON.parse(JSON.stringify(this.state.puzzle, (key, value) => {
      if (value instanceof Game) {
        return undefined;
      } else {
        return value;
      }
    }));
    this.props.client.createPuzzle(cleanedPuzzle);
  };

  updatePuzzle = () => {
    const cleanedPuzzle = JSON.parse(JSON.stringify(this.state.puzzle, (key, value) => {
      if (value instanceof Game) {
        return undefined;
      } else {
        return value;
      }
    }));
    this.props.client.updatePuzzle(cleanedPuzzle);
  };

  createOrUpdatePuzzle = () => {
    if (this.state.puzzle.id) {
      this.updatePuzzle();
    } else {
      this.createPuzzle();
    }
  };

  discardPuzzle = () => {
    if (this.state.puzzle.id) {
      this.props.history.push(`/puzzle/${this.state.puzzle.id}`);
    } else {
      this.setState({
        editing: true,
        puzzle: null,
        currentStep: null,
        tree: null,
        game: null,
      });
    }
  };

  render() {
    const {user, client, gamesInfo: {byId: gamesById}, selectLiveGame} = this.props;
    const {editing, puzzle, game, tree, currentStep} = this.state;
    const settings = client.applicableSettings;

    if (editing && (!puzzle || puzzle.isMyPuzzle)) {
      return (
        <PuzzleForm initialPuzzle={puzzle} onCreatePuzzle={this.onCreatePuzzle} gamesById={gamesById} />
      )
    }

    if (!puzzle) {
      return null;
    }

    return (
      <Fragment>
        <Grid centered>
          <Grid.Row>
            <PuzzleHeader puzzle={puzzle} won={false} selectLiveGame={selectLiveGame} />
          </Grid.Row>
          <Grid.Row>
            <Button secondary onClick={this.editPuzzle}>Edit</Button>
            <Button positive onClick={this.createOrUpdatePuzzle}>{puzzle.id ? 'Update' : 'Create'}</Button>
            <Button negative onClick={this.discardPuzzle}>Discard</Button>
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
            names={{[puzzle.options.initialPlayer]: 'Player', [Game.OTHER_PLAYER[puzzle.options.initialPlayer]]: 'Puzzle'}}
            submit={this.submit}
            onDisplayPositionChange={this.onDisplayPositionChange}
            makeMove={this.makeMove}
          >
            <Button negative disabled={currentStep === puzzle} onClick={this.deleteCurrentStep}>
              <Icon name={'delete'}/>Delete response
            </Button>
          </Play>
        </Segment> : null}
      </Fragment>
    );
  }
}

CreatePuzzle.propTypes = {
  initialPuzzle: PropTypes.object,
  gamesInfo: PropTypes.object.isRequired,
  puzzlesInfo: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  selectLiveGame: PropTypes.func.isRequired,
};

class PuzzleForm extends Component {
  static valueConversion = {
    'options.typeOptions.mateIn': parseInt,
    'meta.difficulty': parseInt,
    'meta.publishDatetime': timestamp => timestamp ? moment(timestamp) : null,
  };

  state = {
    puzzle: this.props.initialPuzzle || {
      isMyPuzzle: true,
      options: {
        initialPlayer: Game.PLAYER_A,
        type: 'mate',
        typeOptions: {
          mateIn: 1,
        },
      },
      meta: {
        source: '',
        gameId: null,
        game: null,
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
      gameId: null,
    },
    editingPosition: false,
  };

  componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    if (!this.props.initialPuzzle) {
      const position = params.get('position');
      if (position) {
        this.setValue(null, {name: 'startingPosition.position', value: position});
      }
    }
    const gameId = params.get('gameId');
    if (gameId) {
      this.setValue(null, {name: 'meta.gameId', value: gameId});
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.gamesById !== this.props.gamesById) {
      this.onValueSet('meta.gameId');
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
      const puzzle = {
        ...state.puzzle,
      };
      let newPuzzleToChange = puzzle;
      const parts = name.split('.');
      for (const part of parts.slice(0, parts.length - 1)) {
        newPuzzleToChange = newPuzzleToChange[part] || {};
      }
      newPuzzleToChange[parts[parts.length - 1]] = convertedValue;
      return {puzzle};
    });
    this.onValueSet(name, convertedValue);
  };

  onValueSet = name => {
    if (name === 'startingPosition.position') {
      this.setState(state => {
        const position = state.puzzle.startingPosition.position;
        const isPositionValid = position
          ? Game.Classic.isValidCompressedPositionNotation(position) : false;
        const game = isPositionValid ? Game.Classic.fromCompressedPositionNotation(position) : null;
        return {
          error: {
            ...state.error,
            position: !position || isPositionValid ? null : 'This is not a valid position',
          },
          puzzle: {
            ...state.puzzle,
            options: {
              ...state.puzzle.options,
              initialPlayer: game ? game.nextPlayer : null,
            },
            startingPosition: {
              ...state.puzzle.startingPosition,
              game,
            }
          },
        };
      });
    } else if (name === 'options.type') {
      this.setState(state => {
        switch (state.puzzle.options.type) {
          case 'mate':
            return _.merge({}, {puzzle: state.puzzle}, {
              puzzle: {
                options: {
                  typeOptions: {
                    mateIn: 1,
                  },
                },
              },
            });
          case 'avoidMate':
            return _.merge({}, {puzzle: state.puzzle}, {
              puzzle: {
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
    } else if (name === 'meta.gameId') {
      this.setState(state => {
        const game = this.props.gamesById[state.puzzle.meta.gameId];
        return _.merge({}, {puzzle: state.puzzle}, {
          error: {
            gameId: !game && state.puzzle.meta.gameId ? 'There is no game with such an ID' : null,
          },
          puzzle: {
            meta: {
              game: game ? Game.Classic.deserialize(game.game) : null,
            },
          },
        });
      });
    }
  };

  createPuzzle = () => {
    const {puzzle, error} = this.state;
    if (error.position) {
      return;
    }
    this.props.onCreatePuzzle(puzzle);
  };

  usePosition = positionNotation => {
    this.setState({
      editingPosition: false,
    });
    this.setValue(null, {name: 'startingPosition.position', value: positionNotation});
  };

  discard = () => {
    this.setState({
      editingPosition: false,
    });
  };

  editPosition = () => {
    this.setState({editingPosition: true});
  };

  render() {
    const {client, initialPuzzle} = this.props;
    const {editingPosition, puzzle, error} = this.state;
    const settings = client.applicableSettings;

    if (editingPosition) {
      return (
        <EditPosition
          usePosition={this.usePosition}
          discard={this.discard}
          initialPositionNotation={puzzle.startingPosition.position}
        />
      );
    }

    return (
      <Fragment>
        <Header>Create a puzzle</Header>
        <Segment>
          <Form onSubmit={this.createPuzzle}>
            <Form.Group>
              <Form.Field
                name={'startingPosition.position'}
                control={Input}
                label={'Initial position'}
                placeholder={'Game position'}
                onChange={this.setValue}
                value={puzzle.startingPosition.position}
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
                checked={puzzle.options.initialPlayer === Game.PLAYER_A}
                disabled={puzzle.options.initialPlayer !== Game.PLAYER_A}
              />
              <Form.Radio
                name={'options.initialPlayer'}
                label={'Player B'}
                onChange={this.setValue}
                value={Game.PLAYER_B}
                checked={puzzle.options.initialPlayer === Game.PLAYER_B}
                disabled={puzzle.options.initialPlayer !== Game.PLAYER_B}
              />
            </Form.Group>
            {puzzle.startingPosition.game ? (
              <Board
                medium
                settings={settings}
                game={puzzle.startingPosition.game}
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
              value={puzzle.options.type}
            />
            {puzzle.options.type === 'mate' ? (
              <Form.Group>
                <Form.Field
                  control={Input}
                  type={'range'}
                  label={`Mate In: ${puzzle.options.typeOptions.mateIn}`}
                  min={1}
                  max={10}
                  name={'options.typeOptions.mateIn'}
                  onChange={this.setValue}
                  required
                  value={puzzle.options.typeOptions.mateIn}
                />
              </Form.Group>
            ) : puzzle.options.type === 'avoidMate' ? (
              <Form.Group>
                <Form.Field
                  control={Input}
                  type={'range'}
                  label={`Avoid Mate In: ${puzzle.options.typeOptions.mateIn}`}
                  min={1}
                  max={10}
                  name={'options.typeOptions.mateIn'}
                  onChange={this.setValue}
                  required
                  value={puzzle.options.typeOptions.mateIn}
                />
              </Form.Group>
            ) : "Unknown puzzle type"}
            <Form.Group>
              <Form.Field
                control={Input}
                label={'Source'}
                name={'meta.source'}
                onChange={this.setValue}
                value={puzzle.meta.source}
              />
              <Form.Field
                control={Input}
                type={'range'}
                label={`Difficulty: ${puzzle.meta.difficulty}/${puzzle.meta.maxDifficulty}`}
                min={1}
                max={puzzle.meta.maxDifficulty}
                name={'meta.difficulty'}
                onChange={this.setValue}
                required
                value={puzzle.meta.difficulty}
              />
            </Form.Group>
            <Form.Group>
              <Form.Field
                name={'meta.gameId'}
                control={Input}
                label={'From game'}
                placeholder={'Game ID'}
                onChange={this.setValue}
                value={puzzle.meta.gameId || ''}
                error={error.gameId}
              />
            </Form.Group>
            {puzzle.meta.game ? (
              <Board
                medium
                settings={settings}
                game={puzzle.meta.game}
              />
            ) : null}
            <Form.Group>
              <Form.Field
                control={Checkbox}
                label={'Public'}
                name={'meta.public'}
                onChange={this.setValue}
                checked={puzzle.meta.public}
              />
              <Form.Field
                control={Input}
                type={'datetime-local'}
                label={'Publish On'}
                name={'meta.publishDatetime'}
                onChange={this.setValue}
                value={puzzle.meta.publishDatetime ? puzzle.meta.publishDatetime.format("YYYY-MM-DDTHH:mm") : ''}
              />
            </Form.Group>
            <Form.Button primary content={initialPuzzle ? 'Update' : 'Create'} />
          </Form>
        </Segment>
      </Fragment>
    );
  }
}

PuzzleForm.propTypes = {
  initialPuzzle: PropTypes.object,
  onCreatePuzzle: PropTypes.func.isRequired,
  user: PropTypes.object,
  client: PropTypes.object.isRequired,
  gamesById: PropTypes.object.isRequired,
};

PuzzleForm = withClient(PuzzleForm);

export default withRouter(withClient(CreatePuzzle));
