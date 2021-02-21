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
  FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { sleep } from '../utils';
import { PRIMARY, SECONDARY, TERTIARY } from '../settings';

const fakeChat = [
  {from: 'steve', message: 'hello', id: '0'},
  {from: 'chenchen', message: 'hello world\nhelloworld', id: '1'},
];

function Bubble(props) {
  return (
    <View style={{
      paddingHorizontal: 10,
      marginBottom: 10
    }}>
      <Text style={{fontSize: 16, fontWeight: 'bold'}}>{props.from}</Text>
      <Text>{props.message}</Text>
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
    text: ''
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
            data={fakeChat}
            renderItem={({item}) => {
              if (!item) {
                return null;
              }

              return <Bubble {...item} />;
            }}
            // style={{flex: 1}}
            // contentContainerStyle={{backgroundColor: 'blue'}}
            keyExtractor={item => item.id}
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
          <Icon
            name='send-outline'
            size={20}
            color='white'
          />
        </View>
      </SafeAreaView>
    );
  }
};

export default MainChat;