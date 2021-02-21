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
import { Provider, connect } from 'react-redux';
import { createStore } from 'redux';

import { Home, Join, Handle, MainChat, New } from './js/screens';
import reducer from './js/reducer';
import { PRIMARY } from './js/settings';

const store = createStore(reducer);
const Stack = createStackNavigator();

class App extends React.Component {
  render() {
    let stack;

    switch (this.props.appState) {
      case 'Menu':
        stack = (
          <>
            <Stack.Screen name='Home' component={Home} />
            <Stack.Screen name='Join' component={Join} />
            <Stack.Screen name='Handle' component={Handle} />
            <Stack.Screen name='New' component={New} />
          </>
        );
        break;
      case 'InGame':
        stack = (
          <>
            <Stack.Screen name='MainChat' component={MainChat} />
          </>
        );
        break;
    }

    return (
      <>
        <StatusBar backgroundColor={PRIMARY} />
        <NavigationContainer theme={{ colors: { background: '#000' }}}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {stack}
          </Stack.Navigator>
        </NavigationContainer>
      </>
    );
  }
};

function mapStateToProps(state) {
  return {
    appState: state.appState
  };
}

const ConnectedApp = connect(mapStateToProps, null)(App);

function AppWithProvider() {
  return (
    <Provider store={store}>
      <ConnectedApp />
    </Provider>
  );
}

export default AppWithProvider;
