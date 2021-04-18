import { generateRandomBase64String } from '../utils';

class Lobby {
  constructor(serverAddr, lobbyId, clientId, isHost=false) {
    this.serverAddr = serverAddr;
    this.lobbyId = lobbyId;
    this.clientId = clientId;
    this.isHost = isHost;
    this.listening = false;

    this.numMessagesReceived = 0;
    this.pending = new Map();

    this.onMessage.bind(this);
    this.send.bind(this);
    this.respondTo.bind(this);
    this._continuouslyFetch.bind(this);
    this._fetchMessages.bind(this);
  }

  listen(callback) {
    // First time callback is attached
    if (!this.listening) {
      this.callback = callback;
      this._continuouslyFetch();
    }
  }

  onMessage(callback) {
    this.callback = callback;
  }

  send(message, returnResponse) {
    if (returnResponse) {
      let messageId = generateRandomBase64String(7);
  
      while (this.pending.has(messageId)) {
        messageId = generateRandomBase64String(7);
      }

      let promise = new Promise((resolve, reject) => {
        this.pending.set(messageId, {resolve, reject});
      });

      fetch(`${this.serverAddr}/lobbies/${this.lobbyId}/send`, {
        method: 'POST',
        headers: {
          'Content-type': 'text/plain'
        },
        body: JSON.stringify({...message, _id: messageId, _from: this.clientId})
      })
        .then(res => {
          if (res.status != 200) {
            // Wait for tick.
            setTimeout(() => {
              let { reject } = this.pending.get(messageId);
              this.pending.delete(messageId);
              reject();
            }, 1);
          }
        });

      return promise;
    } else {
      return fetch(`${this.serverAddr}/lobbies/${this.lobbyId}/send`, {
        method: 'POST',
        headers: {
          'Content-type': 'text/plain'
        },
        body: JSON.stringify({...message, _from: this.clientId})
      })
        .then(res => {
          if (res.status != 200) {
            throw new Error();
          }
        });
    }
  }

  respondTo(message, response) {
    response = {
      ...response,
      _id: message._id,
      _to: message._from
    };

    return this.send(response);
  }

  quit() {
    this.stop = true;

    // TODO
  }

  _continuouslyFetch() {
    this._fetchMessages()
      .then(() => {
        if (!this.stop) {
          setTimeout(this._continuouslyFetch.bind(this), 1);
        }
      })
      .catch(err => {
        console.log('[_continuouslyFetch] An error occured:');
        console.log(err);

        // Recover from failure
        if (!this.stop) {
          setTimeout(this._continuouslyFetch.bind(this), 1);
        }
      });
  }

  _fetchMessages() {
    return fetch(`${this.serverAddr}/lobbies/${this.lobbyId}/${this.numMessagesReceived}`, {
      headers: {
        prefer: 'wait=10000'
      }
    })
      .then(res => {
        return res.json();
      })
      .then(async json => {
        let messages = [];

        for (let message of json.messages) {
          message = JSON.parse(message);

          if (message._to === this.clientId) {
            if (message._id && this.pending.has(message._id)) {
              let { resolve } = this.pending.get(message._id);
              this.pending.delete(message._id);
  
              resolve(message);
              continue;
            }
          }

          messages.push(message);
        }

        this.numMessagesReceived += json.messages.length;

        if (!this.stop) {
          await this.callback(messages);
        }
      });
  }
}

let currentLobby;

export function create(serverAddr) {
  return fetch(`${serverAddr}/lobbies/new`)
    .then(res => {
      return res.json();
    })
    .then(json => {
      currentLobby = new Lobby(serverAddr, json.lobby_id, json.client_id, true);
      return currentLobby;
    });
}

export function join(serverAddr, lobbyId) {
  return fetch(`${serverAddr}/lobbies/${lobbyId}/join`)
    .then(res => {
      return res.json();
    })
    .then(json => {
      if (json.status == 'Ok') {
        currentLobby = new Lobby(serverAddr, lobbyId, json.client_id);
        return currentLobby;
      } else {
        throw new Error(json.message);
      }
    });
}

export function getCurrentLobby() {
  return currentLobby;
}

export function removeMetadata(msg) {
  let { _to, _from, _id, ...message } = msg;

  return message;
}

export default {
  create,
  join,
  getCurrentLobby,
  removeMetadata
};