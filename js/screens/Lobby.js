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

import { ShowWhen } from '../hoc';
import RootOfEvil from '../root-of-evil';
import { getGameStateFromStore } from '../reducer';
import { getCurrentLobby } from '../lobby';
import store from '../store';

// FOR TESTING ONLY
import Mocks from '../mocks';

const PRIMARY = '#0D0628';

const styles = StyleSheet.create({
  container: {
    backgroundColor: PRIMARY,
    height: '100%',
    paddingLeft: 10
  },
  modalBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modal: {
    width: 250,
    height: 200,
    padding: 10,
    backgroundColor: PRIMARY,
    elevation: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputContainer: {
    marginLeft: 20,
    marginTop: 10,
    paddingRight: 20
  },
  inputLabel: {
    fontSize: 16
  },
  input: {
    fontSize: 32,
    color: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'grey'
  },
  header: {
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  nextButton: {
    backgroundColor: 'red',
    borderRadius: 40 / 2
  },
  statusMessage: {
    backgroundColor: 'grey',
    color: 'white',
    padding: 5,
    borderRadius: 5
  }
});

class Lobby extends React.Component {
  state = {
  }

  componentDidMount() {
    // setInterval(() => {
    //   this.props.setMembers([...this.props.members, 'Doh!']);
    // }, 7000);

    if (this.props.isHost) {
      getCurrentLobby().listen(messages => {
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
    this.setStateAsync({screenState: 'Loading'})
      .then(() => {
        return this.validateInput(this.state.input);
      })
      .then(errMessage => {
        if (!errMessage) {
          throw new Error(errMessage);
        }

        this.setState({screenState: 'WaitingForInput'});
        this.props.setAppState('InGame');
      })
      .catch(err => {
        this.setState({
          screenState: 'Failed',
          errMessage: err.message
        });
      })
  }

  setStateAsync = newState => {
    return new Promise((resolve, _) => {
      this.setState(newState, resolve);
    });
  }

  nextButtonDisabled = () => {
    return !this.state.inputLengthValid || this.state.screenState == 'Loading';
  }

  render() {
    let status = 'Waiting...';

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          {/* <TouchableOpacity
            style={[
              styles.nextButton,
              {backgroundColor: this.nextButtonDisabled() ? 'grey' : 'red'}
            ]}
            disabled={this.nextButtonDisabled()}
            onPress={this.handleNext}
          >
            <Icon
              name='chevron-forward-outline'
              size={40}
              color='white'
            />
          </TouchableOpacity> */}
          <Text style={styles.statusMessage}>{status}</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text>Lorem ipsum...</Text>
        </View>
        <ScrollView contentContainerStyle={{width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly', marginTop: 10}}>
          {this.props.players.map(player => <Text style={{marginHorizontal: 10, fontSize: 18, marginTop: 10}} key={player}>{player}</Text>)}
        </ScrollView>
      </SafeAreaView>
    );
  }
};

function mapStateToProps(state) {
  return {
    members: state.members,
    isHost: state.isHost,
    players: state.players
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setAppState: appState => dispatch({type: 'SET_APP_STATE', payload: appState}),
    setMembers: members => dispatch({type: 'SET_MEMBERS', payload: members}),
    setGameState: gameState => dispatch({type: 'SET_GAME_STATE', gameState: gameState})
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Lobby);

// export default Handle;