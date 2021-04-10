/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider, connect } from 'react-redux';

import {
  Menu,
  Join,
  Handle,
  MainChat,
  New,
  Lobby,
  RoleAssignment,
  PrivateChat,
  Hack,
  ProposeTeam,
  Vote,
  Mission,
  Kill,
  GameOver
} from './js/screens';

import { PRIMARY } from './js/styles';
import store from './js/store';

const Stack = createStackNavigator();

class App extends React.Component {
  render() {
    let stack;

    switch (this.props.appState) {
      case 'Menu':
        stack = (
          <>
            <Stack.Screen name='Menu' component={Menu} />
            <Stack.Screen name='Join' component={Join} />
            <Stack.Screen name='Handle' component={Handle} />
            <Stack.Screen name='New' component={New} />
          </>
        );
        break;
      case 'Lobby':
        stack = <Stack.Screen name='Lobby' component={Lobby} />;
        break;
      case 'RoleAssignment':
        stack = <Stack.Screen name='RoleAssignment' component={RoleAssignment} />;
        break;
      case 'InGame':
        stack = (
          <>
            <Stack.Screen name='MainChat' component={MainChat} />
            <Stack.Screen name='PrivateChat' component={PrivateChat} />
            <Stack.Screen name='Hack' component={Hack} />
            <Stack.Screen name='ProposeTeam' component={ProposeTeam} />
            <Stack.Screen name='Vote' component={Vote} />
            <Stack.Screen name='Mission' component={Mission} />
            <Stack.Screen name='Kill' component={Kill} />
            <Stack.Screen name='GameOver' component={GameOver} />
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
    appState: state.appState,
    gameState: state.state
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
