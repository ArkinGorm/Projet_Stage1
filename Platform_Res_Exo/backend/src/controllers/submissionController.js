const Submission = require('../models/Submission');
const Exercise = require('../models/Exercise');
const CodeExecutor = require('../utils/codeExecutor');
const { ObjectId } = require('mongodb');

// Soumettre une solution
const submitSolution = async (req, res) => {
    try {
        const { exerciseId, code } = req.body;
        const userId = req.userId;

        // Validation
        if (!exerciseId || !code) {
            return res.status(400).json({
                message: 'ID de l\'exercice et code requis'
            });
        }

        if (!ObjectId.isValid(exerciseId)) {
            return res.status(400).json({ message: 'ID d\'exercice invalide' });
        }

        // Récupérer l'exercice
        const exercise = await Exercise.findById(exerciseId);
        if (!exercise) {
            return res.status(404).json({ message: 'Exercice non trouvé' });
        }

        // Vérifier que l'exercice est publié (sauf pour admin)
        if (!exercise.isPublished && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Cet exercice n\'est pas encore disponible'
            });
        }

        // Exécuter le code avec les tests
        console.log(` Exécution du code pour l'exercice: ${exercise.title}`);
        console.log(` Langage: ${exercise.language}`);
        console.log(` Tests: ${exercise.testCases.length}`);

        const executionResult = await CodeExecutor.execute(
            code,
            exercise.language,
            exercise.testCases
        );

        // Créer la soumission
        const submission = new Submission({
            userId,
            exerciseId,
            code,
            status: executionResult.allPassed ? 'passed' : 'failed',
            testResults: executionResult.results,
            executionTime: executionResult.results.reduce((acc, r) => acc + (r.executionTime || 0), 0)
        });

        const submissionId = await submission.save();

        // Répondre avec les résultats
        res.json({
            message: executionResult.allPassed ? ' Tous les tests passés !' : ' Certains tests ont échoué',
            submissionId,
            results: executionResult,
            summary: {
                total: executionResult.totalTests,
                passed: executionResult.passedTests,
                failed: executionResult.totalTests - executionResult.passedTests,
                success: executionResult.allPassed
            }
        });

    } catch (error) {
        console.error('Erreur soumission:', error);
        res.status(500).json({
            message: 'Erreur lors de l\'exécution du code',
            error: error.message
        });
    }
};

// Récupérer les soumissions d'un utilisateur
const getUserSubmissions = async (req, res) => {
    try {
        const userId = req.userId;
        const { exerciseId } = req.query;

        let submissions;
        if (exerciseId) {
            // Filtrer par exercice spécifique
            submissions = await Submission.findByUserAndExercise(userId, exerciseId);
        } else {
            // Toutes les soumissions de l'utilisateur
            submissions = await Submission.findByUser(userId);
        }

        // Enrichir avec les titres des exercices
        const db = require('../config/db').getDB();
        const enrichedSubmissions = await Promise.all(submissions.map(async (sub) => {
            const exercise = await db.collection('exercises').findOne(
                { _id: new ObjectId(sub.exerciseId) },
                { projection: { title: 1, difficulty: 1 } }
            );
            return {
                ...sub,
                exerciseTitle: exercise?.title || 'Exercice inconnu',
                exerciseDifficulty: exercise?.difficulty
            };
        }));

        res.json({
            count: enrichedSubmissions.length,
            submissions: enrichedSubmissions
        });

    } catch (error) {
        console.error('Erreur récupération soumissions:', error);
        res.status(500).json({
            message: 'Erreur lors de la récupération des soumissions',
            error: error.message
        });
    }
};

// Récupérer une soumission spécifique
const getSubmissionById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID de soumission invalide' });
        }

        const db = require('../config/db').getDB();
        const submission = await db.collection('submissions').findOne({
            _id: new ObjectId(id)
        });

        if (!submission) {
            return res.status(404).json({ message: 'Soumission non trouvée' });
        }

        // Vérifier que l'utilisateur a le droit de voir cette soumission
        if (submission.userId.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        // Ajouter les détails de l'exercice
        const exercise = await db.collection('exercises').findOne(
            { _id: new ObjectId(submission.exerciseId) },
            { projection: { title: 1, description: 1, difficulty: 1 } }
        );

        res.json({
            submission: {
                ...submission,
                exerciseDetails: exercise
            }
        });

    } catch (error) {
        console.error('Erreur récupération soumission:', error);
        res.status(500).json({
            message: 'Erreur lors de la récupération de la soumission',
            error: error.message
        });
    }
};

// Récupérer les statistiques d'un utilisateur
const getUserStats = async (req, res) => {
    try {
        const userId = req.userId;

        const db = require('../config/db').getDB();
        
        // Agrégation pour les stats
        const stats = await db.collection('submissions').aggregate([
            { $match: { userId: new ObjectId(userId) } },
            { $group: {
                _id: null,
                totalSubmissions: { $sum: 1 },
                passedSubmissions: {
                    $sum: { $cond: [{ $eq: ['$status', 'passed'] }, 1, 0] }
                },
                failedSubmissions: {
                    $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                },
                uniqueExercises: { $addToSet: '$exerciseId' }
            }},
            { $project: {
                _id: 0,
                totalSubmissions: 1,
                passedSubmissions: 1,
                failedSubmissions: 1,
                successRate: {
                    $multiply: [
                        { $divide: ['$passedSubmissions', { $max: [1, '$totalSubmissions'] }] },
                        100
                    ]
                },
                exercisesAttempted: { $size: '$uniqueExercises' }
            }}
        ]).toArray();

        // Dernières soumissions
        const recentSubmissions = await db.collection('submissions')
            .find({ userId: new ObjectId(userId) })
            .sort({ submittedAt: -1 })
            .limit(5)
            .toArray();

        // Enrichir avec les titres des exercices
        const enrichedRecent = await Promise.all(recentSubmissions.map(async (sub) => {
            const exercise = await db.collection('exercises').findOne(
                { _id: new ObjectId(sub.exerciseId) },
                { projection: { title: 1 } }
            );
            return {
                id: sub._id,
                exerciseTitle: exercise?.title || 'Inconnu',
                status: sub.status,
                submittedAt: sub.submittedAt,
                passedTests: sub.testResults?.filter(t => t.passed).length || 0,
                totalTests: sub.testResults?.length || 0
            };
        }));

        res.json({
            stats: stats[0] || {
                totalSubmissions: 0,
                passedSubmissions: 0,
                failedSubmissions: 0,
                successRate: 0,
                exercisesAttempted: 0
            },
            recentSubmissions: enrichedRecent
        });

    } catch (error) {
        console.error('Erreur récupération stats:', error);
        res.status(500).json({
            message: 'Erreur lors de la récupération des statistiques',
            error: error.message
        });
    }
};

// Admin: Récupérer toutes les soumissions
const getAllSubmissions = async (req, res) => {
    try {
        const db = require('../config/db').getDB();
        
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const submissions = await db.collection('submissions')
            .find({})
            .sort({ submittedAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        // Enrichir avec les infos utilisateur et exercice
        const enriched = await Promise.all(submissions.map(async (sub) => {
            const user = await db.collection('users').findOne(
                { _id: new ObjectId(sub.userId) },
                { projection: { username: 1, email: 1 } }
            );
            const exercise = await db.collection('exercises').findOne(
                { _id: new ObjectId(sub.exerciseId) },
                { projection: { title: 1 } }
            );
            return {
                ...sub,
                username: user?.username || 'Inconnu',
                userEmail: user?.email,
                exerciseTitle: exercise?.title || 'Inconnu'
            };
        }));

        // Compter le total
        const total = await db.collection('submissions').countDocuments();

        res.json({
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            submissions: enriched
        });

    } catch (error) {
        console.error('Erreur récupération toutes soumissions:', error);
        res.status(500).json({
            message: 'Erreur lors de la récupération des soumissions',
            error: error.message
        });
    }
};

module.exports = {
    submitSolution,
    getUserSubmissions,
    getSubmissionById,
    getUserStats,
    getAllSubmissions
};