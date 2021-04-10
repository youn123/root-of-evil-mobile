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
    height: '100%',
    paddingLeft: 10
  },
  title: {
    marginTop: 50,
    fontSize: 48,
    color: 'white'
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
          {/* <Animated.View>
            <Animated.Text style={{ transform: [{scale: this.state.scale}], backgroundColor: 'red', alignSelf: 'flex-start'}}>Hello world!</Animated.Text>
            <Button
              onPress={() => {
                Animated.timing(
                  this.state.scale,
                  {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true
                  }
                ).start();
              }}
              title='Press me'
            />
            <TextInput />
          </Animated.View> */}
          <Text style={styles.title}>
            Root{'\n'}of{'\n'}<Text>Evil</Text>
          </Text>
          <View style={styles.buttonBar}>
            <TouchableOpacity onPress={() => {
              this.props.navigation.navigate('New');
            }}>
              <Text style={[styles.button, {marginRight: 30}]}>New</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              this.props.navigation.navigate('Join');
            }}>
              <Text style={[styles.button, {marginLeft: 30}]}>Join</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }
};

export default Menu;