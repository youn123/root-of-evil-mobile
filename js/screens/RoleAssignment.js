import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Animated,
  Image,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';

import RootOfEvil from '../root-of-evil';
import { getGameStateFromStore } from '../reducer';
import store from '../store';
import { sleep, generateRandomBase64String, nextId } from '../utils';
import { Handles } from '../components';

import Lobby from '../lobby';
// import Lobby from '../mocks/lobby';
import { ShowWhen } from '../hoc';

import { PRIMARY, ACCENT_COOL, ACCENT_HOT } from '../styles';
import { calculateNumHacks } from '../game-settings';

const { height } = Dimensions.get('window');

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
    screenState: 'Loading',
    showInstructions: false
  };

  componentDidMount() {
    if (this.props.isHost) {
      sleep(2000)
        .then(() => {
          let newGameState = RootOfEvil.start(getGameStateFromStore(store));
    
          this.props.setGameState(newGameState);
    
          Lobby.getCurrentLobby().send({
            ...newGameState,
            type: 'NEW_GAME_STATE',
            to: '__everyone',
          });

          Lobby.getCurrentLobby().send({
            type: 'MESSAGE',
            from: '__announcement_high',
            to: '__everyone',
            id: `${this.props.handle}-${nextId()}`,
            text: `Team lead is ${this.props.teamLead.handle}.`
          });
        });
    }

    this.animateLogo = new Animated.Value(0);
    this.moveLogo = new Animated.Value(0);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.role != this.props.role) {
      this.props.setNumHacksRemaining(calculateNumHacks(getGameStateFromStore(store)));

      Animated.sequence([
        Animated.timing(this.animateLogo, {
          toValue: 2,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.delay(500),
        Animated.parallel([
          Animated.timing(this.moveLogo, {
            toValue: -100,
            duration: 500,
            useNativeDriver: true
          }),
          Animated.timing(this.animateLogo, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          })
        ])
      ]).start(() => {
        this.setState({showInstructions: true});
      });
    }
  }

  handleContinue = () => {
    Lobby.getCurrentLobby().send({
      type: 'MESSAGE',
      from: '__announcement_low',
      to: '__everyone',
      text: `${this.props.handle} has joined the chat.`,
      id: `${this.props.handle}-${nextId()}`,
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
        <SafeAreaView style={[styles.container, {justifyContent: 'flex-start', alignItems: 'center'}]}>
          <Animated.Image
            style={{
              transform: [{scale: this.animateLogo}, {translateY: this.moveLogo}],
              width: 125,
              height: 125,
              margin: 0,
              position: 'absolute',
              top: '40%'
            }}
            source={require('../../assets/RootOfEvil.png')}
          />
          <ShowWhen condition={this.state.showInstructions}>
            <View style={{position: 'absolute', bottom: '20%'}}>
              {/* <View style={{backgroundColor: 'red', width: 100, height: 100}} /> */}
              <Text style={{fontSize: 28}}>
                You are a <Text style={{color: ACCENT_HOT}}>Root of Evil</Text> operative.
              </Text>
              <Text style={{marginTop: 20}}>
                Your job is to sabotage the FBI from within. Work closely with <Handles names={this.props.evilMembers.filter(player => player.handle != this.props.handle).map(player => player.handle)} nameColor={ACCENT_HOT} />.
              </Text>
              <TouchableOpacity
                style={{alignSelf: 'center', marginTop: 20}}
                onPress={this.handleContinue}
              >
                <Text style={styles.nextButton}>Continue</Text>
              </TouchableOpacity>
            </View>
          </ShowWhen>
        </SafeAreaView>
      );
    } else if (this.props.role == RootOfEvil.Roles.FBI) {
      return (
        <SafeAreaView style={[styles.container, {justifyContent: 'flex-start', alignItems: 'center'}]}>
          <Animated.Image
            style={{
              transform: [{scale: this.animateLogo}, {translateY: this.moveLogo}],
              width: 125,
              height: 125,
              margin: 0,
              position: 'absolute',
              top: '40%'
            }}
            source={require('../../assets/FBI.png')}
          />
          <ShowWhen condition={this.state.showInstructions}>
            <View style={{position: 'absolute', bottom: '18%'}}>
              <Text style={{fontSize: 28}}>
                You are an <Text style={{color: ACCENT_COOL}}>FBI</Text> agent.
              </Text>
              <Text style={{marginTop: 10}}>
                Your job is to complete missions successfully.
              </Text>
              <Text style={{marginTop: 5}}>
                Try to find who the Root of Evil operatives are with your deduction and hacking skills.
              </Text>
              <Text style={{marginTop: 5}}>
                Don't draw their attention--your life may be in danger if you do.
              </Text>
              <TouchableOpacity
                style={{alignSelf: 'center', marginTop: 20}}
                onPress={this.handleContinue}
              >
                <Text style={styles.nextButton}>Continue</Text>
              </TouchableOpacity>
            </View>
          </ShowWhen>
        </SafeAreaView>
      );
    }
  }
}

function mapStateToProps(state) {
  return {
    isHost: state.isHost,
    evilMembers: state.evilMembers,
    role: state.role,
    handle: state.handle,
    currentMissionIndex: state.currentMissionIndex,
    currentMission: state.missions[state.currentMissionIndex],
    teamLead: state.players[state.teamLeadIndex],
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setAppState: appState => dispatch({type: 'SET_APP_STATE', appState}),
    setGameState: gameState => dispatch({type: 'SET_GAME_STATE', gameState}),
    setRole: role => dispatch({type: 'SET_ROLE', role}),
    setNumHacksRemaining: numHacks => dispatch({type: 'SET_NUM_HACKS_REMAINING', numHacks})
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RoleAssignment);