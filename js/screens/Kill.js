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

class Kill extends React.Component {
  state = {
    selected: null
  }

  handleSelect = member => {
    if (this.state.selected == member) {
      this.setState({selected: null});
    } else {
      this.setState({selected: member});
    }
  }

  handleContinue = async () => {
    Lobby.getCurrentLobby().send({
      type: 'KILL',
      from: this.props.handle,
      victim: this.state.selected ? this.state.selected : '__None'
    });

    this.props.navigation.navigate('Mission');
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
        </View>
        <View style={{
            marginTop: 20,
            paddingHorizontal: 20
          }}>
          <Text style={{
            marginBottom: 5
          }}>Choose a member to kill.</Text>
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
                  <View style={[styles.selectionOption, {backgroundColor: this.state.selected == member ? '#485696' : SECONDARY}]}>
                    <Text>{member}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        <TouchableOpacity
          style={{alignSelf: 'center', marginTop: 20}}
          onPress={this.handleContinue}
        >
          <Text style={styles.borderButton}>Continue</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
};

function mapStateToProps(state) {
  return {
    players: state.players,
    handle: state.handle
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Kill);