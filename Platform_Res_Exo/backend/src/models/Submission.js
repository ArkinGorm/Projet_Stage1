const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Submission {
    constructor(data) {
        this.userId = data.userId;
        this.exerciseId = data.exerciseId;
        this.code = data.code;
        this.status = data.status || 'pending'; // pending, passed, failed
        this.testResults = data.testResults || [];
        this.executionTime = data.executionTime || 0;
        this.submittedAt = new Date();
    }

    async save() {
        const db = getDB();
        const result = await db.collection('submissions').insertOne(this);
        return result.insertedId;
    }

    static async findByUser(userId) {
        const db = getDB();
        return await db.collection('submissions')
            .find({ userId: new ObjectId(userId) })
            .sort({ submittedAt: -1 })
            .toArray();
    }

    static async findByExercise(exerciseId) {
        const db = getDB();
        return await db.collection('submissions')
            .find({ exerciseId: new ObjectId(exerciseId) })
            .sort({ submittedAt: -1 })
            .toArray();
    }

    static async findByUserAndExercise(userId, exerciseId) {
        const db = getDB();
        return await db.collection('submissions')
            .find({
                userId: new ObjectId(userId),
                exerciseId: new ObjectId(exerciseId)
            })
            .sort({ submittedAt: -1 })
            .toArray();
    }
}

module.exports = Submission;