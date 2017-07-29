const express = require('express');
const busboy = require('connect-busboy');

module.exports = function upload(storage) {
  const router = express.Router();

  router.post('/', busboy(), (req, res) => {
    if (!req.busboy) {
      res.status(400);
      res.end('No file.');
      return;
    }

    req.busboy.on('file', (fieldname, file, name, encoding, mime) => {

      storage.store(file, {name, mime})
      .then(receipt => {
        const response = {
          id: receipt.id,
          secret: receipt.secret,
        };

        res.end(JSON.stringify(response));
      });

    });

    req.pipe(req.busboy);
  });

  return router;
}
