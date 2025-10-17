const Task = require('../models/task');
const dbClient = (process.env.DB_CLIENT || 'postgres').toLowerCase();

async function getAll(req, res) {
    try {
        const tasks = await Task.listTasks();
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Erreur getAll:', error);
        res.status(500).json({ error: 'Erreur interne lors de la récupération des tâches.' });
    }
}

async function createTaskHandler(req, res) {
    try {
        const { title } = req.body;
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return res.status(400).json({ error: "Le champ 'title' est requis, doit être une chaîne non vide." });
        }

        const task = await Task.createTask(title);

        if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
            return res.redirect('/');
        }

        res.status(201).json(task);
    } catch (error) {
        console.error('Erreur createTaskHandler:', error);
        res.status(500).json({ error: 'Erreur interne lors de la création de la tâche.' });
    }
}

async function deleteTaskHandler(req, res) {
    try {
        const rawId = req.params.id;

        if (dbClient === 'mongo') {
            // Validation basique ObjectId (24 hex chars)
            if (!/^[0-9a-fA-F]{24}$/.test(rawId)) {
                return res.status(400).json({ error: 'ID MongoDB invalide.' });
            }

            const ok = await Task.deleteTaskById(rawId);
            if (!ok) {
                return res.status(404).json({ error: 'ID introuvable.' });
            }

            if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
                return res.redirect('/');
            }

            return res.status(200).json({ message: 'Tâche supprimée.' });
        }

        // Postgres: numeric id
        const id = Number(rawId);
        if (Number.isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'ID invalide.' });
        }

        const ok = await Task.deleteTaskById(id);
        if (!ok) {
            return res.status(404).json({ error: 'ID introuvable.' });
        }

        if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
            return res.redirect('/');
        }

        res.status(200).json({ message: 'Tâche supprimée.' });
    } catch (error) {
        console.error('Erreur deleteTaskHandler:', error);
        res.status(500).json({ error: 'Erreur interne lors de la suppression de la tâche.' });
    }
}

module.exports = {
    getAll,
    createTask: createTaskHandler,
    deleteTask: deleteTaskHandler
};