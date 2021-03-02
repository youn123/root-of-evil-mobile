const INITIAL_STATE = {
  appState: 'Menu', // enum('Menu', 'InGame'),
  lobbyCode: '',
  members: [],
  isHost: false,
  handle: '',
  messages: []
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
        appState: action.payload
      };
    case 'SET_GAME_STATE':
      return {
        ...state,
        ...action.gameState
      };
    case 'SET_MEMBERS':
      return {
        ...state,
        members: action.payload
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
  }

  return state;
}

export function getGameStateFromStore(store) {
  let { appState, lobbyCode, members, handle, messages, ...gameState } = store;
  return gameState;
}