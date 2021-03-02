import { sleep } from '../utils';

class Lobby {
  constructor(serverAddr, lobbyId, clientId, isHost) {
    this.serverAddr = serverAddr;
    this.lobbyId = lobbyId;
    this.clientId = clientId;
    this.isHost = isHost;

    this.listening = false;
    this.messages = [];
  }

  listen(callback) {
    this.callback = callback;
    this.listening = true;

    this.checkForMessages = setInterval(() => {
      if (this.messages.length != 0) {
        this.callback(this.messages);
        this.messages = [];
      }
    }, 100);
  }

  send(message, returnResponse) {
    if (returnResponse) {
      return sleep(1000)
        .then(() => {
          return {result: 'Accepted'};
        });
    }

    return sleep(1000)
      .then(() => {
        this.messages.push(message);
      });
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

export function getCurrentLobby() {
  return currentLobby;
}

export default {
  create,
  join,
  getCurrentLobby
};

