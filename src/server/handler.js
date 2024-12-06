const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData');

const postPredictHandler = async (request, h) => {
  try {
    const { payload } = request;

    // Pastikan ada file yang diupload
    if (!payload || !payload.image) {
      return h.response({
        status: 'fail',
        message: 'No file uploaded',
      }).code(400);
    }

    const file = payload.image;

    // Logging untuk memeriksa file yang diterima
    console.log('File:', file);
    console.log('File size:', file._data.length);
    console.log('File Content-Type:', file.hapi.headers['content-type']);

    // Validasi jenis file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.hapi.headers['content-type'])) {
      return h.response({
        status: 'fail',
        message: 'Invalid file type. Only image files are allowed.',
      }).code(415);
    }

    // Validasi ukuran file
    if (file._data.length > 1000000) {
      return h.response({
        status: 'fail',
        message: 'Payload content length greater than maximum allowed: 1000000',
      }).code(413);
    }

    // Akses model dari server.app
    const model = request.server.app.model;
    if (!model) {
      return h.response({
        status: 'fail',
        message: 'Model is not loaded. Please try again later.',
      }).code(500);
    }

    // Lakukan prediksi menggunakan fungsi predictClassification
    const { confidenceScore, label } = await predictClassification(file._data, model);

    // Persiapkan data hasil prediksi
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const data = {
      id,
      result: label === 'Cancer' ? 'Cancer' : 'Non-cancer',
      suggestion: label === 'Cancer' ? 'Segera periksa ke dokter!' : 'Penyakit kanker tidak terdeteksi.',
      confidenceScore,
      createdAt,
    };

    // Simpan data hasil prediksi ke storage
    await storeData(id, data);

    // Kirim respons sukses
    return h.response({
      status: 'success',
      message: 'Model is predicted successfully',
      data,
    }).code(201);
  } catch (error) {
    console.error('Error:', error);
    return h.response({
      status: 'fail',
      message: 'Terjadi kesalahan dalam melakukan prediksi',
    }).code(400);
  }
};

module.exports = postPredictHandler;
