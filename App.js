/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import { Home, Join, Handle } from './js/screens';
import reducer from './js/reducer';
import { PRIMARY } from './js/settings';

const store = createStore(reducer);
const Stack = createStackNavigator();

class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <StatusBar backgroundColor={PRIMARY} />
        <NavigationContainer theme={{ colors: { background: '#000' }}}>
          <Stack.Navigator mode='modal' screenOptions={{ headerShown: false }}>
            <Stack.Screen name='Home' component={Home}
              // options={{
              //   cardOverlay: () => (
              //     <View
              //       style={{
              //       flex: 1,
              //       backgroundColor: '#000',
              //     }}
              //   />)
              // }}
            />
            <Stack.Screen name='Join' component={Join} />
            <Stack.Screen name='Handle' component={Handle} />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    );
  }
};

export default App;
