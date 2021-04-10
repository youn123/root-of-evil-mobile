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
import { connect, useStore } from 'react-redux';

import { ShowWhen } from '../hoc';
import { getGameStateFromStore } from '../reducer';
import store from '../store';
import RootOfEvil from '../root-of-evil';

// import Lobby from '../lobby';
import Lobby from '../mocks/lobby';
import { clientHandleRootOfEvilMessage } from '../message-handler';
import { PRIMARY, SECONDARY, ACCENT, ACCENT_HOT } from '../styles';

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
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  nextButton: {
    backgroundColor: 'red',
    borderRadius: 40 / 2
  },
  messageContainer: {
    flexDirection: 'row',
    marginTop: 10
  }
});

class Handle extends React.Component {
  state = {
    handle: '',
    inputLengthValid: false,
    screenState: 'WaitingForInput', // enum('WaitingForInput', 'Loading', 'Failed')
    errMessage: ''
  }

  componentDidMount() {
    if (!this.props.isHost) {
      Lobby.getCurrentLobby().listen(messages => {
        clientHandleRootOfEvilMessage(messages, Lobby.getCurrentLobby(), store);
      });
    }
  }

  componentWillUnmount() {
  }

  validateInputLength = input => {
    return input.length > 0 && input.length <= 16;
  }

  validateInput = async input => {
    if (!input.match(/^[a-zA-Z0-9_/-]+$/g)) {
      throw new Error('Name must consist of letters, numbers, and underscore.');
    }

    if (!this.props.isHost) {
      return Lobby.getCurrentLobby().send({
        type: 'JOIN',
        handle: input,
      }, returnResponse=true)
        .then(res => {
          if (res.result != 'Accepted') {
            throw new Error(res.message);
          }
        });
    } else {
      let gameState = getGameStateFromStore(store);

      let { newGameState } = RootOfEvil.apply(gameState, {
        type: 'JOIN',
        handle: input,
      });

      this.props.setGameState(newGameState);
      Lobby.getCurrentLobby().send({
        ...newGameState,
        type: 'NEW_GAME_STATE',
        to: '__everyone'
      });
    }
  }

  handleNext = () => {
    this.setStateAsync({screenState: 'Loading'})
      .then(() => {
        return this.validateInput(this.state.handle);
      })
      .then(() => {
        this.setState({screenState: 'WaitingForInput'});
        this.props.setHandle(this.state.handle);
        // Switch navigation stack
        this.props.setAppState('Lobby');
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
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={this.props.navigation.goBack}>
            <Icon
              name='chevron-back-outline'
              size={40}
              color='white'
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.nextButton,
              {backgroundColor: this.nextButtonDisabled() ? SECONDARY : ACCENT_HOT}
            ]}
            disabled={this.nextButtonDisabled()}
            onPress={this.handleNext}
          >
            <Icon
              name='chevron-forward-outline'
              size={40}
              color={PRIMARY}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Enter your name:</Text>
          <TextInput
            style={styles.input}
            maxLength={16}
            onChangeText={text => {
              this.setState({
                handle: text,
                inputLengthValid: this.validateInputLength(text),
                screenState: 'WaitingForInput'
              });
            }}
          />
          <View style={styles.messageContainer}>
            <ShowWhen condition={this.state.screenState == 'Loading'}>
              <Text style={{color: 'grey'}}>Validating{this.state.input}...</Text>
              <ActivityIndicator size='small' color='grey' />
            </ShowWhen>
            <ShowWhen condition={this.state.screenState == 'Failed'}>
              <Text style={{color: 'red'}}>{this.state.errMessage}</Text>
            </ShowWhen>
          </View>
        </View>
        <ScrollView contentContainerStyle={{width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly', marginTop: 10}}>
          {this.props.players.map(player => <Text style={{marginHorizontal: 10, fontSize: 18, marginTop: 10}} key={player.handle}>{player.handle}</Text>)}
        </ScrollView>
      </SafeAreaView>
    );
  }
};

function mapStateToProps(state) {
  return {
    isHost: state.isHost,
    lobbyCode: state.lobbyCode,
    players: state.players
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setAppState: appState => dispatch({type: 'SET_APP_STATE', appState}),
    setGameState: gameState => dispatch({type: 'SET_GAME_STATE', gameState}),
    setHandle: handle => dispatch({type: 'SET_HANDLE', handle})
  };
} 

export default connect(mapStateToProps, mapDispatchToProps)(Handle);