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
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';

import { PRIMARY, SECONDARY } from '../settings';

import { sleep, appendAndIncrement } from '../utils';
import PrivateChatManager from '../root-of-evil/private-chat';
import { TextBubble, RetroLoadingIndicator } from '../components';

// import Lobby from '../lobby';
import Lobby from '../mocks/lobby';

const fakeEvilMembers = ['qin', 'youn', 'steve'];

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
  chatHeader: {
    paddingRight: 10,
    backgroundColor: SECONDARY,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  messageContainer: {
    flexDirection: 'row',
    marginTop: 10
  },
  selectionOption: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: PRIMARY
  },
  nextButton: {
    color: 'white',
    borderColor: 'white',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 5
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
  }
});

class PrivateChat extends React.Component {
  state = {
    screenState: 'Select', // enum('Select', 'Loading', 'Connected', 'Failed', 'Terminated')
    selected: {},
    logs: [],
    text: '',
    scrollOffset: 0,
    endReached: true
  }

  componentDidMount() {
    if (this.props.privateChatJoined) {
      this.setState({screenState: 'Connected'});
    }

    Keyboard.addListener('keyboardDidShow', this.handleKeyboardDidShow);
    Keyboard.addListener('keyboardDidHide', this.handleKeyboardDidHide);

    this.props.navigation.addListener('focus', () => {
      console.log('PrivateChat focused');
    });
  }

  componentWillUnmount() {
    Keyboard.removeListener('keyboardDidShow', this.handleKeyboardDidShow);
    Keyboard.removeListener('keyboardDidHide', this.handleKeyboardDidHide);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.privateChatJoined === 'Terminated' && prevProps.privateChatJoined !== this.props.privateChatJoined) {
      console.log('PrivateChat componentDidUpdate()');
      this.setState({screenState: 'Terminated'});
      this.props.leavePrivateChat();
    } else if (this.state.endReached && prevProps.messages != this.props.messages) {
      this.flatListRef && this.flatListRef.scrollToEnd();
    }
  }

  handleKeyboardDidShow = event => {
    const { height: widnowHeight } = Dimensions.get('window');

    console.log(`screen height: ${widnowHeight}`);
    console.log(`keyboard height: ${event.endCoordinates.height}`);

    this.flatListRef.scrollToOffset({
      offset: this.state.scrollOffset + event.endCoordinates.height
    });
  }

  handleKeyboardDidHide = event => {
    this.setState({keyboardHeight: 0});
  }

  handleSelect = member => {
    let selectedCopy = {...this.state.selected};

    if (selectedCopy.hasOwnProperty(member)) {
      delete selectedCopy[member];
    } else {
      selectedCopy[member] = true;
    }

    this.setState({selected: selectedCopy});
  }

  handleConnect = async () => {
    this.setState({screenState: 'Loading'});

    let connectReqs = [];
    let chatRoomId = PrivateChatManager.newChatRoomId(this.props.handle);

    this.props.joinPrivateChat(chatRoomId);

    for (let member in this.state.selected) {
      connectReqs.push(
        Lobby.getCurrentLobby().send({
          type: 'REQUEST_PRIVATE_CHAT',
          from: this.props.handle,
          to: member,
          chatRoomId
        }, true)
      );
    }

    let atLeastOneAccepted = false;

    for (let req of connectReqs) {
      await req.then(res => {
        let announcementMessage;

        if (res.result == 'Accepted') {
          atLeastOneAccepted = true;
          this.setState({
            logs: [...this.state.logs, `${res.from}.....Accepted`]
          });

          announcementMessage = `${res.from} has joined the chat.`;
        } else {
          this.setState({
            logs: [...this.state.logs, `${res.from}.....Rejected`]
          });

          announcementMessage = `${res.from} refused to connect.`;
        }

        Lobby.getCurrentLobby().send({
          type: 'MESSAGE',
          from: '__announcement_low',
          to: chatRoomId,
          text: announcementMessage
        });
      })
        .catch(err => {
          console.log(err);
        });
    }

    if (atLeastOneAccepted) {
      sleep(500)
        .then(() => {
          this.setState({screenState: 'Connected'});
        });
    }
    // } else {
    //   this.setState({
    //     screenState: 'Failed'
    //   });
    // }
  }

  handleSendMessage = () => {
    Lobby.getCurrentLobby().send({
      type: 'MESSAGE',
      from: this.props.handle,
      to: this.props.privateChatJoined,
      text: this.state.text,
      id: appendAndIncrement(this.props.handle)
    })
      .then(() => {
        this.setState({text: ''});
      });
  }

  handleTerminate = () => {
    Lobby.getCurrentLobby().send({
      type: 'TERMINATE_PRIVATE_CHAT',
      from: this.props.handle,
      to: this.props.privateChatJoined
    })
      .then(() => {
        this.setState({screenState: 'Terminated'});
      });
  }

  setStateAsync = newState => {
    return new Promise((resolve, _) => {
      this.setState(newState, resolve);
    });
  }

  onScrollMessages = ({nativeEvent}) => {
    // Scrolling up
    if (nativeEvent.contentOffset.y < this.state.scrollOffset) {
      this.setState({
        scrollOffset: nativeEvent.contentOffset.y,
        endReached: false
      });
    } else {
      this.setState({
        scrollOffset: nativeEvent.contentOffset.y
      });
    }
  }

  render() {
    let content;

    if (this.state.screenState == 'Select') {
      content = (
        <>
          <View style={{
            marginTop: 20,
            paddingHorizontal: 20
          }}>
            <Text style={{
              marginBottom: 5
            }}>Select who you want to talk to.</Text>
            <Text>You can select more than one person, but group chat increases the risk of being hacked.</Text>
          </View>
          <View>
            <ScrollView contentContainerStyle={{
              marginTop: 20,
              paddingHorizontal: 20
            }}>
              {fakeEvilMembers.map(member => {
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
            onPress={this.handleConnect}
          >
            <Text style={styles.nextButton}>Connect</Text>
          </TouchableOpacity>
        </>
      );
    } else if (this.state.screenState == 'Loading') {
      content = (
        <>
          <View style={{
            paddingHorizontal: 20,
            marginTop: 20,
            flex: 1
          }}>
            <Text>Trying to establish connection...{<RetroLoadingIndicator />}</Text>
            {this.state.logs.map(log => <Text>{log}</Text>)}
          </View>
        </>
      );
    } else if (this.state.screenState == 'Terminated') {
      content = (
        <>
          <View style={{
            paddingHorizontal: 20,
            marginTop: 20,
            flex: 1
          }}>
            <Text>Chat has been terminated.</Text>
          </View>
        </>
      );
    }

    if (this.state.screenState != 'Connected') {
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
          {content}
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.chatHeader}>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.goBack();
            }}
          >
            <Icon
              name='chevron-back-outline'
              size={30}
              color='#485696'
            /> 
          </TouchableOpacity>
          <TouchableOpacity onPress={this.handleTerminate}>
            <Text style={{color: 'red'}}>Terminate</Text>
          </TouchableOpacity>
        </View>
        <View style={{flex: 1}}>
          <FlatList
            data={this.props.messages}
            renderItem={({item}) => <TextBubble {...item} />}
            keyExtractor={item => item.id}
            ref={ref => {
              this.flatListRef = ref;
            }}
            onScroll={this.onScrollMessages}
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
            placeholder='Remember this chat is not secure.'
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
    messages: state.privateMessages,
    handle: state.handle,
    evilMembers: state.evilMembers,
    privateChatJoined: state.privateChatJoined
  };
}

function mapDispatchToProps(dispatch) {
  return {
    joinPrivateChat: chatRoomId => dispatch({type: 'JOIN_PRIVATE_CHAT', chatRoomId}),
    leavePrivateChat: () => dispatch({type: 'LEAVE_PRIVATE_CHAT'})
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PrivateChat);