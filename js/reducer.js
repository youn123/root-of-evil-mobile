const INITIAL_STATE = {
  appState: 'Menu', // enum('Menu', 'Lobby', 'RoleAssignment', 'InGame'),
  lobbyCode: '',
  isHost: false,
  handle: '',
  messages: [],
  role: null,
  evilMembers: ['steve', 'chenchen', 'qin', 'Youn']
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
  }

  return state;
}

export function getGameStateFromStore(store) {
  let { appState, lobbyCode, isHost, handle, messages, role, ...gameState } = store;
  return gameState;
}