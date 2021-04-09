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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';

import { PRIMARY, SECONDARY, TERTIARY, ACCENT, ACCENT_WARM, ACCENT_HOT, ACCENT_COOL } from '../settings';

import { nextId } from '../utils';
import TextBubble from '../components/TextBubble';
import { ShowWhen } from '../hoc';
import RootOfEvil from '../root-of-evil';
import Lobby from '../lobby';
// import Lobby from '../mocks/lobby';

const styles = StyleSheet.create({
  container: {
    backgroundColor: PRIMARY,
    height: '100%',
    justifyContent: 'flex-end'
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: SECONDARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  input: {
    color: 'white',
    paddingVertical: 0,
    width: '90%',
    maxHeight: 60
  },
  header: {
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: SECONDARY,
    // position: 'absolute',
    top: 0,
    width: '100%'
  },
  nextButton: {
    backgroundColor: 'red',
    borderRadius: 40 / 2
  },
  messageContainer: {
    flexDirection: 'row',
    marginTop: 10
  },
  announcementLow: {
    fontStyle: 'italic',
    color: '#485696'
  },
  announcementHigh: {
    fontStyle: 'italic',
    color: '#58fcec'
  },
  missionIndicator: {
    backgroundColor: TERTIARY,
    borderRadius: 11,
    height: 22,
    width: 22,
    marginRight: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  missionIndicatorHighlighted: {
    borderWidth: 1.5,
    borderColor: ACCENT_WARM
  },
  timeGatedButtonOverlay: {
    height: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: 'black',
    opacity: 0.5,
    borderRadius: 3
  }
});

const fakeChat = [
  {from: 'steve', message: 'hello1', id: '0'},
  {from: 'chenchen', message: 'hello world\nhelloworld', id: '1'},
  {from: 'steve', message: 'hello2', id: '2'},
  {from: 'steve', message: 'hello3', id: '3'},
  {from: 'steve', message: 'hello4', id: '4'},
  {from: 'steve', message: 'hello5', id: '5'},
  {from: 'steve', message: 'hello6', id: '6'},
  {from: 'steve', message: 'hello7', id: '7'},
  {from: 'steve', message: 'hello8', id: '8'},
  {from: 'steve', message: 'hello9', id: '9'},
  {from: 'steve', message: 'hello10', id: '10'},
  {from: 'steve', message: 'hello11', id: '11'},
  {from: 'steve', message: 'hello12', id: '12'},
  {from: 'steve', message: 'hello13', id: '13'},
  {from: 'steve', message: 'hello14', id: '14'},
  {from: 'steve', message: 'hello15', id: '15'},
  {from: 'steve', message: 'hello16', id: '16'},
  {from: 'steve', message: 'hello17', id: '17'},
  {from: 'steve', message: 'hello18', id: '18'},
  {from: 'steve', message: 'hello19', id: '19'}
];

function MissionIndicator(props) {
  if (props.status === null) {
    return (
      <View style={[styles.missionIndicator, props.current && styles.missionIndicatorHighlighted]}>
        <Text style={{fontSize: 16, textAlignVertical: 'center'}}>{props.numPeople}</Text>
      </View>
    );
  } else if (props.status) {
    return <Icon name='checkmark-circle' color={ACCENT} size={20} style={{marginRight: 5}} />;
  } else {
    return <Icon name='skull' color={ACCENT_HOT} size={20} style={{marginRight: 5}} />;
  }
}

class TimeGatedButton extends React.Component {
  state = {
    width: 0,
    disabled: false
  }

  constructor(props) {
    super(props);
    props.myRef && props.myRef(this);
  }

  startCountdown = () => {
    if (this.countDown) {
      clearInterval(this.countDown);
    }

    this.setState({width: 100, disabled: true}, () => {
      this.countDown = setInterval(() => {
        let newWidth = this.state.width - 10;

        if (newWidth == 0) {
          this.setState({width: newWidth, disabled: false});

          clearInterval(this.countDown);
          this.countDown = undefined;
          this.props.onFinishCountdown();
        } else {
          this.setState({width: newWidth});
        }
      }, Math.floor(this.props.time / 10));
    });
  }

  render() {
    return (
      <TouchableOpacity onPress={() => {
        this.props.onPress && this.props.onPress();
      }} disabled={this.state.disabled} style={{height: 20}}>
        <Text style={{paddingHorizontal: 5, color: this.state.disabled ? 'grey' : 'white'}}>{this.props.text}</Text>
        <View style={[styles.timeGatedButtonOverlay, {width: `${this.state.width}%`}]} />
      </TouchableOpacity>
    );
  }
}

class MainChat extends React.Component {
  state = {
    text: '',
    scrollOffset: 0,
    endReached: true
  }

  componentDidMount() {
    Keyboard.addListener('keyboardDidShow', this.handleKeyboardDidShow);
    Keyboard.addListener('keyboardDidHide', this.handleKeyboardDidHide);

    this.props.navigation.addListener('focus', () => {
      // console.log('MainChat focused');
    });
  }

  componentWillUnmount() {
    Keyboard.removeListener('keyboardDidShow', this.handleKeyboardDidShow);
    Keyboard.removeListener('keyboardDidHide', this.handleKeyboardDidHide);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.endReached && prevProps.messages != this.props.messages) {
      this.flatListRef.scrollToEnd();
    }

    if (this.props.role == RootOfEvil.Roles.RootOfEvil) {
      if (this.props.privateChatLifeCycleState.type == 'None' && prevProps.privateChatLifeCycleState.type == 'Connected') {
        this.privateChatButton.startCountdown();
        this.props.setAbilityInCooldown(true);
      }
  
      if (this.props.privateChatLifeCycleState.type == 'Requested' && prevProps.privateChatLifeCycleState != this.props.privateChatLifeCycleState) {
        this.props.navigation.navigate('PrivateChat');
      }
    }
    
    if (this.props.gameState == 'Vote' && prevProps.gameState != this.props.gameState && this.props.handle != this.props.teamLead.handle) {
      this.props.navigation.navigate('Vote');
    }
  }

  handleBackButton = () => true;

  handleKeyboardDidShow = event => {
    const { height: windowHeight } = Dimensions.get('window');

    // console.log(`screen height: ${widnowHeight}`);
    // console.log(`keyboard height: ${event.endCoordinates.height}`);

    this.flatListRef.scrollToOffset({
      offset: this.state.scrollOffset + event.endCoordinates.height
    });
  }

  handleKeyboardDidHide = _ => {
    this.setState({keyboardHeight: 0});
  }

  handleSendMessage = () => {
    Lobby.getCurrentLobby().send({
      type: 'MESSAGE',
      from: this.props.handle,
      to: '__everyone',
      text: this.state.text,
      fromTeamLead: this.props.teamLead.handle == this.props.handle,
      ghostly: !this.props.alive,
      id: `${this.props.handle}-${nextId()}`
    })
      .then(() => {
        this.setState({text: ''});
      });
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
          <View style={{
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <View>
                <Icon
                  name='people-outline'
                  size={23}
                  color='white'
                /> 
              </View>
              <View style={{
                flexDirection: 'row'
              }}>
                <ShowWhen condition={this.props.teamLead.handle == this.props.handle}>
                  <TouchableOpacity onPress={() => {
                    this.props.navigation.navigate('ProposeTeam');
                  }}>
                    <Text style={{marginRight: 7}}>Propose team</Text>
                  </TouchableOpacity>
                </ShowWhen>
                <ShowWhen condition={this.props.role == RootOfEvil.Roles.RootOfEvil}>
                  <TimeGatedButton
                    text='Private chat'
                    time={60000}
                    // How to properly handle 'ref is not a prop' warning?
                    myRef={ref => {
                      this.privateChatButton = ref;
                    }}
                    onPress={() => {
                      this.props.navigation.navigate('PrivateChat');
                    }}
                    onFinishCountdown={() => {
                      this.props.setAbilityInCooldown(false);
                    }}
                  />
                </ShowWhen>
                <ShowWhen
                  condition={this.props.role == RootOfEvil.Roles.FBI}
                  style={{
                    alignItems: 'center'
                  }}
                >
                  <TouchableOpacity
                    disabled={this.props.numHacksRemaining == 0 || !this.props.alive}
                    onPress={() => {
                      this.props.navigation.navigate('Hack');
                    }}
                  >
                    <Text style={{marginRight: 3, color: (this.props.numHacksRemaining == 0 || !this.props.alive) ? TERTIARY : 'white'}}>Hack</Text>
                  </TouchableOpacity>
                  <View style={{
                    backgroundColor: TERTIARY,
                    paddingHorizontal: 2,
                    borderRadius: 2
                  }}>
                    <Text style={{color: (this.props.numHacksRemaining == 0 || !this.props.alive) ? SECONDARY : 'white'}}>{this.props.numHacksRemaining}</Text>
                  </View>
                </ShowWhen>
              </View>
            </View>
          </View>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 7
          }}>
            {this.props.missions.map((mission, index) => {
              return <MissionIndicator {...mission} current={this.props.currentMissionIndex == index} key={`${index}`} />;
            })}
          </View>
        </View>
        <View style={{flex: 1}}>
          <FlatList
            data={this.props.messages}
            renderItem={({item}) => <TextBubble {...item} />}
            keyExtractor={item => item.id}
            ref={ref => {
              this.flatListRef = ref;
            }}
            onScroll={({ nativeEvent }) => {
              // Scrolling up
              if (nativeEvent.contentOffset.y < this.state.scrollOffset) {
                console.log('[MainChat] Scrolling up');
                this.setState({
                  scrollOffset: nativeEvent.contentOffset.y,
                  endReached: false
                });
              } else {
                this.setState({
                  scrollOffset: nativeEvent.contentOffset.y
                });
              }
            }}
            scrollEventThrottle
            onEndReachedThreshold={0.05}
            onEndReached={() => {
              console.log(`[MainChat] onEndReached()`);
              this.setState({
                endReached: true
              });
            }}
            onContentSizeChange={() => {
              if (this.state.endReached) {
                this.flatListRef.scrollToEnd();
              } else if (this.props.messages.length != 0 && this.props.messages[this.props.messages.length - 1].from == this.props.handle) {
                this.flatListRef.scrollToEnd();
              }
            }}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            onChangeText={text => {
              this.setState({text});
            }}
            placeholder={this.props.alive ? 'Choose your words carefully' : 'You are dead. The living cannot hear you.'}
            placeholderTextColor={TERTIARY}
            multiline
            maxLength={140}
            value={this.state.text}
          />
          <TouchableOpacity onPress={this.handleSendMessage} disabled={this.state.text.length == 0}>
            <Icon
              name='send-outline'
              size={20}
              color={this.state.text.length != 0 ? 'white' : TERTIARY}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
};

function mapStateToProps(state) {
  return {
    isHost: state.isHost,
    messages: state.messages,
    handle: state.handle,
    missions: state.missions,
    currentMissionIndex: state.currentMissionIndex,
    abilityInCooldown: state.abilityInCooldown,
    privateChatLifeCycleState: state.privateChatLifeCycleState,
    role: state.role,
    numHacksRemaining: state.numHacksRemaining,
    teamLead: state.players[state.teamLeadIndex],
    alive: state.alive,
    gameState: state.state,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setAbilityInCooldown: abilityInCooldown => dispatch({type: 'SET_ABILITY_IN_COOLDOWN', abilityInCooldown}),
    setNumHacksRemaining: numHacks => dispatch({type: 'SET_NUM_HACKS_REMAINING', numHacks})
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainChat);