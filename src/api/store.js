const DiskAdapter = require('./store/adapters/DiskStorage');
const GCSAdapter = require('./store/adapters/GoogleCloudStorage');
const Store = require('./store/Store');

function createAdapter(config) {
	if (config.adapter === 'gcs') {
	  const storage = GCS({
	    projectId: config.gcs.projectId,
	    keyFilename: config.gcs.keyFilename,
	  });

	  const bucket = storage.bucket(config.gcs.bucket);
	  return new GCSAdapter(bucket);

	} else if (config.adapter === 'disk') {
	  return new DiskAdapter(config.disk.dir);
	}
}

function createStore(config) {
	const adapter = createAdapter(config);
	return new Store(adapter);
}

module.exports = {
	createAdapter,
	createStore,
};
