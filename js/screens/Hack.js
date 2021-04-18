import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Dimensions,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';

import { PRIMARY, SECONDARY, ACCENT_HOT, TERTIARY } from '../styles';

import { TextBubble, RetroLoadingIndicator } from '../components';
import store from '../store';

import Lobby from '../lobby';
import { sleep, obfuscateMessage, obfuscateHandle } from '../utils';
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
  chatHeader: {
    paddingRight: 10,
    paddingVertical: 5,
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
    borderRadius: 5,
    textAlign: 'center'
  },
  bottomBar: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: SECONDARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

class Hack extends React.Component {
  state = {
    screenState: 'Select', // enum('Select', 'Loading', 'Connected', 'Disconnected', 'Failed')
    selected: '',
    scrollOffset: 0,
    endReached: true
  }

  componentDidMount() {
    if (this.props.privateChatLifeCycleState.type == 'Connected') {
      this.setState({screenState: 'Connected', selected: this.props.privateChatLifeCycleState.personOfInterest});
    }

    Keyboard.addListener('keyboardDidShow', this.handleKeyboardDidShow);

    this.props.navigation.addListener('focus', () => {
      console.log('PrivateChat focused');
    });
  }

  componentWillUnmount() {
    Keyboard.removeListener('keyboardDidShow', this.handleKeyboardDidShow);
  }

  componentDidUpdate(prevProps, prevState) {    
    if (this.state.endReached && prevProps.messages != this.props.messages) {
      this.flatListRef && this.flatListRef.scrollToEnd();
    }
  }

  handleSelect = member => {
    this.setState({selected: member});
  }

  handleHack = async () => {
    this.setState({screenState: 'Loading'});
    this.props.setNumHacksRemaining(this.props.numHacksRemaining - 1);

    Lobby.getCurrentLobby().send({
      type: 'HACK',
      from: this.props.handle,
      to: this.state.selected
    }, true)
      .then(async res => {
        await sleep(1000);
        return res;
      })
      .then(res => {
        if (res.result == 'Accepted') {
          // let slowlyObfuscate = setInterval(() => {
          //   console.log('slowlyObfuscate');

          //   // console.log(store.getState().privateMessages);

          //   let newMessages = store.getState().privateMessages.map(message => obfuscateMessage(message, message.from != store.getState().privateChatLifeCycleState.personOfInterest));
          //   console.log(newMessages);
          //   store.dispatch({
          //     type: 'SET_PRIVATE_MESSAGES',
          //     messages: newMessages
          //   });
          // }, 30000);

          this.props.setPrivateChatId(res.chatRoomId);
          this.props.setPrivateChatLifeCycleState({
            type: 'Connected',
            personOfInterest: this.state.selected
            // slowlyObfuscate
          });
          this.props.setPrivateMessages(res.messages.map(message => {
            if (message.from != this.state.selected) {
              return obfuscateHandle(message);
            } else {
              return message;
            }
          }));

          this.setState({screenState: 'Connected'});
        } else {
          this.setState({screenState: 'Failed'});
        }
      });
  }

  handleDisconnect = () => {
    this.setState({screenState: 'Disconnected'});
    // clearInterval(this.props.privateChatLifeCycleState.slowlyObfuscate);
    this.props.clearPrivateChat();
  }

  hackButtonDisabled = () => {
    return !this.state.selected || this.state.selected.length == 0;
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
            }}>Suspicious of someone? Select a player to hack.</Text>
          </View>
          <View>
            <ScrollView contentContainerStyle={{
              marginTop: 20,
              paddingHorizontal: 20
            }}>
              {this.props.players.filter(member => member.handle != this.props.handle).map(member => {
                if (!member.alive) {
                  return null;
                }
                
                return (
                  <TouchableOpacity
                    onPress={() => {
                      this.handleSelect(member.handle);
                    }}
                    key={member.handle}
                  >
                    <View style={[styles.selectionOption, {backgroundColor: this.state.selected == member.handle ? ACCENT_HOT : SECONDARY}]}>
                      <Text>{member.handle}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
          <TouchableOpacity
            style={{alignSelf: 'center', marginTop: 20}}
            onPress={this.handleHack}
            disabled={this.hackButtonDisabled()}
          >
            <Text style={[styles.borderButton, {color: this.hackButtonDisabled() ? SECONDARY : 'white', borderColor: this.hackButtonDisabled() ? SECONDARY : 'white'}]}>Hack</Text>
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
            <Text>Attempting to hack...{<RetroLoadingIndicator />}</Text>
          </View>
        </>
      );
    } else if (this.state.screenState == 'Disconnected') {
      content = (
        <>
          <View style={{
            paddingHorizontal: 20,
            marginTop: 20,
            flex: 1
          }}>
            <Text>You have disconnected from the chat.</Text>
          </View>
        </>
      );
    } else if (this.state.screenState == 'Failed') {
      content = (
        <>
          <View style={{
            paddingHorizontal: 20,
            marginTop: 20,
            flex: 1
          }}>
            <Text>Hack failed.</Text>
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
                  color='white'
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
          <TouchableOpacity onPress={this.props.navigation.goBack}>
            <Icon
              name='chevron-back-outline'
              size={30}
              color='white'
            /> 
          </TouchableOpacity>
          <TouchableOpacity onPress={this.handleDisconnect}>
            <Text style={{color: 'red'}}>Disconnect</Text>
          </TouchableOpacity>
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
        <View style={styles.bottomBar}>
          <Icon
            name='glasses-outline'
            size={30}
            color={TERTIARY}
            style={{marginRight: 5}}
          /> 
          <Text style={{color: TERTIARY, marginLeft: 5, fontSize: 16}}>READ ONLY</Text>
        </View>
      </SafeAreaView>
    );
  }
};

function mapStateToProps(state) {
  return {
    players: state.players,
    messages: state.privateMessages,
    handle: state.handle,
    privateChatId: state.privateChatId,
    privateChatLifeCycleState: state.privateChatLifeCycleState,
    numHacksRemaining: state.numHacksRemaining
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setPrivateChatId: privateChatId => dispatch({type: 'SET_PRIVATE_CHAT_ID', privateChatId}),
    setPrivateChatLifeCycleState: privateChatLifeCycleState => dispatch({type: 'SET_PRIVATE_CHAT_LIFE_CYCLE_STATE', privateChatLifeCycleState}),
    clearPrivateChat: () => dispatch({type: 'CLEAR_PRIVATE_CHAT'}),
    setPrivateMessages: messages => dispatch({type: 'SET_PRIVATE_MESSAGES', messages}),
    setNumHacksRemaining: numHacks => dispatch({type: 'SET_NUM_HACKS_REMAINING', numHacks})
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Hack);