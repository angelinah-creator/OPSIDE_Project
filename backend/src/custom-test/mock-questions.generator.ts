
export interface MockQuestion {
  id: number;
  type: 'qcm' | 'code' | 'debug' | 'open';
  question: string;
  options?: string[];
  placeholder?: string;
  points: number;
}

// Generate mock questions
export function generateMockQuestions(
  skillsTested: string[],
  difficulty: string = 'mid',
): MockQuestion[] {
  const primarySkill = skillsTested[0] || 'JavaScript';
  const level = difficulty === 'junior' ? 'basique' : difficulty === 'senior' ? 'avancé' : 'intermédiaire';

  return [
    {
      id: 1,
      type: 'qcm',
      question: `[Niveau ${level}] Quelle est la particularité principale de ${primarySkill} par rapport aux autres technologies similaires ?`,
      options: [
        `${primarySkill} est un langage compilé uniquement`,
        `${primarySkill} supporte la programmation asynchrone native`,
        `${primarySkill} ne peut fonctionner que côté serveur`,
        `${primarySkill} ne supporte pas les fonctions anonymes`,
      ],
      points: 10,
    },
    {
      id: 2,
      type: 'qcm',
      question: `Quel pattern de conception est le plus adapté pour gérer l'état global dans une application ${primarySkill} ?`,
      options: [
        'Singleton avec état mutable global',
        'Observer pattern avec un store centralisé',
        'Factory pattern pour chaque composant',
        'Prototype pattern avec héritage en chaîne',
      ],
      points: 10,
    },
    {
      id: 3,
      type: 'qcm',
      question: `Dans le contexte de ${primarySkill}, que signifie le principe "separation of concerns" ?`,
      options: [
        'Écrire le moins de code possible',
        'Diviser le code en modules ayant chacun une responsabilité unique',
        'Séparer les développeurs en équipes distinctes',
        'Utiliser uniquement des fonctions pures',
      ],
      points: 10,
    },
    {
      id: 4,
      type: 'qcm',
      question: `Laquelle de ces pratiques améliore le plus les performances en ${primarySkill} ?`,
      options: [
        'Utiliser des variables globales pour éviter les recalculs',
        'Implémenter la mémoïsation pour les fonctions coûteuses',
        'Écrire des fonctions synchrones pour tout contrôler',
        'Dupliquer la logique dans chaque module',
      ],
      points: 10,
    },
    {
      id: 5,
      type: 'code',
      question: `Écrivez une fonction ${primarySkill} qui filtre un tableau d'objets \`{ id: number, name: string, active: boolean }\` et retourne uniquement les objets actifs, triés par nom alphabétiquement. La fonction doit être typée et gérer les cas limites (tableau vide, undefined).`,
      placeholder: `// Écrivez votre solution ici\nfunction filterAndSort(items) {\n  // ...\n}`,
      points: 15,
    },
    {
      id: 6,
      type: 'code',
      question: `Implémentez une fonction utilitaire \`debounce\` en ${primarySkill} qui prend une fonction \`fn\` et un délai \`delay\` en ms. La fonction doit annuler les appels précédents si un nouvel appel arrive avant la fin du délai. Incluez un exemple d'utilisation en commentaire.`,
      placeholder: `// Implémentez debounce ici\nfunction debounce(fn, delay) {\n  // ...\n}`,
      points: 15,
    },
    {
      id: 7,
      type: 'code',
      question: `Créez une classe \`EventEmitter\` en ${primarySkill} avec les méthodes \`on(event, callback)\`, \`off(event, callback)\` et \`emit(event, ...args)\`. La classe doit gérer plusieurs listeners par événement et éviter les fuites mémoire.`,
      placeholder: `// Implémentez EventEmitter ici\nclass EventEmitter {\n  // ...\n}`,
      points: 15,
    },
    {
      id: 8,
      type: 'debug',
      question: `Le code suivant est censé calculer la somme des nombres pairs d'un tableau, mais il contient des bugs. Identifiez et corrigez TOUS les bugs :\n\n\`\`\`\nfunction sumEven(arr) {\n  let total = 1;\n  for (let i = 0; i <= arr.length; i++) {\n    if (arr[i] % 2 = 0) {\n      total += arr[i];\n    }\n  }\n  returns total;\n}\n\`\`\``,
      placeholder: `// Écrivez le code corrigé ici avec des commentaires expliquant chaque bug\nfunction sumEven(arr) {\n  // ...\n}`,
      points: 10,
    },
    {
      id: 9,
      type: 'debug',
      question: `Ce composant ${primarySkill} provoque une boucle infinie. Expliquez pourquoi et proposez 2 corrections différentes :\n\n\`\`\`\nuseEffect(() => {\n  setCount(count + 1);\n}, [count]);\n\`\`\``,
      placeholder: `// Explication du problème :\n// ...\n\n// Correction 1 :\n// ...\n\n// Correction 2 :\n// ...`,
      points: 10,
    },
    {
      id: 10,
      type: 'open',
      question: `Architecture : Vous devez concevoir un système de cache distribué pour une API ${primarySkill} recevant 10 000 requêtes/seconde. Décrivez votre approche architecturale en mentionnant : (1) la stratégie de cache choisie, (2) la gestion des invalidations, (3) les mécanismes de fallback en cas de panne. Soyez précis et justifiez vos choix techniques.`,
      placeholder: `Décrivez votre approche architecturale ici...`,
      points: 5,
    },
  ];
}

// Evaluate mock answers
export function evaluateMockAnswers(
  questions: MockQuestion[],
  answers: Record<string, any>,
): { score: number; details: Record<string, any> } {

  let isCheatPass = false;
  let isCheatFail = false;

  for (const key in answers) {
    const val = String(answers[key]).toUpperCase();
    if (val.includes('PASS')) isCheatPass = true;
    if (val.includes('FAIL')) isCheatFail = true;
  }

  let baseScore = Math.floor(Math.random() * 40) + 55; // 55-95
  if (isCheatPass) baseScore = 88;
  if (isCheatFail) baseScore = 35;

  const details: Record<string, any> = {};

  questions.forEach((q) => {
    const hasAnswer = answers[`q${q.id}`] && String(answers[`q${q.id}`]).trim().length > 10;
    const questionScore = hasAnswer ? Math.floor(q.points * (0.6 + Math.random() * 0.4)) : 0;
    details[`q${q.id}`] = {
      score: questionScore,
      max_points: q.points,
      feedback: hasAnswer
        ? 'Bonne réponse. Approche correcte avec quelques points d\'amélioration possibles.'
        : 'Pas de réponse fournie.',
    };
  });

  return { score: baseScore, details };
}
