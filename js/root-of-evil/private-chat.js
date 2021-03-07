import { generateRandomBase64String } from '../utils';

const ids = new Map();

// Returns an id for a private chat
function newChatRoomId(prefix) {
  // TODO
  return '__' + prefix + '-' + generateRandomBase64String(10);
}

export default {
  newChatRoomId
};


