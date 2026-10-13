import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import { SyllabusGenerator } from '../../src/services/syllabusGenerator';
import type { Course } from '../../src/types/Course';

export async function runSyllabusGeneratorAcceptanceTests() {
  await feature('FT-SYLLABUS', 'Generative Syllabus & Course DAG Normalization Engine', async () => {
    await scenario('Strip noise prefix words and extract core learning subject', async () => {
      await then('extractCleanSubject removes conversational wrappers', () => {
        expect(SyllabusGenerator.extractCleanSubject('I want to learn 2-week trip to Taipei')).toBe('2-week trip to Taipei');
        expect(SyllabusGenerator.extractCleanSubject('learn how to order food')).toBe('order food');
        expect(SyllabusGenerator.extractCleanSubject('practice business negotiation campaign')).toBe('business negotiation');
      });
    });

    await scenario('Synthesize bespoke narrative premises without repetitive template suffixes', async () => {
      await then('synthesizeGoalPremise produces evocative scenario descriptions', () => {
        const premise = SyllabusGenerator.synthesizeGoalPremise('medical emergency in Shanghai', 'medical emergency in Shanghai');
        expect(premise).toContain('narrative adventure');
        expect(premise).toContain('communicative Mandarin');
      });
    });

    await scenario('Normalize sparse course DAG by expanding to 5-node rich branch structure', async () => {
      let normalized: Course | null = null;

      await given('a sparse course with a chapter having only 1 basic node', () => {
        const sparseCourse: Course = {
          id: 'test-sparse-course',
          title: 'Test Course',
          subtitle: 'Testing DAG normalization',
          description: 'A test course',
          targetHskLevel: '2',
          totalWeeks: 1,
          createdAt: Date.now(),
          chapters: [
            {
              id: 'ch-1',
              title: 'Chapter 1',
              subtitle: 'Basics',
              biome: 'bamboo_grove',
              description: 'Intro chapter',
              nodes: [
                {
                  id: 'n-1',
                  type: 'sentence_scramble',
                  title: 'First Step',
                  branchType: 'main',
                  order: 1,
                  hskLevel: '2',
                  requiredMasteryScore: 80,
                  rewardXp: 50,
                  exercises: []
                }
              ]
            }
          ]
        };
        normalized = SyllabusGenerator.normalizeCourseDAG(sparseCourse);
      });

      await then('the chapter is automatically expanded to 5 nodes', () => {
        expect(normalized).toBeDefined();
        const ch1 = normalized?.chapters[0];
        expect(ch1?.nodes.length).toBe(5);
      });

      await and('the expanded nodes include main line, side quest, review ambush, and boss capstone', () => {
        const nodeTypes = normalized?.chapters[0].nodes.map(n => n.type);
        expect(nodeTypes).toContain('boss_capstone');
        expect(nodeTypes).toContain('review_ambush');
      });

      await and('map coordinates are distributed across canvas height (y: 10 to 90)', () => {
        const allY = normalized?.chapters[0].nodes.map(n => n.mapCoordinates?.y || 0) || [];
        const minY = Math.min(...allY);
        const maxY = Math.max(...allY);
        expect(minY).toBeGreaterThanOrEqual(10);
        expect(maxY).toBeLessThanOrEqual(92);
        expect(maxY - minY).toBeGreaterThanOrEqual(35);
      });
    });
  });
}
