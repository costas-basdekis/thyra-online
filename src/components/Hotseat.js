import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import Play from "./Play";
import Game from "../game/game";
import {Grid, Modal, Menu} from "semantic-ui-react";
import * as utils from "../utils";
import {withClient} from "../client/withClient";

class Hotseat extends Component {
  state = {
    selectedGame: null,
    error: false,
    ...this.constructor.getGameAndErrorFromUrlPosition(),
  };

  static getGameAndErrorFromUrlPosition() {
    const params = new URLSearchParams(window.location.search);
    const position = params.get('position');
    if (position) {
      let game, error;
      try {
        game = Game.fromCompressedMoveNotation(position);
        if (!game) {
          error = 'The position was not valid';
        } else {
          error = null;
        }
      } catch (e) {
        game = null;
        error = 'The series of moves where not valid';
      }
      if (!game) {
        return {game: Game.create(), error};
      }
      return {game, error: false};
    } else {
      return {game: Game.create(), error: false};
    }
  }

  dismissUrlPositionError = () =>{
    this.setState({error: null});
  };

  makeMove = newGame => {
    this.setState({game: newGame});
  };

  share = () => {
    const url = window.location.href;
    if (navigator.share) {
      const game = this.state.game;
      navigator.share({
        title: `Thyra Online - Game after ${game.moveCount} moves`,
        text: `Review Santorini game between after ${game.moveCount} moves`,
        url,
      }).catch(() => {
        utils.copyToClipboard(url);
        alert('Link copied to clipboard');
      });
    } else {
      utils.copyToClipboard(url);
      alert('Link copied to clipboard');
    }
  };

  onSelectedGameChange = selectedGame => {
    this.setState({selectedGame});
  };

  render() {
    const {game, error, selectedGame} = this.state;
    const {user} = this.props;

    return (
      <Fragment>
        <Modal
          open={error}
          size={'mini'}
          onClose={this.dismissUrlPositionError}
          header={'Could not load shared position'}
          content={`${error}. Please check that you copied the full URL`}
          actions={[{key: 'ok', content: 'OK', positive: true}]}
        />
        <Grid centered>
          <Grid.Row>
            <Menu inverted size={'massive'} items={[
              {key: 'share', icon: 'share', content: 'Share position', color: 'green', active: true, as: 'a',
                href: `?position=${(selectedGame || game).compressedFullNotation}`,
                title: navigator.share ? 'Click to open the sharing menu' : 'Click to copy URL to game'}
            ]} />
          </Grid.Row>
        </Grid>
        <Play
          user={user}
          game={game}
          makeMove={this.makeMove}
          onSelectedGameChange={this.onSelectedGameChange}
        />
      </Fragment>
    );
  }
}

Hotseat.propTypes = {
  user: PropTypes.object,
};

export default withClient(Hotseat);
