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
import { sleep, generateRandomBase64String } from '../utils';
import { Handles } from '../components';

// import Lobby from '../lobby';
import Lobby from '../mocks/lobby';

const PRIMARY = '#0D0628';

const styles = StyleSheet.create({
  container: {
    backgroundColor: PRIMARY,
    height: '100%',
    padding: 20
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
    borderColor: 'white',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 5
  }
});

class RoleAssignment extends React.Component {
  state = {
    screenState: 'Loading'
  };

  componentDidMount() {
    if (this.props.isHost) {
      sleep(2000)
        .then(() => {
          let { newGameState } = RootOfEvil.startWithConfig(getGameStateFromStore(store.getState()), {
            numEvilMembers: 1
          });
    
          this.props.setGameState(newGameState);
    
          Lobby.getCurrentLobby().send({
            ...newGameState,
            type: 'NEW_GAME_STATE',
            to: '__everyone'
          });

          Lobby.getCurrentLobby().send({
            type: 'MESSAGE',
            from: '__announcement_high',
            to: '__everyone',
            text: `Team lead for mission ${this.props.currentMission} is ${this.props.players[this.props.teamLead]}. Choose ${this.props.missions[this.props.currentMission].numPeople} people to go on the mission.`
          })
        });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.evilMembers != this.props.evilMembers) {
      if (this.props.evilMembers.includes(this.props.handle)) {
        this.props.setRole(RootOfEvil.Roles.RootOfEvil);
      } else {
        this.props.setRole(RootOfEvil.Roles.FBI);
      }
    }
  }

  handleContinue = () => {
    Lobby.getCurrentLobby().send({
      type: 'MESSAGE',
      from: '__announcement_low',
      to: '__everyone',
      text: `${this.props.handle} has joined the chat.`,
      id: generateRandomBase64String(5)
    });

    this.props.setAppState('InGame');
  }

  setStateAsync = newState => {
    return new Promise((resolve, _) => {
      this.setState(newState, resolve);
    });
  }

  render() {
    if (!this.props.role) {
      return (
        <SafeAreaView style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
          <View>
            <Text>Waiting to receive your role...</Text>
          </View>
        </SafeAreaView>
      );
    }

    if (this.props.role == RootOfEvil.Roles.RootOfEvil) {
      return (
        <SafeAreaView style={[styles.container, {justifyContent: 'center'}]}>
          <Text style={{fontSize: 28}}>
            You are a <Text style={{color: 'red'}}>Root of Evil</Text> operative.
          </Text>
          <Text style={{marginTop: 20}}>
            Your job is to sabotage the FBI from within.
          </Text>
          <Text>
            Work closely with <Handles names={this.props.evilMembers.filter(name => name != this.props.handle)} nameColor='red' />.
          </Text>
          <TouchableOpacity
            style={{alignSelf: 'center', marginTop: 20}}
            onPress={this.handleContinue}
          >
            <Text style={styles.nextButton}>Continue</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    } else if (this.props.role == RootOfEvil.Roles.FBI) {
      return (
        <SafeAreaView style={[styles.container, {justifyContent: 'center'}]}>
          <Text style={{fontSize: 28}}>
            You are an <Text style={{color: '#485696'}}>FBI</Text> agent.
          </Text>
          <Text style={{marginTop: 20}}>
            Your job is to complete missions successfully.
          </Text>
          <TouchableOpacity
            style={{alignSelf: 'center', marginTop: 20}}
            onPress={this.handleContinue}
          >
            <Text style={styles.nextButton}>Continue</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }
  }
};

function mapStateToProps(state) {
  return {
    isHost: state.isHost,
    evilMembers: state.evilMembers,
    role: state.role,
    handle: state.handle,
    currentMission: state.currentMission,
    teamLead: state.teamLead,
    players: state.players,
    missions: state.missions
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setAppState: appState => dispatch({type: 'SET_APP_STATE', appState}),
    setGameState: gameState => dispatch({type: 'SET_GAME_STATE', gameState}),
    setRole: role => dispatch({type: 'SET_ROLE', role})
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RoleAssignment);