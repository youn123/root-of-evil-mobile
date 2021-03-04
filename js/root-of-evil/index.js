const RESERVED_HANDLES = [
  '__everyone',
  '__host',
  '__announcement_low',
  '__announcement_high'
];

const Roles = {
  RootOfEvil: 'RootOfEvil',
  FBI: 'FBI'
};

function createNew() {
  return {
    players: [],
    state: 'Created',
    evilMembers: [],
    missions: [
      {numPeople: 2},
      {numPeople: 2},
      {numPeople: 3},
      {numPeople: 3},
      {numPeople: 3}
    ],
    currentMission: 0,
    teamLead: null
  };
}
  
function apply(gameState, action) {
  switch (action.type) {
    case 'JOIN':
      return join(gameState, action);
  }
}
  
function join(gameState, joinData) {
  if (gameState.players.includes(joinData.handle)) {
    return {
      newGameState: gameState,
      response: {
        result: 'Rejected',
        message: `'${joinData.handle}' is already taken.`
      }
    };
  }
  
  if (RESERVED_HANDLES.includes(joinData.handle)) {
    return {
      newGameState: gameState,
      response: {
        result: 'Rejected',
        message: `'${joinData.handle}' is a reserved keyword.`
      }
    };
  }
  
  return {
    newGameState: {
      players: [...gameState.players, joinData.handle],
    },
    response: {
      result: 'Accepted'
    }
  };
}
  
function start(gameState) {
  let numEvilMembers;
  let numPlayers = gameState.players.length;

  // These mappings will need to be tweaked.
  if (numPlayers == 5 || numPlayers == 6) {
    numEvilMembers = 2;
  } else if (numPlayers <= 10) {
    numEvilMembers = 3;
  } else if (numPlayers <= 15) {
    numEvilMembers = 4;
  } else {
    numEvilMembers = 5;
  }

  let { chosen } = chooseNoReplacement(gameState.players, numEvilMembers);
  let teamLead = choose(gameState.players);

  let newGameState = {
    ...gameState,
    evilMembers: chosen,
    state: 'TeamBuilding',
    teamLead
  };

  return {
    newGameState,
    response: {
      ...newGameState,
      type: 'NEW_GAME_STATE'
    }
  };
}

function startWithConfig(gameState, config) {
  let numEvilMembers = config.numEvilMembers;
  let { chosen } = chooseNoReplacement(gameState.players, numEvilMembers);
  let teamLead = choose(gameState.players);

  let newGameState = {
    ...gameState,
    evilMembers: chosen,
    state: 'TeamBuilding',
    teamLead
  };

  return {
    newGameState,
    response: {
      ...newGameState,
      type: 'NEW_GAME_STATE'
    }
  };
}
  
function chooseNoReplacement(arr, numToChoose) {
  let arrCopy = [...arr];
  let chosen = [];

  for (let i = 0; i < numToChoose; i++) {
    let randIndex = Math.floor(Math.random() * arrCopy.length);
    chosen.push(arrCopy[randIndex]);
    arrCopy.splice(randIndex, 1);
  }

  return {
    finalArr: arrCopy,
    chosen
  };
}

function choose(arr) {
  return Math.floor(Math.random() * arr.length);
}

export default {
  createNew,
  apply,
  start,
  startWithConfig,
  Roles
};