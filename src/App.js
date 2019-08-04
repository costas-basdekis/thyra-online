import React, {Component} from 'react';
import 'fomantic-ui-css/semantic.css';
import {Container, Header, Segment} from 'semantic-ui-react';
import './styles/App.css';
import Game from "./game/game";
import Play from "./components/play";

class App extends Component {
  state = {
    game: Game.create(),
  };

  makeMove = newGame => {
    this.setState({game: newGame});
  };

  render() {
    const {game} = this.state;
    return (
      <Container text>
        <Segment textAlign={"center"}>
          <Header as={"h1"}>Thyra Online</Header>
        </Segment>
        <Play game={game} makeMove={this.makeMove} />
      </Container>
    );
  }
}

export default App;
