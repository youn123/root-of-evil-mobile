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
  Dimensions
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
  return (
    <View style={{
      paddingHorizontal: 10,
      marginBottom: 10
    }}>
      <Text style={{fontSize: 16, fontWeight: 'bold'}}>{props.from}</Text>
      <Text>{props.text}</Text>
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
    paddingVertical: 0
  },
  header: {
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'yellow',
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
  }
});

class MainChat extends React.Component {
  state = {
    text: '',
    scrollOffset: 0
  }

  componentDidMount() {
    this.keyboardDidShowSub = Keyboard.addListener('keyboardDidShow', event => {
      const { height: widnowHeight } = Dimensions.get('window');

      console.log(`screen height: ${widnowHeight}`);
      console.log(`keyboard height: ${event.endCoordinates.height}`);

      this.flatListRef.scrollToOffset({
        offset: this.state.scrollOffset + event.endCoordinates.height
      });
    });
  }

  handleSendMessage = () => {
    Lobby.getCurrentLobby().send({
      type: 'MESSAGE',
      from: this.props.handle,
      to: 'everyone',
      text: this.state.text,
      id: generateRandomBase64String(5)
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

              this.setState({
                scrollOffset: nativeEvent.contentOffset.y
              });
            }}
            scrollEventThrottle
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            onChangeText={text => {
              this.setState({text});
            }}
            placeholder='Choose your words carefully.'
            placeholderTextColor='grey'
            multiline
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
    lobbyCode: state.lobbyCode,
    messages: state.messages,
    handle: state.handle
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainChat);