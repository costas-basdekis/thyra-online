import React, {Component} from "react";
import PropTypes from 'prop-types';
import {Checkbox, Form, Grid, Header, Label, Modal, Segment, Tab} from "semantic-ui-react";
import Client from "../client/client";
import {withClient} from "../client/withClient";
import {ThemeDemoBoard} from "./Board";

class SettingsContent extends Component {
  themeSchemeOptions = [
    {value: '', label: 'Default'},
    {value: 'subtle', label: 'Subtle'},
    {value: 'pastel', label: 'Pastel'},
    {value: 'green', label: 'Green'},
  ];
  themePiecesOptions = [
    {value: 'pawn', label: 'Pawn'},
    {value: 'king', label: 'King'},
    {value: 'circle', label: 'Circle'},
    {value: 'certificate', label: 'Star'},
    {value: 'sun', label: 'Sun'},
    {value: 'rocket', label: 'Rocket'},
    {value: 'bug', label: 'Bug'},
    {value: 'eye', label: 'Eye'},
    {value: 'user', label: 'User'},
  ];
  themeNumbersOptions = [
    {value: '', label: 'None'},
    {value: 'obvious', label: 'Obvious'},
    {value: 'subtle', label: 'Subtle'},
    {value: 'very-subtle', label: 'Very subtle'},
  ];

  updateAutoSubmitMove = (e, {checked}) => {
    this.props.updateSettings({autoSubmitMoves: checked});
  };

  updateEnableNotifications = (e, {checked}) => {
    this.props.updateSettings({enableNotifications: checked});
  };

  updateThemeRotateOpponent = (e, {checked}) => {
    this.props.updateSettings({theme: {rotateOpponent: checked}});
  };

  updateAnimations = (e, {checked}) => {
    this.props.updateSettings({theme: {animations: checked}});
  };

  updateArrows = (e, {checked}) => {
    this.props.updateSettings({theme: {arrows: checked}});
  };

  updateThemeNumbers = (e, {value}) => {
    this.props.updateSettings({theme: {numbers: value}});
  };

  updateThemeScheme = (e, {value}) => {
    this.props.updateSettings({theme: {scheme: value}});
  };

  updateThemePieces = (e, {value}) => {
    this.props.updateSettings({theme: {pieces: value}});
  };

  render() {
    const {settings: {autoSubmitMoves, enableNotifications, theme}} = this.props;
    const {pieces = 'king', scheme, rotateOpponent, animations, arrows, numbers} = theme;

    return (
      <Tab menu={{pointing: true, attached: false}} panes={[
        {menuItem: 'Playing', render: () => (
          <Segment>
            <Form>
              <Form.Group>
                <Checkbox
                  label={'Auto-submit online moves'}
                  name={'autoSubmitMoves'}
                  checked={autoSubmitMoves}
                  onChange={this.updateAutoSubmitMove}
                />
              </Form.Group>
              <Form.Group>
                <Checkbox
                  label={'Enable notifications'}
                  name={'enableNotifications'}
                  checked={enableNotifications}
                  onChange={this.updateEnableNotifications}
                />
              </Form.Group>
            </Form>
          </Segment>
        )},
        {menuItem: 'Theme', render: () => (
          <Segment>
            <Grid stackable columns={'equal'} verticalAlign={'middle'}>
              <Grid.Row>
                <Grid.Column textAlign={'center'}>
                  <ThemeDemoBoard medium settings={{theme}}/>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column width={4}>
                  <Checkbox
                    label={'Rotate Opponent'}
                    name={'theme.rotateOpponent'}
                    checked={rotateOpponent}
                    onChange={this.updateThemeRotateOpponent}
                  />
                </Grid.Column>
                <Grid.Column floated={'right'} textAlign={'right'}>
                  <ThemeDemoBoard medium settings={{theme: {...theme, rotateOpponent: true}}}/>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column width={4}>
                  <Checkbox
                    label={'Animation'}
                    name={'theme.animations'}
                    checked={animations}
                    onChange={this.updateAnimations}
                  />
                </Grid.Column>
                <Grid.Column floated={'right'} textAlign={'right'}>
                  <ThemeDemoBoard medium settings={{theme: {...theme, animations: true}}}/>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column width={4}>
                  <Checkbox
                    label={'Arrows'}
                    name={'theme.arrows'}
                    checked={arrows}
                    onChange={this.updateArrows}
                  />
                </Grid.Column>
                <Grid.Column floated={'right'} textAlign={'right'}>
                  <ThemeDemoBoard medium settings={{theme: {...theme, arrows: true}}} arrows={this.arrows}/>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column textAlign={'center'}>
                  <Form.Field><Header as={'h2'}>Numbers:</Header></Form.Field>
                </Grid.Column>
              </Grid.Row>
              {this.themeNumbersOptions.map(option => (
                <Grid.Row key={`theme-numbers-${option.value}`}>
                  <Grid.Column width={4}>
                    <Checkbox
                      radio
                      label={option.label}
                      name={'theme.numbers'}
                      value={option.value}
                      checked={numbers === option.value}
                      onChange={this.updateThemeNumbers}
                    />
                  </Grid.Column>
                  <Grid.Column floated={'right'} textAlign={'right'}>
                    <ThemeDemoBoard medium settings={{theme: {...theme, numbers: option.value}}}/>
                  </Grid.Column>
                </Grid.Row>
              ))}
              <Grid.Row>
                <Grid.Column textAlign={'center'}>
                  <Form.Field><Header as={'h2'}>Pieces:</Header></Form.Field>
                </Grid.Column>
              </Grid.Row>
              {this.themePiecesOptions.map(option => (
                <Grid.Row key={`theme-pieces-${option.value}`}>
                  <Grid.Column width={4}>
                    <Checkbox
                      radio
                      label={option.label}
                      name={'theme.pieces'}
                      value={option.value}
                      checked={pieces === option.value}
                      onChange={this.updateThemePieces}
                    />
                  </Grid.Column>
                  <Grid.Column floated={'right'} textAlign={'right'}>
                    <ThemeDemoBoard medium settings={{theme: {...theme, pieces: option.value}}}/>
                  </Grid.Column>
                </Grid.Row>
              ))}
              <Grid.Row>
                <Grid.Column textAlign={'center'}>
                  <Form.Field><Header as={'h2'}>Scheme:</Header></Form.Field>
                </Grid.Column>
              </Grid.Row>
              {this.themeSchemeOptions.map(option => (
                <Grid.Row key={`theme-scheme-${option.value}`}>
                  <Grid.Column width={4}>
                    <Checkbox
                      radio
                      label={option.label}
                      name={'theme.scheme'}
                      value={option.value}
                      checked={scheme === option.value}
                      onChange={this.updateThemeScheme}
                    />
                  </Grid.Column>
                  <Grid.Column floated={'right'} textAlign={'right'}>
                    <ThemeDemoBoard medium settings={{theme: {...theme, scheme: option.value}}}/>
                  </Grid.Column>
                </Grid.Row>
              ))}
            </Grid>
          </Segment>
        )},
      ]} />
    );
  }
}

SettingsContent.propTypes = {
  settings: PropTypes.object.isRequired,
  updateSettings: PropTypes.func.isRequired,
};

class Settings extends Component {
  state = {
    user: null,
    settings: Client.getDefaultSettings(),
  };

  static getDerivedStateFromProps(props, state) {
    if (props.user && props.user !== state.user) {
      return {
        user: props.user,
        settings: props.user.settings || Client.getDefaultSettings(),
      };
    }

    return {};
  }

  updateSettings = update => {
    this.setState(state => ({
      settings: {
        ...state.settings,
        ...update,
        theme: {
          ...state.settings.theme,
          ...update.theme,
        },
      },
    }));
  };

  save = () => {
    this.props.client.updateSettings(this.state.settings);
  };

  render() {
    const {settings} = this.state;

    return (
      <Modal
        trigger={<Label as={'a'} icon={'cog'} content={'Settings'} />}
        size={'small'}
        header={'Settings'}
        actions={[
          {key: 'cancel', content: 'Cancel'},
          {key: 'save', content: 'Save', positive: true, onClick: this.save},
        ]}
        content={{scrolling: true, content: <SettingsContent settings={settings} updateSettings={this.updateSettings} />}}
      />
    );
  }
}

Settings.propTypes = {
  client: PropTypes.object.isRequired,
  user: PropTypes.object,
};

export default withClient(Settings);
