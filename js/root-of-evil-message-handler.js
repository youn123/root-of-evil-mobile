import RootOfEvil from './root-of-evil';
import { PrivateChatStore } from './root-of-evil';
import { getGameStateFromStore } from './reducer';
import { removeMetadata } from './lobby'; 
import { obfuscateMessage } from './utils';

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
        let { newGameState, response } = RootOfEvil.apply(getGameStateFromStore(store), message);
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
    let messageWithoutMetadata = removeMetadata(message);
    let { type, to, from, ...gameState } = messageWithoutMetadata;
    let newGameState;

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
          if (store.getState().role == RootOfEvil.Roles.FBI) {
            store.dispatch({
              type: 'ADD_PRIVATE_MESSAGE',
              message: obfuscateMessage(message, from != store.getState().privateChatLifeCycleState.personOfInterest)
            });
          } else {
            store.dispatch({
              type: 'ADD_PRIVATE_MESSAGE',
              message
            });

            if (from.indexOf('__') != 0) {
              PrivateChatStore.add(message);
            }
          }
        }
        break;
      case 'START_GAME':
        store.dispatch({
          type: 'SET_APP_STATE',
          appState: 'RoleAssignment'
        });
        break;
      case 'TERMINATE_PRIVATE_CHAT':
        if (store.getState().role == RootOfEvil.Roles.RootOfEvil && to === store.getState().privateChatId) {
          store.dispatch({
            type: 'CLEAR_PRIVATE_CHAT'
          });
        }
        break;
      case 'REQUEST_PRIVATE_CHAT':
        console.log(`${store.getState().handle} received REQUEST_PRIVATE_CHAT`);
        console.log(store.getState().privateChatLifeCycleState);

        if (to != store.getState().handle) {
          break;
        }

        if (store.getState().privateChatLifeCycleState.type != 'None') {
          lobby.respondTo(message, {
            result: 'Rejected',
            from: store.getState().handle
          });
        } else if (store.getState().abilityInCooldown) {
          lobby.respondTo(message, {
            result: 'Rejected',
            from: store.getState().handle
          });
        }

        store.dispatch({
          type: 'SET_PRIVATE_CHAT_LIFE_CYCLE_STATE',
          privateChatLifeCycleState: {
            type: 'Requested',
            request: message,
            chatRoomId: message.chatRoomId,
            from,
            others: message.others.filter(name => name != store.getState().handle),
            hasTerminatePrivilege: false
          }
        });
      case 'ESTABLISHED_PRIVATE_CHAT':
        console.log('received ESTABLISHED_PRIVATE_CHAT');

        if (store.getState().privateChatLifeCycleState.type == 'Requested') {
          let chatRoomId = store.getState().privateChatLifeCycleState.chatRoomId;

          if (to == chatRoomId) {
            store.dispatch({
              type: 'SET_PRIVATE_CHAT_ID',
              privateChatId: chatRoomId
            });
            store.dispatch({
              type: 'SET_PRIVATE_CHAT_LIFE_CYCLE_STATE',
              privateChatLifeCycleState: {type: 'Connected', hasTerminatePrivilege: store.getState().privateChatLifeCycleState.hasTerminatePrivilege}
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
      case 'HACK':
        if (to != store.getState().handle) {
          break;
        }

        console.log(`${store.getState().handle} Received HACK from ${from}`);

        if (store.getState().role != RootOfEvil.Roles.RootOfEvil) {
          lobby.respondTo(message, {
            result: 'Rejected',
            from: store.getState().handle
          });
        }

        let messages = PrivateChatStore.get();

        if (messages) {
          lobby.respondTo(message, {
            result: 'Accepted',
            chatRoomId: messages[0].to,
            messages,
            from: store.getState().handle
          });
        } else {
          lobby.respondTo(message, {
            result: 'Rejected',
            from: store.getState().handle
          });
        }
        break;
      case 'PROPOSE_TEAM':
        let votes = {};
        store.getState().players.forEach(player => {
          votes[player] = null;
        });
        votes[from] = true;

        store.dispatch({
          type: 'SET_GAME_STATE',
          gameState: {
            state: 'Vote',
            proposedTeam: message.proposedTeam,
            votes
          },
        });
        break;
      case 'VOTE':
        newGameState = RootOfEvil.apply(getGameStateFromStore(store), messageWithoutMetadata);

        console.log(`${store.getState().handle} received VOTE.`);
        console.log(newGameState.newGameState);

        store.dispatch({
          type: 'SET_GAME_STATE',
          gameState: newGameState
        });
        break;
      case 'KILL':
        newGameState = RootOfEvil.apply(getGameStateFromStore(store), messageWithoutMetadata);

        store.dispatch({
          type: 'SET_GAME_STATE',
          gameState: newGameState
        });
        break;
    }
  }
}