import RootOfEvil, { PrivateChatStore } from './root-of-evil';
import { getGameStateFromStore } from './reducer';
import { removeMetadata } from './lobby'; 
import { obfuscateMessage, obfuscateHandle, choose } from './utils';

export async function hostHandleRootOfEvilMessage(messages, lobby, store) {
  let sendFinalGameState;

  for (let message of messages) {
    let messageWithoutMetadata = removeMetadata(message);
    let { type, to, from } = messageWithoutMetadata;
  
    // Handle host-specific messages first
    switch (type) {
      case 'NEW_GAME_STATE':
        // I'm host, so I already have the latest game state
        break;
      case 'JOIN':
        let { newGameState, response } = RootOfEvil.apply(getGameStateFromStore(store), message);
        sendFinalGameState = newGameState;

        lobby.respondTo(message, response);

        store.dispatch({
          type: 'SET_GAME_STATE',
          gameState: sendFinalGameState
        });
        break;
      case 'DO_MISSION':
        newGameState = RootOfEvil.apply(getGameStateFromStore(store), messageWithoutMetadata);

        if (newGameState.state == 'MissionComplete') {
          console.log('[hostHandleRootOfEvilMessage] state=MissionComplete');

          if (newGameState.privateChatLeaked) {
            console.log('[hostHandleRootOfEvilMessage] private chat leaked');

            let fetchLeakedMessages = [];
  
            for (let evilMember of store.getState().evilMembers) {
              fetchLeakedMessages.push(lobby.send({
                type: 'LEAK_PRIVATE_MESSAGES',
                to: evilMember
              }, returnResponse=true));
            }
  
            let responses = await Promise.all(fetchLeakedMessages);
            responses = responses.filter(response => response.messages.length != 0);
  
            if (responses.length == 0) {
              newGameState.privateChatLeaked = null;
            } else {
              toLeak = responses[choose(responses)].messages;
              newGameState.privateChatLeaked = toLeak.map(message => obfuscateHandle(message));
              console.log('toLeak:');
              console.log(toLeak);
            }
          }

          sendFinalGameState = newGameState;
        }

        store.dispatch({
          type: 'SET_GAME_STATE',
          gameState: newGameState
        });
        break;
      default:
        clientHandleRootOfEvilMessage([message], lobby, store);
        break;
    }
  }

  if (sendFinalGameState) {
    lobby.send({
      type: 'NEW_GAME_STATE',
      to: '__everyone',
      ...sendFinalGameState
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
          console.log(messageWithoutMetadata);

          if (messageWithoutMetadata.fromTeamLead) {
            messageWithoutMetadata.from = messageWithoutMetadata.from + ' [Lead]';
          }

          store.dispatch({
            type: 'ADD_MESSAGE',
            message: messageWithoutMetadata
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
        newGameState = {...getGameStateFromStore(store)};

        newGameState.state = 'Vote';
        newGameState.proposedTeam = message.proposedTeam;

        newGameState = RootOfEvil.apply(newGameState, {
          type: 'VOTE',
          accept: true,
          from
        });

        store.dispatch({
          type: 'SET_GAME_STATE',
          gameState: newGameState
        });
        break;
      case 'VOTE':
        newGameState = RootOfEvil.apply(getGameStateFromStore(store), messageWithoutMetadata);

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
      case 'LEAK_PRIVATE_MESSAGES':
        if (to != store.getState().handle) {
          break;
        }

        console.log(`[${store.getState().handle} clientHandleRootOfEvilMessage] received LEAK_PRIVATE_MESSAGES`);
        let leakedMessages = PrivateChatStore.leak();
        console.log('leakedMessages:');
        console.log(leakedMessages);

        lobby.respondTo(message, {
          messages: leakedMessages
        });

        break;
    }
  }
}