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
import { sleep, generateRandomBase64String } from '../utils';

import Lobby from '../lobby';
// import Lobby from '../mocks/lobby';

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
  },
  name: {
    color: 'red'
  }
});

function joinNames(names) {
  let texts = [];

  if (names.length == 0) {
    return '';
  }
  if (names.length == 1) {
    return names[0];
  }
  if (names.length == 2) {
    return (
      <Text>
        <Text style={styles.name}>{names[0]}</Text> and <Text style={styles.name}>{names[1]}</Text>
      </Text>
    );
  }

  for (let i = 0; i < names.length - 1; i++) {
    texts.push(<Text style={styles.name}>{names[i]}</Text>);
    texts.push(<Text>, </Text>);
  }

  return (
    <Text>
      {texts}
      <Text>and </Text>
      <Text style={styles.name}>{names[names.length - 1]}</Text>
    </Text>
  );
}

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
      from: '*',
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
            Work closely with {joinNames(this.props.evilMembers.filter(name => name != this.props.handle))}.
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

    // return (
    //   <SafeAreaView style={styles.container}>
    //     <View style={styles.header}>
    //       <Text style={{fontSize: 19}}>{this.props.lobbyCode}</Text>
    //       <ShowWhen condition={status == 'Waiting'}>
    //         <TouchableOpacity disabled>
    //           <Text style={[styles.nextButton, {backgroundColor: 'grey'}]}>Waiting...</Text>
    //         </TouchableOpacity>
    //       </ShowWhen>
    //       <ShowWhen condition={status == 'Ready'}>
    //         <TouchableOpacity onPress={this.handleNext}>
    //           <Text style={[styles.nextButton, {backgroundColor: 'green'}]}>Start!</Text>
    //         </TouchableOpacity>
    //       </ShowWhen>
    //     </View>
    //     <View style={{marginTop: 20}}>
    //       <ShowWhen condition={this.props.players.length == 1}>
    //         <Text>1 person has joined.</Text>
    //       </ShowWhen>
    //       <ShowWhen condition={this.props.players.length > 1}>
    //         <Text>{this.props.players.length} people have joined.</Text>
    //       </ShowWhen>
    //       <ScrollView contentContainerStyle={{width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly', marginTop: 10}}>
    //         {this.props.players.map(player => <Text style={{marginHorizontal: 10, fontSize: 18, marginTop: 10}} key={player}>{player}</Text>)}
    //       </ScrollView>
    //     </View>
    //   </SafeAreaView>
    // );
  }
};

function mapStateToProps(state) {
  return {
    isHost: state.isHost,
    evilMembers: state.evilMembers,
    role: state.role,
    handle: state.handle
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