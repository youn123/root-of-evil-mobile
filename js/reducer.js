const INITIAL_STATE = {
  appState: 'Menu', // enum('Menu', 'Lobby', 'RoleAssignment', 'InGame'),
  lobbyCode: '',
  isHost: false,
  handle: '',
  messages: [],
  role: null,
  evilMembers: ['steve', 'chenchen', 'qin', 'Youn'],
  privateChatJoined: null,
  privateMessages: [],
  abilityInCooldown: false
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'HOST_NEW_GAME':
      return {
        ...state,
        lobbyCode: action.lobbyCode,
        isHost: true,
        ...action.gameState
      };
    case 'JOIN_GAME':
      return {
        ...state,
        lobbyCode: action.lobbyCode,
        isHost: false,
        ...action.gameState
      };
    case 'SET_APP_STATE':
      return {
        ...state,
        appState: action.appState
      };
    case 'SET_GAME_STATE':
      return {
        ...state,
        ...action.gameState
      };
    case 'SET_HANDLE':
      return {
        ...state,
        handle: action.handle
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.message]
      };
    case 'SET_ROLE':
      return {
        ...state,
        role: action.role
      };
    case 'JOIN_PRIVATE_CHAT':
      return {
        ...state,
        privateChatJoined: action.chatRoomId
      };
    case 'LEAVE_PRIVATE_CHAT':
      return {
        ...state,
        privateChatJoined: null,
        privateMessages: [],
        abilityInCooldown: true
      }
    case 'ADD_PRIVATE_MESSAGE':
      return {
        ...state,
        privateMessages: [...state.privateMessages, action.message]
      };
    case 'SET_ABILITY_IN_COOLDOWN':
      return {
        ...state,
        abilityInCooldown: action.abilityInCooldown
      };
    case 'SET_PRIVATE_CHAT_JOINED':
      return {
        ...state,
        privateChatJoined: action.privateChatJoined
      };
  }

  return state;
}

export function getGameStateFromStore(store) {
  let {
    appState,
    lobbyCode,
    isHost,
    handle,
    messages,
    role,
    ...gameState
  } = store;

  return gameState;
}