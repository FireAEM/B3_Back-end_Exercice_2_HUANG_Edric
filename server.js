require('dotenv').config();
const express = require('express');
const cors = require('cors');
const tasksRouter = require('./src/routes/tasks');
const { connectToDatabase } = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('ToDoList API Express');
});

app.use('/tasks', tasksRouter);

app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Fonction de démarrage
async function startServer() {
    try {
        // Connexion à la base
        await connectToDatabase();

        // Démarrage du serveur uniquement si la DB est OK
        app.listen(PORT, () => {
            console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('❌ Impossible de démarrer le serveur sans connexion à la base de données :', err);
        process.exit(1); // Arrêt du process si la DB n’est pas dispo
    }
}

startServer();