const tf = require('@tensorflow/tfjs-node');

async function loadModel() {
    // Path model dapat berupa URL atau jalur lokal
    const modelPath = process.env.MODEL_URL; // Pastikan MODEL_URL sudah diatur di .env
    const model = await tf.loadGraphModel(modelPath);
    return model;
}

module.exports = loadModel;