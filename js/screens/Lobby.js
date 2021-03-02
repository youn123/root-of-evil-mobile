import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';

import RootOfEvil from '../root-of-evil';
import { getGameStateFromStore } from '../reducer';
import store from '../store';
import { ShowWhen } from '../hoc';

// import { getCurrentLobby } from '../lobby';
import { getCurrentLobby } from '../mocks/lobby';

const PRIMARY = '#0D0628';

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
        console.log(`Received ${messages.length} messages.`);
        let finalGameState;
  
        for (let message of messages) {
          switch (message.type) {
            case 'NEW_GAME_STATE':
              // I'm host, so I already have the latest game state
              break;
            case 'JOIN':
              let { newGameState, response } = RootOfEvil.apply(getGameStateFromStore(store.getState()), message);
              finalGameState = newGameState;
              getCurrentLobby().send(response);
              break;
            case 'MESSAGE':
              store.dispatch({
                type: 'ADD_MESSAGE',
                message
              });
          }
        }
  
        if (finalGameState) {
          getCurrentLobby().send({
            type: 'NEW_GAME_STATE',
            to: 'everyone',
            ...finalGameState
          });

          this.props.setGameState(finalGameState);
        }
      });
    }
  }

  handleNext = () => {
    this.props.navigation.navigate('MainChat');
  }

  setStateAsync = newState => {
    return new Promise((resolve, _) => {
      this.setState(newState, resolve);
    });
  }

  render() {
    let status = this.props.players.length > 0 ? 'Ready' : 'Waiting';

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={{fontSize: 19}}>{this.props.lobbyCode}</Text>
          <ShowWhen condition={status == 'Waiting'}>
            <TouchableOpacity disabled>
              <Text style={[styles.nextButton, {backgroundColor: 'grey'}]}>Waiting...</Text>
            </TouchableOpacity>
          </ShowWhen>
          <ShowWhen condition={status == 'Ready'}>
            <TouchableOpacity onPress={this.handleNext}>
              <Text style={[styles.nextButton, {backgroundColor: 'green'}]}>Start!</Text>
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
            {this.props.players.map(player => <Text style={{marginHorizontal: 10, fontSize: 18, marginTop: 10}} key={player}>{player}</Text>)}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
};

function mapStateToProps(state) {
  return {
    members: state.members,
    isHost: state.isHost,
    players: state.players,
    lobbyCode: state.lobbyCode
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setAppState: appState => dispatch({type: 'SET_APP_STATE', payload: appState}),
    setMembers: members => dispatch({type: 'SET_MEMBERS', payload: members}),
    setGameState: gameState => dispatch({type: 'SET_GAME_STATE', gameState: gameState}),
    addMessage: message => dispatch({type: 'ADD_MESSAGE', message})
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Lobby);