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

import { PRIMARY, SECONDARY } from '../settings';

import { TextBubble, RetroLoadingIndicator } from '../components';

// import Lobby from '../lobby';
import Lobby from '../mocks/lobby';

function obfuscate(message, obfuscateHandle) {
  let obfuscatedMessage = {...message};
  if (obfuscateHandle) {
    obfuscatedMessage.to = '***';
  }

  let now = Date.now();
  let ageInSeconds = (now - message.timestamp) / 1000;

  let charArray = [...message.text];
  let mask = Math.floor(Math.random() * 50);

  decayRate = ageInSeconds * 0.5;

  for (let i in charArray) {
    if (Math.random() < decayRate) {
      charArray[i] = String.fromCharCode(charArray[i].charCodeAt(0) ^ mask);
    }
  }
  
  obfuscatedMessage.message = charArray.join('');
  return obfuscatedMessage;
}

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
    screenState: 'Select', // enum('Select', 'Loading', 'Connected', Terminated', Left')
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
    if (this.props.privateChatLifeCycleState.type === 'None' && prevProps.privateChatLifeCycleState.type == 'Connected') {
      this.setState({screenState: 'Terminated'});
    }
    
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

  handleSelect = member => {
    this.setState({selected: member});
  }

  handleHack = async () => {
    this.setState({screenState: 'Loading'});

    Lobby.getCurrentLobby().send({
      type: 'HACK',
      from: this.props.handle,
      to: this.state.selected
    }, true)
      .then(res => {
        if (res.result == 'Accepted') {
          this.props.setPrivateChatId(res.chatRoomId);
          this.props.setPrivateChatLifeCycleState({type: 'Connected', personOfInterest: this.state.selected});
          this.props.setPrivateMessages(res.messages.map(message => obfuscate(message, message.to != this.state.selected)));

          this.setState({screenState: 'Connected'});
        } else {
          this.setState({screenState: 'Failed'});
        }
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
            }}>Suspicious? Select who you want to hack.</Text>
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
                    <View style={[styles.selectionOption, {backgroundColor: this.state.selected == member? '#485696' : SECONDARY}]}>
                      <Text>{member}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
          <TouchableOpacity
            style={{alignSelf: 'center', marginTop: 20}}
            onPress={this.handleHack}
          >
            <Text style={styles.borderButton}>Hack</Text>
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
          <TouchableOpacity onPress={() => {
            this.setState({screenState: 'Terminated'});
            this.props.clearPrivateChat();
          }}>
            <Text style={{color: 'red'}}>Leave</Text>
          </TouchableOpacity>
        </View>
        <View style={{flex: 1}}>
          <FlatList
            data={this.props.messages}
            renderItem={({item}) => <TextBubble handleStyle={{color: '#58fcec'}} textStyle={{color: '#58fcec'}} {...item} />}
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
        <View style={styles.bottomBar}>
          <Icon
            name='glasses-outline'
            size={30}
            color='#485696'
            style={{marginRight: 5}}
          /> 
          <Text style={{color: '#485696', marginLeft: 5, fontSize: 16}}>Read Only</Text>
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
    privateChatLifeCycleState: state.privateChatLifeCycleState
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setPrivateChatId: privateChatId => dispatch({type: 'SET_PRIVATE_CHAT_ID', privateChatId}),
    setPrivateChatLifeCycleState: privateChatLifeCycleState => dispatch({type: 'SET_PRIVATE_CHAT_LIFE_CYCLE_STATE', privateChatLifeCycleState}),
    clearPrivateChat: () => dispatch({type: 'CLEAR_PRIVATE_CHAT'}),
    setPrivateMessages: messages => dispatch({type: 'SET_PRIVATE_MESSAGES', messages})
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Hack);