import { sleep } from '../utils';

function fetch(addr) {
  if (addr.includes('/lobbies/new')) {
    return sleep(1000)
      .then(() => {
        return new Promise((resolve, reject) => {
          resolve({
            ok: true,
            json: function() {
              return Promise.resolve({lobby_id: '00000', client_id: 0});
            }
          });
        });
      });
  }

  return Promise.resolve();
}

export default {
  fetch
};