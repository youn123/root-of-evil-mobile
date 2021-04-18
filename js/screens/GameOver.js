import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  BackHandler
} from 'react-native';
import { connect } from 'react-redux';

import { PRIMARY, SECONDARY, ACCENT, ACCENT_HOT, ACCENT_WARM } from '../styles';

import RootOfEvil from '../root-of-evil';

import Lobby from '../lobby';
// import Lobby from '../mocks/lobby';
import appInsights from '../telemetry';

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: PRIMARY,
    height: '100%',
    justifyContent: 'flex-start'
  },
  header: {
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: SECONDARY,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center'
  },
  member: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: PRIMARY,
    flexDirection: 'row',
    backgroundColor: SECONDARY,
    alignItems: 'center'
  },
  borderButton: {
    color: 'white',
    borderColor: 'white',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 5,
    minWidth: 70,
    textAlign: 'center'
  }
});

class GameOver extends React.Component {
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    if (this.props.isHost) {
      appInsights.trackEvent({name: 'GameOver'}, {
        winner: this.props.winner,
        gameOverMessage: this.props.gameOverMessage
      });
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }

  handleBackButton = () => {
    return true;
  }

  render() {
    let youWon = <Text style={{fontSize: 28, color: ACCENT}}>You won!</Text>;
    let youLost = <Text style={{fontSize: 28, color: ACCENT_HOT}}>You lost.</Text>;

    let topLevelMessage = null;

    if (this.props.winner == RootOfEvil.Roles.FBI) {
      if (this.props.role == RootOfEvil.Roles.FBI) {
        topLevelMessage = youWon;
      } else {
        topLevelMessage = youLost;
      }
    } else {
      if (this.props.role == RootOfEvil.Roles.FBI) {
        topLevelMessage = youLost;
      } else {
        topLevelMessage = youWon;
      }
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={{
          marginTop: 20,
          paddingHorizontal: 10,
          flex: 1
        }}>
          {topLevelMessage}
          <Text>{this.props.gameOverMessage}</Text>
          {/* <View style={{flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10}}>
            <Text>Exp.</Text>
            <Text>+50</Text>
          </View>
          <Text>Total: 100</Text> */}
          <TouchableOpacity
            onPress={() => {
              this.props.clearStore();
            }}
            style={{marginTop: 20}}
          >
            <Text style={[styles.borderButton, {alignSelf: 'center'}]}>Main Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
};

function mapStateToProps(state) {
  return {
    gameState: state.state,
    winner: state.winner,
    gameOverMessage: state.gameOverMessage,
    role: state.role,
    isHost: state.isHost
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setAppState: appState => dispatch({type: 'SET_APP_STATE', appState}),
    clearStore: () => dispatch({type: 'CLEAR_STORE'})
  };
} 

export default connect(mapStateToProps, mapDispatchToProps)(GameOver);