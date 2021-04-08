const INITIAL_STATE = {
  appState: 'Menu', // enum('Menu', 'Lobby', 'RoleAssignment', 'InGame'),
  lobbyCode: '',
  isHost: false,
  handle: '',
  messages: [],
  role: null,
  privateChatId: null,
  privateChatLifeCycleState: {type: 'None'},
  privateMessages: [],
  abilityInCooldown: false,
  numHacksRemaining: 7,
  // Game state
  players: null,
  state: null, // enum(Created, TeamBuilding, Vote, MissionComplete, FBIWon, RootOfEvilWon)
  evilMembers: [],
  missions: null,
  currentMissionIndex: null,
  teamLeadIndex: null,
  proposedTeam: null,
  votes: {},
  killVotes: {},
  killContracts: [],
  missionStatus: null,
  killAttempted: null,
  killed: null,
  privateChatLeaked: null,
  // Player state embedded within game state
  alive: true
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
      let myState = action.gameState.players.find(player => player.handle == state.handle);

      myState = {...myState};
      delete myState.handle;

      return {
        ...state,
        ...action.gameState,
        ...myState
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
    case 'SET_ABILITY_IN_COOLDOWN':
      return {
        ...state,
        abilityInCooldown: action.abilityInCooldown
      };
    case 'SET_PRIVATE_CHAT_LIFE_CYCLE_STATE':
      return {
        ...state,
        privateChatLifeCycleState: action.privateChatLifeCycleState
      };
    case 'SET_PRIVATE_CHAT_ID':
      return {
        ...state,
        privateChatId: action.privateChatId
      };
    case 'CLEAR_PRIVATE_CHAT':
      return {
        ...state,
        privateChatId: null,
        privateMessages: [],
        privateChatLifeCycleState: {type: 'None'},
        abilityInCooldown: true
      };
    case 'ADD_PRIVATE_MESSAGE':
      return {
        ...state,
        privateMessages: [...state.privateMessages, action.message]
      };
    case 'SET_NUM_HACKS_REMAINING':
      return {
        ...state,
        numHacksRemaining: action.numHacks
      };
    case 'SET_PRIVATE_MESSAGES':
      return {
        ...state,
        privateMessages: action.messages
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
    privateChatId,
    privateChatLifeCycleState,
    privateMessages,
    abilityInCooldown,
    numHacksRemaining,
    alive,
    ...gameState
  } = store.getState();

  return gameState;
}