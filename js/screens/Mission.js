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

import { PRIMARY, SECONDARY, TERTIARY, ACCENT, ACCENT_HOT, ACCENT_WARM } from '../settings';

import { sleep, nextId } from '../utils';
import { RetroLoadingIndicator, TextBubble } from '../components';
import RootOfEvil from '../root-of-evil';
import { getGameStateFromStore } from '../reducer';
import store from '../store';

import { ShowWhen } from '../hoc';
import Lobby from '../lobby';
// import Lobby from '../mocks/lobby';

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

class TypingText extends React.Component {
  state = {
    i: 0
  }

  componentDidMount() {
    this.typeText = setInterval(() => {
      this.setState({
        i: this.state.i + 1
      });

      if (this.state.i == this.props.text.length) {
        clearInterval(this.typeText);
        this.props.onFinish && this.props.onFinish();
      }
    }, 50);
  }

  render() {
    return <Text style={this.props.textStyle}>{this.props.text.substring(0, this.state.i)}</Text>;
  } 

} 

class Mission extends React.Component {
  state = {
    screenState: 'WaitingForVotes', // enum('WaitingForVotes', 'DoingMission', 'WaitingForMission', 'MissionComplete', 'MissionAborted')
    showResult: false
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }

  componentDidUpdate(prevProps) {
    if (this.props.gameState != prevProps.gameState) {
      console.log(`[Mission] componentDidUpdate() gameState: '${this.props.gameState}'`);

      if (this.props.gameState == 'MissionInProgress') {
        if (this.props.proposedTeam.includes(this.props.handle)) {
          this.setState({screenState: 'DoingMission'});
        } else {
          this.setState({screenState: 'WaitingForMission'});
        }
      } else if (this.props.gameState == 'MissionComplete') {
        this.setState({screenState: 'MissionComplete'});

        if (this.props.isHost) {
          let newGameState = RootOfEvil.tick(getGameStateFromStore(store));

          Lobby.getCurrentLobby().send({
            type: 'MESSAGE',
            from: '__announcement_high',
            to: '__everyone',
            id: `${this.props.handle}-${nextId()}`,
            text: `Team lead for mission #${newGameState.currentMissionIndex+1} is ${newGameState.players[newGameState.teamLeadIndex].handle}. Choose ${newGameState.missions[newGameState.currentMissionIndex].numPeople} people to go on the mission.`
          });
        }
      } else if (this.props.gameState == 'MissionAborted') {
        this.setState({screenState: 'MissionAborted'});

        if (this.props.isHost) {
          let newGameState = RootOfEvil.tick(getGameStateFromStore(store));

          Lobby.getCurrentLobby().send({
            type: 'MESSAGE',
            from: '__announcement_high',
            to: '__everyone',
            id: `${this.props.handle}-${nextId()}`,
            text: `Team lead for mission ${newGameState.currentMissionIndex} is ${newGameState.teamLead.handle}. Choose ${newGameState.currentMission.numPeople} people to go on the mission.`
          });
        }
      }
    }
  }

  handleBackButton = () => {
    return true;
  }

  handleDoMission = completeMission => {
    this.setState({screenState: 'WaitingForMission'});

    Lobby.getCurrentLobby().send({
      type: 'DO_MISSION',
      completeMission,
      from: this.props.handle
    });
  }

  setStateAsync = newState => {
    return new Promise((resolve, _) => {
      this.setState(newState, resolve);
    });
  }

  render() {
    let content = null;

    if (this.state.screenState == 'WaitingForVotes') {
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
                  <View style={styles.member} key={member}>
                    <Text>{member}</Text>
                    <ShowWhen condition={this.props.votes[member] === null}>
                      <Icon
                        name='hourglass-outline'
                        size={20}
                        color={TERTIARY}
                      />
                    </ShowWhen>
                    <ShowWhen condition={this.props.votes[member]}>
                      <Icon
                        name='checkmark-circle-outline'
                        size={20}
                        color={ACCENT}
                      />
                    </ShowWhen>
                    <ShowWhen condition={this.props.votes[member] !== null && !this.props.votes[member]}>
                      <Icon
                        name='close-circle-outline'
                        size={20}
                        color={ACCENT_HOT}
                      />
                    </ShowWhen>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </>
      );
    } else if (this.state.screenState == 'WaitingForMission') {
      content = (
        <>
          <Text>Mission is in progress...{<RetroLoadingIndicator />}</Text>
        </>
      );
    } else if (this.state.screenState == 'DoingMission') {
      content = (
        <>
          <Text>You have been selected to complete the mission.</Text>
          <Text style={{marginTop: 5}}>Complete or sabotage the mission.</Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-around', marginTop: 20}}>
            <TouchableOpacity onPress={() => {
              this.handleDoMission(true);
            }}>
              <Text style={styles.borderButton}>Complete</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              this.handleDoMission(false);
            }}>
              <Text style={[styles.borderButton, {color: ACCENT_HOT, borderColor: ACCENT_HOT}]}>Sabotage</Text>
            </TouchableOpacity>
          </View>
        </>
      );
    } else {
      if (this.props.missionStatus === null) {
        return null;
      }

      let leakedMessages = null;
      if (this.props.privateChatLeaked) {
        leakedMessages = (
          <FlatList
            data={this.props.privateChatLeaked}
            renderItem={({item}) => <TextBubble {...item} handleStyle={{color: 'red'}} textStyle={{color: 'red'}} bubbleStyle={{backgroundColor: 'transparent', marginVertical: 5}} />}
            keyExtractor={item => item.id}
          />
        );
      }

      let report = null;
      if (this.props.killAttempted) {
        if (this.props.killed) {
          report = (
            <>
              <Icon
                name='skull-outline'
                size={20}
                color='red'
                style={{alignSelf: 'center'}}
              />
              <Text style={{color: 'red'}}>While the mission was going on, Root of Evil killed <Text style={{fontWeight: 'bold'}}>{this.props.killed}</Text>.</Text>
              <ShowWhen condition={this.props.privateChatLeaked}>
                <Text style={{marginVertical: 5}}>FBI intercepted these private messages between Root of Evil members:</Text>
                <View style={{height: height * 0.3, backgroundColor: SECONDARY, borderRadius: 10}}>
                  {leakedMessages}
                </View>
              </ShowWhen>
            </>
          );
        } else {
          report = (
            <>
              <Icon
                name='warning-outline'
                size={20}
                color={ACCENT_WARM}
                style={{alignSelf: 'center'}}
              />
              <Text style={{color: ACCENT_WARM}}>Root of Evil tried to kill a member during the mission, but they failed.</Text>
              <ShowWhen condition={this.props.privateChatLeaked}>
                <Text style={{marginVertical: 5}}>FBI intercepted these private messages between Root of Evil members:</Text>
                <View style={{height: height * 0.3, backgroundColor: SECONDARY, borderRadius: 10}}>
                  {leakedMessages}
                </View>
              </ShowWhen>
            </>
          );
        }
      }

      content = (
        <>
          <TypingText
            text='----- MISSION STATUS -----'
            onFinish={() => {
              sleep(500)
                .then(() => {
                  this.setState({showResult: true});
                });
            }}
          />
          <ShowWhen condition={this.state.showResult}>
            {this.props.missionStatus ? <Text style={{color: ACCENT, fontSize: 24}}>Success</Text> : <Text style={{color: 'red', fontSize: 24}}>Failed</Text>}
            <View style={{
              marginTop: 5
            }}>
              <Text style={{marginBottom: 20, textAlignVertical: 'bottom'}}>{`${this.props.failMission} ${this.props.failMission == 1 ? 'member' : 'members'} sabotaged the mission.`}</Text>
              {report}
              <TouchableOpacity
                onPress={() => {
                  let newGameState = RootOfEvil.tick(getGameStateFromStore(store));

                  this.props.navigation.navigate('MainChat');

                  store.dispatch({
                    type: 'SET_GAME_STATE',
                    gameState: newGameState
                  });
                }}
                style={{marginTop: 20}}
              >
                <Text style={[styles.borderButton, {alignSelf: 'center'}]}>Continue</Text>
              </TouchableOpacity>
            </View>
          </ShowWhen>
        </>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={{
          paddingHorizontal: 10,
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
    gameState: state.state,
    proposedTeam: state.proposedTeam,
    handle: state.handle,
    missionStatus: state.missionStatus,
    currentMission: state.missions[state.currentMissionIndex],
    privateChatLeaked: state.privateChatLeaked,
    completeMission: state.completeMission,
    failMission: state.failMission,
    killAttempted: state.killAttempted,
    killed: state.killed,
    isHost: state.isHost
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setGameState: gameState => dispatch({type: 'SET_GAME_STATE', gameState}),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Mission);