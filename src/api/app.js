const http = require('http');
const express = require('express');

const {createAPI} = require('./api');
const {createStore} = require('./store');

function createApp(config) {
	const store = createStore(config.store);
	const api = createAPI(store);
	const app = express();

	app.use('/v1', api);

	return app;
}

module.exports = {
	createApp,
};
