import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { connect } from 'react-redux';

import store from '../store';
import { ShowWhen } from '../hoc';

import { getCurrentLobby } from '../lobby';
// import { getCurrentLobby } from '../mocks/lobby';
import { hostHandleRootOfEvilMessage } from '../root-of-evil-message-handler';
import { PRIMARY, SECONDARY, ACCENT_HOT } from '../settings';

const styles = StyleSheet.create({
  container: {
    backgroundColor: PRIMARY,
    height: '100%',
    paddingLeft: 20
  },
  header: {
    paddingTop: 10,
    paddingRight: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  nextButton: {
    color: 'white',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 5
  }
});

class Lobby extends React.Component {
  state = {
  }

  componentDidMount() {
    if (this.props.isHost) {
      getCurrentLobby().listen(messages => {
        hostHandleRootOfEvilMessage(messages, getCurrentLobby(), store);
      });
    }
  }

  handleStart = () => {
    getCurrentLobby().send({
      type: 'START_GAME',
      to: '__everyone'
    });
  }

  setStateAsync = newState => {
    return new Promise((resolve, _) => {
      this.setState(newState, resolve);
    });
  }

  render() {
    let status = (this.props.players.length > 0 && this.props.isHost) ? 'Ready' : 'Waiting';

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={{fontSize: 19}}>{this.props.lobbyCode}</Text>
          <ShowWhen condition={status == 'Waiting'}>
            <Text style={[styles.nextButton, {backgroundColor: SECONDARY}]}>Waiting...</Text>
          </ShowWhen>
          <ShowWhen condition={status == 'Ready'}>
            <TouchableOpacity onPress={this.handleStart}>
              <Text style={[styles.nextButton, {backgroundColor: ACCENT_HOT, color: PRIMARY}]}>Start!</Text>
            </TouchableOpacity>
          </ShowWhen>
        </View>
        <View style={{marginTop: 20}}>
          <ShowWhen condition={this.props.players.length == 1}>
            <Text>1 person has joined.</Text>
          </ShowWhen>
          <ShowWhen condition={this.props.players.length > 1}>
            <Text>{this.props.players.length} people have joined.</Text>
          </ShowWhen>
          <ScrollView contentContainerStyle={{width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly', marginTop: 10}}>
            {this.props.players.map(player => <Text style={{marginHorizontal: 10, fontSize: 18, marginTop: 10}} key={player.handle}>{player.handle}</Text>)}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
};

function mapStateToProps(state) {
  return {
    isHost: state.isHost,
    players: state.players,
    lobbyCode: state.lobbyCode
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Lobby);