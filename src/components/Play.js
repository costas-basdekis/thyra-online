import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import '../styles/play.css';
import Game from "../game/game";
import Board from "./Board";
import {Button, Checkbox, Grid, Header, Icon, Label, Modal, Pagination, Segment, Statistic} from "semantic-ui-react";
import classNames from 'classnames';
import {BoardTransformation} from "./Board/Board";

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
    this.setState({selectedGame: game === this.state.game ? null : game});
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
      this.props.submit(moves);
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
      );
      if (gameChanged) {
        this.setState({selectedGame: null, game: this.props.game, resigning: false});
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
      && this.getMovesToSubmit().length
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
      user, defaultSettings, otherUser, changeSettings, challengeUser, stopChallengeUser, challengedUser, names,
      allowControl, matchGame,
    } = this.props;
    const {selectedGame, game, transformation} = this.state;
    const displayGame = selectedGame || game;
    const isMyGame = allowControl.length > 0;
    const canSubmit = this.canSubmit();
    const tooShortToResign = matchGame ? matchGame.tooShortToResign : false;
    return (
      <Fragment>
        <Segment>
          <Statistic.Group widths={"three"} size={"tiny"}>
            {game.finished ? (
              <Statistic color={"green"} value={names[game.winner]} label={"Won!"} />
            ) : (
              <Statistic value={names[game.nextPlayer]} label={this.constructor.MOVE_TYPE_NAMES[game.moveType]} />
            )}
            <Statistic value={game.moveCount} label={"Move"} />
            {this.props.game.finished ? (
              this.props.submit ? (
                (isMyGame && challengeUser) ? (
                  challengedUser ? (
                    <Statistic value={<Button color={'green'} onClick={stopChallengeUser}><Icon loading name={'circle notch'} />Waiting for {challengedUser.name}...</Button>} />
                  ) : (
                    otherUser && otherUser.readyToPlay === user.id ? (
                      <Statistic value={<Button className={'attention'} color={'yellow'} icon={'play'} onClick={challengeUser} content={'Accept challenge'} />} />
                    ) : (
                      <Statistic value={<Button color={'yellow'} icon={'play'} onClick={challengeUser} content={'Challenge user'} />} />
                    )
                  )
                ) : null
              ) : (
                <Statistic value={<Button negative onClick={this.newGame} disabled={!game.previous}>New Game</Button>} />
              )
            ) : (
              this.props.submit
                ? <Statistic value={(
                  <Fragment>
                    {!user || !user.settings.autoSubmitMoves ? <Button positive onClick={this.submit} className={classNames({attention: canSubmit})} disabled={!canSubmit}>Submit</Button> : null}
                    {user && changeSettings ? (
                      <Segment>
                        <Checkbox
                          label={'Auto submit moves'}
                          toggle
                          checked={user.settings.autoSubmitMoves}
                          onChange={this.changeAutoSubmitMoves}
                        />
                        <Modal
                          ref={this.autoSubmitModal}
                          header={'Auto submit moves'}
                          content={'Are you sure you want to be auto submitting your moves?'}
                          actions={[
                            {key: 'yes', content: 'Auto submit', onClick: this.doAutoSubmitMoves, primary: true},
                            {key: 'no', content: 'No, manually submit moves', secondary: true},
                          ]}
                        />
                      </Segment>
                    ) : null}
                  </Fragment>
                )}/>
                : <Statistic value={<Button negative onClick={this.props.submit ? this.takeMoveBack : this.undo} disabled={!!selectedGame || (this.props.submit ? game.chainCount <= this.props.game.chainCount : !game.canUndo)}>Undo</Button>} />
            )}
          </Statistic.Group>
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
              <Statistic value={<Button negative onClick={this.props.submit ? this.takeMoveBack : this.undo} disabled={!!selectedGame || (this.props.submit ? game.chainCount <= this.props.game.chainCount : !game.canUndo)}>Undo</Button>} />
            </Statistic.Group>
          </Segment>
        ) : null}
        <Segment style={{textAlign: "center"}}>
          <Board
            game={displayGame}
            transformation={transformation}
            makeMove={selectedGame ? this.makeMoveToSelected : this.makeMove}
            minChainCount={this.props.submit ? this.props.game.chainCount : (
              this.props.game.canUndo ? this.props.game.previous.chainCount : this.props.game.chainCount
            )}
            allowControl={displayGame === game ? allowControl : undefined}
            settings={user ? user.settings : defaultSettings}
            animated
          />
          <Grid centered>
            <Grid.Row>
              <BoardTransformation onChange={this.onTransformationChange} />
            </Grid.Row>
          </Grid>
        </Segment>
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
        {!this.props.submit ? (
          <Segment>
            <Statistic.Group widths={"two"} size={"small"}>
              <Statistic value={<Button negative onClick={this.takeMoveBack} disabled={!!selectedGame || !game.previous}>Take Back a Move</Button>}/>
              <Statistic value={<Button negative onClick={this.newGame} disabled={!!selectedGame || !game.previous}>New Game</Button>} />
            </Statistic.Group>
          </Segment>
        ) : null}
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
};

Play.defaultProps = {
  names: {
    [Game.PLAYER_A]: "Player A",
    [Game.PLAYER_B]: "Player B",
  },
  allowControl: [Game.PLAYER_A, Game.PLAYER_B],
};

class PlayHistory extends Component {
  state = {
    activePage: 1,
  };

  onPageChange = (e, {activePage}) => {
    this.setState({activePage});
  };

  render() {
    const {game, selectedGame, user, defaultSettings, selectGame, pageSize} = this.props;
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
};

PlayHistory.defaultProps = {
  pageSize: 10,
};

export default Play;
