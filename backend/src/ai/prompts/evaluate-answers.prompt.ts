export const evaluateAnswersPrompt = (
  questions: any[],
  candidateAnswers: any[],
) => `
Tu es un correcteur technique. Voici les questions posées, les réponses attendues et les réponses du candidat. Évalue chaque réponse.

Questions avec réponses correctes :
${JSON.stringify(questions, null, 2)}

Réponses du candidat :
${JSON.stringify(candidateAnswers, null, 2)}

Pour les QCM : 100% si correct, 0% sinon.
Pour les questions code : évalue sur la logique (40%), la syntaxe (30%), les bonnes pratiques (30%).
Pour les questions debug : évalue si le bug est identifié (50%) et la correction proposée (50%).
Pour les questions open : évalue la compréhension (50%) et la clarté (50%).

Réponds UNIQUEMENT en JSON avec le format suivant :
{
  "scores": [
    {
      "question_id": 1,
      "points_earned": 8,
      "max_points": 10,
      "feedback": "Excellente réponse, mais il manque..."
    }
  ],
  "total_score": 75
}
`;