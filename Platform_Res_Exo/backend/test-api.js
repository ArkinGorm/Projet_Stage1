const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let token = '';

async function test() {
    try {
        console.log(' Test de l\'API...\n');

        // 1. Connexion avec l'admin
        console.log('1️⃣ Connexion admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@example.com',
            password: 'admin123'
        });
        token = loginRes.data.token;
        console.log('✅ Admin connecté');
        console.log('📝 Token:', token.substring(0, 20) + '...\n');

        // 2. Récupérer les exercices publiés
        console.log('2️⃣ Récupération des exercices publiés...');
        const exercisesRes = await axios.get(`${API_URL}/exercises/published`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ ${exercisesRes.data.count} exercices trouvés`);
        const exercise = exercisesRes.data.exercises[0];
        console.log('📝 Premier exercice:', exercise.title, '\n');

        // 3. Soumettre une solution correcte
        console.log('3️⃣ Soumission d\'une solution correcte...');
        const correctCode = `
            function sum(a, b) {
                return a + b;
            }
        `;
        const submitRes = await axios.post(`${API_URL}/submissions`, {
            exerciseId: exercise._id,
            code: correctCode
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Résultat:', submitRes.data.message);
        console.log('📊 Stats:', submitRes.data.summary, '\n');

        // 4. Soumettre une solution incorrecte
        console.log('4️⃣ Soumission d\'une solution incorrecte...');
        const wrongCode = `
            function sum(a, b) {
                return a - b;  // Erreur volontaire
            }
        `;
        const wrongRes = await axios.post(`${API_URL}/submissions`, {
            exerciseId: exercise._id,
            code: wrongCode
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('❌ Résultat:', wrongRes.data.message);
        console.log('📊 Stats:', wrongRes.data.summary, '\n');

        // 5. Récupérer les statistiques
        console.log('5️⃣ Récupération des statistiques...');
        const statsRes = await axios.get(`${API_URL}/submissions/my-stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('📈 Statistiques:', statsRes.data.stats);
        console.log('🕒 Dernières soumissions:', statsRes.data.recentSubmissions.length, '\n');

        console.log('🎉 Tous les tests passés !');

    } catch (error) {
        console.error('❌ Erreur:', error.response?.data || error.message);
    }
}

test();