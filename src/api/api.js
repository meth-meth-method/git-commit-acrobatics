const express = require('express');
const uploadHandler = require('./endpoints/upload');
const downloadHandler = require('./endpoints/download');

function createAPI(store) {
  const api = express.Router();

  api.use('/file/upload', uploadHandler(store));
  api.use('/file/download', downloadHandler(store));

  return api;
}

module.exports = {
  createAPI,
};
