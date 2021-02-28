import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';

import { ShowWhen } from '../hoc';
import { SERVER_ADDR } from '../../env';
import Lobby from '../lobby';
import RootOfEvil from '../root-of-evil';

// FOR TESTING ONLY
import Mocks from '../mocks';

const PRIMARY = '#0D0628';

const styles = StyleSheet.create({
  container: {
    backgroundColor: PRIMARY,
    height: '100%',
    paddingLeft: 10
  },
  statusMessageContainer: {
    marginLeft: 20,
    marginTop: 10,
    paddingRight: 20
  },
  statusMessage: {
    fontSize: 16
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
  }
});

class New extends React.Component {
  state = {
    code: '',
    screenState: 'Loading' // enum(Loading', 'Failed', 'Succeeded')
  }

  componentDidMount() {
    Lobby.create(SERVER_ADDR)
      .then(lobby => {
        console.log(`Got lobbyId: ${lobby.lobbyId}`);
        
        this.props.hostNewGame(lobby.lobbyId);
        this.setState({screenState: 'Succeeded'});
      })
      .catch(err => {
        this.setState({screenState: 'failed'});
      });
  }

  handleNext = () => {
    this.props.navigation.navigate('Handle');
  }

  nextButtonDisabled = () => {
    return this.state.screenState == 'Loading';
  }

  setStateAsync = newState => {
    return new Promise((resolve, _) => {
      this.setState(newState, resolve);
    });
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
          </TouchableOpacity>
        </View>
        <View style={styles.statusMessageContainer}>
          <ShowWhen condition={this.state.screenState == 'Loading'}>
            <Text style={styles.statusMessage}>Contacting server...</Text>
          </ShowWhen>
          <ShowWhen condition={this.state.screenState == 'Succeeded'}>
            <Text style={styles.statusMessage}>Succesfully created a new lobby!</Text>
            <Text style={styles.statusMessage}>Continue.</Text>
          </ShowWhen>
        </View>
      </SafeAreaView>
    );
  }
};

function mapDispatchToProps(dispatch) {
  return {
    hostNewGame: lobbyCode => dispatch({type: 'HOST_NEW_GAME', lobbyCode, gameState: RootOfEvil.createNew()})
  };
}

export default connect(null, mapDispatchToProps)(New);