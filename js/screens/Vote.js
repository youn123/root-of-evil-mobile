import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Dimensions,
  ScrollView,
  BackHandler
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';

import { PRIMARY, SECONDARY, ACCENT_WARM, ACCENT_HOT } from '../styles';

import { sleep, nextId } from '../utils';
import { Handles } from '../components';
import RootOfEvil from '../root-of-evil';

import Lobby from '../lobby';
// import Lobby from '../mocks/lobby';

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
    borderRadius: 5
  }
});

class Vote extends React.Component {
  componentDidMount() {
    if (!this.props.alive) {
      this.props.navigation.navigate('Mission');
    }
    
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
  }

  handleBackButton = () => {
    return true;
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }

  handleVote = accept => {
    Lobby.getCurrentLobby().send({
      type: 'VOTE',
      accept,
      from: this.props.handle
    });

    if (this.props.role == RootOfEvil.Roles.RootOfEvil) {
      this.props.navigation.navigate('Kill');
    } else {
      this.props.navigation.navigate('Mission');
    }
  }

  setStateAsync = newState => {
    return new Promise((resolve, _) => {
      this.setState(newState, resolve);
    });
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{
          paddingHorizontal: 20,
          marginTop: 40,
          flex: 1
        }}>
          <Text>
            <Handles names={[this.props.teamLead.handle]} handleStyle={{fontWeight: 'bold'}} /> has proposed the following team: <Handles names={[...this.props.proposedTeam]} handleStyle={{fontWeight: 'bold'}} />.
          </Text>
          <Text style={{marginTop: 5}}>Do you accept?</Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-around', marginTop: 20}}>
            <TouchableOpacity onPress={() => {
              this.handleVote(true);
            }}>
              <Text style={styles.borderButton}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              this.handleVote(false);
            }}>
              <Text style={[styles.borderButton, {color: ACCENT_HOT, borderColor: ACCENT_HOT}]}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }
};

function mapStateToProps(state) {
  return {
    handle: state.handle,
    teamLead: state.players[state.teamLeadIndex],
    votes: state.votes,
    proposedTeam: state.proposedTeam,
    role: state.role,
    alive: state.alive
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Vote);