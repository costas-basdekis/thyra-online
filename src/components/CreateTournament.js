import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button, Form, Input, Modal, Segment} from "semantic-ui-react";
import {withClient} from "../client/withClient";
import Client from "../client/client";

class CreateTournament extends Component {
  state = {
    name: '',
    gameCount: '1',
  };

  createTournament = () => {
    const {client} = this.props;
    const {name, gameCount} = this.state;
    client.createTournament({name, gameCount: parseInt(gameCount, 10)});
  };

  onClose = () => {
    this.setState({name: '', gameCount: 1});
  };

  setValue = (e, {name, value}) => {
    this.setState({[name]: value});
  };

  render() {
    return (
      <Modal
        size={'mini'}
        trigger={<Button color={'yellow'} icon={'sitemap'} content={'Create tournament'} />}
        header={'Create tournament'}
        content={
          <Segment>
            <Form>
              <Form.Field
                name={'name'}
                control={Input}
                label={'Name'}
                placeholder={'Tournament name'}
                onChange={this.setValue}
                required
                defaultValue={this.state.name}
              />
              <Form.Field
                name={'gameCount'}
                control={Input}
                label={`${this.state.gameCount} game(s) between each pair of players`}
                placeholder={'Game count between each pair of players'}
                onChange={this.setValue}
                type={'range'}
                min={1}
                max={5}
                defaultValue={this.state.gameCount}
                required
              />
            </Form>
          </Segment>
        }
        actions={[
          {key: 'cancel', content: 'Cancel'},
          {key: 'create', positive: true, content: 'Create Tournament', onClick: this.createTournament, disabled: !this.state.name},
        ]}
        onClose={this.onClose}
      />
    );
  }
}

CreateTournament.propTypes = {
  client: PropTypes.instanceOf(Client),
};

export default withClient(CreateTournament);
