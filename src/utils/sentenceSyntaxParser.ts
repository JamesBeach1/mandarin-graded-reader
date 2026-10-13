/**
 * Chinese Sentence Syntax Tree & Hierarchical Parser (TRC-006)
 *
 * Deconstructs Mandarin sentence grammar into pedagogical syntactic tiers:
 * 1. Topic-Comment (话题-说明) / Subject-Predicate (主谓结构)
 * 2. Verbal Core & Coverbs / Prepositions (介词结构: 把, 被, 对, 在, 跟)
 * 3. Complements (补语: 结果补语, 程度补语, 趋向补语, 可能补语)
 * 4. Aspect Particles (时态助词: 了, 着, 过) & Structural Particles (的, 得, 地)
 * 5. Direct / Indirect Objects (宾语)
 */

export interface SyntaxConstituent {
  role: 'Topic' | 'Subject' | 'Coverb/Preposition' | 'Adverbial' | 'Verb' | 'Complement' | 'Object' | 'Particle' | 'Punctuation';
  labelZh: string;
  text: string;
  pinyin?: string;
  explanation: string;
  color: string;
  children?: SyntaxConstituent[];
}

export interface SentenceSyntaxTree {
  sentence: string;
  structureType: 'Subject-Verb-Object' | 'Topic-Comment' | '把-Disposal' | '被-Passive' | 'Complex-Conditional';
  structureExplanation: string;
  constituents: SyntaxConstituent[];
}

const SYNTAX_COLORS = {
  Subject: '#4A90E2',      // Blue
  Topic: '#9B51E0',        // Purple
  Coverb: '#E67E22',       // Orange
  Adverbial: '#F1C40F',    // Gold
  Verb: '#2ECC71',         // Green
  Complement: '#E74C3C',   // Red / Coral
  Object: '#3498DB',       // Light Blue
  Particle: '#95A5A6',     // Gray
  Punctuation: '#7F8C8D'
};

/**
 * Parses a Mandarin sentence into its constituent hierarchical syntax tree.
 */
export function parseSentenceSyntax(sentence: string): SentenceSyntaxTree {
  const clean = sentence.trim();

  // 1. Detect 把 (Ba disposal structure)
  if (clean.includes('把')) {
    const baMatch = clean.match(/^(.*?)(把)(.*?)([\u4e00-\u9fa5]{1,3})([着过了得]|到|好|完|掉|走|给)?(.*)$/);
    if (baMatch) {
      const [, subj, ba, obj, verb, comp, rest] = baMatch;
      const constituents: SyntaxConstituent[] = [];
      if (subj) {
        constituents.push({
          role: 'Subject',
          labelZh: '主语 (Subject/Agent)',
          text: subj,
          explanation: 'The initiator of the action.',
          color: SYNTAX_COLORS.Subject
        });
      }
      constituents.push({
        role: 'Coverb/Preposition',
        labelZh: '处置标记 (Ba Disposal Marker)',
        text: ba,
        explanation: 'Fronts the object for disposal or manipulation.',
        color: SYNTAX_COLORS.Coverb
      });
      if (obj) {
        constituents.push({
          role: 'Object',
          labelZh: '处置对象 (Disposed Object)',
          text: obj,
          explanation: 'The patient being acted upon.',
          color: SYNTAX_COLORS.Object
        });
      }
      if (verb) {
        constituents.push({
          role: 'Verb',
          labelZh: '动词核心 (Verb Core)',
          text: verb,
          explanation: 'The primary action applied to the object.',
          color: SYNTAX_COLORS.Verb
        });
      }
      if (comp) {
        constituents.push({
          role: 'Complement',
          labelZh: '结果补语/助词 (Complement / Result)',
          text: comp,
          explanation: 'Outcome or completion state of the action.',
          color: SYNTAX_COLORS.Complement
        });
      }
      if (rest) {
        constituents.push({
          role: 'Object',
          labelZh: '后续补充 (Post-verbal Tail)',
          text: rest,
          explanation: 'Additional directional or recipient detail.',
          color: SYNTAX_COLORS.Object
        });
      }
      return {
        sentence: clean,
        structureType: '把-Disposal',
        structureExplanation: 'Special Chinese disposal construction: Subject + 把 + Patient + Verb + Result Complement.',
        constituents
      };
    }
  }

  // 2. Detect 被 (Passive structure)
  if (clean.includes('被')) {
    const beiMatch = clean.match(/^(.*?)(被)(.*?)([\u4e00-\u9fa5]{1,3})([着过了得]|掉|走|坏|破)?(.*)$/);
    if (beiMatch) {
      const [, receiver, bei, agent, verb, comp, rest] = beiMatch;
      const constituents: SyntaxConstituent[] = [];
      if (receiver) {
        constituents.push({
          role: 'Subject',
          labelZh: '受事主语 (Recipient/Subject)',
          text: receiver,
          explanation: 'The recipient enduring the action.',
          color: SYNTAX_COLORS.Subject
        });
      }
      constituents.push({
        role: 'Coverb/Preposition',
        labelZh: '被动标记 (Passive Marker)',
        text: bei,
        explanation: 'Introduces the passive relationship ("by / was -ed").',
        color: SYNTAX_COLORS.Coverb
      });
      if (agent) {
        constituents.push({
          role: 'Object',
          labelZh: '施事者 (Agent of Action)',
          text: agent,
          explanation: 'The entity that performed the action.',
          color: SYNTAX_COLORS.Object
        });
      }
      if (verb) {
        constituents.push({
          role: 'Verb',
          labelZh: '核心谓语动词 (Verb)',
          text: verb,
          explanation: 'The action inflicted upon the subject.',
          color: SYNTAX_COLORS.Verb
        });
      }
      if (comp) {
        constituents.push({
          role: 'Complement',
          labelZh: '结果补语 (Result Complement)',
          text: comp,
          explanation: 'Outcome or altered state resulting from the action.',
          color: SYNTAX_COLORS.Complement
        });
      }
      if (rest) {
        constituents.push({
          role: 'Object',
          labelZh: '余下成分 (Remaining clause)',
          text: rest,
          explanation: 'Clause termination.',
          color: SYNTAX_COLORS.Object
        });
      }
      return {
        sentence: clean,
        structureType: '被-Passive',
        structureExplanation: 'Standard passive voice: Patient + 被 + (Agent) + Verb + Result.',
        constituents
      };
    }
  }

  // 3. Detect Topic-Comment structure (e.g. 这个事情，我不知道。)
  if (clean.includes('，') || clean.includes(',')) {
    const commaIdx = clean.search(/[，,]/);
    const firstPart = clean.slice(0, commaIdx);
    const secondPart = clean.slice(commaIdx + 1);

    // Heuristic: if first clause has no high-frequency transitive verb or pronoun, it's often the Topic
    if (!firstPart.match(/(我|你|他|她|我们|他们|谁|为什么)/) && secondPart.match(/(我|你|他|她|我们|他们)/)) {
      return {
        sentence: clean,
        structureType: 'Topic-Comment',
        structureExplanation: 'Topic-Comment structure (话题-说明): An initial theme is stated, followed by a subjective judgment or clause.',
        constituents: [
          {
            role: 'Topic',
            labelZh: '话题 (Topic / Theme)',
            text: firstPart,
            explanation: 'What the entire sentence is about (fronted topic).',
            color: SYNTAX_COLORS.Topic
          },
          {
            role: 'Punctuation',
            labelZh: '停顿 (Caesura)',
            text: '，',
            explanation: 'Boundary between Topic and Comment.',
            color: SYNTAX_COLORS.Punctuation
          },
          {
            role: 'Subject',
            labelZh: '说明分句 (Comment Clause)',
            text: secondPart,
            explanation: 'Proposition or commentary regarding the topic.',
            color: SYNTAX_COLORS.Subject
          }
        ]
      };
    }
  }

  // 4. Default Subject-Verb-Object breakdown with complement detection
  const constituents: SyntaxConstituent[] = [];
  
  // Segment tokens using Intl.Segmenter
  let tokens: string[] = [];
  if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
    const segmenter = new (Intl as any).Segmenter('zh-Hans', { granularity: 'word' });
    tokens = Array.from(segmenter.segment(clean)).map((s: any) => s.segment);
  } else {
    tokens = clean.split('');
  }

  // Basic syntactic heuristics
  let foundVerb = false;
  let subjectTokens: string[] = [];
  let verbTokens: string[] = [];
  let complementTokens: string[] = [];
  let objectTokens: string[] = [];

  const commonVerbs = new Set([
    '是', '有', '去', '来', '看', '吃', '喝', '说', '写', '听', '买', '卖',
    '喜欢', '想', '要', '知道', '认识', '做', '学', '习', '读', '坐', '住', '走'
  ]);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.match(/^[。！？.!?]+$/)) continue;

    if (!foundVerb && (commonVerbs.has(token) || (token.length >= 1 && i > 0 && subjectTokens.length > 0))) {
      foundVerb = true;
      verbTokens.push(token);
      continue;
    }

    if (!foundVerb) {
      subjectTokens.push(token);
    } else {
      // Check if complement (得, 完, 好, 懂, 见, 到)
      if (['得', '完', '好', '到', '见', '懂', '错', '清'].includes(token) && complementTokens.length === 0 && objectTokens.length === 0) {
        complementTokens.push(token);
      } else {
        objectTokens.push(token);
      }
    }
  }

  if (subjectTokens.length > 0) {
    const text = subjectTokens.join('');
    constituents.push({
      role: 'Subject',
      labelZh: '主语 (Subject)',
      text,
      explanation: 'Entity performing the action or being described.',
      color: SYNTAX_COLORS.Subject
    });
  }

  if (verbTokens.length > 0) {
    const text = verbTokens.join('');
    constituents.push({
      role: 'Verb',
      labelZh: '谓语核心 (Predicate Verb)',
      text,
      explanation: 'Core action or state.',
      color: SYNTAX_COLORS.Verb
    });
  }

  if (complementTokens.length > 0) {
    const text = complementTokens.join('');
    constituents.push({
      role: 'Complement',
      labelZh: '补语 (Complement)',
      text,
      explanation: 'Result, potential, or degree modifier qualifying the verb.',
      color: SYNTAX_COLORS.Complement
    });
  }

  if (objectTokens.length > 0) {
    const text = objectTokens.join('');
    constituents.push({
      role: 'Object',
      labelZh: '宾语 (Direct Object)',
      text,
      explanation: 'Entity receiving the action.',
      color: SYNTAX_COLORS.Object
    });
  }

  return {
    sentence: clean,
    structureType: 'Subject-Verb-Object',
    structureExplanation: 'Standard Mandarin canonical word order: Subject + Adverbial + Verb + Complement + Object.',
    constituents: constituents.length > 0 ? constituents : [
      {
        role: 'Subject',
        labelZh: '完整句 (Complete Clause)',
        text: clean,
        explanation: 'Unified syntactic statement.',
        color: SYNTAX_COLORS.Subject
      }
    ]
  };
}
