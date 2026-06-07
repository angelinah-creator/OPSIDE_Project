// Generate test prompt
export const generateTestPrompt = (
  speciality: string,
  difficulty: string,
  skills: string[],
) => `
Tu es un examinateur technique senior. Génère un test technique pour un développeur ${speciality} de niveau ${difficulty} sur les technologies suivantes : ${skills.join(', ')}.

Règles :
- Exactement 10 questions
- Mix de types : 4 QCM, 3 code, 2 debug, 1 open
- Difficulté progressive : 3 easy, 4 medium, 3 hard
- Total des points = 100
- QCM : 4 options dont 1 seule correcte, distracteurs plausibles
- Code : contexte clair et contraintes explicites

Réponds UNIQUEMENT en JSON valide avec le format suivant :
{
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "skill": "React",
      "difficulty": "easy",
      "question_text": "...",
      "options": ["...", "...", "...", "..."],
      "correct_answer": "...",
      "points": 10,
      "evaluation_criteria": "..."
    },
    {
      "id": 2,
      "type": "code",
      "skill": "Node.js",
      "difficulty": "medium",
      "question_text": "...",
      "code_snippet": "...",
      "correct_answer": "...",
      "points": 10,
      "evaluation_criteria": "..."
    }
  ]
}
`;