
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const multer = require('multer');

admin.initializeApp();
const app = express();

// Izinkan semua origin (atau bisa dibatasi ke domain kamu)
app.use(cors({ origin: true }));

// Setup multer untuk handle file upload dari memory
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint test
app.get('/hello', (req, res) => {
  res.json({ message: 'Halo dari Firebase Functions!' });
});

// Endpoint upload file Excel
app.post('/uploadExcel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diupload.' });
    }

    const bucket = admin.storage().bucket();
    const blob = bucket.file(`uploads/${req.file.originalname}`);
    const blobStream = blob.createWriteStream();

    blobStream.end(req.file.buffer);

    blobStream.on('finish', () => {
      res.status(200).json({ message: 'Upload sukses!', filename: req.file.originalname });
    });

    blobStream.on('error', (err) => {
      res.status(500).json({ error: 'Gagal upload file.', detail: err.message });
    });
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan server.', detail: err.message });
  }
});

// Ekspor fungsi sebagai endpoint Firebase
exports.api = functions.https.onRequest(app);
