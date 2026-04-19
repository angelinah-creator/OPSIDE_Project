import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClaudeClientService } from '../ai/claude-client.service';
import { generateTestPrompt } from '../ai/prompts/generate-test.prompt';
import { evaluateAnswersPrompt } from '../ai/prompts/evaluate-answers.prompt';
import { ConfigService } from '@nestjs/config';
import { TestStatus } from '@prisma/client';

@Injectable()
export class TestService {
  private readonly logger = new Logger(TestService.name);
  private readonly maxRetries = 3;
  private readonly generationTemp = 0.7;
  private readonly evaluationTemp = 0.2;

  constructor(
    private prisma: PrismaService,
    private claude: ClaudeClientService,
    private configService: ConfigService,
  ) {}

  async startTest(userId: string, skills: string[], speciality: string) {
    // Vérifier que le candidat a un profil complété
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { user_id: userId },
    });
    if (!candidate) {
      throw new ForbiddenException('Vous devez compléter votre profil avant de passer un test.');
    }

    // Vérifier si le candidat a déjà passé un test ce mois-ci (règle métier)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const recentTest = await this.prisma.test.findFirst({
      where: {
        candidate_id: userId,
        type: 'platform',
        status: 'scored',
        created_at: { gte: oneMonthAgo },
      },
      orderBy: { created_at: 'desc' },
    });
    if (recentTest) {
      throw new ForbiddenException(
        'Vous avez déjà passé un test ce mois-ci. Vous pourrez en repasser un le mois prochain.',
      );
    }

    // Déterminer la difficulté
    const difficulty = this.determineDifficulty(candidate.experience_years);

    // Générer le test via Claude
    const systemPrompt = 'Tu es un examinateur technique senior. Réponds UNIQUEMENT en JSON valide.';
    const userPrompt = generateTestPrompt(speciality, difficulty, skills);

    let jsonResponse: any;
    let retries = 0;
    let rawResponse = '';

    while (retries < this.maxRetries) {
      try {
        rawResponse = await this.claude.generateCompletion(
          systemPrompt,
          userPrompt,
          this.generationTemp,
          4096,
        );
        jsonResponse = this.extractAndParseJSON(rawResponse);
        break;
      } catch (error) {
        retries++;
        this.logger.warn(`Retry ${retries} after JSON parse error: ${error.message}`);
        if (retries === this.maxRetries) {
          throw new BadRequestException(
            'Impossible de générer un test valide. Veuillez réessayer plus tard.',
          );
        }
      }
    }

    // Stocker le test
    const test = await this.prisma.test.create({
      data: {
        candidate_id: userId,
        type: 'platform',
        skills_tested: skills,
        speciality,
        difficulty,
        questions: jsonResponse.questions,
        duration_minutes: 45,
        status: 'pending',
        ai_model: this.configService.get('AI_MODEL'),
        ai_generation_prompt: userPrompt,
      },
    });

    // Retirer les réponses correctes avant de renvoyer au front
    const safeQuestions = this.sanitizeQuestions(jsonResponse.questions);

    return {
      testId: test.id,
      questions: safeQuestions,
      durationMinutes: 45,
    };
  }

  async startTestById(userId: string, testId: string) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
    });

    if (!test) throw new NotFoundException('Test non trouvé');
    if (test.candidate_id !== userId) throw new ForbiddenException('Accès non autorisé');

    if (test.status !== 'pending' && test.status !== 'in_progress') {
      throw new BadRequestException('Ce test ne peut plus être démarré');
    }

    // Mettre à jour le statut et started_at
    await this.prisma.test.update({
      where: { id: testId },
      data: {
        status: 'in_progress',
        started_at: new Date(),
      },
    });

    const safeQuestions = this.sanitizeQuestions(test.questions as any[]);

    return {
      testId: test.id,
      questions: safeQuestions,
      durationMinutes: test.duration_minutes,
    };
  }

  async submitTest(userId: string, testId: string, answers: any[]) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
    });

    if (!test) throw new NotFoundException('Test non trouvé');
    if (test.candidate_id !== userId) throw new ForbiddenException('Accès non autorisé');
    if (test.status !== 'in_progress') {
      throw new BadRequestException('Ce test a déjà été soumis ou a expiré');
    }

    const questions = test.questions as any[];

    // Évaluation par Claude
    const systemPrompt = 'Tu es un correcteur technique. Réponds UNIQUEMENT en JSON.';
    const userPrompt = evaluateAnswersPrompt(questions, answers);

    let evaluation: any;
    let retries = 0;
    let rawResponse = '';

    while (retries < this.maxRetries) {
      try {
        rawResponse = await this.claude.generateCompletion(
          systemPrompt,
          userPrompt,
          this.evaluationTemp,
          2048,
        );
        evaluation = JSON.parse(rawResponse);
        break;
      } catch (error) {
        retries++;
        this.logger.warn(`Retry ${retries} after evaluation parse error`);
        if (retries === this.maxRetries) {
          throw new BadRequestException(
            "Impossible d'évaluer le test. Veuillez contacter le support.",
          );
        }
      }
    }

    const totalScore = evaluation.total_score;

    // Mise à jour du test
    await this.prisma.test.update({
      where: { id: testId },
      data: {
        answers,
        score: totalScore,
        score_details: evaluation.scores,
        status: 'scored',
        submitted_at: new Date(),
        ai_evaluation_prompt: userPrompt,
      },
    });

    return {
      score: totalScore,
      message: 'Test évalué avec succès',
    };
  }

  async getTestResult(userId: string, testId: string) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
    });

    if (!test) throw new NotFoundException('Test non trouvé');
    if (test.candidate_id !== userId) throw new ForbiddenException('Accès non autorisé');

    return {
      id: test.id,
      score: test.score,
      status: test.status,
      submittedAt: test.submitted_at,
      durationMinutes: test.duration_minutes,
    };
  }

  async getLatestTestScore(userId: string): Promise<number | null> {
    const latest = await this.prisma.test.findFirst({
      where: {
        candidate_id: userId,
        type: 'platform',
        status: 'scored',
      },
      orderBy: { created_at: 'desc' },
      select: { score: true },
    });
    return latest?.score ?? null;
  }

  // Helpers
  private determineDifficulty(years: number): 'junior' | 'mid' | 'senior' {
    if (years < 2) return 'junior';
    if (years < 5) return 'mid';
    return 'senior';
  }

  private extractAndParseJSON(raw: string): any {
    const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/) || raw.match(/({[\s\S]*})/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    return JSON.parse(jsonMatch[1]);
  }

  private sanitizeQuestions(questions: any[]) {
    return questions.map(({ correct_answer, evaluation_criteria, ...q }) => q);
  }
}