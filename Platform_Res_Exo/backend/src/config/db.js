const { MongoClient } = require('mongodb');

// URI de connexion
const uri = "mongodb://localhost:27017";
const dbName = "mongodb-local";

let db = null;
let client = null;

async function connectDB() {
    try {
        if (db) return db; // Retourne la connexion existante
        
        console.log(' Connexion à MongoDB...');
        client = new MongoClient(uri);
        await client.connect();
        console.log(' Connecté à MongoDB');
        
        db = client.db(dbName);
        
        // Créer des index pour améliorer les performances
        await createIndexes(db);
        
        return db;
    } catch (error) {
        console.error(' Erreur de connexion MongoDB:', error);
        process.exit(1);
    }
}

async function createIndexes(db) {
    try {
        // Index pour la collection users
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        await db.collection('users').createIndex({ username: 1 }, { unique: true });
        
        // Index pour la collection exercises
        await db.collection('exercises').createIndex({ title: 1 });
        await db.collection('exercises').createIndex({ difficulty: 1 });
        await db.collection('exercises').createIndex({ isPublished: 1 });
        
        // Index pour la collection submissions
        await db.collection('submissions').createIndex({ userId: 1, exerciseId: 1 });
        await db.collection('submissions').createIndex({ status: 1 });
        
        console.log(' Index créés avec succès');
    } catch (error) {
        console.log('  Erreur lors de la création des index:', error.message);
    }
}

function getDB() {
    if (!db) {
        throw new Error('Base de données non initialisée. Appelle connectDB() d\'abord.');
    }
    return db;
}

async function closeDB() {
    if (client) {
        await client.close();
        console.log(' Connexion MongoDB fermée');
    }
}

module.exports = {
    connectDB,
    getDB,
    closeDB
};

// a revoir d'ici la fin du de la partie utilisateur // 