const express = require('express');
const router = express.Router();
const { signup, login, deleteUser } = require('../controllers/userController');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives max par IP
    message: `Trop de tentatives de connexion, réessayez plus tard.`,
    standardHeaders: true,
    legacyHeaders: false,
})

router.post('/signup', signup);
router.post('/login', loginLimiter, login);
router.delete('/:id', deleteUser);

module.exports = router;