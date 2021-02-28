function createNew() {
  return {
    players: [],
    idToPlayers: {},
    playersToId: {},
    state: 'Created'
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
    return [gameState, {
      result: 'Rejected',
      to: joinData.from
    }];
  } else {
    return {
      newGameState: {
        players: [...gameState.players, joinData.handle],
        idToPlayers: {
          ...gameState.idToPlayers,
          [joinData.from]: joinData.handle 
        },
        playersToId: {
          ...gameState.playersToId,
          [joinData.handle]: joinData.from
        }
      },
      response: {
        result: 'Accepted',
        to: joinData.from,
        id: joinData.id
      }
    };
  }
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

  let newGameState = {
    ...gameState,
    evilMembers: chosen,
    state: 'TeamBuilding'
  };

  return [newGameState, {
    ...newGameState,
    result: 'NEW_GAME_STATE',
    to: 'everyone'
  }];
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

export default {
  createNew,
  apply,
  start
};