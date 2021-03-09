import RootOfEvil from './root-of-evil';
import { getGameStateFromStore } from './reducer';
import { removeMetadata } from './lobby'; 

export function hostHandleRootOfEvilMessage(messages, lobby, store) {
  console.log(`Host received ${messages.length} messages.`);
  let finalGameState;

  for (let message of messages) {
    // Handle host-specific messages first
    switch (message.type) {
      case 'NEW_GAME_STATE':
        // I'm host, so I already have the latest game state
        break;
      case 'JOIN':
        let { newGameState, response } = RootOfEvil.apply(getGameStateFromStore(store.getState()), message);
        finalGameState = newGameState;

        lobby.respondTo(message, response);
        break;
      default:
        clientHandleRootOfEvilMessage([message], lobby, store);
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
    let { type, to, from, ...gameState } = removeMetadata(message);

    switch (type) {
      case 'NEW_GAME_STATE':
        store.dispatch({
          type: 'SET_GAME_STATE',
          gameState
        });
        break;
      case 'JOIN':
        break;
      case 'MESSAGE':
        if (to == '__everyone') {
          store.dispatch({
            type: 'ADD_MESSAGE',
            message
          });
        } else if (to === store.getState().privateChatId) {
          store.dispatch({
            type: 'ADD_PRIVATE_MESSAGE',
            message
          });
        }
        break;
      case 'START_GAME':
        store.dispatch({
          type: 'SET_APP_STATE',
          appState: 'RoleAssignment'
        });
        break;
      case 'TERMINATE_PRIVATE_CHAT':
        if (to === store.getState().privateChatId) {
          store.dispatch({
            type: 'CLEAR_PRIVATE_CHAT'
          });
        }
        break;
      case 'REQUEST_PRIVATE_CHAT':
        if (store.getState().privateChatLifeCycleState.type != 'None') {
          lobby.respondTo(message, {
            result: 'Rejected',
            from: store.getState().handle
          });
          break;
        }

        if (to == store.getState().handle) {
          store.dispatch({
            type: 'SET_PRIVATE_CHAT_LIFE_CYCLE_STATE',
            privateChatLifeCycleState: {
              type: 'Requested',
              request: message,
              chatRoomId: message.chatRoomId,
              from,
              others: message.others.filter(name => name != store.getState().handle)
            }
          });
        }
      case 'ESTABLISHED_PRIVATE_CHAT':
        console.log('received ESTABLISHED_PRIVATE_CHAT');

        if (store.getState().privateChatLifeCycleState.type == 'Requested') {
          let chatRoomId = store.getState().privateChatLifeCycleState.chatRoomId;

          if (message.to == chatRoomId) {
            store.dispatch({
              type: 'SET_PRIVATE_CHAT_ID',
              privateChatId: chatRoomId
            });
            store.dispatch({
              type: 'SET_PRIVATE_CHAT_LIFE_CYCLE_STATE',
              privateChatLifeCycleState: {type: 'Connected'}
            });

            lobby.send({
              type: 'MESSAGE',
              from: '__announcement_low',
              to: chatRoomId,
              text: `${store.getState().handle} has joined the chat.`
            });
          }
        }
        break;
    }
  }
}