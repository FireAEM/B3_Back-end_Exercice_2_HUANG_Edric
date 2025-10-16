const mongoose = require('mongoose');

async function connectToDatabase() {
    const defaultUri = 'mongodb://127.0.0.1:27017/B3_Back-end_Exercice_2';
    const mongoUri = process.env.MONGO_URI || defaultUri;

    // Options recommandées pour Mongoose
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
    };

    // Déjà connecté
    if (mongoose.connection.readyState === 1) {
        console.log('MongoDB: déjà connecté');
        return mongoose.connection;
    }

    // Connexion en cours
    if (mongoose.connection.readyState === 2) {
        console.log('MongoDB: connexion en cours...');
        return mongoose.connection.asPromise();
    }

    try {
        const conn = await mongoose.connect(mongoUri, options);
        console.log(`MongoDB connecté: ${mongoUri}`);

        // Écouteurs d'événements basiques pour faciliter le debug
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB erreur de connexion:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB déconnecté');
        });

        return conn;
    } catch (error) {
        console.error('MongoDB échec de connexion:', error);
        // Propager l'erreur pour que l'appelant puisse la gérer
        throw error;
    }
}

module.exports = { connectToDatabase };