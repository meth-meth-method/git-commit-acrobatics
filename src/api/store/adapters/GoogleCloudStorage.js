class GoogleCloudStorageAdapter
{
	constructor(bucket) {
	  this.bucket = bucket;
	}

	getFile(id) {
	  return this.bucket.file(id);
	}

	getStream(id) {
	  return this.getFile(id).createReadStream();
	}

	putStream(input, id) {
	  const output = this.getFile(id).createWriteStream();
	  return input.pipe(output);
	}
}

module.exports = GoogleCloudStorageAdapter;
