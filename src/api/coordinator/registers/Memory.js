class MemoryRegistry
{
	constructor() {
	  this.owners = new Map();
	}

	add(id, owner) {
	  if (!this.owners.has(id)) {
	    this.owners.set(id, new Set());
	  }

	  this.owners.get(id).add(owner);
	}

	remove(id, owner) {
	  if (this.owners.has(id)) {
	    const owners = this.owners.get(id);
	    owners.delete(owner);

	    if (owners.size === 0) {
	      this.owners.delete(id);
	    }
	  }
	}

	get(id) {
	  return this.owners.has(id)
	    ? this.owners.get(id)
	    : new Set();
	}
}

module.exports = MemoryRegistry;
