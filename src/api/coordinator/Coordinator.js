const requestAccess = require('./requestAccess');

class Coordinator {
  constructor(store, registry) {
    this.store = store;
    this.owners = registry;
  }

  claim(id, secret, client) {
    console.info('Trying to claim %s', id);
    return this.store.verify(id, secret)
    .then(isValid => {
      if (!isValid) {
        console.info('Claim %s invalid', id);
        return;
      }

      owners.add(id, client);

      console.info('%d owners for %s', owners.size, id);
    });
  }

  release(id, client) {
    this.owners.remove(id, client);
    console.info('%d owners for %s', this.owners.get(id).size, id);
  }

  request(id, signature = null) {
    return new Promise(resolve => {
      const owners = this.owners.get(id);
      if (owners.size === 0) {
        throw new Error(`No owner for ${id}`);
      }

      resolve(owners);
    })
    .then(owners => {
      return Promise.race([...owners].map(client => {
        return requestAccess(client, id, signature);
      }));
    })
    .then(secret => {
      return this.store.retrieve(id, secret);
    });
  }
}

module.exports = Coordinator;
