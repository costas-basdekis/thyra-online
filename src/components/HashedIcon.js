import React, {Component} from 'react';
import PropTypes from 'prop-types';

import jdenticon from "jdenticon";
import classNames from "classnames";

class HashedIcon extends Component {
  ref = React.createRef();

  componentDidMount() {
    this.updateIcon();
  }

  updateIcon() {
    if (this.ref.current) {
      jdenticon.update(this.ref.current);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.hash !== this.props) {
      this.updateIcon();
    }
  }

  render() {
    const {hash, floated, size, textSized} = this.props;
    return (
      <svg
        ref={this.ref}
        className={classNames(["ui", "mini", "right", "floated", "image"], {floated: !!floated, [floated]: !!floated, [size]: !!size, 'text-sized': textSized})}
        data-jdenticon-value={hash}
      />
    );
  }
}

HashedIcon.propTypes = {
  hash: PropTypes.string.isRequired,
  floated: PropTypes.oneOf(['left', 'right']),
  size: PropTypes.oneOf(['mini', 'tiny', 'small', 'medium', 'large', 'big', 'huge', 'massive']),
  textSized: PropTypes.bool.isRequired,
};

HashedIcon.defaultProps = {
  textSized: false,
};

export default HashedIcon;
