import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Button, Grid, Label, Menu, Message} from "semantic-ui-react";
import BoardBackground from "./Board/BoardBackground";
import Game from "../game/game";
import {withClient} from "../client/withClient";
import Client from "../client/client";
import {NavLink} from "react-router-dom";

class LearnBoard extends Component {
  state = {
    rowsAndColumns: this.props.rowsAndColumns,
    arrows: null,
    selectedMoveCell: null,
    movedFromCell: null,
    selectedBuildCell: null,
    won: false,
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.rowsAndColumns !== this.props.rowsAndColumns) {
      this.reset();
    }
  }

  isCellAvailable = cell => {
    const {canMove, canBuild} = this.props;
    if (!canMove && !canBuild) {
      return false;
    }
    const {selectedMoveCell, selectedBuildCell, won} = this.state;
    if (won) {
      return false;
    }
    if (canMove && !canBuild) {
      return this.isCellAvailableForMoving(cell, selectedMoveCell);
    } else if (canBuild && !canMove) {
      return this.isCellAvailableForBuilding(cell, selectedBuildCell);
    } else if (canMove && canBuild) {
      if (!selectedMoveCell && !selectedBuildCell) {
        return this.isCellAvailableForMoving(cell, selectedMoveCell);
      } else if (selectedMoveCell) {
        return this.isCellAvailableForMoving(cell, selectedMoveCell);
      } else if (selectedBuildCell) {
        return this.isCellAvailableForBuilding(cell, selectedBuildCell);
      } else {
        return false;
      }
    }
  };

  isCellAvailableForMoving(cell, selectedMoveCell) {
    if (!selectedMoveCell) {
      return cell.player === Game.PLAYER_A;
    }
    if (selectedMoveCell.level === 3) {
      return false;
    }
    if (Math.max(Math.abs(cell.x - selectedMoveCell.x), Math.abs(cell.y - selectedMoveCell.y)) !== 1) {
      return false;
    }
    if ((cell.level - selectedMoveCell.level) > 1) {
      return false;
    }
    if (cell.player) {
      return false;
    }
    return true;
  }

  isCellAvailableForBuilding(cell, selectedBuildCell) {
    if (!selectedBuildCell) {
      return cell.player === Game.PLAYER_A;
    }
    if (Math.max(Math.abs(cell.x - selectedBuildCell.x), Math.abs(cell.y - selectedBuildCell.y)) !== 1) {
      return false;
    }
    if (cell.level > 3) {
      return false;
    }
    if (cell.player) {
      return false;
    }
    return true;
  }

  makeMove = cell => {
    const {selectedMoveCell, selectedBuildCell, won} = this.state;
    if (won) {
      return;
    }
    const {canMove, canBuild} = this.props;
    if (canMove && !canBuild) {
      this.makeMoveMoving(cell, selectedMoveCell);
    } else if (canBuild && !canMove) {
      this.makeMoveBuilding(cell, selectedBuildCell);
    } else if (canMove && canBuild) {
      if (!selectedMoveCell && !selectedBuildCell) {
        this.makeMoveMoving(cell, selectedMoveCell);
      } else if (selectedMoveCell) {
        this.makeMoveMoving(cell, selectedMoveCell);
        if (cell.level !== 3) {
          this.setState({movedFromCell: selectedMoveCell});
          this.makeMoveBuilding(cell, selectedBuildCell);
        }
      } else if (selectedBuildCell) {
        this.makeMoveBuilding(cell, selectedBuildCell);
        this.setState({movedFromCell: null});
      }
    }
  };

  makeMoveMoving(cell, selectedMoveCell) {
    if (selectedMoveCell) {
      this.setState(({rowsAndColumns}) => ({
        selectedMoveCell: null,
        rowsAndColumns: rowsAndColumns.map(row => ({
          ...row,
          cells: row.cells.map(originalCell => ({
            ...originalCell,
            ...(originalCell === selectedMoveCell ? {player: null, worker: null} : null),
            ...(originalCell === cell ? {player: selectedMoveCell.player, worker: selectedMoveCell.worker} : null),
          })),
        })),
        arrows: [
          {from: selectedMoveCell, to: cell, type: 'move', colour: 'white'},
        ],
        won: cell.level === 3,
      }));
    } else {
      this.setState({selectedMoveCell: cell});
    }
  }

  makeMoveUndoMoving(movedFromCell, selectedBuildCell) {
    this.setState(({rowsAndColumns}) => ({
      selectedMoveCell: movedFromCell,
      selectedBuildCell: null,
      rowsAndColumns: rowsAndColumns.map(row => ({
        ...row,
        cells: row.cells.map(originalCell => ({
          ...originalCell,
          ...(originalCell.x === selectedBuildCell.x && originalCell.y === selectedBuildCell.y ? {player: null, worker: null} : null),
          ...(originalCell.x === movedFromCell.x && originalCell.y === movedFromCell.y ? {player: movedFromCell.player, worker: movedFromCell.worker} : null),
        })),
      })),
      arrows: null,
      won: false,
    }));
  }

  makeMoveBuilding(cell, selectedBuildCell) {
    if (selectedBuildCell) {
      this.setState(({rowsAndColumns}) => ({
        selectedBuildCell: null,
        rowsAndColumns: rowsAndColumns.map(row => ({
          ...row,
          cells: row.cells.map(originalCell => ({
            ...originalCell,
            ...(originalCell === cell ? {level: originalCell.level + 1} : null),
          })),
        })),
        arrows: [
          {from: selectedBuildCell, to: cell, type: 'build', colour: 'white'},
        ],
      }));
    } else {
      this.setState({selectedBuildCell: cell});
    }
  }

  isCellUndoable = cell => {
    if (!this.props.canMove && !this.props.canBuild) {
      return false;
    }
    const {selectedMoveCell, selectedBuildCell, won} = this.state;
    if (won) {
      return false;
    }
    const {canMove, canBuild} = this.props;
    if (canMove && !canBuild) {
      return selectedMoveCell !== null && selectedMoveCell.x === cell.x && selectedMoveCell.y === cell.y;
    } else if (canBuild && !canMove) {
      return selectedBuildCell !== null && selectedBuildCell.x === cell.x && selectedBuildCell.y === cell.y;
    } else if (canMove && canBuild) {
      if (selectedMoveCell) {
        return selectedMoveCell.x === cell.x && selectedMoveCell.y === cell.y;
      } else if (selectedBuildCell) {
        return selectedBuildCell.x === cell.x && selectedBuildCell.y === cell.y;
      } else {
        return false;
      }
    }
  };

  undo = () => {
    const {canMove, canBuild} = this.props;
    const {selectedMoveCell, movedFromCell, selectedBuildCell, won} = this.state;
    if (won) {
      return;
    }
    if (canMove && !canBuild) {
      this.setState({selectedMoveCell: null});
    } else if (canBuild && !canMove) {
      this.setState({selectedBuildCell: null});
    } else if (canMove && canBuild) {
      if (selectedMoveCell) {
        this.setState({selectedMoveCell: null});
      } else if (selectedBuildCell) {
        this.makeMoveUndoMoving(movedFromCell, selectedBuildCell);
      }
    }
  };

  reset = () => {
    const {rowsAndColumns} = this.props;
    this.setState({
      rowsAndColumns, arrows: null, won: false, selectedMoveCell: null, movedFromCell: null, selectedBuildCell: null,
    });
  };

  render() {
    const {user, board, canMove, canBuild, rowsAndColumns: originalRowsAndColumns} = this.props;
    const {rowsAndColumns, arrows, won, selectedMoveCell, selectedBuildCell} = this.state;
    const rawSettings = user ? user.settings : Client.getDefaultSettings();
    const settings = {...rawSettings, theme: {...rawSettings.theme, numbers: 'obvious'}};

    return (
      <Fragment>
        {canMove || canBuild ? (
          <Fragment>
            <br />
            <Label color={won ? 'green' : 'blue'} icon={won ? 'trophy' : undefined} content={(
              won ? "You won! Press reset to start again" : (
                !selectedMoveCell && !selectedBuildCell ? "Select one of your pieces" : (
                  selectedMoveCell ? "Select a square to move to, or click on your piece to do something else" : (
                    "Select a square to build on, or click on your piece to do something else"
                  )
                )
              )
            )} />
            <br />
          </Fragment>
        ) : null}
        <BoardBackground
          medium
          allowControl={[]}
          clickable={canMove || canBuild}
          undoable={canMove || canBuild}
          isCellAvailable={this.isCellAvailable}
          isCellUndoable={this.isCellUndoable}
          makeMove={this.makeMove}
          undo={this.undo}
          settings={settings}
          animated showArrows
          rowsAndColumns={rowsAndColumns}
          {...(arrows ? {...board, arrows} : board)}
        />
        {canMove || canBuild ? (
          <div>
            <Button onClick={this.reset} disabled={rowsAndColumns === originalRowsAndColumns} primary>Reset</Button>
          </div>
        ) : null}
      </Fragment>
    )
  }
}

LearnBoard.propTypes = {
  user: PropTypes.object,
  board: PropTypes.object,
  rowsAndColumns: PropTypes.array.isRequired,
  canMove: PropTypes.bool.isRequired,
  canBuild: PropTypes.bool.isRequired,
};

LearnBoard.defaultProps = {
  canMove: false,
  canBuild: false,
};

LearnBoard = withClient(LearnBoard);

class LearnToPlay extends Component {
  static steps = [
    {title: 'Introduction', body: <Fragment>
      <div>
        In this website, you can play <strong>Santorini©</strong> games with people around the world.
      </div>
      <div>
        The board consists of a <strong>5x5 square grid</strong>, and each player, <strong>black</strong> and
        <strong>white</strong>, has two <strong>pieces</strong> each:
      </div>
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: null, worker: null},
            {x: 3, y: 0, level: 0, player: null, worker: null},
            {x: 4, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 0, player: null, worker: null},
            {x: 1, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_SECOND},
            {x: 2, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 3, y: 1, level: 0, player: null, worker: null},
            {x: 4, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: Game.PLAYER_B, worker: Game.WORKER_FIRST},
            {x: 2, y: 2, level: 0, player: Game.PLAYER_B, worker: Game.WORKER_SECOND},
            {x: 3, y: 2, level: 0, player: null, worker: null},
            {x: 4, y: 2, level: 0, player: null, worker: null},
          ]},
          {y: 3, cells: [
            {x: 0, y: 3, level: 0, player: null, worker: null},
            {x: 1, y: 3, level: 0, player: null, worker: null},
            {x: 2, y: 3, level: 0, player: null, worker: null},
            {x: 3, y: 3, level: 0, player: null, worker: null},
            {x: 4, y: 3, level: 0, player: null, worker: null},
          ]},
          {y: 4, cells: [
            {x: 0, y: 4, level: 0, player: null, worker: null},
            {x: 1, y: 4, level: 0, player: null, worker: null},
            {x: 2, y: 4, level: 0, player: null, worker: null},
            {x: 3, y: 4, level: 0, player: null, worker: null},
            {x: 4, y: 4, level: 0, player: null, worker: null},
          ]},
        ]}
      />
      <div>
        The <strong>objective</strong> of the game is to move one of your pieces to the <strong>3rd level</strong>,
        and of course, to <strong>prevent your opponent</strong> from doing so before you:
      </div>
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 1, y: 0, level: 1, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 3, player: null, worker: null},
            {x: 1, y: 1, level: 2, player: null, worker: null},
          ]},
        ]}
        board={{
          arrows: [
            {from: {x: 0, y: 0}, to: {x: 1, y: 0}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 0}, to: {x: 1, y: 1}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 0, y: 1}, type: 'move', colour: 'white'},
          ],
        }}
      />
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 1, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 3, player: null, worker: null},
            {x: 1, y: 1, level: 2, player: null, worker: null},
          ]},
        ]}
        board={{
          arrows: [
            {from: {x: 0, y: 0}, to: {x: 1, y: 0}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 0}, to: {x: 1, y: 1}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 0, y: 1}, type: 'move', colour: 'white'},
          ],
        }}
      />
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 1, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 3, player: null, worker: null},
            {x: 1, y: 1, level: 2, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
          ]},
        ]}
        board={{
          arrows: [
            {from: {x: 0, y: 0}, to: {x: 1, y: 0}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 0}, to: {x: 1, y: 1}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 0, y: 1}, type: 'move', colour: 'white'},
          ],
        }}
      />
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 1, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 3, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 1, y: 1, level: 2, player: null, worker: null},
          ]},
        ]}
        board={{
          arrows: [
            {from: {x: 0, y: 0}, to: {x: 1, y: 0}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 0}, to: {x: 1, y: 1}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 0, y: 1}, type: 'move', colour: 'white'},
          ],
        }}
      />
    </Fragment>},
    {title: 'Moving', body: <Fragment>
      <div>
        You can <strong>move 1 square</strong> in any direction, <strong>horizontally</strong>,
        <strong>vertically</strong>, or <strong>diagonally</strong>.
      </div>
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 0, player: null, worker: null},
            {x: 1, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 2, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: null, worker: null},
            {x: 2, y: 2, level: 0, player: null, worker: null},
          ]},
        ]}
        board={{
          arrows: [
            {from: {x: 1, y: 1}, to: {x: 0, y: 0}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 1, y: 0}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 2, y: 0}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 0, y: 1}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 2, y: 1}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 0, y: 2}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 1, y: 2}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 2, y: 2}, type: 'move', colour: 'white'},
          ],
        }}
      />
      <div>
        But you <strong>can't move in a square that has another piece</strong>, your's or the opponent's:
      </div>
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: Game.PLAYER_B, worker: Game.WORKER_FIRST},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_SECOND},
            {x: 1, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 2, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: Game.PLAYER_B, worker: Game.WORKER_SECOND},
            {x: 2, y: 2, level: 0, player: null, worker: null},
          ]},
        ]}
        board={{
          arrows: [
            {from: {x: 1, y: 1}, to: {x: 0, y: 0}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 1, y: 0}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 2, y: 1}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 0, y: 2}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 2, y: 2}, type: 'move', colour: 'white'},
          ],
        }}
      />
      <div>
        Beneath, you can <strong>try moving your pieces</strong>. Notice that you need to <strong>click on a piece to
        select it</strong>, and then <strong>click on the target square</strong> to move it.
        To <strong>deselect</strong> a selected piece <strong>click on it again</strong>:
      </div>
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: Game.PLAYER_B, worker: Game.WORKER_FIRST},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_SECOND},
            {x: 1, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 2, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: Game.PLAYER_B, worker: Game.WORKER_SECOND},
            {x: 2, y: 2, level: 0, player: null, worker: null},
          ]},
        ]}
        canMove
      />
    </Fragment>},
    {title: 'Levels', body:<Fragment>
      <div>
        In the game there are <strong>five levels</strong>: <Label color={'green'}>ground</Label>,
        <Label color={'grey'}>level 1</Label>, <Label color={'yellow'}>level 2</Label>,
        <Label color={'red'}>level 3</Label>, and the <Label color={'blue'}>blocked level (level 4)</Label>:
      </div>
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 1, player: null, worker: null},
            {x: 2, y: 0, level: 2, player: null, worker: null},
            {x: 3, y: 0, level: 3, player: null, worker: null},
            {x: 4, y: 0, level: 4, player: null, worker: null},
          ]},
        ]}
      />
      <div>
        You can go <strong>up one level</strong>, go <strong>down any number of levels</strong>, and <strong>move to
        the same level</strong>. You can <strong>never move to a blocked level</strong>:
      </div>
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 2, player: null, worker: null},
            {x: 2, y: 0, level: 3, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 0, player: null, worker: null},
            {x: 1, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 2, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 1, player: null, worker: null},
            {x: 1, y: 2, level: 1, player: null, worker: null},
            {x: 2, y: 2, level: 4, player: null, worker: null},
          ]},
        ]}
        board={{
          arrows: [
            {from: {x: 1, y: 1}, to: {x: 0, y: 0}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 0, y: 1}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 2, y: 1}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 0, y: 2}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 1, y: 2}, type: 'move', colour: 'white'},
          ],
        }}
      />
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 2, player: null, worker: null},
            {x: 2, y: 0, level: 3, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 0, player: null, worker: null},
            {x: 1, y: 1, level: 1, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 2, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 1, player: null, worker: null},
            {x: 1, y: 2, level: 1, player: null, worker: null},
            {x: 2, y: 2, level: 4, player: null, worker: null},
          ]},
        ]}
        board={{
          arrows: [
            {from: {x: 1, y: 1}, to: {x: 0, y: 0}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 1, y: 0}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 0, y: 1}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 2, y: 1}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 0, y: 2}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 1, y: 2}, type: 'move', colour: 'white'},
          ],
        }}
      />
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 2, player: null, worker: null},
            {x: 2, y: 0, level: 3, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 0, player: null, worker: null},
            {x: 1, y: 1, level: 2, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 2, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 1, player: null, worker: null},
            {x: 1, y: 2, level: 1, player: null, worker: null},
            {x: 2, y: 2, level: 4, player: null, worker: null},
          ]},
        ]}
        board={{
          arrows: [
            {from: {x: 1, y: 1}, to: {x: 0, y: 0}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 1, y: 0}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 2, y: 0}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 0, y: 1}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 2, y: 1}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 0, y: 2}, type: 'move', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 1, y: 2}, type: 'move', colour: 'white'},
          ],
        }}
      />
      <div>
        Try it yourself below:
      </div>
      <LearnBoard
        canMove
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 2, player: null, worker: null},
            {x: 2, y: 0, level: 3, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 0, player: null, worker: null},
            {x: 1, y: 1, level: 1, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 2, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 1, player: null, worker: null},
            {x: 1, y: 2, level: 1, player: null, worker: null},
            {x: 2, y: 2, level: 4, player: null, worker: null},
          ]},
        ]}
      />
    </Fragment>},
    {title: 'Building', body:<Fragment>
      <div>
        After you've moved one of your pieces, you <strong>must build on 1 nearby square</strong>, horizontally,
        vertically, or diagonally:
      </div>
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 0, player: null, worker: null},
            {x: 1, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 2, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: null, worker: null},
            {x: 2, y: 2, level: 0, player: null, worker: null},
          ]},
        ]}
        board={{
          arrows: [
            {from: {x: 1, y: 1}, to: {x: 0, y: 0}, type: 'build', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 1, y: 0}, type: 'build', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 2, y: 0}, type: 'build', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 0, y: 1}, type: 'build', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 2, y: 1}, type: 'build', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 0, y: 2}, type: 'build', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 1, y: 2}, type: 'build', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 2, y: 2}, type: 'build', colour: 'white'},
          ],
        }}
      />
      <div>
        You can <strong>build at any square</strong> next to the piece you moved: it <strong>doesn't matter which
        level your are</strong>, and which level you want to build. But you can never build more than the blocked
        level:
      </div>
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 1, player: null, worker: null},
            {x: 2, y: 0, level: 2, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 1, player: null, worker: null},
            {x: 1, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 2, y: 1, level: 3, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 2, player: null, worker: null},
            {x: 1, y: 2, level: 3, player: null, worker: null},
            {x: 2, y: 2, level: 4, player: null, worker: null},
          ]},
        ]}
        board={{
          arrows: [
            {from: {x: 1, y: 1}, to: {x: 0, y: 0}, type: 'build', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 1, y: 0}, type: 'build', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 2, y: 0}, type: 'build', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 0, y: 1}, type: 'build', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 2, y: 1}, type: 'build', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 0, y: 2}, type: 'build', colour: 'white'},
            {from: {x: 1, y: 1}, to: {x: 1, y: 2}, type: 'build', colour: 'white'},
          ],
        }}
      />
      <div>
        Try it yourself below, by selecting your player and then building:
      </div>
      <LearnBoard
        canBuild
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 1, player: null, worker: null},
            {x: 2, y: 0, level: 2, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 1, player: null, worker: null},
            {x: 1, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 2, y: 1, level: 3, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 2, player: null, worker: null},
            {x: 1, y: 2, level: 3, player: null, worker: null},
            {x: 2, y: 2, level: 4, player: null, worker: null},
          ]},
        ]}
      />
    </Fragment>},
    {title: 'Winning', body:<Fragment>
      <div>
        If there was no opponent on the board (you wish!), you would do something like the following
        moves <strong>to win</strong>:
      </div>
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 0, player: null, worker: null},
            {x: 1, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 2, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: null, worker: null},
            {x: 2, y: 2, level: 0, player: null, worker: null},
          ]},
        ]}
      />
      {/*<br/>*/}
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 0, player: null, worker: null},
            {x: 1, y: 1, level: 0, player: null, worker: null},
            {x: 2, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: null, worker: null},
            {x: 2, y: 2, level: 0, player: null, worker: null},
          ]},
        ]}
        board={{
          arrows: [
            {from: {x: 1, y: 1}, to: {x: 2, y: 1}, type: 'move', colour: 'white'},
          ],
        }}
      />
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 0, player: null, worker: null},
            {x: 1, y: 1, level: 1, player: null, worker: null},
            {x: 2, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: null, worker: null},
            {x: 2, y: 2, level: 0, player: null, worker: null},
          ]},
        ]}
        board={{
          arrows: [
            {from: {x: 2, y: 1}, to: {x: 1, y: 1}, type: 'build', colour: 'white'},
          ],
        }}
      />
      {/*<br/>*/}
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 0, player: null, worker: null},
            {x: 1, y: 1, level: 1, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 2, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: null, worker: null},
            {x: 2, y: 2, level: 0, player: null, worker: null},
          ]},
        ]}
        board={{
          arrows: [
            {from: {x: 2, y: 1}, to: {x: 1, y: 1}, type: 'move', colour: 'white'},
          ],
        }}
      />
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 1, player: null, worker: null},
            {x: 1, y: 1, level: 1, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 2, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: null, worker: null},
            {x: 2, y: 2, level: 0, player: null, worker: null},
          ]},
        ]}
        board={{
          arrows: [
            {from: {x: 1, y: 1}, to: {x: 0, y: 1}, type: 'build', colour: 'white'},
          ],
        }}
      />
      {/*<br/>*/}
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 1, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 1, y: 1, level: 1, player: null, worker: null},
            {x: 2, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: null, worker: null},
            {x: 2, y: 2, level: 0, player: null, worker: null},
          ]},
        ]}
        board={{
          arrows: [
            {from: {x: 1, y: 1}, to: {x: 0, y: 1}, type: 'move', colour: 'white'},
          ],
        }}
      />
      <br/>
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 1, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 1, y: 1, level: 2, player: null, worker: null},
            {x: 2, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: null, worker: null},
            {x: 2, y: 2, level: 0, player: null, worker: null},
          ]},
        ]}
        board={{
          arrows: [
            {from: {x: 0, y: 1}, to: {x: 1, y: 1}, type: 'build', colour: 'white'},
          ],
        }}
      />
      {/*<br/>*/}
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 1, player: null, worker: null},
            {x: 1, y: 1, level: 2, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 2, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: null, worker: null},
            {x: 2, y: 2, level: 0, player: null, worker: null},
          ]},
        ]}
        board={{
          arrows: [
            {from: {x: 0, y: 1}, to: {x: 1, y: 1}, type: 'move', colour: 'white'},
          ],
        }}
      />
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 2, player: null, worker: null},
            {x: 1, y: 1, level: 2, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 2, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: null, worker: null},
            {x: 2, y: 2, level: 0, player: null, worker: null},
          ]},
        ]}
        board={{
          arrows: [
            {from: {x: 1, y: 1}, to: {x: 0, y: 1}, type: 'build', colour: 'white'},
          ],
        }}
      />
      {/*<br/>*/}
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 2, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 1, y: 1, level: 2, player: null, worker: null},
            {x: 2, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: null, worker: null},
            {x: 2, y: 2, level: 0, player: null, worker: null},
          ]},
        ]}
        board={{
          arrows: [
            {from: {x: 1, y: 1}, to: {x: 0, y: 1}, type: 'move', colour: 'white'},
          ],
        }}
      />
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 2, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 1, y: 1, level: 3, player: null, worker: null},
            {x: 2, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: null, worker: null},
            {x: 2, y: 2, level: 0, player: null, worker: null},
          ]},
        ]}
        board={{
          arrows: [
            {from: {x: 0, y: 1}, to: {x: 1, y: 1}, type: 'build', colour: 'white'},
          ],
        }}
      />
      {/*<br/>*/}
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 2, player: null, worker: null},
            {x: 1, y: 1, level: 3, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 2, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: null, worker: null},
            {x: 2, y: 2, level: 0, player: null, worker: null},
          ]},
        ]}
        board={{
          arrows: [
            {from: {x: 0, y: 1}, to: {x: 1, y: 1}, type: 'move', colour: 'white'},
          ],
        }}
      />
      <div>
        Why don't you try this below?
      </div>
      <LearnBoard
        canMove canBuild
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 0, player: null, worker: null},
            {x: 1, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 2, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: null, worker: null},
            {x: 2, y: 2, level: 0, player: null, worker: null},
          ]},
        ]}
      />
    </Fragment>},
    {title: 'Good starting positions', body:<Fragment>
      <div>
        To start the game, the first player puts their pieces anywhere on the board, and then second player does the
        same. Here are some good examples:
      </div>
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: null, worker: null},
            {x: 3, y: 0, level: 0, player: null, worker: null},
            {x: 4, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 0, player: null, worker: null},
            {x: 1, y: 1, level: 0, player: null, worker: null},
            {x: 2, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 3, y: 1, level: 0, player: null, worker: null},
            {x: 4, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: Game.PLAYER_B, worker: Game.WORKER_FIRST},
            {x: 2, y: 2, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_SECOND},
            {x: 3, y: 2, level: 0, player: Game.PLAYER_B, worker: Game.WORKER_SECOND},
            {x: 4, y: 2, level: 0, player: null, worker: null},
          ]},
          {y: 3, cells: [
            {x: 0, y: 3, level: 0, player: null, worker: null},
            {x: 1, y: 3, level: 0, player: null, worker: null},
            {x: 2, y: 3, level: 0, player: null, worker: null},
            {x: 3, y: 3, level: 0, player: null, worker: null},
            {x: 4, y: 3, level: 0, player: null, worker: null},
          ]},
          {y: 4, cells: [
            {x: 0, y: 4, level: 0, player: null, worker: null},
            {x: 1, y: 4, level: 0, player: null, worker: null},
            {x: 2, y: 4, level: 0, player: null, worker: null},
            {x: 3, y: 4, level: 0, player: null, worker: null},
            {x: 4, y: 4, level: 0, player: null, worker: null},
          ]},
        ]}
      />
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: null, worker: null},
            {x: 3, y: 0, level: 0, player: null, worker: null},
            {x: 4, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 0, player: null, worker: null},
            {x: 1, y: 1, level: 0, player: null, worker: null},
            {x: 2, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 3, y: 1, level: 0, player: Game.PLAYER_B, worker: Game.WORKER_SECOND},
            {x: 4, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: Game.PLAYER_B, worker: Game.WORKER_FIRST},
            {x: 2, y: 2, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_SECOND},
            {x: 3, y: 2, level: 0, player: null, worker: null},
            {x: 4, y: 2, level: 0, player: null, worker: null},
          ]},
          {y: 3, cells: [
            {x: 0, y: 3, level: 0, player: null, worker: null},
            {x: 1, y: 3, level: 0, player: null, worker: null},
            {x: 2, y: 3, level: 0, player: null, worker: null},
            {x: 3, y: 3, level: 0, player: null, worker: null},
            {x: 4, y: 3, level: 0, player: null, worker: null},
          ]},
          {y: 4, cells: [
            {x: 0, y: 4, level: 0, player: null, worker: null},
            {x: 1, y: 4, level: 0, player: null, worker: null},
            {x: 2, y: 4, level: 0, player: null, worker: null},
            {x: 3, y: 4, level: 0, player: null, worker: null},
            {x: 4, y: 4, level: 0, player: null, worker: null},
          ]},
        ]}
      />
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: null, worker: null},
            {x: 3, y: 0, level: 0, player: null, worker: null},
            {x: 4, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 0, player: null, worker: null},
            {x: 1, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 2, y: 1, level: 0, player: null, worker: null},
            {x: 3, y: 1, level: 0, player: null, worker: null},
            {x: 4, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: Game.PLAYER_B, worker: Game.WORKER_FIRST},
            {x: 2, y: 2, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_SECOND},
            {x: 3, y: 2, level: 0, player: Game.PLAYER_B, worker: Game.WORKER_SECOND},
            {x: 4, y: 2, level: 0, player: null, worker: null},
          ]},
          {y: 3, cells: [
            {x: 0, y: 3, level: 0, player: null, worker: null},
            {x: 1, y: 3, level: 0, player: null, worker: null},
            {x: 2, y: 3, level: 0, player: null, worker: null},
            {x: 3, y: 3, level: 0, player: null, worker: null},
            {x: 4, y: 3, level: 0, player: null, worker: null},
          ]},
          {y: 4, cells: [
            {x: 0, y: 4, level: 0, player: null, worker: null},
            {x: 1, y: 4, level: 0, player: null, worker: null},
            {x: 2, y: 4, level: 0, player: null, worker: null},
            {x: 3, y: 4, level: 0, player: null, worker: null},
            {x: 4, y: 4, level: 0, player: null, worker: null},
          ]},
        ]}
      />
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: null, worker: null},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: null, worker: null},
            {x: 3, y: 0, level: 0, player: null, worker: null},
            {x: 4, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 0, player: null, worker: null},
            {x: 1, y: 1, level: 0, player: Game.PLAYER_B, worker: Game.WORKER_FIRST},
            {x: 2, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 3, y: 1, level: 0, player: null, worker: null},
            {x: 4, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: null, worker: null},
            {x: 2, y: 2, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_SECOND},
            {x: 3, y: 2, level: 0, player: null, worker: null},
            {x: 4, y: 2, level: 0, player: null, worker: null},
          ]},
          {y: 3, cells: [
            {x: 0, y: 3, level: 0, player: null, worker: null},
            {x: 1, y: 3, level: 0, player: null, worker: null},
            {x: 2, y: 3, level: 0, player: null, worker: null},
            {x: 3, y: 3, level: 0, player: Game.PLAYER_B, worker: Game.WORKER_SECOND},
            {x: 4, y: 3, level: 0, player: null, worker: null},
          ]},
          {y: 4, cells: [
            {x: 0, y: 4, level: 0, player: null, worker: null},
            {x: 1, y: 4, level: 0, player: null, worker: null},
            {x: 2, y: 4, level: 0, player: null, worker: null},
            {x: 3, y: 4, level: 0, player: null, worker: null},
            {x: 4, y: 4, level: 0, player: null, worker: null},
          ]},
        ]}
      />
    </Fragment>},
    {title: 'Disadvantaged starting positions', body:<Fragment>
      <div>
        In these starting positions the both players have their pieces near the center, and they can move easily to
        any square on the board. In contrast, these starting positions would probably put the black players at a
        disadvantage, since his pieces are too far away from the opponent's:
      </div>
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: Game.PLAYER_B, worker: Game.WORKER_FIRST},
            {x: 1, y: 0, level: 0, player: Game.PLAYER_B, worker: Game.WORKER_SECOND},
            {x: 2, y: 0, level: 0, player: null, worker: null},
            {x: 3, y: 0, level: 0, player: null, worker: null},
            {x: 4, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 0, player: null, worker: null},
            {x: 1, y: 1, level: 0, player: null, worker: null},
            {x: 2, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 3, y: 1, level: 0, player: null, worker: null},
            {x: 4, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: null, worker: null},
            {x: 2, y: 2, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_SECOND},
            {x: 3, y: 2, level: 0, player: null, worker: null},
            {x: 4, y: 2, level: 0, player: null, worker: null},
          ]},
          {y: 3, cells: [
            {x: 0, y: 3, level: 0, player: null, worker: null},
            {x: 1, y: 3, level: 0, player: null, worker: null},
            {x: 2, y: 3, level: 0, player: null, worker: null},
            {x: 3, y: 3, level: 0, player: null, worker: null},
            {x: 4, y: 3, level: 0, player: null, worker: null},
          ]},
          {y: 4, cells: [
            {x: 0, y: 4, level: 0, player: null, worker: null},
            {x: 1, y: 4, level: 0, player: null, worker: null},
            {x: 2, y: 4, level: 0, player: null, worker: null},
            {x: 3, y: 4, level: 0, player: null, worker: null},
            {x: 4, y: 4, level: 0, player: null, worker: null},
          ]},
        ]}
      />
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: Game.PLAYER_B, worker: Game.WORKER_FIRST},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: null, worker: null},
            {x: 3, y: 0, level: 0, player: null, worker: null},
            {x: 4, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 0, player: null, worker: null},
            {x: 1, y: 1, level: 0, player: null, worker: null},
            {x: 2, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 3, y: 1, level: 0, player: null, worker: null},
            {x: 4, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: null, worker: null},
            {x: 2, y: 2, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_SECOND},
            {x: 3, y: 2, level: 0, player: null, worker: null},
            {x: 4, y: 2, level: 0, player: null, worker: null},
          ]},
          {y: 3, cells: [
            {x: 0, y: 3, level: 0, player: null, worker: null},
            {x: 1, y: 3, level: 0, player: null, worker: null},
            {x: 2, y: 3, level: 0, player: null, worker: null},
            {x: 3, y: 3, level: 0, player: null, worker: null},
            {x: 4, y: 3, level: 0, player: null, worker: null},
          ]},
          {y: 4, cells: [
            {x: 0, y: 4, level: 0, player: Game.PLAYER_B, worker: Game.WORKER_SECOND},
            {x: 1, y: 4, level: 0, player: null, worker: null},
            {x: 2, y: 4, level: 0, player: null, worker: null},
            {x: 3, y: 4, level: 0, player: null, worker: null},
            {x: 4, y: 4, level: 0, player: null, worker: null},
          ]},
        ]}
      />
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: Game.PLAYER_B, worker: Game.WORKER_FIRST},
            {x: 1, y: 0, level: 0, player: Game.PLAYER_B, worker: Game.WORKER_SECOND},
            {x: 2, y: 0, level: 0, player: null, worker: null},
            {x: 3, y: 0, level: 0, player: null, worker: null},
            {x: 4, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 0, player: null, worker: null},
            {x: 1, y: 1, level: 0, player: null, worker: null},
            {x: 2, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 3, y: 1, level: 0, player: null, worker: null},
            {x: 4, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: null, worker: null},
            {x: 2, y: 2, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_SECOND},
            {x: 3, y: 2, level: 0, player: null, worker: null},
            {x: 4, y: 2, level: 0, player: null, worker: null},
          ]},
          {y: 3, cells: [
            {x: 0, y: 3, level: 0, player: null, worker: null},
            {x: 1, y: 3, level: 0, player: null, worker: null},
            {x: 2, y: 3, level: 0, player: null, worker: null},
            {x: 3, y: 3, level: 0, player: null, worker: null},
            {x: 4, y: 3, level: 0, player: null, worker: null},
          ]},
          {y: 4, cells: [
            {x: 0, y: 4, level: 0, player: null, worker: null},
            {x: 1, y: 4, level: 0, player: null, worker: null},
            {x: 2, y: 4, level: 0, player: null, worker: null},
            {x: 3, y: 4, level: 0, player: null, worker: null},
            {x: 4, y: 4, level: 0, player: null, worker: null},
          ]},
        ]}
      />
      <LearnBoard
        rowsAndColumns={[
          {y: 0, cells: [
            {x: 0, y: 0, level: 0, player: Game.PLAYER_B, worker: Game.WORKER_FIRST},
            {x: 1, y: 0, level: 0, player: null, worker: null},
            {x: 2, y: 0, level: 0, player: null, worker: null},
            {x: 3, y: 0, level: 0, player: null, worker: null},
            {x: 4, y: 0, level: 0, player: null, worker: null},
          ]},
          {y: 1, cells: [
            {x: 0, y: 1, level: 0, player: null, worker: null},
            {x: 1, y: 1, level: 0, player: null, worker: null},
            {x: 2, y: 1, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST},
            {x: 3, y: 1, level: 0, player: null, worker: null},
            {x: 4, y: 1, level: 0, player: null, worker: null},
          ]},
          {y: 2, cells: [
            {x: 0, y: 2, level: 0, player: null, worker: null},
            {x: 1, y: 2, level: 0, player: null, worker: null},
            {x: 2, y: 2, level: 0, player: Game.PLAYER_A, worker: Game.WORKER_SECOND},
            {x: 3, y: 2, level: 0, player: null, worker: null},
            {x: 4, y: 2, level: 0, player: null, worker: null},
          ]},
          {y: 3, cells: [
            {x: 0, y: 3, level: 0, player: null, worker: null},
            {x: 1, y: 3, level: 0, player: null, worker: null},
            {x: 2, y: 3, level: 0, player: null, worker: null},
            {x: 3, y: 3, level: 0, player: null, worker: null},
            {x: 4, y: 3, level: 0, player: null, worker: null},
          ]},
          {y: 4, cells: [
            {x: 0, y: 4, level: 0, player: null, worker: null},
            {x: 1, y: 4, level: 0, player: null, worker: null},
            {x: 2, y: 4, level: 0, player: null, worker: null},
            {x: 3, y: 4, level: 0, player: null, worker: null},
            {x: 4, y: 4, level: 0, player: Game.PLAYER_B, worker: Game.WORKER_SECOND},
          ]},
        ]}
      />
    </Fragment>},
    {title: 'You\'re ready to play!', body: <Fragment>
      <div>
        You're now ready to play! You can now <NavLink to={'./hotseat'}>play with a friend on the same screen</NavLink>
        or play online <NavLink to={'./lobby'}>at the lobby</NavLink>.
      </div>
    </Fragment>}
  ];

  state = {
    stepIndex: 0,
  };

  goToFirstStep = () => {
    this.setState({stepIndex: 0});
  };

  goToPreviousStep = () => {
    this.setState(state => ({stepIndex: state.stepIndex - 1}));
  };

  goToNextStep = () => {
    this.setState(state => ({stepIndex: state.stepIndex + 1}));
  };

  goToLastStep = () => {
    this.setState({stepIndex: this.constructor.steps.length - 1});
  };

  render() {
    const {stepIndex} = this.state;
    const steps = this.constructor.steps;
    const step = steps[stepIndex];

    return (
      <Message>
        <Message.Header>{stepIndex + 1}.  {step.title}</Message.Header>
        <Message.Content>
          <Grid columns={'equal'} verticalAlign={'middle'} textAlign={'center'}>
            <Grid.Row>
              <Menu size={'massive'} items={[
                {key: 'first', icon: 'fast backward', onClick: this.goToFirstStep, disabled: stepIndex === 0},
                {key: 'previous', icon: 'backward', onClick: this.goToPreviousStep, disabled: stepIndex === 0},
                {key: 'next', icon: 'forward', onClick: this.goToNextStep, disabled: stepIndex === steps.length - 1},
                {key: 'last', icon: 'fast forward', onClick: this.goToLastStep, disabled: stepIndex === steps.length - 1},
              ]}/>
            </Grid.Row>
            <Grid.Row><Message content={<Fragment key={stepIndex}>{step.body}</Fragment>} /></Grid.Row>
            <Grid.Row>
              {stepIndex < steps.length - 1 ? (
                <Button primary onClick={this.goToNextStep} icon={'forward'} content={'Go to next step'} />
              ) : (
                <Fragment>
                  <Button positive as={NavLink} to={'/lobby'} icon={'play'} content={'Play with someone online'} />
                  <Button positive as={NavLink} to={'/hotseat'} icon={'retweet'} content={'Play with a friend on the same screen'} />
                </Fragment>
              )}
            </Grid.Row>
          </Grid>
        </Message.Content>
      </Message>
    );
  }
}

export default LearnToPlay;
