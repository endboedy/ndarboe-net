const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: 'https://endboedy.github.io' }));

app.get('/hello', (req, res) => {
  res.json({ message: 'Halo dari Firebase Functions!' });
});

exports.api = functions.https.onRequest(app);
