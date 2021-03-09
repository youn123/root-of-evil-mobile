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
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  Dimensions,
  BackHandler
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';

import { PRIMARY, SECONDARY } from '../settings';

import { generateRandomBase64String, appendAndIncrement } from '../utils';
import TextBubble from '../components/TextBubble';
// import Lobby from '../lobby';
import Lobby from '../mocks/lobby';

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
    color: '#F4D35E'
  },
  missionIndicator: {
    backgroundColor: '#717C89',
    borderRadius: 11,
    height: 22,
    width: 22,
    marginRight: 7,
    alignItems: 'center',
    justifyContent: 'center'
  },
  missionIndicatorHighlighted: {
    borderWidth: 1.5,
    borderColor: '#F4D35E'
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
  return (
    <View style={[styles.missionIndicator, props.current && styles.missionIndicatorHighlighted]}>
      <Text style={{fontSize: 16, textAlignVertical: 'center'}}>{props.numPeople}</Text>
    </View>
  );
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

    // BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    this.props.navigation.addListener('focus', () => {
      console.log('MainChat focused');
    });
  }

  componentWillUnmount() {
    Keyboard.removeListener('keyboardDidShow', this.handleKeyboardDidShow);
    Keyboard.removeListener('keyboardDidHide', this.handleKeyboardDidHide);
    // BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.endReached && prevProps.messages != this.props.messages) {
      this.flatListRef.scrollToEnd();
    }

    if (this.props.privateChatLifeCycleState.type == 'None' && prevProps.privateChatLifeCycleState.type == 'Connected') {
      this.timeGatedButton.startCountdown();
    }

    if (this.props.privateChatLifeCycleState.type == 'Requested' && prevProps.privateChatLifeCycleState != this.props.privateChatLifeCycleState) {
      this.props.navigation.navigate('PrivateChat');
    }
  }

  handleBackButton = () => true;

  handleKeyboardDidShow = event => {
    const { height: widnowHeight } = Dimensions.get('window');

    console.log(`screen height: ${widnowHeight}`);
    console.log(`keyboard height: ${event.endCoordinates.height}`);

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
      id: appendAndIncrement(this.props.handle)
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
                  color='#485696'
                /> 
              </View>
              <View style={{
                flexDirection: 'row'
              }}>
                <Text style={{marginRight: 7}}>Propose team</Text>
                <TimeGatedButton
                  text='Private chat'
                  time={60000}
                  // How to properly handle 'ref is not a prop' warning?
                  myRef={ref => {
                    this.timeGatedButton = ref;
                  }}
                  onPress={() => {
                    this.props.navigation.navigate('PrivateChat');
                  }}
                  onFinishCountdown={() => {
                    this.props.setAbilityInCooldown(false);
                  }}
                />
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
              return <MissionIndicator {...mission} current={this.props.currentMission == index} />;
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
              console.log(nativeEvent.contentOffset.y);

              // Scrolling up
              if (nativeEvent.contentOffset.y < this.state.scrollOffset) {
                console.log('Scrolling up');
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
              console.log('onEndReached()');
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
            placeholder='Choose your words carefully.'
            placeholderTextColor='#485696'
            multiline
            maxLength={140}
            value={this.state.text}
          />
          <TouchableOpacity onPress={this.handleSendMessage}>
            <Icon
              name='send-outline'
              size={20}
              color='white'
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
    players: state.players,
    messages: state.messages,
    handle: state.handle,
    missions: state.missions,
    currentMission: state.currentMission,
    abilityInCooldown: state.abilityInCooldown,
    privateChatLifeCycleState: state.privateChatLifeCycleState
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setAbilityInCooldown: abilityInCooldown => dispatch({type: 'SET_ABILITY_IN_COOLDOWN', abilityInCooldown})
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainChat);