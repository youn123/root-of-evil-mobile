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
    votes: {},
    proposedTeam: null,
    killVotes: {},
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
  votesCopy[action.from] = action.accept;

  let newGameState = {
    ...gameState,
    votes: votesCopy
  };

  let statusReport = generateStatusReport(newGameState);

  if (statusReport) {
    newGameState.statusReport = statusReport;
    newGameState.state = 'MissionComplete';
  }

  return newGameState;
}

function voteToKill(gameState, action) {
  let killVotesCopy = {...gameState.voteToKill};
  killVotesCopy[action.from] = action.victim;

  let newGameState = {
    ...gameState,
    killVotes: killVotesCopy
  };

  let statusReport = generateStatusReport(newGameState);

  if (statusReport) {
    newGameState.statusReport = statusReport;
    newGameState.state = 'MissionComplete';
  }

  return newGameState;
}

function generateStatusReport(gameState) {
  let numVotedYes = 0;
  let numVotedNo = 0;

  for (let member of Object.keys(gameState.votes)) {
    if (gameState.votes[member]) {
      numVotedYes++;
    } else if (gameState.votes[member] !== null && !gameState.votes[member]) {
      numVotedNo++;
    }
  }

  let numKillVotes = 0;
  let victimsToVotes = {};
  let victim = null;

  for (let evilMember of Object.keys(gameState.killVotes)) {
    numKillVotes++;
    victim = gameState.killVotes[evilMember];

    if (victim) {
      if (!victimsToVotes[victim]) {
        victimsToVotes[victim] = 0;
      } else {
        victimsToVotes[victim]++;
      }
    }
  }

  if ((numVotedYes + numVotedNo) == gameState.players.length && numKillVotes == gameState.evilMembers.length) {
    console.log('Doh!');
    let victimSuccessfullyKilled = victim && victimsToVotes[victim] == gameState.evilMembers.length;
    let victimHadKillContract = victimSuccessfullyKilled && gameState.killContracts.includes(victim);

    return {
      mission: victimHadKillContract ? false : numVotedYes >= gameState.players.length / 2.0 ? true : false,
      killed: victimSuccessfullyKilled ? victim : null,
      privateChatLeaked: victim && !victimHadKillContract
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