import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import Play from "./Play";
import Game from "../game/game";
import {Button, Icon, Grid, Modal} from "semantic-ui-react";
import * as utils from "../utils";
import Settings from "./Settings";
import {withClient} from "../client/withClient";

class Hotseat extends Component {
  state = {
    error: false,
    ...this.constructor.getGameAndErrorFromUrlPosition(),
  };

  static getGameAndErrorFromUrlPosition() {
    const params = new URLSearchParams(window.location.search);
    const position = params.get('position');
    if (position) {
      let game, error;
      try {
        game = Game.fromCompressedNotation(position);
        if (!game) {
          error = 'The position was not valid';
        }
      } catch (e) {
        game = null;
        error = 'The series of moves where not valid'
      }
      if (error) {
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
    const url = this.props.location.pathname;
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

  render() {
    const {game, error} = this.state;
    const {user, client} = this.props;

    return (
      <Fragment>
        <Modal
          open={error}
          size={'mini'}
          onClose={this.dismissUrlPositionError}
          header={'Could not load shared position'}
          content={`${error}. Please check that you copied the full URL`}
          actions={[{content: 'OK', positive: true}]}
        />
        <Grid columns={'equal'}>
          <Grid.Column>
            <Grid columns={'equal'}>
              <Grid.Column><Settings/></Grid.Column>
              <Grid.Column />
            </Grid>
          </Grid.Column>
          <Grid.Column>
            <Button
              positive
              icon
              onClick={this.share}
              style={{width: '100%'}}
              as={'a'}
              href={`?position=${game.compressedFullNotation}`}
              title={navigator.share ? 'Click to open the sharing menu' : 'Click to copy URL to game'}
            >
              <Icon name={'share'}/> Share position
            </Button>
          </Grid.Column>
        </Grid>
        <Play user={user} defaultSettings={client.settings} game={game} makeMove={this.makeMove} />
      </Fragment>
    );
  }
}

Hotseat.propTypes = {
  user: PropTypes.object,
};

export default withClient(Hotseat);
