import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from "react-router-dom";
import {Modal} from "semantic-ui-react";
import CreatePuzzle from "./CreatePuzzle";
import {withClient} from "../client/withClient";

class EditPuzzle extends Component {
  get puzzle() {
    const {match, puzzlesInfo: {byId}} = this.props;
    const puzzle = byId[match.params.id];
    return puzzle;
  }

  dismissUrlPuzzleError = () => {
    this.props.history.push('/puzzle');
  };

  render() {
    const puzzle = this.puzzle;
    if (!puzzle || !puzzle.isMyPuzzle) {
      return (
        <Fragment>
          <Modal
            open={true}
            size={'mini'}
            onClose={this.dismissUrlPuzzleError}
            header={'Could not find puzzle'}
            content={'This puzzle cannot be found. Please check that you copied the full URL, or perhaps the puzzle was deleted'}
            actions={[{key: 'ok', content: 'OK', positive: true}]}
          />
          Could not find puzzle
        </Fragment>
      );
    }

    return (
      <CreatePuzzle initialPuzzle={puzzle} />
    );
  }
}

EditPuzzle.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  puzzlesInfo: PropTypes.object.isRequired,
};

export default withRouter(withClient(EditPuzzle));
