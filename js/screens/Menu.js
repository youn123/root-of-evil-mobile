import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  Animated,
  TouchableOpacity
} from 'react-native';

import { PRIMARY } from '../styles';

const styles = StyleSheet.create({
  container: {
    backgroundColor: PRIMARY,
    height: '100%'
  },
  title: {
    marginTop: 50,
    fontSize: 40,
    color: 'white',
    alignSelf: 'center'
  },
  buttonBar: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  button: {
    color: 'white',
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 5,
    minWidth: 70,
    textAlign: 'center',
    paddingVertical: 2,
    paddingHorizontal: 5,
    fontSize: 18
  }
});

class Menu extends React.Component {
  state = {
    scale: new Animated.Value(0)
  };

  componentDidMount() {
  }

  render() {
    const s = this.state.scale;

    return (
      <>
        <StatusBar backgroundColor={PRIMARY} />
        <SafeAreaView style={styles.container}>
          <Text style={styles.title}>
            Root of Evil
          </Text>
          <View style={styles.buttonBar}>
            <TouchableOpacity onPress={() => {
              this.props.navigation.navigate('New');
            }}>
              <Text style={[styles.button, {marginRight: 7}]}>New</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              this.props.navigation.navigate('Join');
            }}>
              <Text style={[styles.button, {marginLeft: 7}]}>Join</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }
};

export default Menu;