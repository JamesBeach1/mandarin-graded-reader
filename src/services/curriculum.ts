/**
 * Curriculum Alignment Frameworks: HSK 1-6 / HSK 3.0 & SCQF Level 6 (SQA Higher Mandarin)
 */

export interface CurriculumFramework {
  id: string;
  name: string;
  description: string;
  levels: {
    id: string;
    label: string;
    targetVocabCount: number;
    grammarOverview: string;
  }[];
}

export const HSK_CURRICULUM: CurriculumFramework = {
  id: 'hsk',
  name: 'Hanyu Shuiping Kaoshi (HSK)',
  description: 'Standardized international proficiency assessment for non-native Chinese speakers.',
  levels: [
    { id: '1', label: 'HSK 1 (Beginner)', targetVocabCount: 150, grammarOverview: 'Basic greetings, numbers, S+V+O simple sentences.' },
    { id: '2', label: 'HSK 2 (Elementary)', targetVocabCount: 300, grammarOverview: 'Simple conjunctions (虽然...但是), comparisons with 比.' },
    { id: '3', label: 'HSK 3 (Intermediate)', targetVocabCount: 600, grammarOverview: '把 disposal, simple 被 passive, result complements.' },
    { id: '4', label: 'HSK 4 (Upper-Intermediate)', targetVocabCount: 1200, grammarOverview: 'Complex complements, double negatives, formal conjunctions.' },
    { id: '5', label: 'HSK 5 (Advanced)', targetVocabCount: 2500, grammarOverview: 'Abstract syntax, formal writing, common idioms (成语).' },
    { id: '6', label: 'HSK 6 (Mastery)', targetVocabCount: 5000, grammarOverview: 'Literary Chinese, full expressive fluency, professional discourse.' }
  ]
};

export const SCQF_HIGHER_MANDARIN: CurriculumFramework = {
  id: 'scqf_higher',
  name: 'SQA Higher Mandarin (SCQF Level 6)',
  description: 'Scottish Qualifications Authority Upper-Secondary Curriculum for applied communicative competence and critical literary analysis.',
  levels: [
    {
      id: 'society',
      label: 'Society & Family Context',
      targetVocabCount: 800,
      grammarOverview: 'Expressing personal viewpoints, family structures, digital communication, and community values.'
    },
    {
      id: 'learning',
      label: 'Learning & Schooling Context',
      targetVocabCount: 900,
      grammarOverview: 'Education systems, school life, future higher education aspirations, and language acquisition.'
    },
    {
      id: 'employability',
      label: 'Employability & Work Context',
      targetVocabCount: 1000,
      grammarOverview: 'Careers, part-time jobs, workplace responsibilities, and future professional plans.'
    },
    {
      id: 'culture',
      label: 'Culture & Global Context',
      targetVocabCount: 1100,
      grammarOverview: 'Traditional festivals (Spring Festival, Mid-Autumn), travel in China, and intercultural comparisons.'
    }
  ]
};
