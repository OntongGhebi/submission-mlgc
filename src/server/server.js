require('dotenv').config();

const Hapi = require('@hapi/hapi');
const routes = require('../server/routes'); // Pastikan path file routes sudah benar
const loadModel = require('../services/loadModel'); // Pastikan path file loadModel sudah benar
const InputError = require('../exceptions/InputError'); // Pastikan file ini tersedia jika ingin menangani error khusus

(async () => {
    try {
        // Membuat server Hapi
        const server = Hapi.server({
            port: 9000, // Ubah sesuai kebutuhan
            host: 'localhost',
            routes: {
                cors: {
                    origin: ['*'], // Mengizinkan CORS untuk semua origin
                },
            },
        });

        // Memuat model TensorFlow dan menyimpannya di server.app
        const model = await loadModel();
        server.app.model = model; // Model akan dapat diakses dari handler melalui `request.server.app.model`

        // Menambahkan routes
        server.route(routes);

        // Middleware untuk menangani error yang terjadi sebelum respons dikirim
        server.ext('onPreResponse', function (request, h) {
            const response = request.response;

            // Menangani error dari tipe InputError
            if (response instanceof InputError) {
                const newResponse = h.response({
                    status: 'fail',
                    message: `${response.message} Silakan gunakan foto lain.`,
                });
                newResponse.code(response.statusCode || 400); // Pastikan ada statusCode di InputError
                return newResponse;
            }

            // Menangani error yang dilemparkan oleh server
            if (response.isBoom) {
                const newResponse = h.response({
                    status: 'fail',
                    message: response.output.payload.message, // Pesan error
                });
                newResponse.code(response.output.statusCode || 500);
                return newResponse;
            }

            // Lanjutkan ke respons normal jika tidak ada error
            return h.continue;
        });

        // Memulai server
        await server.start();
        console.log(`Server started at: ${server.info.uri}`);
    } catch (error) {
        console.error('Error during server initialization:', error);
        process.exit(1); // Keluar dari proses jika ada error
    }
})();
