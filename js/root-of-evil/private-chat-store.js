const { choose } = require('../utils');

const chats = new Map();

function add(message) {
  if (!chats.has(message.to)) {
    chats.set(message.to, {
      accessible: true,
      messages: []
    });
  }

  chats.get(message.to).messages.push(message);
}

function scheduleTermination(chatId, ms = 120000) {
  if (!chats.has(chatId)) {
    return;
  }

  // Set chat to expire in 2 minutes
  setTimeout(function() {
    chats.get(chatId).accessible = false; 
  }, ms);
}

function get() {
  // Just return the first accessible chat
  for (let [id, chat] of chats) {
    if (chat.accessible) {
      // Once a chat is accessed, it becomes unaccessible
      chat.accessible = false;
      return chat.messages;
    }
  }

  return null;
}

function leak() {
  let chatIds = [];
  for (let id of chats.keys()) {
    chatIds.push(id);
  }

  let randomId = choose(chatIds);
  let chat = chats.get(randomId).messages;

  let randomStart = choose(chats.get(chatIds).messages);

  let leaked = [];
  // Grab up to 20 messages
  for (let i = randomStart; i < chat.messages.length && i - randomStart < 20; i++) {
    leaked.push(messages[i]);
  }

  return leaked;
}

module.exports = {
  add,
  scheduleTermination,
  get,
  leak
};