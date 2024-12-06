const tf = require('@tensorflow/tfjs-node'); // TensorFlow.js untuk Node.js

/**
 * Fungsi untuk memprediksi label gambar menggunakan model
 * @param {Buffer} imageBuffer - Buffer gambar yang diunggah
 * @param {tf.LayersModel} model - Model TensorFlow yang sudah diload
 * @returns {Object} Hasil prediksi
 */
const predictClassification = async (imageBuffer, model) => {
  try {
    // Pastikan model tersedia
    if (!model) {
      throw new Error('Model is not loaded or defined.');
    }

    // Preprocessing gambar agar sesuai dengan input model
    const tensorImage = tf.node
      .decodeImage(imageBuffer) // Decode buffer ke tensor
      .resizeNearestNeighbor([224, 224]) // Resize ke dimensi model
      .toFloat()
      .div(tf.scalar(255)) // Normalisasi piksel
      .expandDims(); // Tambahkan dimensi batch
    console.log('Tensor shape:', tensorImage.shape);

    // Lakukan prediksi
    const prediction = model.predict(tensorImage).dataSync();

    // Misal threshold untuk mendeteksi kanker adalah >0.5
    const label = prediction[0] > 0.58 ? 'Cancer' : 'Non-cancer';
    const confidenceScore = (prediction[0] * 100).toFixed(2); // Confidence dalam persen

    // Hasil prediksi
    return {
      confidenceScore,
      label,
      suggestion: label === 'Cancer' ? 'Segera periksa ke dokter!' : 'Penyakit kanker tidak terdeteksi.',
    };
  } catch (error) {
    console.error('Error during prediction:', error.message);
    throw new Error('Failed to process the image for prediction.');
  }
};

module.exports = predictClassification;
