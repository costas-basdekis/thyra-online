import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import BoardBackground from "./Board/BoardBackground";
import Game from "../game/game";
import {withClient} from "../client/withClient";
import {Button, Grid, Menu, Message, Modal, Segment} from "semantic-ui-react";
import keydown from "react-keydown";
import Play from "./Play";
import * as utils from "../utils";

class EditPosition extends Component {
  static initialPositionNotation = Game.getPositionNotation(Game.getInitialRowsAndColumns());

  state = {
    paletteSelectedItem: {x: 0, y: 1},
    paletteUpdate: {player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
    position: Game.getInitialRowsAndColumns(),
    positionError: null,
    urlError: false,
    ...this.getGameAndErrorFromUrlPosition(),
    selectedGame: null,
    previousPosition: null,
  };

  getGameAndErrorFromUrlPosition() {
    const params = new URLSearchParams(window.location.search);
    const position = params.get('position') || this.props.initialPositionNotation;
    if (position) {
      let game, urlError;
      try {
        game = Game.fromCompressedPositionNotation(position);
        if (!game) {
          urlError = 'The position was not valid';
        }
      } catch (e) {
        game = null;
        urlError = `The board position was not valid: ${e.message}`;
      }
      if (!game) {
        return {game: Game.create(), urlError, position: Game.getInitialRowsAndColumns()};
      }
      return {game, urlError: false, position: game.rowsAndColumns};
    } else {
      return {game: Game.create(), urlError: false, position: Game.getInitialRowsAndColumns()};
    }
  }

  dismissUrlPositionError = () =>{
    this.setState({error: null});
  };

  onPaletteSelectedItemChange = (paletteSelectedItem, paletteUpdate) => {
    this.setState({paletteSelectedItem, paletteUpdate});
  };

  onPositionChange = position => {
    let game, positionError;
    try {
      game = Game.fromPosition(position);
      positionError = null;
    } catch (e) {
      game = Game.create();
      positionError = e.message;
    }
    this.setState(state => ({
      position,
      game,
      positionError,
      previousPosition: state.position,
    }));
  };

  makeMove = newGame => {
    this.setState({game: newGame});
  };

  onSelectedGameChange = selectedGame => {
    this.setState({selectedGame});
  };

  copyGame = () => {
    const {game, selectedGame} = this.state;
    const visibleGame = selectedGame || game;
    this.onPositionChange(visibleGame.rowsAndColumns);
  };

  resetBoard = () => {
    this.onPositionChange(Game.getInitialRowsAndColumns());
  };

  undo = () => {
    this.onPositionChange(this.state.previousPosition);
  };

  resetGame = () => {
    this.onPositionChange(this.state.position);
  };

  copyPosition = () => {
    utils.copyToClipboard(Game.getPositionNotation(this.state.position));
    alert('Position copied to clipboard');
  };

  copyPlayPosition = () => {
    utils.copyToClipboard((this.state.selectedGame || this.state.game).positionNotation);
    alert('Play position copied to clipboard');
  };

  usePosition = () => {
    this.props.usePosition(Game.fromPosition(this.state.position).positionNotation);
  };

  render() {
    const {user, client, keydown, usePosition} = this.props;
    const {paletteSelectedItem, position, paletteUpdate, positionError, urlError, game, selectedGame, previousPosition} = this.state;
    const settings = client.applicableSettings;

    const positionNotation = Game.getPositionNotation(position);
    return (
      <Fragment>
        <Modal
          open={!!urlError}
          size={'mini'}
          onClose={this.dismissUrlPositionError}
          header={'Could not load shared position'}
          content={`${urlError}. Please check that you copied the full URL`}
          actions={[{key: 'ok', content: 'OK', positive: true}]}
        />
        <Grid centered>
          <Grid.Row>
            <Menu inverted size={'massive'} items={[
              {key: 'share', icon: 'share', content: 'Share position', color: 'green', active: true, as: 'a',
                href: `?position=${positionNotation}`,
                title: navigator.share ? 'Click to open the sharing menu' : 'Click to copy URL to position'},
              {key: 'copy', icon: 'clipboard', content: 'Copy position', color: 'green', active: true,
                title: 'Click to copy position to position', onClick: this.copyPosition},
              {key: 'copy-play', icon: 'clipboard', content: 'Copy play position', color: 'green', active: true,
                title: 'Click to copy play position to position', onClick: this.copyPlayPosition},
            ]} />
          </Grid.Row>
        </Grid>
        <Segment>
          {positionError ? <Message error content={positionError} /> : null}
          <Play
            user={user}
            settings={settings}
            game={game}
            makeMove={this.makeMove}
            onSelectedGameChange={this.onSelectedGameChange}
          >
            <div>
              <Button
                content={'Reset game'}
                primary
                onClick={this.resetGame}
              />
            </div>
            <EditPositionPalette
              selectedItem={paletteSelectedItem}
              onSelectedItemChange={this.onPaletteSelectedItemChange}
              keydown={keydown}
            />
            <div>
              <Button
                content={'Copy from game'}
                primary
                disabled={(selectedGame || game).positionNotation === positionNotation}
                onClick={this.copyGame}
              />
              <Button
                content={'Reset'}
                negative
                disabled={positionNotation === this.constructor.initialPositionNotation}
                onClick={this.resetBoard}
              />
              <Button
                content={'Undo'}
                secondary
                disabled={!previousPosition}
                onClick={this.undo}
              />
            </div>
            <EditPositionBoard
              position={position}
              update={paletteUpdate}
              onPositionChange={this.onPositionChange}
            />
            {usePosition ? (
              <div>
                <Button
                  content={'Use position'}
                  primary
                  onClick={this.usePosition}
                  disabled={!!positionError}
                />
              </div>
            ) : null}
          </Play>
        </Segment>
      </Fragment>
    );
  }
}

EditPosition.propTypes = {
  keydown: PropTypes.object.isRequired,
  user: PropTypes.object,
  client: PropTypes.object.isRequired,
  usePosition: PropTypes.func,
  initialPositionNotation: PropTypes.string,
};

class EditPositionPalette extends Component {
  static rowsAndColumns = [
    {y: 0, cells: [
      {x: 0, y: 0, level: 0, player: null, worker: null},
      {x: 1, y: 0, level: 1, player: null, worker: null},
      {x: 2, y: 0, level: 2, player: null, worker: null},
      {x: 3, y: 0, level: 3, player: null, worker: null},
      {x: 4, y: 0, level: 4, player: null, worker: null},
    ]},
    {y: 1, cells: [
      {x: 0, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
      {x: 1, y: 1, level: 0, player: Game.PLAYER_B, worker: Game.WORKER_FIRST},
      {x: 2, y: 1, level: 0, player: null, worker: null},
      {x: 3, y: 1, level: 0, player: null, worker: null},
      {x: 4, y: 1, level: 0, player: null, worker: null},
    ]},
  ];
  static keys = [
    'q', '0', '1', '2', '3', '4', 'a', 'b',
  ];
  static moveFromKey = {
    'q': {x: 0, y: 0},
    0: {x: 0, y: 0},
    1: {x: 1, y: 0},
    2: {x: 2, y: 0},
    3: {x: 3, y: 0},
    4: {x: 4, y: 0},
    a: {x: 0, y: 1},
    b: {x: 1, y: 1},
  };

  state = {
    selectedItem: {x: 0, y: 1},
  };

  componentWillReceiveProps({keydown}) {
    if (keydown.event) {
      const {key} = keydown.event;
      const coordinates = this.constructor.moveFromKey[key];
      if (coordinates) {
        const {x, y} = coordinates;
        const move = this.constructor.rowsAndColumns[y].cells[x];
        this.makeMove(move);
      }
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.selectedItem !== undefined && this.props.selectedItem === undefined) {
      this.setState({selectedItem: prevProps.selectedItem});
    }
  }

  get selectedItem() {
    if (this.props.selectedItem === undefined) {
      return this.state.selectedItem;
    } else {
      return this.props.selectedItem;
    }
  }

  isCellAvailable = cell => {
    return !this.isCellUndoable(cell) && (cell.y === 0 || cell.x <= 1);
  };

  isCellUndoable = cell => {
    const {selectedItem} = this;
    return cell.x === selectedItem.x && cell.y === selectedItem.y;
  };

  makeMove = cell => {
    const selectedItem = {x: cell.x, y: cell.y};
    if (this.props.selectedItem === undefined) {
      this.setState({selectedItem: selectedItem});
    }
    if (this.props.onSelectedItemChange) {
      const update = cell.player ? {player: cell.player} : {level: cell.level};
      this.props.onSelectedItemChange(selectedItem, update);
    }
  };

  render() {
    const {client} = this.props;
    const settings = client.applicableSettings;

    return (
      <BoardBackground
        medium
        allowControl={[Game.PLAYER_A, Game.PLAYER_B]}
        rowsAndColumns={this.constructor.rowsAndColumns}
        clickable undoable={false}
        isCellAvailable={this.isCellAvailable}
        isCellUndoable={this.isCellUndoable}
        makeMove={this.makeMove}
        settings={settings}
        animated={false}
        showArrows={false}
      />
    );
  }
}

EditPositionPalette.propTypes = {
  user: PropTypes.object,
  client: PropTypes.object.isRequired,
  selectedItem: PropTypes.object,
  onSelectedItemChange: PropTypes.func,
  keydown: PropTypes.object.isRequired,
};

EditPositionPalette = withClient(EditPositionPalette);

class EditPositionBoard extends Component {
  state = {
    position: Game.getInitialRowsAndColumns(),
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.position !== undefined && this.props.position === undefined) {
      this.setState({position: prevProps.position});
    }
  }

  get position() {
    if (this.props.position === undefined) {
      return this.state.position;
    } else {
      return this.props.position;
    }
  }

  isCellAvailable = () => {
    return true;
  };

  isCellUndoable = () => {
    return false;
  };

  makeMove = cell => {
    const {update} = this.props;
    if ('level' in update) {
      if (cell.level !== update.level) {
        this.updatePosition({x: cell.x, y: cell.y, level: update.level});
      }
    } else if ('player' in update) {
      if (cell.player !== update.player) {
        this.updatePosition({x: cell.x, y: cell.y, player: update.player, worker: Game.WORKER_FIRST});
      } else {
        this.updatePosition({x: cell.x, y: cell.y, player: null, worker: null});
      }
    }
  };

  updatePosition = newCell => {
    const newPosition = Game.updateCells(this.position, newCell);

    if (this.props.position === undefined) {
      this.setState({position: newPosition});
    }
    if (this.props.onPositionChange) {
      this.props.onPositionChange(newPosition);
    }
  };

  render() {
    const {position} = this;
    const {client} = this.props;
    const settings = client.applicableSettings;

    return (
      <BoardBackground
        medium
        allowControl={[Game.PLAYER_A, Game.PLAYER_B]}
        rowsAndColumns={position}
        clickable undoable={false}
        isCellAvailable={this.isCellAvailable}
        isCellUndoable={this.isCellUndoable}
        makeMove={this.makeMove}
        settings={settings}
        animated={false}
        showArrows={false}
      />
    );
  }
}

EditPositionBoard.propTypes = {
  user: PropTypes.object,
  client: PropTypes.object.isRequired,
  position: PropTypes.array,
  update: PropTypes.object.isRequired,
  onPositionChange: PropTypes.func,
};

EditPositionBoard = withClient(EditPositionBoard);

export default keydown(EditPositionPalette.SubComponent.keys)(withClient(EditPosition));
