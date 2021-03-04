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

import { generateRandomBase64String } from '../utils';
// import Lobby from '../lobby';
import Lobby from '../mocks/lobby';

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

function Bubble(props) {
  if (props.from == '__announcement_low') {
    return (
      <View style={{
        paddingHorizontal: 10,
        marginVertical: 5
      }}>
        <Text style={styles.announcementLow}>{props.text}</Text>
      </View>
    );
  }
  if (props.from == '__announcement_high') {
    return (
      <View style={{
        paddingHorizontal: 10,
        marginVertical: 5
      }}>
        <Text style={styles.announcementHigh}>{props.text}</Text>
      </View>
    );
  }

  return (
    <View style={{
      paddingHorizontal: 10,
      marginVertical: 5
    }}>
      <Text style={{fontSize: 16, fontWeight: 'bold'}}>{props.from}</Text>
      <Text>{props.text}</Text>
    </View>
  );
}

function MissionIndicator(props) {
  return (
    <View style={[styles.missionIndicator, props.current && styles.missionIndicatorHighlighted]}>
      <Text style={{fontSize: 16, textAlignVertical: 'center'}}>{props.numPeople}</Text>
    </View>
  );
}

function TimedText(props) {
  return (
    <View>
      <Text style={{paddingHorizontal: 5, color: 'grey'}}>{props.text}</Text>
      <View style={{width: '50%', height: 20, position: 'absolute', bottom: 0, left: 0, backgroundColor: 'black', opacity: 0.5, borderRadius: 3}} />
    </View>
  );
}

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
  }
});

class MainChat extends React.Component {
  state = {
    text: '',
    scrollOffset: 0
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
      console.log('Doh!');
      this.flatListRef.scrollToEnd();
    }
  }

  handleBackButton = () => true;

  handleKeyboardDidShow = event => {
    const { height: widnowHeight } = Dimensions.get('window');

    console.log(`screen height: ${widnowHeight}`);
    console.log(`keyboard height: ${event.endCoordinates.height}`);

    this.setStateAsync({keyboardHeight: event.endCoordinates.height})
      .then(() => {
        this.flatListRef.scrollToOffset({
          offset: this.state.scrollOffset + this.state.keyboardHeight
        });
      })
  }

  handleKeyboardDidHide = event => {
    this.setState({keyboardHeight: 0});
  }

  handleSendMessage = () => {
    Lobby.getCurrentLobby().send({
      type: 'MESSAGE',
      from: this.props.handle,
      to: '__everyone',
      text: this.state.text,
      id: generateRandomBase64String(5)
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
                <TimedText text='Private chat' />
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
            renderItem={({item}) => {
              if (!item) {
                return null;
              }

              return <Bubble {...item} />;
            }}
            // style={{flex: 1}}
            // contentContainerStyle={{marginBottom: 30}}
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
    currentMission: state.currentMission
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainChat);