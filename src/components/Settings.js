import React, {Component, Fragment} from "react";
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
    {value: 'halloween', label: 'Halloween'},
  ];
  themeCellsOptions = [
    {value: 'original', label: 'Original'},
    {value: 'halloween', label: 'Halloween'},
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
    {value: 'halloween-witch-hat', label: 'Halloween: Witch Hat'},
    {value: 'halloween-cauldron', label: 'Halloween: Cauldron'},
    {value: 'halloween-bat', label: 'Halloween: Bat'},
    {value: 'halloween-spider', label: 'Halloween: Spider'},
    {value: 'halloween-cat', label: 'Halloween: Cat'},
    {value: 'halloween-tombstone', label: 'Halloween: Tombstone'},
    {value: 'halloween-pumpkin', label: 'Halloween: Pumpkin'},
    {value: 'halloween-ghost', label: 'Halloween: Ghost'},
  ];
  themeNumbersOptions = [
    {value: '', label: 'None'},
    {value: 'obvious', label: 'Obvious'},
    {value: 'subtle', label: 'Subtle'},
    {value: 'very-subtle', label: 'Very subtle'},
  ];

  themeDemoBoard = overrides => {
    const {settings: {theme}} = this.props;
    return (
      <ThemeDemoBoard medium settings={{theme: {...theme, animations: false, ...overrides}}}/>
    );
  };

  updateAutoSubmitMove = (e, {checked}) => {
    this.props.updateSettings({autoSubmitMoves: checked});
  };

  updateConfirmSubmitMoves = (e, {checked}) => {
    this.props.updateSettings({confirmSubmitMoves: checked});
  };

  updateEnableNotifications = (e, {checked}) => {
    this.props.updateSettings({enableNotifications: checked});
  };

  updateThemeUseTopicalTheme = (e, {checked}) => {
    this.props.updateSettings({theme: {useTopicalTheme: checked}});
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

  updateThemeCells = (e, {value}) => {
    this.props.updateSettings({theme: {cells: value}});
  };

  render() {
    const {settings: {autoSubmitMoves, confirmSubmitMoves, enableNotifications, theme}, applicableSettingsName, applicableSettingsOverride} = this.props;
    const {useTopicalTheme, cells = 'original', pieces = 'king', scheme, rotateOpponent, animations, arrows, numbers} = theme;

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
                  label={'Confirm before submitting online moves'}
                  name={'confirmSubmitMoves'}
                  checked={confirmSubmitMoves}
                  onChange={this.updateConfirmSubmitMoves}
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
                  {this.themeDemoBoard({animations: theme.animations})}
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column width={4}>
                  <Checkbox
                    label={'Use topical theme when available'}
                    name={'theme.useTopicalTheme'}
                    checked={useTopicalTheme}
                    onChange={this.updateThemeUseTopicalTheme}
                  />
                </Grid.Column>
                <Grid.Column floated={'right'} textAlign={'right'}>
                  {applicableSettingsName ? (
                    <Fragment>
                      {applicableSettingsName}
                      <br/>
                      {this.themeDemoBoard(applicableSettingsOverride.theme)}
                    </Fragment>
                  ) : null}
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Tab menu={{pointing: true, attached: false}} panes={[
                  {menuItem: 'Pieces', render: () => (
                    <Tab.Pane>
                    <Grid stackable columns={'equal'} verticalAlign={'middle'}>
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
                          {this.themeDemoBoard({rotateOpponent: true})}
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
                          {this.themeDemoBoard({animations: true})}
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
                          {this.themeDemoBoard({arrows: true})}
                        </Grid.Column>
                      </Grid.Row>
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
                            {this.themeDemoBoard({pieces: option.value})}
                          </Grid.Column>
                        </Grid.Row>
                      ))}
                    </Grid>
                  </Tab.Pane>
                  )},
                  {menuItem: 'Board', render: () => (
                    <Tab.Pane>
                      <Grid stackable columns={'equal'} verticalAlign={'middle'}>
                        <Grid.Row>
                          <Grid.Column textAlign={'center'}>
                            <Form.Field><Header as={'h2'}>Cells:</Header></Form.Field>
                          </Grid.Column>
                          </Grid.Row>
                        {this.themeCellsOptions.map(option => (
                          <Grid.Row key={`theme-cells-${option.value}`}>
                            <Grid.Column width={4}>
                              <Checkbox
                                radio
                                label={option.label}
                                name={'theme.cells'}
                                value={option.value}
                                checked={cells === option.value}
                                onChange={this.updateThemeCells}
                              />
                            </Grid.Column>
                            <Grid.Column floated={'right'} textAlign={'right'}>
                              {this.themeDemoBoard({cells: option.value})}
                            </Grid.Column>
                          </Grid.Row>
                        ))}
                        <Grid.Row>
                          <Grid.Column textAlign={'center'}>
                            <Form.Field><Header as={'h2'}>Colours:</Header></Form.Field>
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
                              {this.themeDemoBoard({scheme: option.value})}
                            </Grid.Column>
                          </Grid.Row>
                        ))}
                      </Grid>
                    </Tab.Pane>
                  )},
                  {menuItem: 'Level Indicators', render: () => (
                    <Tab.Pane>
                      <Grid stackable columns={'equal'} verticalAlign={'middle'}>
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
                              {this.themeDemoBoard({numbers: option.value})}
                            </Grid.Column>
                          </Grid.Row>
                        ))}
                      </Grid>
                    </Tab.Pane>
                  )}
                ]} />
              </Grid.Row>
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
  applicableThemeName: PropTypes.string,
  applicableSettingsOverride: PropTypes.object,
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
        settings: props.client.settings,
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
    const {client} = this.props;

    return (
      <Modal
        trigger={<Label as={'a'} icon={'cog'} content={'Settings'} />}
        size={'small'}
        header={'Settings'}
        actions={[
          {key: 'cancel', content: 'Cancel'},
          {key: 'save', content: 'Save', positive: true, onClick: this.save},
        ]}
        content={{scrolling: true, content: (
          <SettingsContent
            settings={settings}
            updateSettings={this.updateSettings}
            applicableSettingsName={client.applicableSettingsName}
            applicableSettingsOverride={client.applicableSettingsOverride}
          />
        )}}
      />
    );
  }
}

Settings.propTypes = {
  client: PropTypes.object.isRequired,
  user: PropTypes.object,
};

export default withClient(Settings);
