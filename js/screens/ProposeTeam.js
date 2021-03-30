import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';

import { PRIMARY, SECONDARY } from '../settings';
import RootOfEvil from '../root-of-evil';

// import Lobby from '../lobby';
import Lobby from '../mocks/lobby';

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
  selectionOption: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: PRIMARY
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

class ProposeTeam extends React.Component {
  state = {
    selected: {}
  }

  handleSelect = member => {
    let selectedCopy = {...this.state.selected};

    if (selectedCopy.hasOwnProperty(member)) {
      delete selectedCopy[member];
    } else {
      if (Object.keys(this.state.selected) == this.props.currentMission.numPeople) {
        return;
      }

      selectedCopy[member] = true;
    }

    this.setState({selected: selectedCopy});
  }

  handlePropose = async () => {
    Lobby.getCurrentLobby().send({
      type: 'PROPOSE_TEAM',
      from: this.props.handle,
      to: '__everyone',
      proposedTeam: Object.keys(this.state.selected)
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
        <View style={[styles.header, {backgroundColor: PRIMARY}]}>
          <View>
            <TouchableOpacity
              onPress={() => {
                this.props.navigation.goBack();
              }}
            >
              <Icon
                name='chevron-back-outline'
                size={40}
                color='#485696'
              /> 
            </TouchableOpacity>
          </View>
        </View>
        <View style={{
            marginTop: 20,
            paddingHorizontal: 20
          }}>
          <Text style={{
            marginBottom: 5
          }}>Choose {this.props.currentMission.numPeople} members to go on the mission.</Text>
        </View>
        <View>
          <ScrollView contentContainerStyle={{
            marginTop: 20,
            paddingHorizontal: 20
          }}>
            {this.props.players.map(member => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    this.handleSelect(member);
                  }}
                >
                  <View style={[styles.selectionOption, {backgroundColor: this.state.selected.hasOwnProperty(member) ? '#485696' : SECONDARY}]}>
                    <Text>{member}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        <TouchableOpacity
          style={{alignSelf: 'center', marginTop: 20}}
          onPress={this.handlePropose}
        >
          <Text style={styles.borderButton}>Propose</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
};

function mapStateToProps(state) {
  return {
    players: state.players,
    missions: state.missions,
    currentMission: state.missions[state.currentMissionIndex],
    handle: state.handle,
    gameState: state.state,
    role: state.role
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProposeTeam);