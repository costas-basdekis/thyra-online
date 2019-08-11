import PropTypes from "prop-types";
import React, { Component, Fragment } from 'react';
import {
  NavLink,
  Redirect, Route,
  Switch,
  withRouter
} from "react-router-dom";
import { Menu, Tab } from 'semantic-ui-react';

class NavigationalTab extends Component {
  constructUrl(path) {
    const {match} = this.props;
    return `${match.url.endsWith('/') ? match.url.slice(0, -1) : match.url}${path ? `/${path}` : ''}`;
  }

  getPreparedPanesDefaultToAndActiveIndex() {
    const {panes, defaultIndex, match, location} = this.props;
    let defaultTo = null;
    let activeIndex = null;
    let activeTo = match.url;

    const preparedPanes = panes
      .map((pane, index) => {
        if (!pane) {
          return null;
        }

        const to = this.constructUrl(pane.path);
        if (index === defaultIndex) {
          defaultTo = to;
        }
        const navigate = pane.navigate !== undefined ? this.constructUrl(pane.navigate) : to;
        if (location.pathname.startsWith(navigate)) {
          activeIndex = index;
          activeTo = to;
        }

        const menuItem = (
          typeof pane.menuItem === typeof ""
            ? {content: pane.menuItem}
            : pane.menuItem
        );
        return {
          to,
          ...pane,
          menuItem: (
            <Menu.Item
              key={pane.path}
              as={NavLink}
              to={navigate}
              {...menuItem}
              icon={pane.icon || menuItem.icon}
            />
          ),
        };
      })
      .filter(preparedPane => preparedPane);
    return {preparedPanes, defaultTo, activeIndex, activeTo}
  }

  render() {
    const {tab, menu, match, renderActiveOnly, className} = this.props;
    const {preparedPanes, defaultTo, activeIndex, activeTo} = this.getPreparedPanesDefaultToAndActiveIndex();

    return (
      <Fragment>
        {defaultTo !== null ? (
          <Switch>
            <Redirect exact from={match.url} to={defaultTo} />
          </Switch>
        ) : null}
        <Route path={activeTo}>
          <Tab
            menu={menu}
            renderActiveOnly={renderActiveOnly}
            {...tab}
            panes={preparedPanes}
            activeIndex={activeIndex}
            className={className}
          />
        </Route>
      </Fragment>
    );
  }
}

NavigationalTab.propTypes = {
  panes: PropTypes.arrayOf(PropTypes.shape({
    ...Menu.Item.propTypes,
    path: PropTypes.string,
    menuItem: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  })).isRequired,
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  tab: PropTypes.object,
  menu: PropTypes.object,
  renderActiveOnly: PropTypes.bool.isRequired,
  defaultIndex: PropTypes.number.isRequired,
};

NavigationalTab.defaultProps = {
  renderActiveOnly: true,
  defaultIndex: 0,
};

export default withRouter(NavigationalTab);
