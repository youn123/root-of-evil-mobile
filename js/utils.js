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

export function appendAndIncrement(str) {
  return `${str}-${num++}`;
}