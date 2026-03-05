const { connectDB, closeDB } = require('./src/config/db');
const User = require('./src/models/User');
const Exercise = require('./src/models/Exercise');

async function seedDatabase() {
    try {
        await connectDB();
        console.log(' Début du seeding...');

        // Créer un admin
        const admin = new User({
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin'
        });
        const adminId = await admin.save();
        console.log(' Admin créé avec ID:', adminId);

        // Créer un participant
        const participant = new User({
            username: 'participant',
            email: 'participant@example.com',
            password: 'participant123'
        });
        const participantId = await participant.save();
        console.log(' Participant créé avec ID:', participantId);

        // Créer des exercices
        const exercise1 = new Exercise({
            title: 'Somme de deux nombres',
            description: 'Écris une fonction qui prend deux nombres en paramètres et retourne leur somme.',
            difficulty: 'facile',
            language: 'javascript',
            testCases: [
                {
                    input: '2, 3',
                    expectedOutput: '5',
                    description: 'Addition de deux positifs'
                },
                {
                    input: '-1, 5',
                    expectedOutput: '4',
                    description: 'Addition avec un négatif'
                },
                {
                    input: '0, 0',
                    expectedOutput: '0',
                    description: 'Addition de zéros'
                }
            ],
            solution: 'function sum(a, b) { return a + b; }',
            createdBy: adminId,
            isPublished: true
        });

        const exercise2 = new Exercise({
            title: 'Nombre pair ou impair',
            description: 'Écris une fonction qui retourne "pair" si le nombre est pair, "impair" sinon.',
            difficulty: 'facile',
            language: 'javascript',
            testCases: [
                {
                    input: '4',
                    expectedOutput: 'pair',
                    description: 'Nombre pair'
                },
                {
                    input: '7',
                    expectedOutput: 'impair',
                    description: 'Nombre impair'
                },
                {
                    input: '0',
                    expectedOutput: 'pair',
                    description: 'Zéro est pair'
                }
            ],
            solution: 'function checkParity(n) { return n % 2 === 0 ? "pair" : "impair"; }',
            createdBy: adminId,
            isPublished: true
        });

        const exercise3 = new Exercise({
            title: 'Maximum de trois nombres',
            description: 'Écris une fonction qui retourne le plus grand de trois nombres.',
            difficulty: 'moyen',
            language: 'javascript',
            testCases: [
                {
                    input: '5, 2, 8',
                    expectedOutput: '8',
                    description: 'Maximum à la fin'
                },
                {
                    input: '10, 10, 5',
                    expectedOutput: '10',
                    description: 'Égalité maximum'
                },
                {
                    input: '-5, -2, -8',
                    expectedOutput: '-2',
                    description: 'Nombres négatifs'
                }
            ],
            solution: 'function maxOfThree(a, b, c) { return Math.max(a, b, c); }',
            createdBy: adminId,
            isPublished: false // En attente de publication
        });

        const ex1Id = await exercise1.save();
        const ex2Id = await exercise2.save();
        const ex3Id = await exercise3.save();

        console.log(' 3 exercices créés avec succès');
        console.log('   - Exercice 1 (publié):', ex1Id);
        console.log('   - Exercice 2 (publié):', ex2Id);
        console.log('   - Exercice 3 (brouillon):', ex3Id);

        console.log('\n Résumé:');
        console.log(`   - Utilisateurs: 2 (1 admin, 1 participant)`);
        console.log(`   - Exercices: 3 (2 publiés, 1 brouillon)`);
        
        // Afficher les identifiants pour test
        console.log('\n Identifiants de test:');
        console.log('   Admin: admin@example.com / admin123');
        console.log('   Participant: participant@example.com / participant123');

    } catch (error) {
        console.error(' Erreur seeding:', error);
    } finally {
        await closeDB();
    }
}

seedDatabase();