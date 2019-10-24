import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Game from "../../game/game";
import HtmlBoardBackground from "./HtmlBoardBackground";
import SvgBoardBackground from "./SvgBoardBackground";
import "../../styles/board.css";
import "../../styles/board-theme.css";
import * as utils from "../../utils";

class BoardBackground extends Component {
  render() {
    let {renderer = 'svg', ...props} = this.props;

    if (props.settings) {
      props.settings = utils.getApplicableSettings(props.settings);
    }

    const renderers = {
      'html': HtmlBoardBackground,
      'svg': SvgBoardBackground,
    };
    const Renderer = renderers[renderer];
    return <Renderer {...props} />;
  }
}

BoardBackground.propTypes = {
  rowsAndColumns: PropTypes.array.isRequired,
  transformation: PropTypes.func,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]).isRequired,
  makeMove: PropTypes.func,
  undo: PropTypes.func,
  small: PropTypes.bool.isRequired,
  medium: PropTypes.bool.isRequired,
  clickable: PropTypes.bool.isRequired,
  undoable: PropTypes.bool.isRequired,
  onSelect: PropTypes.func,
  selected: PropTypes.bool.isRequired,
  isCellAvailable: PropTypes.func.isRequired,
  isCellUndoable: PropTypes.func.isRequired,
  allowControl: PropTypes.array.isRequired,
  settings: PropTypes.object.isRequired,
  animated: PropTypes.bool.isRequired,
  showArrows: PropTypes.bool.isRequired,
  game: PropTypes.instanceOf(Game),
  arrows: PropTypes.array,
};

BoardBackground.defaultProps = {
  className: '',
  small: false,
  medium: false,
  clickable: false,
  selected: false,
  allowControl: [Game.PLAYER_A, Game.PLAYER_B],
  animated: false,
  showArrows: false,
};

export default BoardBackground;
