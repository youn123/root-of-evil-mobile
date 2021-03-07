import React from 'react';
import { Text } from 'react-native';

const loadingIndicator = ['---', ' \\', ' |', ' /'];

export default class RetroLoadingIndicator extends React.Component {
  state = {
    i: 0
  }

  componentDidMount() {
    this.loading = setInterval(() => {
      this.setState({
        i: (this.state.i + 1) % 4
      });
    }, 125);
  }

  componentWillUnmount() {
    clearInterval(this.loading);
  }

  render() {
    return <Text>{loadingIndicator[this.state.i]}</Text>;
  }
}
  