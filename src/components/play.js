import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import '../styles/play.css';
import Game from "../game/game";
import Board from "./board";
import {Button, Divider, Message, Segment, Statistic} from "semantic-ui-react";

class Play extends Component {
  static PLAYER_NAMES = {
    [Game.PLAYER_A]: "Player A",
    [Game.PLAYER_B]: "Player B",
  };
  static MOVE_TYPE_NAMES = {
    [Game.MOVE_TYPE_PLACE_FIRST_WORKER]: "Place a worker",
    [Game.MOVE_TYPE_PLACE_SECOND_WORKER]: "Place a worker",
    [Game.MOVE_TYPE_SELECT_WORKER_TO_MOVE]: "Select a worker",
    [Game.MOVE_TYPE_MOVE_FIRST_WORKER]: "Move worker",
    [Game.MOVE_TYPE_MOVE_SECOND_WORKER]: "Move worker",
    [Game.MOVE_TYPE_BUILD_AROUND_WORKER]: "Build",
  };

  takeMoveBack = () => {
    this.props.makeMove(this.props.game.previous);
  };

  undo = () => {
    this.props.makeMove(this.props.game.undo());
  };

  newGame = () => {
    this.props.makeMove(Game.create());
  };

  render() {
    const {game, makeMove} = this.props;
    return (
      <Fragment>
        <Segment>
          <Statistic.Group widths={"three"} size={"small"}>
            {game.finished ? (
              <Statistic color={"green"} value={this.constructor.PLAYER_NAMES[game.winner]} label={"Won!"} />
            ) : (
              <Statistic value={this.constructor.PLAYER_NAMES[game.nextPlayer]} label={this.constructor.MOVE_TYPE_NAMES[game.moveType]} />
            )}
            <Statistic value={game.moveCount} label={"Move"} />
            {game.finished ? (
              <Statistic value={<Button negative onClick={this.newGame} disabled={!game.previous}>New Game</Button>} />
            ) : (
              <Statistic value={<Button negative onClick={this.undo} disabled={!game.canUndo}>Undo</Button>} />
            )}
          </Statistic.Group>
        </Segment>
        <Divider />
        <Segment style={{textAlign: "center"}}>
          <Board game={game} makeMove={makeMove} />
        </Segment>
        <Segment>
          <Statistic.Group widths={"two"} size={"small"}>
            <Statistic value={<Button negative onClick={this.takeMoveBack} disabled={!game.previous}>Take Back a Move</Button>}/>
            <Statistic value={<Button negative onClick={this.newGame} disabled={!game.previous}>New Game</Button>} />
          </Statistic.Group>
        </Segment>
      </Fragment>
    );
  }
}

Play.propTypes = {
  game: PropTypes.instanceOf(Game).isRequired,
  makeMove: PropTypes.func.isRequired,
};

export default Play;
