const INITIAL_STATE = {
  appState: 'Menu', // enum('Menu', 'InGame'),
  lobbyCode: '',
  members: ['steve', 'chenchen', 'qin', 'rubob']
};

export default function reducer(state = INITIAL_STATE, action) {
  return state;
}