const express = require('express');
const router = express.Router();
const { 
    getPublishedExercises,
    getAllExercises,
    getExerciseById,
    createExercise,
    updateExercise,
    publishExercise,
    deleteExercise
} = require('../controllers/exerciseController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Routes publiques (participants)
router.get('/published', authMiddleware, getPublishedExercises);
router.get('/:id', authMiddleware, getExerciseById);

// Routes admin seulement
router.get('/admin/all', authMiddleware, adminMiddleware, getAllExercises);
router.post('/', authMiddleware, adminMiddleware, createExercise);
router.put('/:id', authMiddleware, adminMiddleware, updateExercise);
router.patch('/:id/publish', authMiddleware, adminMiddleware, publishExercise);
router.delete('/:id', authMiddleware, adminMiddleware, deleteExercise);

module.exports = router;