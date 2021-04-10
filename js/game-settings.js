export const PRIVATE_CHAT_COOLDOWN_TIME = 100000;

const numEvilMembers = {
  // For testing
  1: 0,
  2: 1,
  3: 2,
  // Real games
  5: 2,
  6: 2,
  7: 2,
  8: 3,
  9: 3,
  10: 3
};

const numPeoplePerMission = {
  // For testing
  1: [1, 1, 1, 1, 1],
  2: [1, 1, 2, 2, 2],
  3: [2, 2, 2, 2, 2],
  // Real games
  5: [2, 3, 4, 3, 3],
  6: [2, 3, 4, 3, 4],
  7: [2, 3, 3, 4, 4],
  8: [3, 4, 4, 5, 5],
  9: [3, 4, 4, 5, 5],
  10: [3, 4, 4, 4, 5,]
};

export function calculateNumEvilMembers(gameState) {
  return numEvilMembers[gameState.players.length];
}

export function calculateNumHacks(gameState) {
  return gameState.players.length + 2;
}

export function generateMissions(gameState) {
  return numPeoplePerMission[gameState.players.length].map(numPeople => {
    return {
      numPeople: numPeople,
      status: null
    };
  });
}
