// Utilitaire pour exécuter du code JavaScript
// Version simplifiée pour le développement
class CodeExecutor {
    // Exécute du code JavaScript avec des tests
    static async executeJavaScript(code, testCases) {
        const results = [];
        let allPassed = true;

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            try {
                // Créer une fonction à partir du code
                const userFunction = new Function('return ' + code)();
                
                // Parser les entrées (format simple: "2, 3" ou "4")
                const args = testCase.input.split(',').map(arg => {
                    arg = arg.trim();
                    // Convertir en nombre si possible
                    return isNaN(arg) ? arg : Number(arg);
                });

                // Exécuter la fonction
                const startTime = Date.now();
                const result = userFunction(...args);
                const executionTime = Date.now() - startTime;

                // Comparer le résultat
                const passed = String(result) === String(testCase.expectedOutput);

                results.push({
                    testCase: testCase.description || `Test ${i + 1}`,
                    input: testCase.input,
                    expected: testCase.expectedOutput,
                    output: String(result),
                    passed,
                    executionTime
                });

                if (!passed) allPassed = false;

            } catch (error) {
                results.push({
                    testCase: testCase.description || `Test ${i + 1}`,
                    input: testCase.input,
                    expected: testCase.expectedOutput,
                    output: null,
                    error: error.message,
                    passed: false
                });
                allPassed = false;
            }
        }

        return {
            allPassed,
            results,
            totalTests: testCases.length,
            passedTests: results.filter(r => r.passed).length
        };
    }

    // Version pour Python (simulée pour l'instant)
    static async executePython(code, testCases) {
        // Simulation - à implémenter avec un vrai interpréteur Python plus tard
        return {
            allPassed: false,
            results: testCases.map((tc, i) => ({
                testCase: tc.description || `Test ${i + 1}`,
                input: tc.input,
                expected: tc.expectedOutput,
                output: "Python execution not implemented yet",
                passed: false,
                note: "Simulation mode"
            })),
            totalTests: testCases.length,
            passedTests: 0,
            note: "Python execution en mode simulation"
        };
    }

    // Méthode générique selon le langage
    static async execute(code, language, testCases) {
        switch (language.toLowerCase()) {
            case 'javascript':
            case 'js':
                return await this.executeJavaScript(code, testCases);
            case 'python':
            case 'py':
                return await this.executePython(code, testCases);
            default:
                throw new Error(`Langage non supporté: ${language}`);
        }
    }
}

module.exports = CodeExecutor;