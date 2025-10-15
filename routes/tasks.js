const express = require('express');
const router = express.Router();
const { getAll, createTask, deleteTask } = require('../controllers/taskController');

router.get('/', getAll);
router.post('/', createTask);
router.delete('/:id', deleteTask);

module.exports = router;