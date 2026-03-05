const express = require('express');
const router = express.Router();
const {
    submitSolution,
    getUserSubmissions,
    getSubmissionById,
    getUserStats,
    getAllSubmissions
} = require('../controllers/submissionController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Toutes les routes de soumission nécessitent une authentification
router.use(authMiddleware);

// Routes pour les participants
router.post('/', submitSolution);
router.get('/my-submissions', getUserSubmissions);
router.get('/my-stats', getUserStats);
router.get('/:id', getSubmissionById);

// Routes admin seulement
router.get('/admin/all', adminMiddleware, getAllSubmissions);

module.exports = router;