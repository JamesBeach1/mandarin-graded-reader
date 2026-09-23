/**
 * Moyun Writing Grader Engine (AIM-001)
 * High-performance client-side heuristic grammar checker and Gemini-powered
 * composition evaluator for free-writing and essays.
 */

export interface GrammarIssue {
  id: string;
  type: 'particle' | 'measure_word' | 'aspect' | 'negation' | 'collocation' | 'word_order';
  title: string;
  originalSnippet: string;
  replacementSnippet: string;
  explanation: string;
  startIndex: number;
  endIndex: number;
  severity: 'error' | 'warning' | 'suggestion';
}

export interface DiffSegment {
  type: 'unchanged' | 'removed' | 'added';
  text: string;
}

export interface EvaluationResult {
  score: number; // 0 - 100
  estimatedHsk: string; // e.g. "HSK 2-3"
  wordCount: number;
  characterCount: number;
  correctedText: string;
  diffSegments: DiffSegment[];
  issues: GrammarIssue[];
  strengths: string[];
  improvements: string[];
  nativeComment: string;
}

// Common Mandarin grammatical patterns and misuses
const HEURISTIC_RULES: Array<{
  regex: RegExp;
  type: GrammarIssue['type'];
  title: string;
  suggest: (match: string) => string;
  explanation: string;
  severity: GrammarIssue['severity'];
}> = [
  // 1. 的 vs 得 vs 地 (Structural Particles)
  {
    // Verb + 的 + Adverb/Adj (e.g. 跑的快 -> 跑得快, 说的很好 -> 说得很好)
    regex: /([\u4E00-\u9FFF]{1,2})的(快|慢|好|高|多|少|远|漂亮|清楚|对|错|早|晚)/g,
    type: 'particle',
    title: '结构助词 “得” 与 “的” 混淆',
    suggest: (m) => m.replace('的', '得'),
    explanation: '修饰动词或形容词达到的程度或结果时，应使用结构助词 “得”（如 “跑得快”、“写得好”），而不是定语标记 “的”。',
    severity: 'error'
  },
  {
    // Adverb/Adj + 的 + Verb (e.g. 认真的写 -> 认真地写, 慢慢的走 -> 慢慢地走)
    regex: /(认真|努力|慢慢|飞快|高兴|偷偷|大声|热烈|悄悄)的([\u4E00-\u9FFF]{1,2})/g,
    type: 'particle',
    title: '状语标记 “地” 与 “的” 混淆',
    suggest: (m) => m.replace('的', '地'),
    explanation: '形容词充当状语修饰后置动词时，标准书面语应当使用状语助词 “地”（如 “认真地做”、“慢慢地走”）。',
    severity: 'warning'
  },

  // 2. Measure Words (量词搭配)
  {
    // 一个书 -> 一本书
    regex: /([一二两三四五六七八九十几多])个书/g,
    type: 'measure_word',
    title: '书的量词误用',
    suggest: (m) => m.replace('个书', '本书'),
    explanation: '名词 “书” 的专用量词是 “本”（如 “一本书”），不能直接用泛用量词 “个”。',
    severity: 'error'
  },
  {
    // 一个猫/狗/鸟 -> 一只猫/狗/鸟
    regex: /([一二两三四五六七八九十几多])个(猫|狗|鸟|鸡|鸭|羊)/g,
    type: 'measure_word',
    title: '动物量词应为 “只”',
    suggest: (m) => m.replace(/个(猫|狗|鸟|鸡|鸭|羊)/, '只$1'),
    explanation: '绝大多数飞禽与小型哺乳动物的专用量词应使用 “只”（如 “一只猫”、“两只狗”）。',
    severity: 'error'
  },
  {
    // 一个车 -> 一辆车
    regex: /([一二两三四五六七八九十几多])个车/g,
    type: 'measure_word',
    title: '车辆量词应为 “辆”',
    suggest: (m) => m.replace('个车', '辆车'),
    explanation: '陆地车辆（汽车、自行车、卡车）的专用量词是 “辆”（如 “一辆汽车”）。',
    severity: 'error'
  },
  {
    // 一个问题/事情 -> 一个... (fine, but 一只问题 is wrong)
    regex: /([一二两三四五六七八九十几多])只(问题|事情|工作|电脑)/g,
    type: 'measure_word',
    title: '抽象事物不可用 “只”',
    suggest: (m) => m.replace(/只(问题|事情|工作)/, '个$1').replace('只电脑', '台电脑'),
    explanation: '抽象名词如 “问题”、“事情” 应使用量词 “个”；电器设备如 “电脑” 使用 “台”。',
    severity: 'error'
  },

  // 3. Negation (不 vs 没)
  {
    // 没是 -> 不是
    regex: /没是/g,
    type: 'negation',
    title: '系词 “是” 必须用 “不” 否定',
    suggest: () => '不是',
    explanation: '判断动词 “是” 无论在过去、现在还是将来，只能用 “不” 否定，不能用 “没”。',
    severity: 'error'
  },
  {
    // 没能 -> 不能 (in general contexts) or 不有 -> 没有
    regex: /不有/g,
    type: 'negation',
    title: '领属与存在动词 “有” 必须用 “没” 否定',
    suggest: () => '没有',
    explanation: '动词 “有” 的否定式永远是 “没有”，不能说 “不有”。',
    severity: 'error'
  },
  {
    // 不了 (past completed negation: 昨天我不去了 -> 昨天我没去)
    regex: /昨天不([\u4E00-\u9FFF]{1,2})了/g,
    type: 'aspect',
    title: '过去发生的动作否定应使用 “没” 且不带 “了”',
    suggest: (m) => m.replace(/昨天不([\u4E00-\u9FFF]{1,2})了/, '昨天没$1'),
    explanation: '过去时态否定完成时，使用否定副词 “没” 或 “没有”，且动词后通常省略动态助词 “了”。',
    severity: 'error'
  },

  // 4. Aspect Particles (了, 着, 过)
  {
    // 没...了 (e.g. 我没吃饭了 -> 我没吃饭)
    regex: /没([\u4E00-\u9FFF]{1,3})了/g,
    type: 'aspect',
    title: '“没” 否定句末通常不加时态 “了”',
    suggest: (m) => m.replace(/没([\u4E00-\u9FFF]{1,3})了/, '没$1'),
    explanation: '动作未发生用 “没” 否定时，动词后不再使用表示完成的动态助词 “了”（除非表示情况发生新变化）。',
    severity: 'warning'
  }
];

export const WritingGraderEngine = {
  /**
   * Fast offline heuristic analysis
   */
  evaluateOffline(text: string): EvaluationResult {
    const raw = text.trim();
    if (!raw) {
      return {
        score: 0,
        estimatedHsk: 'N/A',
        wordCount: 0,
        characterCount: 0,
        correctedText: '',
        diffSegments: [],
        issues: [],
        strengths: [],
        improvements: [],
        nativeComment: '请输入一段中文文字或作文。'
      };
    }

    const issues: GrammarIssue[] = [];
    let corrected = raw;

    // Apply heuristic rules
    for (const rule of HEURISTIC_RULES) {
      let match: RegExpExecArray | null;
      const ruleRegex = new RegExp(rule.regex.source, rule.regex.flags);
      while ((match = ruleRegex.exec(raw)) !== null) {
        const originalSnippet = match[0];
        const replacement = rule.suggest(originalSnippet);
        if (originalSnippet !== replacement) {
          issues.push({
            id: `rule-${issues.length + 1}`,
            type: rule.type,
            title: rule.title,
            originalSnippet,
            replacementSnippet: replacement,
            explanation: rule.explanation,
            startIndex: match.index,
            endIndex: match.index + originalSnippet.length,
            severity: rule.severity
          });
        }
      }
    }

    // Apply replacements to generate corrected text
    for (const issue of issues) {
      corrected = corrected.replace(issue.originalSnippet, issue.replacementSnippet);
    }

    // Compute diff segments
    const diffSegments = this.computeDiff(raw, corrected);

    // Compute approximate HSK level based on sentence length and vocabulary
    const charCount = raw.replace(/[^\u4E00-\u9FFF]/g, '').length;
    let estimatedHsk = 'HSK 1-2';
    if (charCount > 250) estimatedHsk = 'HSK 4-5';
    else if (charCount > 120) estimatedHsk = 'HSK 3-4';
    else if (charCount > 50) estimatedHsk = 'HSK 2-3';

    // Calculate score
    const errorPenalty = issues.filter(i => i.severity === 'error').length * 8;
    const warnPenalty = issues.filter(i => i.severity === 'warning').length * 4;
    const baseScore = Math.max(50, 95 - errorPenalty - warnPenalty);
    const score = issues.length === 0 ? 98 : baseScore;

    const strengths: string[] = [];
    if (charCount >= 50) strengths.push('文章篇幅适中，具备连续成句的篇章表达能力。');
    if (issues.filter(i => i.type === 'particle').length === 0) strengths.push('结构助词（的/得/地）使用规范准确。');
    if (issues.filter(i => i.type === 'measure_word').length === 0) strengths.push('量词搭配自然，符合现代汉语习惯。');
    if (strengths.length === 0) strengths.push('用词清晰，句意表达明确。');

    const improvements: string[] = [];
    if (issues.length > 0) {
      improvements.push(`检测到 ${issues.length} 处语法或搭配优化建议，请参考下方批改详情。`);
    } else {
      improvements.push('语法结构规范！可尝试增加更多连词（虽然...但是...、不仅...而且...）丰富复句表达。');
    }

    const nativeComment = issues.length === 0
      ? '文笔流畅，语法自然！表达通顺且准确。'
      : `整体表达基本通顺，建议重点关注 “${issues[0].title}” 等细节搭配。`;

    return {
      score,
      estimatedHsk,
      wordCount: raw.split(/\s+/).length,
      characterCount: charCount,
      correctedText: corrected,
      diffSegments,
      issues,
      strengths,
      improvements,
      nativeComment
    };
  },

  /**
   * Online evaluation using Google Gemini API
   */
  async evaluateWithGemini(text: string, apiKey: string): Promise<EvaluationResult> {
    if (!apiKey) {
      return this.evaluateOffline(text);
    }

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a certified senior HSK Mandarin Chinese examiner and linguistic evaluator.
Analyze the following student writing passage and return a valid JSON object ONLY (no markdown formatting, no code fences):

STUDENT ESSAY:
"""${text}"""

Return JSON format:
{
  "score": number (0-100),
  "estimatedHsk": "HSK 1" | "HSK 2" | "HSK 3" | "HSK 4" | "HSK 5" | "HSK 6",
  "correctedText": string (the natural, grammatically flawless rewrite in natural Mandarin),
  "issues": [
    {
      "title": string,
      "originalSnippet": string,
      "replacementSnippet": string,
      "explanation": string,
      "severity": "error" | "warning" | "suggestion"
    }
  ],
  "strengths": [string, string],
  "improvements": [string, string],
  "nativeComment": string
}`;

      const response = await model.generateContent(prompt);
      const responseText = response.response.text().trim();
      const cleaned = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned);

      const diffSegments = this.computeDiff(text, parsed.correctedText || text);
      const charCount = text.replace(/[^\u4E00-\u9FFF]/g, '').length;

      return {
        score: parsed.score || 85,
        estimatedHsk: parsed.estimatedHsk || 'HSK 2',
        wordCount: text.split(/\s+/).length,
        characterCount: charCount,
        correctedText: parsed.correctedText || text,
        diffSegments,
        issues: (parsed.issues || []).map((iss: any, idx: number) => ({
          id: `ai-${idx + 1}`,
          type: 'collocation',
          title: iss.title || '语法搭配修正',
          originalSnippet: iss.originalSnippet || '',
          replacementSnippet: iss.replacementSnippet || '',
          explanation: iss.explanation || '',
          startIndex: 0,
          endIndex: 0,
          severity: iss.severity || 'warning'
        })),
        strengths: parsed.strengths || ['文章结构清晰'],
        improvements: parsed.improvements || ['注意书面语搭配'],
        nativeComment: parsed.nativeComment || '写作富有逻辑，已完成针对性润色。'
      };
    } catch (e) {
      console.warn('Gemini online writing grading failed, falling back to offline engine:', e);
      return this.evaluateOffline(text);
    }
  },

  /**
   * Simple character/word level diff algorithm
   */
  computeDiff(original: string, modified: string): DiffSegment[] {
    if (original === modified) {
      return [{ type: 'unchanged', text: original }];
    }

    const segments: DiffSegment[] = [];
    const origChars = original.split('');
    const modChars = modified.split('');

    let i = 0;
    let j = 0;

    while (i < origChars.length || j < modChars.length) {
      if (i < origChars.length && j < modChars.length && origChars[i] === modChars[j]) {
        // Collect identical run
        let run = '';
        while (i < origChars.length && j < modChars.length && origChars[i] === modChars[j]) {
          run += origChars[i];
          i++;
          j++;
        }
        segments.push({ type: 'unchanged', text: run });
      } else {
        // Collect removed and added chunks
        let removedRun = '';
        let addedRun = '';

        if (i < origChars.length && (j >= modChars.length || origChars[i] !== modChars[j])) {
          removedRun += origChars[i];
          i++;
        }
        if (j < modChars.length && (i >= origChars.length || modChars[j] !== origChars[i - 1])) {
          addedRun += modChars[j];
          j++;
        }

        if (removedRun) {
          segments.push({ type: 'removed', text: removedRun });
        }
        if (addedRun) {
          segments.push({ type: 'added', text: addedRun });
        }
      }
    }

    return segments;
  }
};
