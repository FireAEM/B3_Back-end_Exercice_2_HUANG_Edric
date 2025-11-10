const User = require('../models/user');
const dbUser = (process.env.DB_USER || 'postgres').toLowerCase();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function signup(req, res) {
    try {
        const { nom, email, password } = req.body;

        if (!nom || typeof nom !== 'string' || nom.trim().length === 0) {
            return res.status(400).json({ error: "Le champ 'nom' est requis." });
        }
        if (!email || typeof email !== 'string' || email.trim().length === 0) {
            return res.status(400).json({ error: "Le champ 'email' est requis." });
        }
        if (!password || typeof password !== 'string' || password.trim().length < 6) {
            return res.status(400).json({ error: "Le champ 'password' est requis et doit contenir au moins 6 caractères." });
        }

        // Vérifier si l'email existe déjà
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: "Un utilisateur avec cet email existe déjà." });
        }

        const newUser = await User.createUser(nom, email, password);
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Erreur signup:', error);
        res.status(500).json({ error: `Erreur interne lors de la création de l'utilisateur.` });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email et mot de passe sont requis." });
        }

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur introuvable." });
        }

        // Vérification du mot de passe
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Mot de passe incorrect." });
        }

        // Génération du token JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                nom: user.nom
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ id: user.id, nom: user.nom, email: user.email, token });
    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({ error: 'Erreur interne lors de la connexion.' });
    }
}

async function deleteUserHandler(req, res) {
    try {
        const rawId = req.params.id;

        if (dbUser === 'mongo') {
            // Validation basique ObjectId (24 hex chars)
            if (!/^[0-9a-fA-F]{24}$/.test(rawId)) {
                return res.status(400).json({ error: 'ID MongoDB invalide.' });
            }

            const ok = await User.deleteUserById(rawId);
            if (!ok) {
                return res.status(404).json({ error: 'Utilisateur introuvable.' });
            }

            return res.status(200).json({ message: 'Utilisateur supprimé.' });
        }

        // Postgres: numeric id
        const id = Number(rawId);
        if (Number.isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'ID invalide.' });
        }

        const ok = await User.deleteUserById(id);
        if (!ok) {
            return res.status(404).json({ error: 'Utilisateur introuvable.' });
        }

        res.status(200).json({ message: 'Utilisateur supprimé.' });
    } catch (error) {
        console.error('Erreur deleteUserHandler:', error);
        res.status(500).json({ error: `Erreur interne lors de la suppression de l'utilisateur.` });
    }
}

module.exports = {
    signup,
    login,
    deleteUser: deleteUserHandler
};