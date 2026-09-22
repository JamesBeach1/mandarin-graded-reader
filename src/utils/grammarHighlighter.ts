/**
 * Chinese Grammar Pattern Highlighter
 * Identifies core HSK grammatical markers and sentence patterns
 */

export interface GrammarPatternMatch {
  patternName: string;
  matchedText: string;
  startIndex: number;
  endIndex: number;
  hskLevel: number;
  formula: string;
  explanation: string;
}

export interface GrammarRule {
  name: string;
  regex: RegExp;
  hskLevel: number;
  formula: string;
  explanation: string;
}

export const COMMON_GRAMMAR_PATTERNS: GrammarRule[] = [
  // HSK 1
  {
    name: '在...里/中/上 (Locational Framework)',
    regex: /在[^，。！？\n]{1,15}(里|中|上|下|前|后)/g,
    hskLevel: 1,
    formula: '在 + Location / Context + 里/中/上',
    explanation: 'Indicates action occurring within a spatial, temporal, or conceptual boundary.'
  },
  {
    name: '可以... (Permission / Capability)',
    regex: /可以[\u4e00-\u9fa5]{1,8}/g,
    hskLevel: 1,
    formula: 'Subject + 可以 + Verb Phrase',
    explanation: 'Expresses permission or feasible ability ("can / may").'
  },

  // HSK 2
  {
    name: '因为...所以... (Causal Construction)',
    regex: /因为[^，。！？\n]{1,25}所以/g,
    hskLevel: 2,
    formula: '因为 + Reason, 所以 + Result',
    explanation: 'Expresses cause and effect ("Because... therefore...").'
  },
  {
    name: '虽然...但是... (Concessive Conjunction)',
    regex: /虽然[^，。！？\n]{1,25}(但是|可是|但)/g,
    hskLevel: 2,
    formula: '虽然 + Clause 1, 但是 + Clause 2',
    explanation: 'Connects two contrasting statements ("Although... but...").'
  },
  {
    name: '如果...就... (Conditional)',
    regex: /(如果|要是)[^，。！？\n]{1,25}就/g,
    hskLevel: 2,
    formula: '如果 + Condition, 就 + Result',
    explanation: 'Expresses hypothetical scenarios ("If..., then...").'
  },
  {
    name: '越来越... (Progressive Intensifier)',
    regex: /越来越[\u4e00-\u9fa5]{1,4}/g,
    hskLevel: 2,
    formula: '越来越 + Adjective / Mental Verb',
    explanation: 'Expresses progressive change over time ("More and more...").'
  },
  {
    name: '一边...一边... (Simultaneous Actions)',
    regex: /(一边|边)[^，。！？\n]{1,10}(一边|边)/g,
    hskLevel: 2,
    formula: '一边 + Action 1, 一边 + Action 2',
    explanation: 'Two actions occurring concurrently ("Doing A while doing B").'
  },
  {
    name: '比...更/还... (Comparative)',
    regex: /比[^，。！？\n]{1,12}(更|还)[\u4e00-\u9fa5]{1,3}/g,
    hskLevel: 2,
    formula: 'Noun A + 比 + Noun B + 更/还 + Adjective',
    explanation: 'Standard comparative structure ("Even more ... than ...").'
  },

  // HSK 3
  {
    name: '把 (Disposal Construction)',
    regex: /把[^，。！？\n]{1,14}[\u4e00-\u9fa5]{1,4}(了|掉|完|好|到|在|进|出|开|上|下|成)/g,
    hskLevel: 3,
    formula: 'Subject + 把 + Object + Verb + Complement / Result',
    explanation: 'Emphasizes how an action affects, moves, or changes an object.'
  },
  {
    name: '被 (Passive Construction)',
    regex: /被[^，。！？\n]{0,12}[\u4e00-\u9fa5]{1,4}(了|掉|坏|完|走|到)/g,
    hskLevel: 3,
    formula: 'Receiver + 被 + (Agent) + Action + Result',
    explanation: 'Passive sentence indicating the recipient was affected by an action.'
  },
  {
    name: '除了...以外 (Inclusion / Exclusion)',
    regex: /除了[^，。！？\n]{1,20}(以外|之外)(都|也|还)/g,
    hskLevel: 3,
    formula: '除了 + X + 以外, 都 (Exclusion) / 也/还 (Inclusion)',
    explanation: 'Expresses "Except for X" or "In addition to X".'
  },
  {
    name: '不但/不仅...而且... (Progressive Addition)',
    regex: /(不但|不仅)[^，。！？\n]{1,25}(而且|也|还)/g,
    hskLevel: 3,
    formula: '不仅 / 不但 + Clause 1, 而且 + Clause 2',
    explanation: 'Adds escalating information ("Not only... but also...").'
  },
  {
    name: '一...就... (Immediate Action Sequence)',
    regex: /一[^，。！？\n]{1,8}就/g,
    hskLevel: 3,
    formula: '一 + Action 1 + 就 + Action 2',
    explanation: 'Immediate sequence ("As soon as... then...").'
  },
  {
    name: '对...来说 (Perspective Framework)',
    regex: /对[^，。！？\n]{1,12}来说/g,
    hskLevel: 3,
    formula: '对 + Person / Entity + 来说',
    explanation: 'Frames a statement from someone\'s viewpoint ("As far as X is concerned").'
  },
  {
    name: '为了... (Purpose / Intent)',
    regex: /为了[^，。！？\n]{1,18}[，]/g,
    hskLevel: 3,
    formula: '为了 + Purpose / Goal, Subject + Action',
    explanation: 'States motivation or objective ("In order to...").'
  },

  // HSK 4+
  {
    name: '无论/不管...都... (Unconditional Conjunction)',
    regex: /(无论|不管)[^，。！？\n]{1,25}(都|也)/g,
    hskLevel: 4,
    formula: '无论 / 不管 + Condition, 都 / 也 + Result',
    explanation: 'Expresses no matter what happens, the outcome remains constant.'
  }
];

export function findGrammarPatterns(text: string): GrammarPatternMatch[] {
  const matches: GrammarPatternMatch[] = [];

  COMMON_GRAMMAR_PATTERNS.forEach(pattern => {
    let match: RegExpExecArray | null;
    const rx = new RegExp(pattern.regex.source, 'g');
    while ((match = rx.exec(text)) !== null) {
      matches.push({
        patternName: pattern.name,
        matchedText: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        hskLevel: pattern.hskLevel,
        formula: pattern.formula,
        explanation: pattern.explanation
      });
    }
  });

  // Sort by starting position in text
  return matches.sort((a, b) => a.startIndex - b.startIndex);
}

