import { sleep } from '../utils';

class Lobby {
  constructor(serverAddr, lobbyId, clientId, isHost) {
    this.serverAddr = serverAddr;
    this.lobbyId = lobbyId;
    this.clientId = clientId;
    this.isHost = isHost;

    this.listening = false;
  }

  listen(callback) {
    this.callback = callback;
    this.listening = true;
  }

  send(message, returnResponse) {
    if (returnResponse) {
      return sleep(1000)
        .then(() => {
          return {result: 'Accepted'};
        });
    }

    return sleep(1000);
  }
}

let currentLobby;

function create(serverAddr) {
  return sleep(1000)
    .then(() => {
      currentLobby = new Lobby(serverAddr, '00000', 0, true);
      return currentLobby;
    });
}

function join(serverAddr, lobbyId) {
  return sleep(1000)
    .then(() => {
      currentLobby = new Lobby(serverAddr, lobbyId, 1);
      return currentLobby;
    });
}

function getCurrentLobby() {
  return currentLobby;
}

export default {
  create,
  join,
  getCurrentLobby
};

