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

import { PRIMARY, SECONDARY } from '../settings';

import { sleep, nextId } from '../utils';
import { TextBubble, RetroLoadingIndicator, Handles } from '../components';

import { ShowWhen } from '../hoc';
import Lobby from '../lobby';
// import Lobby from '../mocks/lobby';

const fakeVotes = {
  qin: null,
  youn: true,
  steve: false,
  p1: null,
  p2: null,
  p3: null,
  p4: null,
  p5: null,
  p6: null,
  p7: null,
  p8: null,
  p9: null,
  p10: null,
  p11: null,
  p12: null
};

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

class StatusReport extends React.Component {
  state = {
    screenState: 'Waiting' // enum('Waiting', 'StatusReport')
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }

  componentDidUpdate(prevProps) {
    if (this.props.gameState == 'MissionComplete' && this.props.gameState != prevProps.gameState) {
      this.setState({screenState: 'StatusReport'});
    }
  }

  handleBackButton = () => {
    return true;
  }

  setStateAsync = newState => {
    return new Promise((resolve, _) => {
      this.setState(newState, resolve);
    });
  }

  render() {
    let content = null;

    if (this.state.screenState == 'Waiting') {
      content = (
        <>
          <Text>Waiting for people to finish voting...</Text>
          <View style={{
            marginVertical: 20,
            height: '80%'
          }}>
            <ScrollView>
              {Object.keys(this.props.votes).map(member => {
                return (
                  <View style={styles.member}>
                    <Text>{member}</Text>
                    <ShowWhen condition={this.props.votes[member] === null}>
                      <Icon
                        name='hourglass-outline'
                        size={20}
                        color='#485696'
                      />
                    </ShowWhen>
                    <ShowWhen condition={this.props.votes[member]}>
                      <Icon
                        name='checkmark-circle-outline'
                        size={20}
                        color='#8ac926'
                      />
                    </ShowWhen>
                    <ShowWhen condition={this.props.votes[member] !== null && !this.props.votes[member]}>
                      <Icon
                        name='close-circle-outline'
                        size={20}
                        color='#ff595e'
                      />
                    </ShowWhen>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </>
      );
    } else {
      content = (
        <>
          <Text>Mission complete!</Text>
          <View style={{
            marginVertical: 20,
            height: '80%'
          }}>
          </View>
        </>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={{
          paddingHorizontal: 20,
          marginTop: 40,
          flex: 1
        }}>
          {content}
        </View>
      </SafeAreaView>
    );
  }
};

function mapStateToProps(state) {
  return {
    votes: state.votes,
    gameState: state.state
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StatusReport);