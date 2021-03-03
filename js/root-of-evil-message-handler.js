import RootOfEvil from './root-of-evil';
import { getGameStateFromStore } from './reducer';
import { removeMetadata } from './lobby'; 

export function hostHandleRootOfEvilMessage(messages, lobby, store) {
  console.log(`Host received ${messages.length} messages.`);
  let finalGameState;

  for (let message of messages) {
    switch (message.type) {
      case 'NEW_GAME_STATE':
        // I'm host, so I already have the latest game state
        break;
      case 'JOIN':
        let { newGameState, response } = RootOfEvil.apply(getGameStateFromStore(store.getState()), message);
        finalGameState = newGameState;

        lobby.respondTo(message, response);
        break;
      case 'MESSAGE':
        store.dispatch({
          type: 'ADD_MESSAGE',
          message
        });
        break;
      case 'START_GAME':
        store.dispatch({
          type: 'SET_APP_STATE',
          appState: 'RoleAssignment'
        });
        break;
    }
  }

  if (finalGameState) {
    lobby.send({
      type: 'NEW_GAME_STATE',
      to: '__everyone',
      ...finalGameState
    });

    store.dispatch({
      type: 'SET_GAME_STATE',
      gameState: finalGameState
    });
  }
}
  
export function clientHandleRootOfEvilMessage(messages, lobby, store) {
  for (let message of messages) {
    message = removeMetadata(message);
    console.log(message);

    let type = message.type;

    delete message.type;
    delete message.to;

    switch (type) {
      case 'NEW_GAME_STATE':

        store.dispatch({
          type: 'SET_GAME_STATE',
          gameState: message
        });
        break;
      case 'JOIN':
        break;
      case 'MESSAGE':
        store.dispatch({
          type: 'ADD_MESSAGE',
          message
        });
        break;
      case 'START_GAME':
        store.dispatch({
          type: 'SET_APP_STATE',
          appState: 'RoleAssignment'
        });
        break;
    }
  }
}