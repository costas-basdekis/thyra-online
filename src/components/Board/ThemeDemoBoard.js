import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Game from "../../game/game";
import BoardBackground from "./BoardBackground";

class ThemeDemoBoard extends Component {
  static demoRowsAndColumns = [
    {
      y: 0,
      cells: [
        {x: 0, y: 0, player: null, worker: null, level: 0},
        {x: 1, y: 0, player: null, worker: null, level: 1},
        {x: 2, y: 0, player: null, worker: null, level: 2},
        {x: 3, y: 0, player: null, worker: null, level: 3},
        {x: 4, y: 0, player: null, worker: null, level: 4},
        {x: 5, y: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST, level: 0},
        {x: 6, y: 0, player: Game.PLAYER_B, worker: Game.WORKER_FIRST, level: 0},
      ],
    },
  ];
  static demoRowsAndColumnsAnimated = [
    {
      y: 0,
      cells: [
        {x: 0, y: 0, player: null, worker: null, level: 0},
        {x: 1, y: 0, player: null, worker: null, level: 1},
        {x: 2, y: 0, player: null, worker: null, level: 2},
        {x: 3, y: 0, player: null, worker: null, level: 3},
        {x: 4, y: 0, player: Game.PLAYER_A, worker: Game.WORKER_FIRST, level: 3},
        {x: 5, y: 0, player: null, worker: null, level: 0},
        {x: 6, y: 0, player: Game.PLAYER_B, worker: Game.WORKER_FIRST, level: 0},
      ],
    },
  ];
  static arrows = [
    {from: {x: 5, y: 0}, to: {x: 4, y: 0}, colour: 'white'},
    {from: {x: 4, y: 0}, to: {x: 5, y: 0}, colour: 'white'},
  ];

  state = {
    rowsAndColumns: this.constructor.demoRowsAndColumns,
  };

  isCellAvailable = () => {
    return false;
  };

  isCellUndoable = () => {
    return false;
  };

  animate = () => {
    this.setState(state => ({
      rowsAndColumns: state.rowsAndColumns === this.constructor.demoRowsAndColumns
        ? this.constructor.demoRowsAndColumnsAnimated
        : this.constructor.demoRowsAndColumns,
    }));
  };
  animationInterval = this.props.settings.theme.animations ? setInterval(this.animate, 2000) : null;

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.settings.theme.animations !== prevProps.settings.theme.animations) {
      if (this.props.settings.theme.animations) {
        if (!this.animationInterval) {
          this.animationInterval = setInterval(this.animate, 2000);
        }
      } else {
        if (this.animationInterval) {
          clearInterval(this.animationInterval);
          this.animationInterval = null;
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  }

  render() {
    const {small, medium, settings} = this.props;
    const {rowsAndColumns} = this.state;

    return (
      <BoardBackground
        small={small}
        medium={medium}
        allowControl={[Game.PLAYER_A, Game.PLAYER_B]}
        rowsAndColumns={rowsAndColumns}
        undoable={false}
        isCellAvailable={this.isCellAvailable}
        isCellUndoable={this.isCellUndoable}
        arrows={settings.theme.arrows ? this.constructor.arrows : undefined}
        settings={settings}
        animated={settings.theme.animations}
        showArrows={settings.theme.arrows}
      />
    );
  }
}

ThemeDemoBoard.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]).isRequired,
  small: PropTypes.bool.isRequired,
  medium: PropTypes.bool.isRequired,
  settings: PropTypes.object.isRequired,
};

ThemeDemoBoard.defaultProps = {
  className: '',
  small: false,
  medium: false,
};

export default ThemeDemoBoard;
