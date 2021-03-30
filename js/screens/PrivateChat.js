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

import { sleep, nextId } from '../utils';
import { TextBubble, RetroLoadingIndicator, Handles } from '../components';
import { PrivateChatStore } from '../root-of-evil';

import { ShowWhen } from '../hoc';
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
  borderButton: {
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
    screenState: 'Select', // enum('Select', 'Loading', 'Connected', 'Rejected', 'Terminated', 'Requested', 'Left')
    selected: {},
    logs: [],
    text: '',
    scrollOffset: 0,
    endReached: true
  }

  componentDidMount() {
    if (this.props.privateChatLifeCycleState.type == 'Requested') {
      if (this.props.privateChatLifeCycleState.hasTerminatePrivilege) {
        this.setState({screenState: 'Loading'});
      } else {
        this.setState({screenState: 'Requested'});
      }
    } else if (this.props.privateChatLifeCycleState.type == 'Connected') {
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
    if (prevProps.privateChatLifeCycleState.type == 'Requested' && this.props.privateChatLifeCycleState.type == 'Connected') {
      this.setState({screenState: 'Connected'});
    }

    if (prevProps.privateChatLifeCycleState.type == 'Connected' && this.props.privateChatLifeCycleState.type == 'None' && prevState.screenState != 'Left')

    if (this.state.endReached && prevProps.messages != this.props.messages) {
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
    let chatRoomId = `__${this.props.handle}-pc-${nextId()}`;

    this.props.setPrivateChatLifeCycleState({type: 'Requested', chatRoomId, hasTerminatePrivilege: true});

    for (let member in this.state.selected) {
      connectReqs.push(
        Lobby.getCurrentLobby().send({
          type: 'REQUEST_PRIVATE_CHAT',
          from: this.props.handle,
          to: member,
          others: Object.keys(this.state.selected),
          chatRoomId
        }, true)
      );
    }

    let atLeastOneAccepted = false;

    for (let req of connectReqs) {
      await req.then(res => {
        console.log(`res: ${res.result} ${res.from}`);
        if (res.result == 'Accepted') {
          atLeastOneAccepted = true;
          this.setState({
            logs: [...this.state.logs, `${res.from}.....Accepted`]
          });
        } else {
          this.setState({
            logs: [...this.state.logs, `${res.from}.....Rejected`]
          });
        }
      })
        .catch(err => {
          console.log(err);
        });
    }

    if (atLeastOneAccepted) {
      Lobby.getCurrentLobby().send({
        type: 'ESTABLISHED_PRIVATE_CHAT',
        from: this.props.handle,
        to: chatRoomId
      }).then(() => {
        return sleep(500);
      })
        .then(() => {
          this.setState({screenState: 'Connected'});
        });
    } else {
      this.setState({screenState: 'Rejected'});
      this.props.setPrivateChatLifeCycleState({type: 'None'});
    }
  }

  handleAccept = () => {
    this.setState({screenState: 'Loading'});

    Lobby.getCurrentLobby().respondTo(this.props.privateChatLifeCycleState.request, {
      result: 'Accepted',
      from: this.props.handle
    });
  }

  handleReject = () => {
    this.setState({screenState: 'Left'});

    Lobby.getCurrentLobby().respondTo(this.props.privateChatLifeCycleState.request, {
      result: 'Rejected',
      from: this.props.handle
    })
      .then(() => {
        this.props.clearPrivateChat();
        this.props.navigation.goBack();
      });
  }

  handleSendMessage = () => {
    let message = {
      type: 'MESSAGE',
      from: this.props.handle,
      to: this.props.privateChatId,
      text: this.state.text,
      id: `${this.props.handle}-${nextId()}`,
      timestamp: Date.now()
    };

    Lobby.getCurrentLobby().send(message)
      .then(() => {
        this.setState({text: ''});
      });
  }

  handleTerminate = () => {
    PrivateChatStore.scheduleTermination(this.props.privateChatId);

    Lobby.getCurrentLobby().send({
      type: 'TERMINATE_PRIVATE_CHAT',
      from: this.props.handle,
      to: this.props.privateChatId
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
            }}>Select who you want to talk to. You can select more than one person to form a group chat.</Text>
          </View>
          <View>
            <ScrollView contentContainerStyle={{
              marginTop: 20,
              paddingHorizontal: 20
            }}>
              {this.props.evilMembers.filter(member => member != this.props.handle).map(member => {
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
            <Text style={styles.borderButton}>Connect</Text>
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
    } else if (this.state.screenState == 'Rejected') {
      content = (
        <>
          <View style={{
            paddingHorizontal: 20,
            marginTop: 20,
            flex: 1
          }}>
            <Text>Everyone has rejected.</Text>
          </View>
        </>
      );
    } else if (this.state.screenState == 'Requested') {
      content = (
        <>
          <View style={{
            paddingHorizontal: 20,
            marginTop: 20,
            flex: 1
          }}>
            <Text>
              <Handles names={[this.props.privateChatLifeCycleState.from]} nameColor='red' /> has requested a private connection with <Handles names={[...this.props.privateChatLifeCycleState.others, 'you']} nameColor = 'red' />.
            </Text>
            <View style={{flexDirection: 'row', justifyContent: 'space-around', marginTop: 20}}>
            <TouchableOpacity
              onPress={this.handleAccept}
            >
              <Text style={styles.borderButton}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={this.handleReject}
            >
              <Text style={styles.borderButton}>Reject</Text>
            </TouchableOpacity>
            </View>
          </View>
        </>
      );
    } else if (this.state.screenState == 'Left') {
      content = (
        <>
          <View style={{
            paddingHorizontal: 20,
            marginTop: 20,
            flex: 1
          }}>
            <Text>You left the chat.</Text>
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
          <ShowWhen condition={this.props.privateChatLifeCycleState.hasTerminatePrivilege}>
            <TouchableOpacity onPress={this.handleTerminate}>
              <Text>Terminate</Text>
            </TouchableOpacity>
          </ShowWhen>
          <ShowWhen condition={!this.props.privateChatLifeCycleState.hasTerminatePrivilege}>
            <TouchableOpacity onPress={() => {
              this.setState({screenState: 'Left'});

              Lobby.getCurrentLobby().send({
                type: 'MESSAGE',
                from: '__announcement_low',
                to: this.props.privateChatId,
                text: `${this.props.handle} has left the chat.`
              });

              this.props.clearPrivateChat();
            }}>
              <Text>Leave</Text>
            </TouchableOpacity>
          </ShowWhen>
        </View>
        <View style={{flex: 1}}>
          <FlatList
            data={this.props.messages}
            renderItem={({item}) => <TextBubble handleStyle={{color: 'red'}} textStyle={{color: 'red'}} {...item} />}
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
            onEndReachedThreshold={0.05}
            onEndReached={() => {
              this.setState({
                endReached: true
              });
            }}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            onChangeText={text => {
              this.setState({text});
            }}
            placeholder='An FBI agent could be snooping.'
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
    privateChatId: state.privateChatId,
    privateChatLifeCycleState: state.privateChatLifeCycleState
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setPrivateChatId: privateChatId => dispatch({type: 'SET_PRIVATE_CHAT_ID', privateChatId}),
    setPrivateChatLifeCycleState: privateChatLifeCycleState => dispatch({type: 'SET_PRIVATE_CHAT_LIFE_CYCLE_STATE', privateChatLifeCycleState}),
    clearPrivateChat: () => dispatch({type: 'CLEAR_PRIVATE_CHAT'})
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PrivateChat);