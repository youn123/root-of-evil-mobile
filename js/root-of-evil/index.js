const PrivateChatStore = require('./private-chat-store');
const { choose, chooseNoReplacement } = require('../utils');
const { calculateNumEvilMembers, generateMissions, numPeoplePerMission } = require('../game-settings');

const Roles = {
  RootOfEvil: 'RootOfEvil',
  FBI: 'FBI'
};

function createNew() {
  return {
    players: [],
    state: 'Created', // enum(Created, TeamBuilding, Vote, MissionInProgress, MissionAborted, MissionComplete, GameOver)
    evilMembers: [],
    missions: [
      {numPeople: 1, status: null},
      {numPeople: 1, status: null},
      {numPeople: 1, status: null},
      {numPeople: 1, status: null},
      {numPeople: 1, status: null}
    ],
    winner: null,
    gameOverMessage: null,
    currentMissionIndex: 0,
    teamLeadIndex: null,
    // Mission-specific state
    proposedTeam: null,
    votes: {},
    killVotes: {},
    killContracts: [],
    missionStatus: null,
    killed: null,
    killAttempted: null,
    privateChatLeaked: null,
    completeMission: 0,
    failMission: 0
  };
}
  
function apply(gameState, action) {
  switch (action.type) {
    case 'JOIN':
      return join(gameState, action);
    case 'VOTE':
      return vote(gameState, action);
    case 'KILL':
      return voteToKill(gameState, action);
    case 'DO_MISSION':
      return doMission(gameState, action);
  }
}
  
function join(gameState, joinData) {
  if (gameState.state != 'Created') {
    return {
      response: {
        result: 'Rejected',
        message: 'This game has already started.'
      }
    };
  }
  
  if (gameState.players.includes(joinData.handle)) {
    return {
      newGameState: gameState,
      response: {
        result: 'Rejected',
        message: `'${joinData.handle}' is already taken.`
      }
    };
  }
  
  if (joinData.handle.indexOf('__') == 0) {
    return {
      newGameState: gameState,
      response: {
        result: 'Rejected',
        message: `'${joinData.handle}' is a reserved handle.`
      }
    };
  }
  
  return {
    newGameState: {
      players: [...gameState.players, {handle: joinData.handle, alive: true, role: null}],
    },
    response: {
      result: 'Accepted'
    }
  };
}

function vote(gameState, action) {
  let votesCopy = {...gameState.votes};
  // First vote
  if (Object.keys(votesCopy).length == 0) {
    for (let player of gameState.players) {
      if (!player.alive) {
        votesCopy[player.handle] = 'dead';
      } else {
        votesCopy[player.handle] = null;
      }
    }
  }

  votesCopy[action.from] = action.accept;

  let newGameState = {
    ...gameState,
    votes: votesCopy
  };

  return countVotes(newGameState);
}

function voteToKill(gameState, action) {
  let killVotesCopy = {...gameState.killVotes};
  killVotesCopy[action.from] = action.victim;

  let newGameState = {
    ...gameState,
    killVotes: killVotesCopy
  };

  return countVotes(newGameState);
}

function countVotes(gameState) {
  let newGameState = {...gameState};
  let numVotedYes = 0;
  let numVotedNo = 0;

  // Count number of votes
  for (let member of Object.keys(gameState.votes)) {
    if (gameState.votes[member] === true) {
      numVotedYes++;
    } else if (gameState.votes[member] !== null && !gameState.votes[member]) {
      numVotedNo++;
    }
  }

  // Count number of kill votes
  let numKillVotes = 0;
  let victimsToVotes = {};
  let victim = null;

  for (let evilMember of Object.keys(gameState.killVotes)) {
    numKillVotes++;
    if (gameState.killVotes[evilMember] && gameState.killVotes[evilMember] != '__None') {
      victim = gameState.killVotes[evilMember];

      if (!victimsToVotes[victim]) {
        victimsToVotes[victim] = 1;
      } else {
        victimsToVotes[victim]++;
      }
    }
  }

  let survivingMembers = gameState.players.filter(player => player.alive);
  let survivingEvilMembers = gameState.evilMembers.filter(player => player.alive);

  if ((numVotedYes + numVotedNo) == survivingMembers.length && numKillVotes == survivingEvilMembers.length) {
    let victimSuccessfullyKilled = victim && victimsToVotes[victim] == survivingEvilMembers.length;

    console.log(`[root-of-evil] Game state:`);
    console.log(`[root-of-evil]   victim: ${victim}`);
    console.log(`[root-of-evil]   victimsToVotes: ${victimsToVotes[victim]}`);
    console.log(`[root-of-evil]   survivingEvilMembers: ${survivingEvilMembers.length}`);
    console.log(`[root-of-evil]   victimSuccessfullyKilled: ${victimSuccessfullyKilled}`);

    if (victimSuccessfullyKilled) {
      newGameState.players = gameState.players.map(player => {
        if (player.handle == victim) {
          return {
            ...player,
            alive: false
          };
        }

        return player;
      });

      newGameState.evilMembers = gameState.evilMembers.map(player => {
        if (player.handle == victim) {
          return {
            ...player,
            alive: false
          };
        }

        return player;
      });
    }

    newGameState.killAttempted = victim;
    newGameState.killed = victimSuccessfullyKilled ? victim : null;
    newGameState.privateChatLeaked = newGameState.killAttempted && (!victimSuccessfullyKilled || !gameState.killContracts.includes(victim));

    if (numVotedYes >= survivingMembers.length / 2.0) {
      newGameState.state = 'MissionInProgress';
    } else {
      newGameState.state = 'MissionAborted';
    }
  }

  return newGameState;
}

function doMission(gameState, action) {
  if (!gameState.proposedTeam.includes(action.from)) {
    return gameState;
  }

  let newGameState = {...gameState};
  if (action.completeMission) {
    newGameState.completeMission++;
  } else {
    newGameState.failMission++;
  }

  if ((newGameState.completeMission + newGameState.failMission) == gameState.proposedTeam.length) {
    let missionStatus;

    if (gameState.killed && gameState.killContracts.includes(gameState.killed)) {
      missionStatus = false;
    } else if (newGameState.failMission == 0) {
      missionStatus = true;
    } else {
      missionStatus = false;
    }

    let missionsCopy = [...gameState.missions];

    missionsCopy[gameState.currentMissionIndex] = {
      ...gameState.missions[gameState.currentMissionIndex],
      status: missionStatus
    };

    newGameState.missions = missionsCopy;
    newGameState.missionStatus = missionStatus;
    newGameState.state = 'MissionComplete';
  }

  return newGameState;
}

function tick(gameState) {
  let newGameState = {...gameState};

  let fbiWonMissions = 0;
  let rootOfEvilWonMissions = 0;

  for (let mission of gameState.missions) {
    if (mission.status) {
      fbiWonMissions++;
    } else if (mission.status !== null && !mission.status) {
      rootOfEvilWonMissions++;
    }
  }

  if (fbiWonMissions >= 3) {
    newGameState.state = 'GameOver';
    newGameState.winner = Roles.FBI;
    newGameState.gameOverMessage = `FBI won ${fbiWonMissions} out of ${gameState.missions.length} missions.`;
    
    return newGameState;
  } else if (rootOfEvilWonMissions >= 3) {
    newGameState.state = 'GameOver';
    newGameState.winner = Roles.RootOfEvil;
    newGameState.gameOverMessage = `Root of Evil won ${rootOfEvilWonMissions} out of ${gameState.missions.length} missions.`;

    return newGameState;
  } else {
    let survivingFBIAgents = gameState.players.filter(player => player.alive && player.role != Roles.RootOfEvil);

    // If somehow population parity is reached
    // if (survivingFBIAgents.length < Math.max(...numPeoplePerMission[gameState.players.length])) {
    //   newGameState.state = 'GameOver';
    //   newGameState.winner = Roles.RootOfEvil;
    //   newGameState.gameOverMessage = `Too many FBI agents were killed`;

    //   return newGameState;
    // }
  }

  do {
    newGameState.teamLeadIndex = (newGameState.teamLeadIndex + 1) % gameState.players.length;
  } while (!newGameState.players[newGameState.teamLeadIndex].alive);

  newGameState.proposedTeam = null;
  newGameState.votes = {};
  newGameState.killVotes = {};
  newGameState.killContracts = [];
  newGameState.missionStatus = null;
  newGameState.killAttempted = null;
  newGameState.killed = null;
  newGameState.privateChatLeaked = null;
  newGameState.completeMission = 0;
  newGameState.failMission = 0;

  if (gameState.state == 'MissionComplete') {
    newGameState.currentMissionIndex = newGameState.currentMissionIndex + 1;
  }

  newGameState.state = 'TeamBuilding';
  return newGameState;
}
  
function start(gameState) {
  let numEvilMembers = calculateNumEvilMembers(gameState);

  let { chosen } = chooseNoReplacement(gameState.players.map(player => player.handle), numEvilMembers);
  let teamLeadIndex = choose(gameState.players);

  let newGameState = {
    ...gameState,
    state: 'TeamBuilding',
    teamLeadIndex
  };

  newGameState.players = gameState.players.map(player => {
    if (chosen.includes(player.handle)) {
      return {
        ...player,
        role: Roles.RootOfEvil
      };
    } else {
      return {
        ...player,
        role: Roles.FBI
      }
    }
  });

  newGameState.evilMembers = chosen.map(handle => {
    return {
      handle,
      alive: true,
      role: Roles.RootOfEvil
    };
  });

  newGameState.missions = generateMissions(newGameState);

  return newGameState;
}

function startWithConfig(gameState, config) {
  let numEvilMembers = config.numEvilMembers;

  let { chosen } = chooseNoReplacement(gameState.players.map(player => player.handle), numEvilMembers);
  let teamLeadIndex = choose(gameState.players);

  let newGameState = {
    ...gameState,
    state: 'TeamBuilding',
    teamLeadIndex
  };

  newGameState.players = gameState.players.map(player => {
    if (chosen.includes(player.handle)) {
      return {
        ...player,
        role: Roles.RootOfEvil
      };
    } else {
      return {
        ...player,
        role: Roles.FBI
      }
    }
  });

  newGameState.evilMembers = chosen.map(handle => {
    return {
      handle,
      alive: true,
      role: Roles.RootOfEvil
    };
  });

  return {
    newGameState,
    response: {
      ...newGameState,
      type: 'NEW_GAME_STATE'
    }
  };
}

module.exports = {
  createNew,
  apply,
  start,
  doMission,
  tick,
  startWithConfig,
  Roles,
  PrivateChatStore
};