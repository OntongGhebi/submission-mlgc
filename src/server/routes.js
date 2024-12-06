const postPredictHandler = require('./handler');

const routes = [
  {
    method: 'POST',
    path: '/predict',
    handler: postPredictHandler,
    options: {
      payload: {
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data',
        multipart: true,
        maxBytes: 1000000 // Maksimal 1MB
      },
    },
  },
];

module.exports = routes;
