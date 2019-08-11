import React, {Component} from "react";
import PropTypes from 'prop-types';
import {Checkbox, Form, Grid, Header, Label, Modal, Segment, Tab} from "semantic-ui-react";
import {withClient} from "../client/withClient";
import {ThemeDemoBoard} from "./Board";

class SettingsContent extends Component {
  themeSchemeOptions = [
    {value: '', label: 'Default'},
    {value: 'subtle', label: 'Subtle'},
    {value: 'pastel', label: 'Pastel'},
    {value: 'green', label: 'Green'},
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

  updateThemeRotated = (e, {checked}) => {
    this.props.updateSettings({theme: {rotated: checked}});
  };

  updateThemeRounded = (e, {checked}) => {
    this.props.updateSettings({theme: {rounded: checked}});
  };

  updateThemeNumbers = (e, {value}) => {
    this.props.updateSettings({theme: {numbers: value}});
  };

  updateThemeScheme = (e, {value}) => {
    this.props.updateSettings({theme: {scheme: value}});
  };

  render() {
    const {settings: {autoSubmitMoves, theme: {scheme, rotated, rounded, numbers}}} = this.props;

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
            </Form>
          </Segment>
        )},
        {menuItem: 'Theme', render: () => (
          <Segment>
            <Grid stackable columns={'equal'} verticalAlign={'middle'}>
              <Grid.Row>
                <Grid.Column textAlign={'center'}>
                  <ThemeDemoBoard medium settings={{theme: {scheme, rotated, rounded, numbers}}}/>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column width={4}>
                  <Checkbox
                    label={'Rotated'}
                    name={'theme.rotated'}
                    checked={rotated}
                    onChange={this.updateThemeRotated}
                  />
                </Grid.Column>
                <Grid.Column floated={'right'} textAlign={'right'}>
                  <ThemeDemoBoard medium settings={{theme: {scheme, rotated: true, rounded, numbers}}}/>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column width={4}>
                  <Checkbox
                    label={'Rounded'}
                    name={'theme.rounded'}
                    checked={rounded}
                    onChange={this.updateThemeRounded}
                  />
                </Grid.Column>
                <Grid.Column floated={'right'} textAlign={'right'}>
                  <ThemeDemoBoard medium settings={{theme: {scheme, rotated, rounded: true, numbers}}}/>
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
                    <ThemeDemoBoard medium settings={{theme: {scheme, rotated, rounded, numbers: option.value}}}/>
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
                    <ThemeDemoBoard medium settings={{theme: {scheme: option.value, rotated, rounded, numbers}}}/>
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
    settings: {
      autoSubmitMoves: false,
      theme: {scheme: '', rotated: false, rounded: false, numbers: ''},
    },
  };

  static getDerivedStateFromProps(props, state) {
    if (props.user && props.user !== state.user) {
      return {
        user: props.user,
        settings: props.user.settings || {
          autoSubmitMoves: false,
          theme: {scheme: '', rotated: false, rounded: false, numbers: ''},
        },
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
        content={<SettingsContent settings={settings} updateSettings={this.updateSettings} />}
      />
    );
  }
}

Settings.propTypes = {
  client: PropTypes.object.isRequired,
  user: PropTypes.object,
};

export default withClient(Settings);
