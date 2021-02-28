const INITIAL_STATE = {
  appState: 'Menu', // enum('Menu', 'InGame'),
  lobbyCode: '',
  members: [],
  isHost: false
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
      }
  }

  return state;
}

export function getGameStateFromStore(store) {
  let { appState, lobbyCode, members, ...gameState } = store;
  return gameState;
}