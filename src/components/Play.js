import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import '../styles/play.css';
import Game from "../game/game";
import Board from "./Board";
import {Button, Header, Icon, Modal, Segment, Statistic} from "semantic-ui-react";
import classNames from 'classnames';

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
  };

  makeMove = game => {
    if (this.props.submit) {
      this.setState({game})
    } else {
      this.props.makeMove(game);
    }
  };

  takeMoveBack = () => {
    this.makeMove(this.state.game.previous);
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
    this.selectGame(this.state.selectedGame.previous);
  };

  undoToSelected = () => {
    this.selectGame(this.state.selectedGame.undo());
  };

  deselectGame = () => {
    this.selectGame(null);
  };

  submit = () => {
    const history = this.state.game.fullHistory;
    const propsGameIndex = history.findIndex(game => game === this.props.game);
    const newHistory = history.slice(propsGameIndex + 1);
    const moves = newHistory.map(game => game.lastMove);
    this.props.submit(moves);
  };

  resign = () => {
    this.props.submit("resign");
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.props.game !== prevProps.game) {
      this.setState({selectedGame: null, game: this.props.game, resigning: false});
    }
    if (this.props.user && this.props.user.settings.autoSubmitMoves) {
      if (!this.canSubmit(prevProps, prevState) && this.canSubmit()) {
        this.submit();
      }
    }
  }

  changeAutoSubmitMoves = () => {
    this.props.changeSettings({...this.props.user.settings, autoSubmitMoves: !this.props.user.settings.autoSubmitMoves});
  };

  canSubmit(props = this.props, state = this.state) {
    const {submit} = props;
    const {selectedGame, game} = state;
    return (
      !!submit
      && !selectedGame
      && game !== props.game
      && (
        game.finished
        || game.nextPlayer !== props.game.nextPlayer
      )
    );
  }

  render() {
    const {user, otherUser, changeSettings, challengeUser, stopChallengeUser, challengedUser, names, allowControl} = this.props;
    const {selectedGame, game} = this.state;
    const displayGame = selectedGame || game;
    const isMyGame = allowControl.length > 0;
    const canSubmit = this.canSubmit();
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
                    {user && changeSettings ? <Button content={'Auto submit move'} color={user.settings.autoSubmitMoves ? 'green' : 'yellow'} onClick={this.changeAutoSubmitMoves} /> : null}
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
                  trigger={<Button negative disabled={!!selectedGame || this.props.game.finished}>Resign</Button>}
                  header='Resign?'
                  content='Are you sure you want to forfeit?'
                  actions={[{key: 'resign', content: 'Resign', negative: true, onClick: this.resign}, { key: 'continue', content: 'Continue', positive: true }]}
                />
              } />
              <Statistic value={<Button negative onClick={this.props.submit ? this.takeMoveBack : this.undo} disabled={!!selectedGame || (this.props.submit ? game.chainCount <= this.props.game.chainCount : !game.canUndo)}>Undo</Button>} />
            </Statistic.Group>
          </Segment>
        ) : null}
        <Segment style={{textAlign: "center"}}>
          <Board game={displayGame} makeMove={selectedGame ? this.makeMoveToSelected : this.makeMove} allowControl={allowControl} settings={user ? user.settings : undefined} />
        </Segment>
        <Segment>
          <div>
            {[...game.history].reverse().map(previousGame => (
              <Board key={previousGame.chainCount} game={previousGame} small onSelect={this.selectGame} selected={previousGame === selectedGame} settings={user ? user.settings : undefined} />
            ))}
          </div>
        </Segment>
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
  otherUser: PropTypes.object,
  settings: PropTypes.object,
  changeSettings: PropTypes.func,
  game: PropTypes.instanceOf(Game).isRequired,
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

export default Play;
