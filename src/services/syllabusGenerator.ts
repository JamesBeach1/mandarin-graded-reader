/**
 * Generative Syllabus Engine
 * Transforms high-level user learning goals (e.g. "2-week trip to Taipei" or "Survival medical Chinese")
 * into a multi-week persistent Course Campaign with chapters, biomes, winding coordinates, and Boss Capstones.
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import type { Course, Chapter, CourseNode, BiomeType } from '../types/Course';

export interface SyllabusGenerationParams {
  goal: string;
  targetHskLevel: string;
  knownWeaknesses?: string[];
  apiKey?: string;
}

export class SyllabusGenerator {
  /**
   * Cleans and extracts the core subject of a goal, stripping noise words.
   */
  public static extractCleanSubject(goal: string): string {
    return goal
      .replace(/^(I want to learn|learn how to|learning|practice|master|study|speak)\s*/i, '')
      .replace(/\s*(campaign|course|curriculum|journey|odyssey|chronicles)$/i, '')
      .trim();
  }

  /**
   * Synthesizes an evocative, scenario-driven premise description instead of echoing raw user strings.
   */
  public static synthesizeGoalPremise(goal: string, cleanSubject: string): string {
    const stopWords = new Set(['a', 'an', 'the', 'in', 'on', 'at', 'for', 'of', 'to', 'from', 'with', 'by', 'and', 'or', 'my', 'your', 'his', 'her', 'their', 'some', 'any', 'it', 'is', 'fun', 'learning', 'how', 'how-to', 'about', 'just', 'comitting', 'committing']);
    const keywords = cleanSubject
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => !stopWords.has(w.toLowerCase()))
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

    const focus = keywords.slice(0, 3).join(' ') || cleanSubject || 'this adventure';
    return `An escalating 3-act narrative adventure: overcome unexpected hurdles, navigate high-stakes dialogues, and master communicative Mandarin centered around ${focus}.`;
  }

  /**
   * Synthesizes an evocative, witty, and bespoke title for any user goal
   * eliminating robotic template suffixes like 'Campaign' or 'Course'.
   */
  public static synthesizeCreativeTitle(goal: string): string {
    const clean = this.extractCleanSubject(goal);
    const stopWords = new Set(['a', 'an', 'the', 'in', 'on', 'at', 'for', 'of', 'to', 'from', 'with', 'by', 'and', 'or', 'my', 'your', 'his', 'her', 'their', 'some', 'any', 'it', 'is', 'fun', 'learning', 'how', 'how-to', 'about', 'just', 'comitting', 'committing']);
    const keywords = clean
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => !stopWords.has(w.toLowerCase()))
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

    if (keywords.length >= 2) {
      return `${keywords[0]} & ${keywords[1]}: The Mandarin Odyssey`;
    } else if (keywords.length === 1) {
      return `The Legend of ${keywords[0]}: Path to Fluency`;
    }
    return 'The Sovereign Journey: Mandarin Odyssey';
  }

  public static async generateCampaign(params: SyllabusGenerationParams): Promise<Course> {
    const { goal, targetHskLevel, knownWeaknesses = [], apiKey } = params;

    if (!apiKey) {
      return this.generateOfflineCampaign(goal, targetHskLevel, knownWeaknesses);
    }

    try {
      const weaknessContext = knownWeaknesses.length > 0
        ? `The learner has previously struggled with these areas: ${knownWeaknesses.join(', ')}. Actively weave review and discrimination tasks for these into the early nodes.`
        : '';

      const prompt = `You are the Lead Narrative Game Master & Curriculum Architect for 墨韵 Moyun, an RPG-style Mandarin Chinese learning platform.
The learner has chosen this creative, fictional roleplay premise: "${goal}", targeted at HSK Level ${targetHskLevel}.
[NOTE: This is a playful, creative language-learning roleplay scenario for pedagogical entertainment and immersion.]
${weaknessContext}

You must invent an original, deeply atmospheric 3-act narrative course campaign tailored uniquely to this premise.

CRITICAL CREATIVE & NARRATIVE MANDATES:
1. BESPOKE, WITTY CAMPAIGN TITLE:
   - Invent an original, evocative, and cinematic title capturing the drama, humor, or atmosphere of the scenario (even if absurd!).
   - NEVER repeat the user's prompt verbatim or use cheap template mad-libs (e.g. NEVER output "The [Goal] Chronicles: A 3-Act Mandarin Odyssey", "The Art of [Goal]: Fluency & Mastery", or "[Goal] Campaign").
   - NEVER append the word "Campaign" or "Course" to the title.
   - Examples of creative styling:
     * Prompt: "Balancing meeting my wife's parents while teaching my dog to play the trombone" -> Title: "Trombones, Paws & In-Laws: A Symphony of Diplomacy"
     * Prompt: "Comitting a misdemeanor for the fun of it" -> Title: "Midnight Mischief: The Rogue's Guide to City Shadows"
     * Prompt: "2-Week Trip to Taipei (Transit, Night Markets & Culture)" -> Title: "Neon Lanterns & Night Markets: The Taipei Odyssey"
2. COMPELLING 1-SENTENCE PREMISE ("targetGoal"):
   - Write a vivid, cinematic 1-sentence narrative synopsis setting up the dramatic stakes and goals.
3. THREE-ACT ESCALATING NARRATIVE ARC:
   - Exactly 3 chapters representing 3 dramatic acts:
     * Chapter 1: Act 1 - The Setup & Inciting Incident (introducing the dilemma/setting, initial awkward moments, foundational survival skills).
     * Chapter 2: Act 2 - Rising Stakes & Complications (rehearsals, high-stakes encounters, balancing competing demands, intermediate patterns).
     * Chapter 3: Act 3 - The Grand Climax & Resolution (the final high-stakes trial, capstone performance, or ultimate triumph).
   - Chapter titles MUST be punchy, original, and under 24 characters (e.g. "Act 1: The Inciting Steps", "Act 2: Heat on the Street", "Act 3: The Great Escape").
   - NEVER put "Setup of [Goal]" or "Immersion in [Goal]" or "Mastery of [Goal]" in the chapter titles!
   - Chapter descriptions MUST provide 1-2 sentences of vivid dramatic context.
4. BESPOKE, STORY-DRIVEN LESSON NODES (NO GENERIC NAMES!):
   - EVERY single node title and description MUST directly tell the specific story of "${goal}".
   - FORBIDDEN: Do NOT name nodes generic things like "Foundations: Immediate survival & greetings", "Core Application", or "Checkpoint".
   - REQUIRED: Every node MUST be named after an active story event or plot milestone specifically tailored to "${goal}".
     (For example, if about a mischievous caper: "Scouting the Rooftops", "The Fence's Password", "Evading the Night Patrol", "Spaced Ambush: Quick Excuses", "Boss: The Chief Inspector's Interrogation").
     (Or if about dog playing trombone with in-laws: "Hiding the Horn", "Dinner Table Small Talk", "Secret Rehearsal in the Yard", "Spaced Ambush: Muffling the Bark", "Boss: Family Concert Debut").
   - EVERY node MUST have an "icon" field containing a vibrant, thematic emoji matching its scenario (e.g. "🎺", "🐶", "🥟", "🕵️", "🏮", "💼", "☕", "🚕", "⚖️", "🏥").
   - Target vocabulary on each node should blend relevant HSK ${targetHskLevel} words with words vital to the scenario in Simplified Chinese.
5. MINIMUM NODE COUNT & BRANCHING DAG (5 nodes per chapter):
   - Each chapter MUST have 5 nodes:
     * Node 1: type: "learning", branchType: "main", mapCoordinates: { "x": 50, "y": 10 }, connectedTo: [Node 2 ID, Side Quest ID].
     * Side Quest: type: "learning", branchType: "side_quest", mapCoordinates: { "x": 20, "y": 28 }, connectedTo: [Node 2 ID].
     * Node 2: type: "learning", branchType: "main", mapCoordinates: { "x": 74, "y": 48 }, connectedTo: [Spaced Ambush ID].
     * Spaced Ambush: type: "review_ambush", branchType: "ambush", mapCoordinates: { "x": 42, "y": 70 }, connectedTo: [Boss Capstone ID].
     * Boss Capstone: type: "boss_capstone", branchType: "boss", mapCoordinates: { "x": 50, "y": 90 }, connectedTo: [].
   - Chapter 1: isUnlocked: true; Node 1: status "active", others "locked".
   - Chapters 2 & 3: isUnlocked: false; all nodes "locked".
   - Set "exercises": [] on every node (exercises are generated on-demand when launched).
6. ALL CHINESE TEXT in Simplified Chinese.
7. OUTPUT:
   - Return ONLY raw valid JSON matching this schema, with no markdown code fences:
{
  "title": "String (witty, bespoke campaign title, e.g. 'Trombones, Paws & In-Laws: A Symphony of Diplomacy')",
  "targetGoal": "String (vivid 1-sentence narrative premise for this campaign)",
  "level": "HSK ${targetHskLevel}",
  "chapters": [
    {
      "id": "ch-1",
      "title": "String (e.g. 'Act 1: The Inciting Steps')",
      "description": "String (dramatic context for this chapter)",
      "themeBiome": "city" | "mountains" | "forest",
      "isUnlocked": true,
      "nodes": [
        {
          "id": "node-1-1",
          "chapterId": "ch-1",
          "title": "String (story-relevant node title)",
          "description": "String (story scenario)",
          "icon": "String (single emoji matching this node e.g. 🐶, 🎺, 🥟, 🕵️, 🏮)",
          "type": "learning" | "review_ambush" | "boss_capstone",
          "branchType": "main" | "side_quest" | "ambush" | "boss",
          "status": "active" | "locked",
          "connectedTo": ["node-1-2", "node-1-b1"],
          "mapCoordinates": { "x": 50, "y": 10 },
          "hskLevel": "${targetHskLevel}",
          "targetVocabulary": ["String", "String", "String"],
          "exercises": []
        }
      ]
    }
  ]
}`;

      // Execute with safetySettings and a 40-second timeout to allow rich 15-node generation
      const generateWithTimeout = async (): Promise<string> => {
        const genAI = new GoogleGenerativeAI(apiKey);
        const safetySettings = [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ];
        try {
          const model = genAI.getGenerativeModel({
            model: 'gemini-3.1-flash-lite',
            safetySettings,
            generationConfig: { responseMimeType: 'application/json' }
          });
          const result = await model.generateContent(prompt);
          return result.response.text();
        } catch (e1) {
          console.warn('gemini-3.1-flash-lite failed, trying gemini-2.5-flash fallback:', e1);
          const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            safetySettings,
            generationConfig: { responseMimeType: 'application/json' }
          });
          const result = await model.generateContent(prompt);
          return result.response.text();
        }
      };

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Campaign generation timed out after 40s')), 40000)
      );

      let text = (await Promise.race([generateWithTimeout(), timeoutPromise])).trim();
      if (text.startsWith('```')) {
        text = text.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      }

      const parsed = JSON.parse(text) as Partial<Course>;
      let resolvedTitle = parsed.title?.trim() || '';

      // Fallback only if Gemini returned an empty title or literally repeated the input goal
      if (
        !resolvedTitle ||
        resolvedTitle.toLowerCase() === goal.toLowerCase().trim() ||
        resolvedTitle.toLowerCase() === `${goal.toLowerCase().trim()} campaign`
      ) {
        resolvedTitle = this.synthesizeCreativeTitle(goal);
      }

      // Ensure targetGoal description is a rich premise
      const targetGoalDescription = parsed.targetGoal?.trim() && parsed.targetGoal.toLowerCase() !== goal.toLowerCase().trim()
        ? parsed.targetGoal.trim()
        : this.synthesizeGoalPremise(goal, this.extractCleanSubject(goal));

      const rawChapters = (parsed.chapters as Chapter[]) || [];

      const rawCourse: Course = {
        id: `campaign-${Date.now()}`,
        title: resolvedTitle,
        targetGoal: targetGoalDescription,
        level: `HSK ${targetHskLevel}`,
        globalMasteryStats: {},
        weaknesses: [...knownWeaknesses],
        chapters: rawChapters,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        totalXp: 0,
        currentRank: 'Initiate Apprentice (学童)'
      };
      return this.normalizeCourseDAG(rawCourse);
    } catch (err) {
      console.warn('AI Campaign generation failed or timed out, using fallback template:', err);
      return this.generateOfflineCampaign(goal, targetHskLevel, knownWeaknesses);
    }
  }

  /**
   * Normalizes any generated or loaded course to guarantee a beautiful snaking S-curve DAG
   * with connectedTo edges, side-quest branches, and balanced coordinates.
   * Auto-expands any chapter with < 4 nodes so the DAG always features 5+ nodes and multiple links.
   */
  public static normalizeCourseDAG(course: Course): Course {
    course.chapters.forEach((chapter) => {
      let nodes = chapter.nodes || [];

      // Auto-expand sparse chapters (< 4 nodes) to at least 5 nodes with branching paths
      if (nodes.length < 4) {
        const firstNode: CourseNode = nodes[0] || {
          id: `${chapter.id}-node-1`,
          chapterId: chapter.id,
          title: `${chapter.title.replace(/^Chapter \d+:\s*/, '')} Foundations`,
          description: 'Master core survival terms and functional sentence formulas.',
          icon: '🏮',
          type: 'learning',
          branchType: 'main',
          status: chapter.isUnlocked ? 'active' : 'locked',
          mapCoordinates: { x: 50, y: 10 },
          connectedTo: [],
          hskLevel: '2',
          targetVocabulary: ['你好', '请问', '谢谢'],
          exercises: []
        };

        const existingBoss = nodes.find(n => n.type === 'boss_capstone') || (nodes.length > 1 ? nodes[nodes.length - 1] : null);
        const bossNode: CourseNode = existingBoss || {
          id: `${chapter.id}-boss`,
          chapterId: chapter.id,
          title: `${chapter.title.replace(/^Chapter \d+:\s*/, '')} Capstone Boss`,
          description: 'Synthesize all chapter material in an intensive multi-turn trial.',
          icon: '👑',
          type: 'boss_capstone',
          branchType: 'boss',
          status: 'locked',
          mapCoordinates: { x: 50, y: 90 },
          connectedTo: [],
          hskLevel: firstNode.hskLevel || '2',
          targetVocabulary: firstNode.targetVocabulary || ['你好', '请问'],
          exercises: []
        };
        bossNode.type = 'boss_capstone';
        bossNode.branchType = 'boss';
        if (!bossNode.icon) bossNode.icon = '👑';

        const baseVocab = firstNode.targetVocabulary && firstNode.targetVocabulary.length > 0
          ? firstNode.targetVocabulary
          : ['学习', '练习', '明白'];

        // Synthesize Side Quest Branch
        const sideQuestNode: CourseNode = {
          id: `${chapter.id}-side-quest`,
          chapterId: chapter.id,
          title: `Side Quest: Tone & Acoustic Reflex (+50 XP)`,
          description: 'Bonus challenge: sharpen tonal reflexes, slang, and cultural fluency.',
          icon: '💎',
          type: 'learning',
          branchType: 'side_quest',
          status: 'locked',
          mapCoordinates: { x: 20, y: 30 },
          connectedTo: [],
          hskLevel: firstNode.hskLevel || '2',
          targetVocabulary: [baseVocab[0] || '买', '卖'],
          exercises: [
            {
              id: `${chapter.id}-ex-sq-1`,
              type: 'minimal_pair_triage',
              title: 'Acoustic Triage',
              instructions: 'Test your acoustic discrimination under pressure for bonus XP.',
              payload: {
                promptAudioText: baseVocab[0] || '买',
                contrastCategory: 'tone',
                explanation: 'Acoustic discrimination sharpens real-world listening reflexes.',
                timeLimitSeconds: 7,
                options: [
                  { text: `${baseVocab[0] || '买'}`, pinyin: 'toned', meaning: 'Target Form', isCorrect: true },
                  { text: '对比音', pinyin: 'distractor', meaning: 'Variant Form', isCorrect: false }
                ]
              }
            }
          ]
        };

        // Synthesize Intermediate Core Application Node
        const intermediateNode: CourseNode = {
          id: `${chapter.id}-node-inter`,
          chapterId: chapter.id,
          title: `Core Application: Structural Fluency`,
          description: 'Construct native sentences and expand grammar patterns.',
          icon: '💬',
          type: 'learning',
          branchType: 'main',
          status: 'locked',
          mapCoordinates: { x: 74, y: 48 },
          connectedTo: [],
          hskLevel: firstNode.hskLevel || '2',
          targetVocabulary: baseVocab,
          exercises: [
            {
              id: `${chapter.id}-ex-inter-1`,
              type: 'sentence_builder_distractors',
              title: 'Sentence Assembly',
              instructions: 'Assemble the sentence correctly. Watch out for grammatical distractors!',
              payload: {
                targetSentence: '我们需要每天多练习中文',
                pinyin: 'wǒ men xū yào měi tiān duō liàn xí zhōng wén',
                englishTranslation: 'We need to practice Chinese more every day',
                validChips: ['我们', '需要', '每天', '多练习', '中文'],
                distractorChips: ['很', '去', '已'],
                explanation: 'Assemble subject + auxiliary verb + adverbial time phrase + verb predicate.'
              }
            }
          ]
        };

        // Synthesize Spaced Ambush Checkpoint Node
        const ambushNode: CourseNode = {
          id: `${chapter.id}-ambush`,
          chapterId: chapter.id,
          title: `Spaced Ambush: Memory Guard`,
          description: 'Surprise checkpoint! Rapid flashcard review of vocabulary before the boss battle.',
          icon: '⚡',
          type: 'review_ambush',
          branchType: 'ambush',
          status: 'locked',
          mapCoordinates: { x: 42, y: 70 },
          connectedTo: [],
          hskLevel: firstNode.hskLevel || '2',
          targetVocabulary: baseVocab,
          exercises: [
            {
              id: `${chapter.id}-ex-ambush-1`,
              type: 'srs_ambush',
              title: 'Memory Ambush',
              instructions: 'Clear flashcard review before facing the chapter capstone.',
              payload: {
                ambushTitle: 'Chapter Memory Guard',
                reason: 'Reinforce foundational words before attempting the boss battle.',
                cards: baseVocab.map(w => ({
                  character: w,
                  pinyin: 'pīnyīn',
                  definition: 'key vocabulary term',
                  hskLevel: firstNode.hskLevel || '2'
                }))
              }
            }
          ]
        };

        // Assemble 5-node rich DAG
        nodes = [firstNode, sideQuestNode, intermediateNode, ambushNode, bossNode];
        chapter.nodes = nodes;

        // Establish DAG edges
        firstNode.connectedTo = [intermediateNode.id, sideQuestNode.id];
        sideQuestNode.connectedTo = [intermediateNode.id];
        intermediateNode.connectedTo = [ambushNode.id];
        ambushNode.connectedTo = [bossNode.id];
      }

      const mainLineNodes: CourseNode[] = [];
      const sideQuestNodes: CourseNode[] = [];

      nodes.forEach((n) => {
        if (!n.branchType) {
          if (n.type === 'review_ambush') n.branchType = 'ambush';
          else if (n.type === 'boss_capstone') n.branchType = 'boss';
          else n.branchType = 'main';
        }
        if (n.branchType === 'side_quest') {
          sideQuestNodes.push(n);
        } else {
          mainLineNodes.push(n);
        }
      });

      // Verify coordinate distribution across canvas height
      const allY = nodes.map(n => n.mapCoordinates?.y || 0);
      const ySpread = Math.max(...allY) - Math.min(...allY);
      const needsSizing = ySpread < 35 || nodes.some(n => !n.mapCoordinates || (n.mapCoordinates.x === 0 && n.mapCoordinates.y === 0));

      if (needsSizing) {
        const totalMain = mainLineNodes.length;
        mainLineNodes.forEach((node, idx) => {
          const progress = totalMain > 1 ? idx / (totalMain - 1) : 0.5;
          const y = Math.round(10 + progress * 78);
          // Smooth snaking S-curve alternating between 25% and 75%
          const x = Math.round(50 + Math.sin(idx * 1.5) * 26);
          node.mapCoordinates = { x, y };
        });

        sideQuestNodes.forEach((sideNode, idx) => {
          const parentIdx = Math.min(idx, mainLineNodes.length - 1);
          const parent = mainLineNodes[parentIdx] || mainLineNodes[0];
          const isLeft = (parent.mapCoordinates?.x || 50) > 50;
          sideNode.mapCoordinates = {
            x: isLeft ? 20 : 80,
            y: Math.min(92, Math.max(8, (parent.mapCoordinates?.y || 20) + 7))
          };
        });
      }

      // Ensure sequential connectedTo links for main line
      mainLineNodes.forEach((node, idx) => {
        if (!node.connectedTo || node.connectedTo.length === 0) {
          node.connectedTo = [];
          if (idx + 1 < mainLineNodes.length) {
            node.connectedTo.push(mainLineNodes[idx + 1].id);
          }
        }
      });

      // Hook in side quest branches
      sideQuestNodes.forEach((sideNode, idx) => {
        const parentMain = mainLineNodes[Math.min(idx, mainLineNodes.length - 2)] || mainLineNodes[0];
        if (parentMain && !parentMain.connectedTo?.includes(sideNode.id)) {
          parentMain.connectedTo = [...(parentMain.connectedTo || []), sideNode.id];
        }
        if (!sideNode.connectedTo || sideNode.connectedTo.length === 0) {
          const nextMain = mainLineNodes[Math.min(idx + 1, mainLineNodes.length - 1)];
          if (nextMain) {
            sideNode.connectedTo = [nextMain.id];
          }
        }
      });
    });

    return course;
  }

  /**
   * Generates a dynamic tailored course offline if Gemini is unavailable
   * Guaranteed to provide 5 nodes per chapter with side quest branching and boss capstones.
   */
  /**
   * Generates a dynamic tailored course offline if Gemini is unavailable
   * Guaranteed to provide 5 nodes per chapter with 3-act storytelling, side quest branching, and boss capstones.
   */
  public static generateOfflineCampaign(
    goal: string,
    targetHskLevel: string,
    knownWeaknesses: string[] = []
  ): Course {
    const courseId = `campaign-${Date.now()}`;
    const cleanGoal = goal.trim() || 'Chinese Fluency Odyssey';
    const creativeTitle = this.synthesizeCreativeTitle(cleanGoal);

    const cleanSubject = this.extractCleanSubject(cleanGoal);
    const stopWords = new Set(['a', 'an', 'the', 'in', 'on', 'at', 'for', 'of', 'to', 'from', 'with', 'by', 'and', 'or', 'my', 'your', 'his', 'her', 'their', 'some', 'any', 'it', 'is', 'fun', 'learning', 'how', 'how-to', 'about', 'just', 'comitting', 'committing']);
    const coreWords = cleanSubject
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => !stopWords.has(w.toLowerCase()));
    const questName = coreWords.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || 'The Mission';

    const chapters: Chapter[] = [
      {
        id: `${courseId}-ch-1`,
        title: 'Act 1: The Inciting Steps',
        description: `Establish your foothold: navigate initial surroundings, decode crucial cues, and master baseline interactions for ${questName}.`,
        themeBiome: 'city' as BiomeType,
        isUnlocked: true,
        nodes: [
          {
            id: `${courseId}-node-1-1`,
            chapterId: `${courseId}-ch-1`,
            title: `Infiltration: First Contact with ${questName}`,
            description: `Master essential survival greetings, polite inquiries, and situational awareness for ${questName}.`,
            icon: '🏮',
            type: 'learning',
            branchType: 'main',
            status: 'active',
            mapCoordinates: { x: 50, y: 10 },
            connectedTo: [`${courseId}-node-1-2`, `${courseId}-node-1-b1`],
            hskLevel: targetHskLevel,
            targetVocabulary: ['请问', '您好', '谢谢', '在哪里'],
            exercises: []
          },
          {
            id: `${courseId}-node-1-b1`,
            chapterId: `${courseId}-ch-1`,
            title: `Side Quest: Rapid Acoustic Reflexes (+50 XP)`,
            description: `High-pressure phonetic and tone discrimination drills to decode incoming audio cues under time pressure.`,
            icon: '💎',
            type: 'learning',
            branchType: 'side_quest',
            status: 'locked',
            mapCoordinates: { x: 20, y: 28 },
            connectedTo: [`${courseId}-node-1-2`],
            hskLevel: targetHskLevel,
            targetVocabulary: ['客气', '明白', '练习'],
            exercises: []
          },
          {
            id: `${courseId}-node-1-2`,
            chapterId: `${courseId}-ch-1`,
            title: `Casing the Scene: Gathering Critical Intelligence`,
            description: `Learn to ask subtle questions, navigate key locations, and express urgent functional needs.`,
            icon: '🗺️',
            type: 'learning',
            branchType: 'main',
            status: 'locked',
            mapCoordinates: { x: 74, y: 48 },
            connectedTo: [`${courseId}-node-1-3`],
            hskLevel: targetHskLevel,
            targetVocabulary: ['需要', '可以', '帮助', '多少'],
            exercises: []
          },
          {
            id: `${courseId}-node-1-3`,
            chapterId: `${courseId}-ch-1`,
            title: `Spaced Ambush: Street Vigilance Checkpoint`,
            description: `Surprise checkpoint review verifying mastery of foundational vocabulary before confronting the Act 1 trial.`,
            icon: '⚡',
            type: 'review_ambush',
            branchType: 'ambush',
            status: 'locked',
            mapCoordinates: { x: 42, y: 70 },
            connectedTo: [`${courseId}-node-1-4`],
            hskLevel: targetHskLevel,
            targetVocabulary: ['请问', '谢谢', '在哪里'],
            exercises: []
          },
          {
            id: `${courseId}-node-1-4`,
            chapterId: `${courseId}-ch-1`,
            title: `Act 1 Boss: The Gatekeeper's Interrogation`,
            description: `Survive a high-stakes conversation to earn clearance and advance deeper into your quest.`,
            icon: '👑',
            type: 'boss_capstone',
            branchType: 'boss',
            status: 'locked',
            mapCoordinates: { x: 50, y: 90 },
            hskLevel: targetHskLevel,
            targetVocabulary: ['明白', '可以', '太好了'],
            exercises: []
          }
        ]
      },
      {
        id: `${courseId}-ch-2`,
        title: 'Act 2: Rising Complications',
        description: `Rising stakes: negotiate unexpected hurdles, express complex logic, and outmaneuver rivals in ${questName}.`,
        themeBiome: 'forest' as BiomeType,
        isUnlocked: false,
        nodes: [
          {
            id: `${courseId}-node-2-1`,
            chapterId: `${courseId}-ch-2`,
            title: `Behind Enemy Lines: Navigating ${questName} Nuance`,
            description: `Field complex inquiries, express preferences, and interpret spoken subtleties under high scrutiny.`,
            icon: '🔍',
            type: 'learning',
            branchType: 'main',
            status: 'locked',
            mapCoordinates: { x: 50, y: 10 },
            connectedTo: [`${courseId}-node-2-2`, `${courseId}-node-2-b1`],
            hskLevel: targetHskLevel,
            targetVocabulary: ['特别', '比较', '觉得', '准备'],
            exercises: []
          },
          {
            id: `${courseId}-node-2-b1`,
            chapterId: `${courseId}-ch-2`,
            title: `Side Quest: Native Slang & Underground Dialect (+50 XP)`,
            description: `Master colorful colloquial idioms, fast native phrasing, and informal speech patterns.`,
            icon: '🎁',
            type: 'learning',
            branchType: 'side_quest',
            status: 'locked',
            mapCoordinates: { x: 20, y: 30 },
            connectedTo: [`${courseId}-node-2-2`],
            hskLevel: targetHskLevel,
            targetVocabulary: ['厉害', '麻烦您', '放心'],
            exercises: []
          },
          {
            id: `${courseId}-node-2-2`,
            chapterId: `${courseId}-ch-2`,
            title: `The Pivot: High-Stakes Logic Under Pressure`,
            description: `Construct compound sentences with connectives and causal logic under a ticking clock.`,
            icon: '💬',
            type: 'learning',
            branchType: 'main',
            status: 'locked',
            mapCoordinates: { x: 74, y: 48 },
            connectedTo: [`${courseId}-node-2-3`],
            hskLevel: targetHskLevel,
            targetVocabulary: ['因为', '所以', '虽然', '但是'],
            exercises: []
          },
          {
            id: `${courseId}-node-2-3`,
            chapterId: `${courseId}-ch-2`,
            title: `Spaced Ambush: Flashpoint Memory Guard`,
            description: `Surprise checkpoint locking in critical intermediate vocabulary during the heart of the crisis.`,
            icon: '🎯',
            type: 'review_ambush',
            branchType: 'ambush',
            status: 'locked',
            mapCoordinates: { x: 42, y: 70 },
            connectedTo: [`${courseId}-node-2-4`],
            hskLevel: targetHskLevel,
            targetVocabulary: ['特别', '比较', '因为', '但是'],
            exercises: []
          },
          {
            id: `${courseId}-node-2-4`,
            chapterId: `${courseId}-ch-2`,
            title: `Act 2 Boss: The Pressure Cooker Showdown`,
            description: `Survive an intense, fast-paced dialogue scenario where one verbal misstep means total exposure.`,
            icon: '⚔️',
            type: 'boss_capstone',
            branchType: 'boss',
            status: 'locked',
            mapCoordinates: { x: 50, y: 90 },
            hskLevel: targetHskLevel,
            targetVocabulary: ['解决', '成功', '高兴'],
            exercises: []
          }
        ]
      },
      {
        id: `${courseId}-ch-3`,
        title: 'Act 3: The Sovereign Trial',
        description: `The grand climax: command long-form narrative persuasion, conquer native discourse, and claim complete mastery in ${questName}.`,
        themeBiome: 'mountains' as BiomeType,
        isUnlocked: false,
        nodes: [
          {
            id: `${courseId}-node-3-1`,
            chapterId: `${courseId}-ch-3`,
            title: `The Masterstroke: Fluent ${questName} Narration`,
            description: `Command advanced spontaneous storytelling, persuasive arguments, and executive diplomacy.`,
            icon: '📜',
            type: 'learning',
            branchType: 'main',
            status: 'locked',
            mapCoordinates: { x: 50, y: 10 },
            connectedTo: [`${courseId}-node-3-2`, `${courseId}-node-3-b1`],
            hskLevel: targetHskLevel,
            targetVocabulary: ['体验', '经验', '未来', '希望'],
            exercises: []
          },
          {
            id: `${courseId}-node-3-b1`,
            chapterId: `${courseId}-ch-3`,
            title: `Side Quest: Classical Chengyu & Strategic Wit (+50 XP)`,
            description: `Deploy ancient 4-character idioms to stun native listeners with unexpected linguistic mastery.`,
            icon: '🌟',
            type: 'learning',
            branchType: 'side_quest',
            status: 'locked',
            mapCoordinates: { x: 20, y: 30 },
            connectedTo: [`${courseId}-node-3-2`],
            hskLevel: targetHskLevel,
            targetVocabulary: ['入乡随俗', '半途而废', '熟能生巧'],
            exercises: []
          },
          {
            id: `${courseId}-node-3-2`,
            chapterId: `${courseId}-ch-3`,
            title: `Sovereign Immersion: Cracking Authentic Signals`,
            description: `Read native documents and parse rapid-fire spoken Mandarin without subtitles or pauses.`,
            icon: '🎙️',
            type: 'learning',
            branchType: 'main',
            status: 'locked',
            mapCoordinates: { x: 74, y: 48 },
            connectedTo: [`${courseId}-node-3-3`],
            hskLevel: targetHskLevel,
            targetVocabulary: ['阅读', '文化', '不仅', '而且'],
            exercises: []
          },
          {
            id: `${courseId}-node-3-3`,
            chapterId: `${courseId}-ch-3`,
            title: `Spaced Ambush: Sovereign Recall Checkpoint`,
            description: `Comprehensive final review ensuring every phrase and tone is burned into reflexive memory.`,
            icon: '🛡️',
            type: 'review_ambush',
            branchType: 'ambush',
            status: 'locked',
            mapCoordinates: { x: 42, y: 70 },
            connectedTo: [`${courseId}-node-3-4`],
            hskLevel: targetHskLevel,
            targetVocabulary: ['体验', '熟能生巧', '成功'],
            exercises: []
          },
          {
            id: `${courseId}-node-3-4`,
            chapterId: `${courseId}-ch-3`,
            title: `Grand Climax Boss: Sovereign ${questName} Victory`,
            description: `The ultimate showdown: achieve flawless native conversational victory and complete your odyssey.`,
            icon: '🏆',
            type: 'boss_capstone',
            branchType: 'boss',
            status: 'locked',
            mapCoordinates: { x: 50, y: 90 },
            hskLevel: targetHskLevel,
            targetVocabulary: ['一家人', '幸福', '精彩', '祝贺'],
            exercises: []
          }
        ]
      }
    ];

    const rawCourse: Course = {
      id: courseId,
      title: creativeTitle,
      targetGoal: this.synthesizeGoalPremise(cleanGoal, cleanSubject),
      level: `HSK ${targetHskLevel}`,
      globalMasteryStats: {
        '你好': 100,
        '请问': 90
      },
      weaknesses: [...knownWeaknesses],
      totalXp: 0,
      currentRank: 'Initiate Apprentice (学童)',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      chapters
    };

    return this.normalizeCourseDAG(rawCourse);
  }
}
