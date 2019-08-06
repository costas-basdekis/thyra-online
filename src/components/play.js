import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import '../styles/play.css';
import Game from "../game/game";
import Board from "./board";
import {Button, Header, Segment, Statistic} from "semantic-ui-react";

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
    selectedGame: null
  };

  makeMove = game => {
    this.props.makeMove(game);
  };

  takeMoveBack = () => {
    this.makeMove(this.props.game.previous);
  };

  undo = () => {
    this.makeMove(this.props.game.undo());
  };

  newGame = () => {
    this.makeMove(Game.create());
  };

  selectGame = game => {
    this.setState({selectedGame: game === this.props.game ? null : game});
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

  componentDidUpdate(prevProps) {
    if (this.props.game !== prevProps.game) {
      this.setState({selectedGame: null});
    }
  }

  render() {
    const {game, names, allowTotalControl} = this.props;
    const {selectedGame} = this.state;
    const displayGame = selectedGame || game;
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
            {game.finished ? (
              <Statistic value={<Button negative onClick={this.newGame} disabled={!game.previous}>New Game</Button>} />
            ) : (
              <Statistic value={<Button negative onClick={this.undo} disabled={!!selectedGame || !game.canUndo}>Undo</Button>} />
            )}
          </Statistic.Group>
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
        <Segment style={{textAlign: "center"}}>
          <Board game={displayGame} makeMove={selectedGame ? this.makeMoveToSelected : this.makeMove} />
        </Segment>
        <Segment>
          <div>
            {[...game.history].reverse().map(previousGame => (
              <Board key={previousGame.chainCount} game={previousGame} small onSelect={this.selectGame} selected={previousGame === selectedGame} />
            ))}
          </div>
        </Segment>
        {allowTotalControl ? (
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
  game: PropTypes.instanceOf(Game).isRequired,
  makeMove: PropTypes.func.isRequired,
  names: PropTypes.object.isRequired,
  allowTotalControl: PropTypes.bool.isRequired,
};

Play.defaultProps = {
  names: {
    [Game.PLAYER_A]: "Player A",
    [Game.PLAYER_B]: "Player B",
  },
  allowTotalControl: true,
};

export default Play;
