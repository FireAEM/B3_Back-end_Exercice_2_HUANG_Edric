const Task = require('../models/task');

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
        if (!title || typeof title !== 'string') {
            return res.status(400).json({ error: "Le champ 'title' est requis et doit être une chaîne." });
        }

        const task = await Task.createTask(title);
        res.status(201).json(task);
    } catch (error) {
        console.error('Erreur createTaskHandler:', error);
        res.status(500).json({ error: 'Erreur interne lors de la création de la tâche.' });
    }
}

async function deleteTaskHandler(req, res) {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'ID invalide.' });
        }

        const ok = await Task.deleteTaskById(id);
        if (!ok) {
            return res.status(404).json({ error: 'ID introuvable.' });
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