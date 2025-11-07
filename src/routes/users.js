const express = require('express');
const router = express.Router();
const { signup, login, deleteUser } = require('../controllers/userController');

router.post('/signup', signup);
router.post('/login', login);
router.delete('/:id', deleteUser);

module.exports = router;