const express = require('express');

module.exports = function download(store) {
  const router = express.Router();

  router.get('/:id/:secret', (req, res) => {
    const {id, secret} = req.params;
    store.retrieve(id, secret)
    .then(({meta, stream}) => {
      const {size, mime, name} = meta;
      res.setHeader('Content-Length', size);
      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
      stream.pipe(res);
    });
  });

  return router;
}
