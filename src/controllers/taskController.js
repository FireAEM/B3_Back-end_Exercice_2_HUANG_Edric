const { TaskManager } = require('../models/task');
const taskManager = new TaskManager();

function getAll(req, res) {
    try {
        const tasks = taskManager.list().map(task => task.toJSON());
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Erreur interne lors de la récupération des tâches.' });
    }
}

function createTask(req, res) {
    try {
        const { title } = req.body;
        if (!title || typeof title !== 'string') {
            return res.status(400).json({ error: "Le champ 'title' est requis et doit être une chaîne." });
        }
        const task = taskManager.add(title);
        res.status(201).json(task.toJSON());
    } catch (error) {
        res.status(500).json({ error: 'Erreur interne lors de la création de la tâche.' });
    }
}

function deleteTask(req, res) {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'ID invalide.' });
        }
        const ok = taskManager.delete(id);
        if (!ok) return res.status(404).json({ error: 'ID introuvable.' });
        res.status(200).json({ message: 'Tâche supprimée.' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur interne lors de la suppression de la tâche.' });
    }
}

module.exports = { getAll, createTask, deleteTask };