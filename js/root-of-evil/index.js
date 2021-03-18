const PrivateChatStore = require('./private-chat-store');
const { choose, chooseNoReplacement } = require('../utils');

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
    teamLead: null,
    votes: null,
    proposedTeam: null,
    votesToKill: null,
    killContracts: []
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
      players: [...gameState.players, joinData.handle],
    },
    response: {
      result: 'Accepted'
    }
  };
}

function vote(gameState, action) {
  let votesCopy = {...gameState.votes};
  votesCopy[action.from] = action.accepted;

  let newGameState = {
    ...gameState,
    votes: votesCopy
  };

  let statusReport = generateStatusReport(newGameState);

  if (statusReport) {
    newGameState.statusReport = statusReport;
    newGameState.state = 'StatusReport';
  }

  return {
    newGameState
  };
}

function voteToKill(gameState, action) {
  let votesToKillCopy = {...gameState.voteToKill};
  votesToKillCopy[action.from] = action.victim;

  let newGameState = {
    ...gameState,
    votesToKill
  };

  let statusReport = generateStatusReport(newGameState);

  if (statusReport) {
    newGameState.statusReport = statusReport;
    newGameState.state = 'StatusReport';
  }

  return {
    newGameState
  };
}

function generateStatusReport(gameState) {
  let numVotedYes = 0;
  let numVotedNo = 0;

  for (let member of Object.keys(votesCopy)) {
    if (votesCopy[member]) {
      numVotedYes++;
    } else if (votesCopy[member] !== null && !votesCopy[member]) {
      numVotedNo++;
    }
  }

  let numVotesToKill = 0;
  let votesToKill = {};
  let victim = null;

  for (let evilMember of Object.keys(gameState.votesToKill)) {
    numVotesToKill++;
    if (gameState.votesToKill[evilMember]) {
      victim = gameState.votesToKill[evilMember];
      votesToKill[victim]++;
    }
  }

  if ((numVotedYes + numVotedNo) == gameState.players.length && numVotesToKill == gameState.evilMembers.length) {
    let victimKilled = votesToKill[victim] == gameState.evilMembers.length;
    let contractKilled = victimKilled && gameState.killContracts.includes(victim);

    return {
      mission: bountyKilled ? false : numVotedYes >= gameState.players.length / 2.0 ? true : false,
      killed: victimKilled ? victim : null,
      privateChatLeaked: victim && !contractKilled
    };
  } else {
    return null;
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

module.exports = {
  createNew,
  apply,
  start,
  startWithConfig,
  Roles,
  PrivateChatStore
};