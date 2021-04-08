import { randomBytes } from 'react-native-randombytes';

let num = 0;

export function sleep(ms) {
  return new Promise(function(resolve, _) {
    setTimeout(resolve, ms);
  });
}

export function generateRandomBase64String(length) {
  let str = randomBytes(Math.ceil(length * 6 / 8)).toString('base64');
  return str.substring(0, length);
}

export function nextId() {
  return num++;
}

export function chooseNoReplacement(arr, numToChoose) {
  let arrCopy = [...arr];
  let chosen = [];

  for (let i = 0; i < numToChoose; i++) {
    let randIndex = Math.floor(Math.random() * arrCopy.length);
    chosen.push(arrCopy[randIndex]);
    arrCopy.splice(randIndex, 1);
  }

  return {
    finalArr: arrCopy,
    chosen
  };
}

export function choose(arr) {
  return Math.floor(Math.random() * arr.length);
}

export function obfuscateMessage(message, hideHandle) {

  let obfuscatedMessage;
  if (hideHandle) {
    obfuscatedMessage = obfuscateHandle(message);
  } else {
    obfuscatedMessage = {...message};
  }

  let now = Date.now();
  let ageInSeconds = (now - message.timestamp) / 1000;

  let charArray = [...message.text];
  let mask = Math.floor(Math.random() * 50);

  decayRate = ageInSeconds * 0.0005;

  if (decayRate > 0.5) {
    return obfuscatedMessage;
  }

  for (let i in charArray) {
    if (Math.random() < decayRate) {
      charArray[i] = String.fromCharCode(charArray[i].charCodeAt(0) ^ mask);
    }
  }
  
  obfuscatedMessage.text = charArray.join('');
  return obfuscatedMessage;
}

export function obfuscateHandle(message) {
  let obfuscatedMessage = {...message};
  if (obfuscateHandle) {
    obfuscatedMessage.from = '***';
  }

  return obfuscatedMessage;
}