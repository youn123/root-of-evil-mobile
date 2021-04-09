const { choose } = require('../utils');

const chats = new Map();

function add(message) {
  if (!chats.has(message.to)) {
    chats.set(message.to, {
      hackable: true,
      messages: []
    });
  }

  chats.get(message.to).messages.push(message);
}

function scheduleTermination(chatId, ms = 120000) {
  if (!chats.has(chatId)) {
    return;
  }

  // Set chat to expire in 2 minutes.
  // Warning: Setting a timer for long time on Android is bad?
  setTimeout(function() {
    chats.get(chatId).hackable = false; 
  }, ms);
}

function get() {
  // Just return the first hackable chat
  for (let [id, chat] of chats) {
    if (chat.hackable) {
      // Once a chat is accessed, it becomes unhackable
      chat.hackable = false;
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

  if (chatIds.length == 0) {
    return [];
  }

  let randomId = chatIds[choose(chatIds)];

  console.log(`chose ${randomId}`);

  let chat = chats.get(randomId);

  console.log(chat);

  let randomStart = choose(chat.messages);
  let leaked = [];

  // Grab up to 20 messages
  for (let i = randomStart; i < chat.messages.length && i - randomStart < 20; i++) {
    leaked.push(chat.messages[i]);
  }

  return leaked;
}

module.exports = {
  add,
  scheduleTermination,
  get,
  leak
};