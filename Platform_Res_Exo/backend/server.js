const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Connexion à MongoDB
const { connectDB } = require('./src/config/db');

// Importer des routes
const authRoutes = require('./src/routes/authRoutes');
const exerciseRoutes = require('./src/routes/exerciseRoutes');
const submissionRoutes = require('./src/routes/submissionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger simple pour le développement
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/submissions', submissionRoutes);

// Route de test
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API fonctionnelle !',
        timestamp: new Date(),
        status: 'ok'
    });
});

// Route 404
app.use((req, res) => {
    res.status(404).json({ 
        message: 'Route non trouvée',
        path: req.originalUrl 
    });
});

// Gestion des erreurs globale
app.use((err, req, res, next) => {
    console.error(' Erreur:', err);
    res.status(500).json({ 
        message: 'Erreur serveur',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Démarrer le serveur
async function startServer() {
    try {
        // Connecter à MongoDB
        await connectDB();
        
        // Démarrer le serveur
        app.listen(PORT, () => {
            console.log(`
╔══════════════════════════════════════════╗
║   🚀 Serveur démarré avec succès !       ║
╠══════════════════════════════════════════╣
║   📡 Port: ${PORT}                                    ║
║   🔗 API: http://localhost:${PORT}                     ║
║   📦 MongoDB: Connecté                    ║
║   ⚡ Mode: ${process.env.NODE_ENV || 'development'}            ║
╚══════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        console.error(' Erreur au démarrage:', error);
        process.exit(1);
    }
}

startServer();