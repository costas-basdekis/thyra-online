import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from "react-router-dom";
import {Modal} from "semantic-ui-react";
import CreateChallenge from "./CreateChallenge";
import {withClient} from "../client/withClient";

class EditChallenge extends Component {
  get challenge() {
    const {match, challengesInfo: {byId}} = this.props;
    const challenge = byId[match.params.id];
    return challenge;
  }

  dismissUrlChallengeError = () => {
    this.props.history.push('/challenge');
  };

  render() {
    const challenge = this.challenge;
    if (!challenge) {
      return (
        <Fragment>
          <Modal
            open={true}
            size={'mini'}
            onClose={this.dismissUrlChallengeError}
            header={'Could not find challenge'}
            content={'This challenge cannot be found. Please check that you copied the full URL, or perhaps the challenge was deleted'}
            actions={[{key: 'ok', content: 'OK', positive: true}]}
          />
          Could not find challenge
        </Fragment>
      );
    }

    return (
      <CreateChallenge initialChallenge={challenge} />
    );
  }
}

EditChallenge.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  challengesInfo: PropTypes.object.isRequired,
};

export default withRouter(withClient(EditChallenge));
