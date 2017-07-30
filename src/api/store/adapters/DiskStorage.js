const fs = require('fs');
const path = require('path');

class DiskStorageAdapter
{
  constructor(dir) {
    this.dir = dir;
  }

  toPath(id) {
    return path.join(this.dir, id);
  }

  getStream(id) {
    const path = this.toPath(id);
    return fs.createReadStream(path);
  }

  putStream(id, input) {
    const path = this.toPath(id);
    const output = fs.createWriteStream(path);
    return input.pipe(output);
  }
}

module.exports = DiskStorageAdapter;
