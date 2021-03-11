import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from  'react-redux';

import { ShowWhen } from '../hoc';
import { SERVER_ADDR } from '../../env';
import RootOfEvil from '../root-of-evil';

// import Lobby from '../lobby';
import Lobby from '../mocks/lobby';

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

class Join extends React.Component {
  state = {
    code: '',
    inputValid: false,
    screenState: 'WaitingForInput' // enum('WaitingForInput', 'Loading', 'Failed')
  }

  validateInput = input => {
    return input.length == 5 && input.match(/^[a-zA-Z0-9]+$/g);
  }

  handleNext = () => {
    this.setStateAsync({screenState: 'Loading'})
      .then(() => {
        return Lobby.join(SERVER_ADDR, this.state.code);
      })
      .then(lobby => {
        // Save lobby code in store
        this.props.joinGame(lobby.lobbyId);

        this.props.navigation.navigate('Handle');
        this.setState({screenState: 'WaitingForInput'});
      });
  }

  setStateAsync = newState => {
    return new Promise((resolve, _) => {
      this.setState(newState, resolve);
    });
  }

  joinButtonDisabled = () => {
    return !this.state.inputValid || this.state.screenState == 'Loading';
  }

  render() {
    // let modal;

    // switch (this.state.modalState) {
    //   case 'LOADING':
    //     modal = (
    //       <View style={styles.modal}>
    //         <ActivityIndicator size='large' color='grey' />
    //       </View>
    //     );
    //     break;
    //   default:
    //     modal = null;
    //     break;
    // }

    return (
      <SafeAreaView style={styles.container}>
        {/* <Modal
          animationType='none'
          visible={this.state.modalState != 'HIDDEN'}
          transparent
        >>

          </View>
          <View style={styles.modalBackground}>
            {modal}
          </View>
        </Modal> */}
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
              {backgroundColor: this.joinButtonDisabled() ? 'grey' : 'red'}
            ]}
            disabled={this.joinButtonDisabled()}
            onPress={this.handleNext}
          >
            <Icon
              name='chevron-forward-outline'
              size={40}
              color='white'
            />
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Enter the lobby code:</Text>
          <TextInput
            style={styles.input}
            maxLength={5}
            onChangeText={text => {
              this.setState({
                code: text,
                inputValid: this.validateInput(text),
                screenState: 'WaitingForInput'
              });
            }}
          />
          <View style={styles.messageContainer}>
            <ShowWhen condition={this.state.screenState == 'Loading'}>
              <Text style={{color: 'grey'}}>Trying to join {this.state.input}...</Text>
              <ActivityIndicator size='small' color='grey' />
            </ShowWhen>
            <ShowWhen condition={this.state.screenState == 'Failed'}>
              <Text style={{color: 'red'}}>Failed to join {this.state.input}.</Text>
            </ShowWhen>
          </View>
        </View>
      </SafeAreaView>
    );
  }
};

function mapStateToProps(state) {
  return {
    members: state.members,
    isHost: state.isHost
  };
}

function mapDispatchToProps(dispatch) {
  return {
    joinGame: lobbyCode => dispatch({type: 'JOIN_GAME', lobbyCode: lobbyCode, gameState: RootOfEvil.createNew()})
  };
} 

export default connect(mapStateToProps, mapDispatchToProps)(Join);