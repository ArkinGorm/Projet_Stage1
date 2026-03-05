const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Inscription
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation de base
        if (!username || !email || !password) {
            return res.status(400).json({ 
                message: 'Tous les champs sont requis' 
            });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Un utilisateur avec cet email existe déjà' 
            });
        }

        // Créer l'utilisateur
        const user = new User({
            username,
            email,
            password,
            role: 'participant' // Par défaut
        });

        const userId = await user.save();

        // Générer le token
        const token = jwt.sign(
            { userId, email, role: 'participant' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.status(201).json({
            message: 'Inscription réussie',
            token,
            user: {
                id: userId,
                username,
                email,
                role: 'participant'
            }
        });

    } catch (error) {
        console.error('Erreur inscription:', error);
        res.status(500).json({ 
            message: 'Erreur lors de l\'inscription',
            error: error.message 
        });
    }
};

// Connexion
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email et mot de passe requis' 
            });
        }

        // Chercher l'utilisateur
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ 
                message: 'Email ou mot de passe incorrect' 
            });
        }

        // Vérifier le mot de passe
        const userInstance = new User(user);
        const isMatch = await userInstance.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ 
                message: 'Email ou mot de passe incorrect' 
            });
        }

        // Générer le token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Erreur connexion:', error);
        res.status(500).json({ 
            message: 'Erreur lors de la connexion',
            error: error.message 
        });
    }
};

// Profil utilisateur
const getProfile = async (req, res) => {
    try {
        // req.user vient du middleware auth
        const user = req.user;
        
        res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Erreur profil:', error);
        res.status(500).json({ 
            message: 'Erreur lors de la récupération du profil',
            error: error.message 
        });
    }
};

module.exports = { register, login, getProfile };