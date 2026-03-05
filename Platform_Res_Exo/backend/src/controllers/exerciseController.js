const Exercise = require('../models/Exercise');
const { ObjectId } = require('mongodb');

// Récupérer tous les exercices publiés (pour les participants)
const getPublishedExercises = async (req, res) => {
    try {
        const exercises = await Exercise.findPublished();
        
        // Ne pas envoyer les solutions aux participants
        const sanitizedExercises = exercises.map(ex => {
            const { solution, ...rest } = ex;
            return rest;
        });

        res.json({
            count: sanitizedExercises.length,
            exercises: sanitizedExercises
        });
    } catch (error) {
        console.error('Erreur récupération exercices:', error);
        res.status(500).json({ 
            message: 'Erreur lors de la récupération des exercices',
            error: error.message 
        });
    }
};

// Récupérer tous les exercices (admin seulement)
const getAllExercises = async (req, res) => {
    try {
        const exercises = await Exercise.findAll();
        res.json({
            count: exercises.length,
            exercises
        });
    } catch (error) {
        console.error('Erreur récupération exercices:', error);
        res.status(500).json({ 
            message: 'Erreur lors de la récupération des exercices',
            error: error.message 
        });
    }
};

// Récupérer un exercice par ID
const getExerciseById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID invalide' });
        }

        const exercise = await Exercise.findById(id);
        
        if (!exercise) {
            return res.status(404).json({ message: 'Exercice non trouvé' });
        }

        // Si l'utilisateur est participant et que l'exercice n'est pas publié
        if (req.user.role === 'participant' && !exercise.isPublished) {
            return res.status(403).json({ 
                message: 'Cet exercice n\'est pas disponible' 
            });
        }

        // Ne pas envoyer la solution aux participants
        if (req.user.role === 'participant') {
            const { solution, ...rest } = exercise;
            return res.json(rest);
        }

        res.json(exercise);
    } catch (error) {
        console.error('Erreur récupération exercice:', error);
        res.status(500).json({ 
            message: 'Erreur lors de la récupération de l\'exercice',
            error: error.message 
        });
    }
};

// Créer un exercice (admin seulement)
const createExercise = async (req, res) => {
    try {
        const { title, description, difficulty, language, testCases, solution } = req.body;

        // Validation
        if (!title || !description) {
            return res.status(400).json({ 
                message: 'Le titre et la description sont requis' 
            });
        }

        const exercise = new Exercise({
            title,
            description,
            difficulty,
            language,
            testCases: testCases || [],
            solution: solution || '',
            createdBy: req.userId,
            isPublished: false // Par défaut non publié
        });

        const exerciseId = await exercise.save();

        res.status(201).json({
            message: 'Exercice créé avec succès',
            exerciseId,
            exercise: { ...exercise, _id: exerciseId }
        });

    } catch (error) {
        console.error('Erreur création exercice:', error);
        res.status(500).json({ 
            message: 'Erreur lors de la création de l\'exercice',
            error: error.message 
        });
    }
};

// Mettre à jour un exercice (admin seulement)
const updateExercise = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID invalide' });
        }

        const exercise = await Exercise.findById(id);
        
        if (!exercise) {
            return res.status(404).json({ message: 'Exercice non trouvé' });
        }

        // Mettre à jour
        exercise.update(updates);

        res.json({
            message: 'Exercice mis à jour avec succès'
        });

    } catch (error) {
        console.error('Erreur mise à jour exercice:', error);
        res.status(500).json({ 
            message: 'Erreur lors de la mise à jour de l\'exercice',
            error: error.message 
        });
    }
};

// Publier un exercice (admin seulement)
const publishExercise = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID invalide' });
        }

        const exercise = await Exercise.findById(id);
        
        if (!exercise) {
            return res.status(404).json({ message: 'Exercice non trouvé' });
        }

        await exercise.update({ isPublished: true });

        res.json({
            message: 'Exercice publié avec succès'
        });

    } catch (error) {
        console.error('Erreur publication exercice:', error);
        res.status(500).json({ 
            message: 'Erreur lors de la publication',
            error: error.message 
        });
    }
};

// Supprimer un exercice (admin seulement)
const deleteExercise = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID invalide' });
        }

        const deleted = await Exercise.deleteById(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Exercice non trouvé' });
        }

        res.json({
            message: 'Exercice supprimé avec succès'
        });

    } catch (error) {
        console.error('Erreur suppression exercice:', error);
        res.status(500).json({ 
            message: 'Erreur lors de la suppression',
            error: error.message 
        });
    }
};

module.exports = {
    getPublishedExercises,
    getAllExercises,
    getExerciseById,
    createExercise,
    updateExercise,
    publishExercise,
    deleteExercise
};