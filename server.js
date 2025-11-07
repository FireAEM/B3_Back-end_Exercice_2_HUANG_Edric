require('dotenv').config();

const express = require('express');
const methodOverride = require('method-override');

const cors = require('cors');
const path = require('path');

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Models & Routes
const Task = require('./src/models/task');
const tasksRouter = require('./src/routes/tasks');
const usersRouter = require('./src/routes/users');
const { connectToDatabase } = require('./src/config/db');



const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: false }));

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Routes
app.get('/', async (req, res, next) => {
    try {
        const tasks = await Task.listTasks();
        res.render('index', { tasks });
    } catch (error) {
        next(error);
    }
});

app.use('/tasks', tasksRouter);
app.use('/users', usersRouter);

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Gestion des erreurs 404
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
            console.log(`📖 Documentation Swagger disponible sur http://localhost:${PORT}/api-docs`);
        });
    } catch (err) {
        console.error('❌ Impossible de démarrer le serveur sans connexion à la base de données :', err);
        process.exit(1); // Arrêt du process si la DB n'est pas dispo
    }
}

startServer();