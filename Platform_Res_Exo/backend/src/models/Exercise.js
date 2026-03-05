// Classe exercise // 
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Exercise {
    constructor(data) {
        this.title = data.title;
        this.description = data.description;
        this.difficulty = data.difficulty || 'facile';
        this.language = data.language || 'javascript';
        this.testCases = data.testCases || [];
        this.solution = data.solution || '';
        this.createdBy = data.createdBy;
        this.isPublished = data.isPublished || false;
        this.createdAt = new Date();
    }

    async save() {
        const db = getDB();
        const result = await db.collection('exercises').insertOne(this);
        return result.insertedId;
    }

    static async findById(id) {
        const db = getDB();
        return await db.collection('exercises').findOne({ _id: new ObjectId(id) });
    }

    static async findAll(filter = {}) {
        const db = getDB();
        return await db.collection('exercises').find(filter).toArray();
    }

    static async findByDifficulty(difficulty) {
        const db = getDB();
        return await db.collection('exercises').find({ difficulty }).toArray();
    }

    static async findPublished() {
        const db = getDB();
        return await db.collection('exercises').find({ isPublished: true }).toArray();
    }

    async update(updates) {
        const db = getDB();
        const result = await db.collection('exercises').updateOne(
            { _id: new ObjectId(this._id) },
            { $set: updates }
        );
        return result.modifiedCount > 0;
    }

    static async deleteById(id) {
        const db = getDB();
        const result = await db.collection('exercises').deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }
}

module.exports = Exercise;