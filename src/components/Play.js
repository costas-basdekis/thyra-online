import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import '../styles/play.css';
import Game from "../game/game";
import Board from "./Board";
import {
  Button,
  Checkbox,
  Grid,
  Header,
  Label,
  Menu,
  Modal,
  Pagination, Responsive,
  Segment,
  Statistic
} from "semantic-ui-react";
import classNames from 'classnames';
import {BoardTransformation} from "./Board/Board";
import keydown, {Keys} from "react-keydown";
import PlayerColourBoard from "./Board/PlayerColourBoard";
import {ChallengeUserButton} from "./Lobby";
import {withClient} from "../client/withClient";

class Play extends Component {
  static MOVE_TYPE_NAMES = {
    [Game.MOVE_TYPE_PLACE_FIRST_WORKER]: "Place a worker",
    [Game.MOVE_TYPE_PLACE_SECOND_WORKER]: "Place a worker",
    [Game.MOVE_TYPE_SELECT_WORKER_TO_MOVE]: "Select a worker",
    [Game.MOVE_TYPE_MOVE_FIRST_WORKER]: "Move worker",
    [Game.MOVE_TYPE_MOVE_SECOND_WORKER]: "Move worker",
    [Game.MOVE_TYPE_BUILD_AROUND_WORKER]: "Build",
  };

  state = {
    selectedGame: null,
    game: this.props.game,
    transformation: null,
  };

  autoSubmitModal = React.createRef();

  makeMove = game => {
    if (this.props.submit) {
      this.setState({game})
    } else {
      this.props.makeMove(game);
    }
    if (this.props.onDisplayPositionChange) {
      this.props.onDisplayPositionChange(game);
    }
  };

  takeMoveBack = () => {
    this.makeMove(this.state.game.takeMoveBack());
  };

  undo = () => {
    this.makeMove(this.state.game.undo());
  };

  newGame = () => {
    this.makeMove(Game.create());
  };

  selectGame = game => {
    const selectedGame = game === this.state.game ? null : game;
    this.setState({selectedGame});
    if (this.props.onSelectedGameChange) {
      this.props.onSelectedGameChange(selectedGame);
    }
  };

  makeMoveToSelected = game => {
    this.selectGame(game);
  };

  takeMoveBackToSelected = () => {
    this.selectGame(this.state.selectedGame.takeMoveBack());
  };

  undoToSelected = () => {
    this.selectGame(this.state.selectedGame.undo());
  };

  deselectGame = () => {
    this.selectGame(null);
  };

  submit = () => {
    const moves = this.getMovesToSubmit();
    if (moves.length) {
      this.props.submit(moves, this.state.game);
    }
  };

  getMovesToSubmit() {
    const {game: propsGame} = this.props;
    const {game: stateGame} = this.state;
    const history = stateGame.fullHistory;
    const propsGameIndex = history.findIndex(
      game => game.compressedFullNotation === propsGame.compressedFullNotation);
    if (propsGameIndex < 0) {
      console.error("Could not find live game in history");
      return [];
    }
    const newHistory = history.slice(propsGameIndex + 1);
    const moves = newHistory.map(game => game.lastMove);

    return moves;
  }

  resignOrAbort = () => {
    this.props.submit("resign");
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.props.game !== prevProps.game) {
      const gameChanged = (
        !this.props.game
        || !prevProps.game
        || this.props.game.compressedFullNotation !== prevProps.game.compressedFullNotation
        || this.props.game.positionNotation !== prevProps.game.positionNotation
      );
      if (gameChanged) {
        this.selectGame(null);
        this.setState({game: this.props.game, resigning: false});
      }
    }
    if (this.props.user && this.props.user.settings.autoSubmitMoves) {
      if (!this.canSubmit(prevProps, prevState) && this.canSubmit()) {
        this.submit();
      }
    }
  }

  changeAutoSubmitMoves = () => {
    if (!this.props.user.settings.autoSubmitMoves) {
      this.autoSubmitModal.current.handleOpen();
    } else {
      this.props.changeSettings({...this.props.user.settings, autoSubmitMoves: false});
    }
  };

  doAutoSubmitMoves = () => {
    this.props.changeSettings({...this.props.user.settings, autoSubmitMoves: true});
    if (this.canSubmit()) {
      this.submit();
    }
  };

  canSubmit(props = this.props, state = this.state) {
    const {submit} = props;
    const {selectedGame, game} = state;
    return (
      !!submit
      && !selectedGame
      && game !== props.game
      && !!this.getMovesToSubmit().length
      && (
        game.finished
        || game.nextPlayer !== props.game.nextPlayer
      )
    );
  }

  onTransformationChange = ({transformation}) => {
    this.setState({transformation});
  };

  render() {
    const {
      user, defaultSettings, names, allowControl, matchGame, children, usersInfo: {byId: usersById},
    } = this.props;
    const {selectedGame, game, transformation} = this.state;
    const displayGame = selectedGame || game;
    const isMyGame = allowControl.length > 0;
    const canSubmit = this.canSubmit();
    const tooShortToResign = matchGame ? matchGame.tooShortToResign : false;
    const settings = user ? user.settings : defaultSettings;
  	const isPlayerBOpponent = allowControl.includes(Game.PLAYER_A);
    const canUndo = !selectedGame && (this.props.submit ? game.chainCount > this.props.game.chainCount : game.canUndo);
    const canTakeBack = !this.props.submit && !selectedGame && game.previous;

  	const controlsNode = (
  	  <Fragment>
        <Grid.Row>
          <PlayPlayer
            player={isPlayerBOpponent ? Game.PLAYER_A : Game.PLAYER_B}
            playerUser={matchGame ? usersById[matchGame.userIds[isPlayerBOpponent ? 0 : 1]] : null}
            canSubmit={canSubmit}
            canAnyPlayerSubmit={canSubmit}
            canUndo={canUndo}
            canTakeBack={canTakeBack}
            submit={this.props.submit ? this.submit : null}
            undo={this.props.submit ? this.takeMoveBack : this.undo}
            takeBack={this.takeMoveBack}
            changeAutoSubmitMoves={this.changeAutoSubmitMoves}
            game={game}
            settings={settings}
            names={names}
            allowControl={allowControl}
          />
        </Grid.Row>
        <Grid.Row>
          <PlayPlayer
            player={isPlayerBOpponent ? Game.PLAYER_B : Game.PLAYER_A}
            playerUser={matchGame ? usersById[matchGame.userIds[isPlayerBOpponent ? 1 : 0]] : null}
            canSubmit={false}
            canAnyPlayerSubmit={canSubmit}
            canUndo={canUndo}
            canTakeBack={canTakeBack}
            submit={this.props.submit ? this.submit : null}
            undo={this.props.submit ? this.takeMoveBack : this.undo}
            takeBack={this.takeMoveBack}
            changeAutoSubmitMoves={this.changeAutoSubmitMoves}
            game={game}
            settings={settings}
            names={names}
            allowControl={allowControl}
          />
        </Grid.Row>
        <Grid.Row>
          <PlayNavigation game={game} selectedGame={selectedGame} selectGame={this.selectGame} />
        </Grid.Row>
        <Grid.Row>
          <BoardTransformation onChange={this.onTransformationChange} />
        </Grid.Row>
        {children}
      </Fragment>
    );
  	const boardNode = (
      <Board
        game={displayGame}
        transformation={transformation}
        makeMove={selectedGame ? this.makeMoveToSelected : this.makeMove}
        minChainCount={displayGame === game ? (
          this.props.submit ? this.props.game.chainCount : (
            this.props.game.canUndo ? this.props.game.previous.chainCount : this.props.game.chainCount
          )
        ) : 0}
        allowControl={displayGame === game ? allowControl : undefined}
        settings={settings}
        animated={settings.theme.animations}
        showArrows={settings.theme.arrows}
      />
    );

    return (
      <Fragment>
        <Segment style={{textAlign: "center"}}>
          <Grid centered columns={'equal'} textAlign={'center'}>
            <Responsive as={Grid.Row} minWidth={800}>
              <Grid.Column>{controlsNode}</Grid.Column>
              <Grid.Column>{boardNode}</Grid.Column>
            </Responsive>
            <Responsive as={Fragment} maxWidth={800}>
              <Grid.Row>
                <Grid.Column stretched={false} textAlign={'center'}>
                  {boardNode}
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column stretched={false} textAlign={'center'}>
                  {controlsNode}
                </Grid.Column>
              </Grid.Row>
            </Responsive>
          </Grid>
        </Segment>
        {this.props.submit && isMyGame ? (
          <Segment>
            <Statistic.Group widths={"two"} size={"tiny"}>
              <Statistic value={
                <Modal
                  trigger={<Button negative disabled={!!selectedGame || this.props.game.finished}>{tooShortToResign ? 'Abort' : 'Resign'}</Button>}
                  header={tooShortToResign ? 'Abort?' : 'Resign?'}
                  content={`Are you sure you want to ${tooShortToResign ? 'abort' : 'forfeit'}?${tooShortToResign ? ' This game is too short to resign.' : ''}`}
                  actions={[{key: 'resign', content: tooShortToResign ? 'Abort' : 'Resign', negative: true, onClick: this.resignOrAbort}, { key: 'continue', content: 'Continue', inverted: true, secondary: true }]}
                />
              } />
              <Statistic value={<Button negative onClick={this.props.submit ? this.takeMoveBack : this.undo} disabled={!canUndo}>Undo</Button>} />
            </Statistic.Group>
          </Segment>
        ) : null}
        {!this.props.submit ? (
          <Segment>
            <Statistic.Group widths={"two"} size={"small"}>
              <Statistic value={<Button negative onClick={this.takeMoveBack} disabled={!canTakeBack}>Take Back a Move</Button>}/>
              <Statistic value={<Button negative onClick={this.newGame} disabled={!!selectedGame || !game.previous}>New Game</Button>} />
            </Statistic.Group>
          </Segment>
        ) : null}
        <PlayHistory
          game={game}
          selectedGame={selectedGame}
          selectGame={this.selectGame}
          user={user}
          defaultSettings={defaultSettings}
        />
        {selectedGame ? (
          <Segment textAlign={"center"}>
            <Header as={"h2"}>Reviewing previous move</Header>
            <Statistic.Group widths={"three"} size={"small"}>
              {selectedGame.finished ? (
                <Statistic color={"green"} value={names[selectedGame.winner]} label={"Won!"} />
              ) : (
                <Statistic value={names[selectedGame.nextPlayer]} label={this.constructor.MOVE_TYPE_NAMES[selectedGame.moveType]} />
              )}
              <Statistic value={selectedGame.moveCount} label={"Move"} />
              <Statistic value={<Button negative onClick={this.undoToSelected} disabled={!selectedGame.canUndo}>Undo</Button>} />
            </Statistic.Group>
            <Statistic.Group widths={"two"} size={"small"}>
              <Statistic value={<Button negative onClick={this.takeMoveBackToSelected} disabled={!selectedGame.previous}>Take Back a Move</Button>}/>
              <Statistic value={<Button negative onClick={this.deselectGame}>Stop reviewing</Button>} />
            </Statistic.Group>
          </Segment>
        ) : null}
        <Modal
          ref={this.autoSubmitModal}
          header={'Auto submit moves'}
          content={'Are you sure you want to be auto submitting your moves?'}
          actions={[
            {key: 'yes', content: 'Auto submit', onClick: this.doAutoSubmitMoves, primary: true},
            {key: 'no', content: 'No, manually submit moves', secondary: true},
          ]}
        />
      </Fragment>
    );
  }
}

Play.propTypes = {
  user: PropTypes.object,
  defaultSettings: PropTypes.object.isRequired,
  otherUser: PropTypes.object,
  settings: PropTypes.object,
  changeSettings: PropTypes.func,
  game: PropTypes.instanceOf(Game).isRequired,
  matchGame: PropTypes.object,
  makeMove: PropTypes.func,
  submit: PropTypes.func,
  challengeUser: PropTypes.func,
  stopChallengeUser: PropTypes.func,
  challengedUser: PropTypes.object,
  names: PropTypes.object.isRequired,
  allowControl: PropTypes.array.isRequired,
  children: PropTypes.node,
  onSelectedGameChange: PropTypes.func,
  onDisplayPositionChange: PropTypes.func,
  usersInfo: PropTypes.object.isRequired,
};

Play.defaultProps = {
  names: {
    [Game.PLAYER_A]: "Player A",
    [Game.PLAYER_B]: "Player B",
  },
  allowControl: [Game.PLAYER_A, Game.PLAYER_B],
};

Play = withClient(Play);

class PlayPlayer extends Component {
  static MOVE_TYPE_NAMES = {
    [Game.MOVE_TYPE_PLACE_FIRST_WORKER]: "Place a worker",
    [Game.MOVE_TYPE_PLACE_SECOND_WORKER]: "Place a worker",
    [Game.MOVE_TYPE_SELECT_WORKER_TO_MOVE]: "Select a worker",
    [Game.MOVE_TYPE_MOVE_FIRST_WORKER]: "Move worker",
    [Game.MOVE_TYPE_MOVE_SECOND_WORKER]: "Move worker",
    [Game.MOVE_TYPE_BUILD_AROUND_WORKER]: "Build",
  };

  render() {
    const {
      game, player, allowControl, names, settings, changeAutoSubmitMoves, playerUser,
      canSubmit, canAnyPlayerSubmit, canUndo, canTakeBack, submit, undo, takeBack,
    } = this.props;
    const isPlayerControlled = allowControl.includes(player);
    const isPlayersTurn = (canAnyPlayerSubmit ? game.previous : game).nextPlayer === player;
    const playerWon = game.winner === player;

    return (
      <Menu
        stackable
        className={classNames({attention: !game.finished && isPlayerControlled && isPlayersTurn && !canSubmit})}
        size={'massive'}
        inverted={game.finished || player === Game.PLAYER_B}
        color={game.finished ? (playerWon ? 'green' : 'red') : undefined}
        items={[
          {key: 'icon',
            icon: game.finished ? (playerWon ? 'trophy' : 'thumbs down') : (isPlayersTurn ? 'play' : 'hourglass'),
            content: (
              <Fragment>
                <PlayerColourBoard medium settings={settings} player={player} allowControl={allowControl} />
                {names[player]}
              </Fragment>
            )},
          {key: 'instructions', content: (
            game.finished
              ? (playerWon ? 'Won' : 'Lost')
              : (
                canSubmit
                  ? (
                    settings.autoSubmitMoves
                      ? 'Auto-submitting'
                      : (
                        <Fragment>
                          <Modal
                            size={'mini'}
                            trigger={
                              <Button
                                positive
                                className={'attention'}
                              >
                                Submit
                              </Button>
                            }
                            header={'Submit move'}
                            content={
                              <Modal.Content>
                                Are you sure you want to submit these moves?
                                <br />
                                <Board
                                  game={game}
                                  medium
                                  settings={settings}
                                  animated
                                  showArrows
                                />
                              </Modal.Content>
                            }
                            actions={[
                              {key: 'cancel', negative: true, content: 'Cancel'},
                              {key: 'ok', positive: true, content: 'Submit', onClick: submit},
                            ]}
                          />
                          {isPlayerControlled && canUndo ? (
                            <Fragment>
                              {" or "}<Button negative content={'Undo'} disabled={!canUndo} onClick={undo} />
                            </Fragment>
                          ) : null}
                        </Fragment>
                      )
                  ) : (
                    isPlayersTurn
                      ? (
                        isPlayerControlled && canUndo
                          ? (
                            <Fragment>
                              {this.constructor.MOVE_TYPE_NAMES[(canAnyPlayerSubmit ? game.previous : game).moveType]}
                              {" or "}<Button negative content={'Undo'} disabled={!canUndo} onClick={undo} />
                            </Fragment>
                          )
                          : this.constructor.MOVE_TYPE_NAMES[(canAnyPlayerSubmit ? game.previous : game).moveType]
                      )
                      : `Waiting for ${names[Game.OTHER_PLAYER[player]]}`
                  )
              )
          )},
          !canUndo && canTakeBack && !isPlayersTurn ? (
            <Button negative content={'Take move back'} onClick={takeBack} />
          ) : null,
          !game.finished && submit && allowControl.includes(player) ? {
            key: 'auto-submit', content: (
              <Checkbox
                label={'Auto submit moves'}
                toggle
                checked={settings.autoSubmitMoves}
                onChange={changeAutoSubmitMoves}
              />
            )
          } : null,
          game.finished && playerUser && playerUser.online ? {
            key: 'challenge', content: (
              <ChallengeUserButton otherUser={playerUser} />
            ),
          } : null,
        ].filter(item => item)}
      />
    );
  }
}

PlayPlayer.propTypes = {
  settings: PropTypes.object,
  game: PropTypes.instanceOf(Game).isRequired,
  names: PropTypes.object.isRequired,
  allowControl: PropTypes.array.isRequired,
  player: PropTypes.oneOf(Game.PLAYERS).isRequired,
  playerUser: PropTypes.object,
  canSubmit: PropTypes.bool.isRequired,
  canAnyPlayerSubmit: PropTypes.bool.isRequired,
  canUndo: PropTypes.bool.isRequired,
  canTakeBack: PropTypes.bool.isRequired,
  submit: PropTypes.func,
  undo: PropTypes.func,
  takeBack: PropTypes.func,
  changeAutoSubmitMoves: PropTypes.func.isRequired,
};

class PlayHistory extends Component {
  state = {
    activePage: 1,
  };

  onPageChange = (e, {activePage}) => {
    this.setState({activePage});
  };

  render() {
    const {game, selectedGame, user, defaultSettings, selectGame, pageSize, moveNotation} = this.props;
    const {activePage} = this.state;

    const totalPages = Math.ceil((game.history.length - 1) / pageSize);
    const visibleGames = [...game.history]
      .slice(1 + (totalPages - activePage) * pageSize, 1 + (totalPages - activePage) * pageSize + pageSize)
      .reverse();
    const lastVisibleGame = visibleGames[visibleGames.length - 1];

    return (
      <Segment>
        <Grid centered>
          <Grid.Row>
            <PlayNavigation game={game} selectedGame={selectedGame} selectGame={selectGame} />
          </Grid.Row>
          <Grid.Row>
            {visibleGames.map(previousGame => (
              <Fragment key={previousGame.chainCount}>
                {previousGame.moveCount % 2 === 1 ? (
                  <Label content={previousGame.moveCount - 1} />
                ) : null}
                <Board
                  game={previousGame}
                  small
                  onSelect={selectGame}
                  selected={previousGame === selectedGame}
                  settings={user ? user.settings : defaultSettings}
                />
                {moveNotation ? (
                  <Label color={'green'}>
                    {previousGame.lastMovesInHistory.map(({x, y, resign}) => resign
                      ? 'R' : `${['A', 'B', 'C', 'D', 'E'][x]}${y + 1}`).join('/')}
                  </Label>
                ) : null}
              </Fragment>
            ))}
            {lastVisibleGame && (lastVisibleGame.moveCount % 2 === 0) ? (
              <Label content={lastVisibleGame.moveCount - 2} />
            ) : null}
          </Grid.Row>
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
      </Segment>
    );
  }
}

PlayHistory.propTypes = {
  game: PropTypes.instanceOf(Game).isRequired,
  selectedGame: PropTypes.instanceOf(Game),
  user: PropTypes.object,
  defaultSettings: PropTypes.object.isRequired,
  selectGame: PropTypes.func,
  pageSize: PropTypes.number.isRequired,
  moveNotation: PropTypes.bool.isRequired,
};

PlayHistory.defaultProps = {
  pageSize: 10,
  moveNotation: false,
};

class PlayNavigation extends Component {
  static keys = [
    'left', 'right', 'shift+left', 'shift+right', 'home', 'end',
  ];

  componentWillReceiveProps({keydown}) {
    if (keydown.event) {
      const {which, shiftKey} = keydown.event;
      if (which === Keys.left && shiftKey) {
        this.goToCurrentMove();
      } else if (which === Keys.home) {
        this.goToCurrentMove();
      } else if (which === Keys.left && !shiftKey) {
        this.goToNextMove();
      } else if (which === Keys.right && !shiftKey) {
        this.goToPreviousMove();
      } else if (which === Keys.right && shiftKey) {
        this.goToFirstMove();
      } else if (which === Keys.home) {
        this.goToFirstMove();
      }
    }
  }

  get gameIndexes() {
    const {game, selectedGame} = this.props;
    const selectedGameIndex = game.history.indexOf(selectedGame || game);
    let mostRecentAncestorGameIndex = selectedGameIndex;
    let ancestor = selectedGame;
    while (mostRecentAncestorGameIndex === -1 && ancestor) {
      ancestor = ancestor.previousInHistory;
      mostRecentAncestorGameIndex = game.history.indexOf(ancestor);
    }
    const lastGameIndex = game.history.length - 1;

    return {selectedGameIndex, lastGameIndex, mostRecentAncestorGameIndex};
  }

  canGoToCurrentMove() {
    const {selectedGameIndex, lastGameIndex} = this.gameIndexes;

    return selectedGameIndex !== lastGameIndex;
  }

  goToCurrentMove = () => {
    if (!this.canGoToCurrentMove()) {
      return;
    }
    this.props.selectGame(this.props.game);
  };

  canGoToNextMove() {
    const {selectedGameIndex, lastGameIndex} = this.gameIndexes;

    return selectedGameIndex >= 0 && selectedGameIndex !== lastGameIndex;
  }

  goToNextMove = () => {
    if (!this.canGoToNextMove()) {
      return;
    }
    const selectedGameIndex = this.props.game.history.indexOf(this.props.selectedGame || this.props.game);
    this.props.selectGame(this.props.game.history[selectedGameIndex + 1]);
  };

  goToAncestor = () => {
    const {mostRecentAncestorGameIndex} = this.gameIndexes;
    this.props.selectGame(this.props.game.history[mostRecentAncestorGameIndex]);
  };

  canGoToPreviousMove() {
    const {selectedGameIndex} = this.gameIndexes;

    return selectedGameIndex >= 0 && selectedGameIndex !== 0;
  }

  goToPreviousMove = () => {
    if (!this.canGoToPreviousMove()) {
      return;
    }
    this.props.selectGame((this.props.selectedGame || this.props.game).previousInHistory);
  };

  goToPreviousVariationMove = () => {
    this.props.selectGame(this.props.selectedGame.previousInHistory);
  };

  canGoToFirstMove() {
    const {selectedGameIndex} = this.gameIndexes;

    return selectedGameIndex !== 0;
  }

  goToFirstMove = () => {
    if (!this.canGoToFirstMove()) {
      return;
    }
    this.props.selectGame(this.props.game.history[0]);
  };

  render() {
    const {game, selectedGame} = this.props;
    const {selectedGameIndex, mostRecentAncestorGameIndex} = this.gameIndexes;

    return (
      <Menu size={'massive'} items={[
        {key: 'current', icon: 'fast backward', onClick: this.goToCurrentMove, disabled: !this.canGoToCurrentMove()},
        ...(selectedGameIndex >= 0 ? [
          {key: 'previous', icon: 'backward', onClick: this.goToNextMove, disabled: !this.canGoToNextMove()},
          {key: 'moveCount', content: selectedGameIndex >= 0 ? `${(selectedGame || game).moveCount}/${game.moveCount}` : selectedGame.moveCount, disabled: game.finished},
          {key: 'next', icon: 'forward', onClick: this.goToPreviousMove, disabled: !this.canGoToPreviousMove()},
        ] : [
          {key: 'goToAncestor', content: `Return to ${mostRecentAncestorGameIndex}/${game.moveCount}`, onClick: this.goToAncestor},
        ]),
        {key: 'first', icon: 'fast forward', onClick: this.goToFirstMove, disabled: !this.canGoToFirstMove()},
        ...(selectedGameIndex >= 0 ? [] : [
          {key: 'ancestor', content: `Variation ${selectedGame.moveCount}/${mostRecentAncestorGameIndex}`, disabled: true},
          {key: 'next', icon: 'forward', onClick: this.goToPreviousVariationMove, disabled: selectedGame.moveCount <= 1},
        ]),
      ]} />
    );
  }
}

PlayNavigation.propTypes = {
  game: PropTypes.instanceOf(Game).isRequired,
  selectedGame: PropTypes.instanceOf(Game),
  selectGame: PropTypes.func.isRequired,
};

PlayNavigation = keydown(PlayNavigation.keys)(PlayNavigation);

export default Play;
