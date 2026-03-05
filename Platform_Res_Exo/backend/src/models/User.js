const { getDB } = require('../config/db');
const bcrypt = require('bcryptjs');
// Création de la classe Participant // 
class User {
    constructor(data) {
        this.username = data.username;
        this.email = data.email;
        this.password = data.password;
        this.role = data.role || 'participant';
        this.createdAt = new Date();
    }

    async save() {
        const db = getDB();
        
        // Hasher le mot de passe avant de sauvegarder
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        
        const result = await db.collection('users').insertOne(this);
        return result.insertedId;
    }

    static async findByEmail(email) {
        const db = getDB();
        return await db.collection('users').findOne({ email });
    }

    static async findById(id) {
        const db = getDB();
        const { ObjectId } = require('mongodb');
        return await db.collection('users').findOne({ _id: new ObjectId(id) });
    }

    static async findAll(role = null) {
        const db = getDB();
        const query = role ? { role } : {};
        return await db.collection('users').find(query).toArray();
    }

    async comparePassword(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
    }
}

module.exports = User;