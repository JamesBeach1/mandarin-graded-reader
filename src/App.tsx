/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import type { HanziItem } from './types/HanziItem';
import type { TooltipContent } from './types/ToolTip';
import Papa from 'papaparse';
import './App.css';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { HanziPracticeModal } from './HanziPracticeModal';
import { addCard, getDueCards, getAllCards, updateCard, type Flashcard } from './services/srsStore';
import { tokenizeStory } from './utils/tokenizer';
import { saveStory as dbSaveStory, deleteStory as dbDeleteStory, getSavedStories, type SavedStory } from './services/libraryStore';
import { saveOverride, deleteOverride, getOverridesMap } from './services/dictionaryStore';
import { generateLesson } from './services/gemini';
import type { Lesson } from './types/Lesson';

// Sleek Modern 5 Workspaces
import { ReadingWorkspace } from './components/ReadingWorkspace';
import { SpeakingWorkspace } from './components/SpeakingWorkspace';
import { ImportMediaWorkspace } from './components/ImportMediaWorkspace';
import { ReviewWorkspace } from './components/ReviewWorkspace';
import { LessonWorkspace } from './components/LessonWorkspace';

// Aux Modals & Services
import { DiagnosticTestModal } from './components/DiagnosticTestModal';
import { OfflineStatusIndicator } from './components/OfflineStatusIndicator';
import { RadicalDecomposition } from './components/RadicalDecomposition';
import { applyTheme, getStoredTheme } from './services/themeEngine';
import { exportStateBundle, importStateBundle } from './services/stateHydration';
import { ReadingAnalytics, type ReadingSpeedRecord } from './services/readingAnalytics';
import { AzureSpeechService, type TtsEngine, type NeuralVoice, type VoiceOption } from './services/azureSpeech';
import { getTraditionalVariant } from './utils/scriptConverter';
import { checkHomophone } from './utils/homophoneDetector';
import { getConfusableCluster } from './utils/confusableHanzi';
import { ConfusableHanziModal } from './components/ConfusableHanziModal';
import { pinyinToZhuyin } from './utils/zhuyinConverter';
import { getEtymology } from './utils/etymologyDatabase';
import { EtymologyModal } from './components/EtymologyModal';
import { getStoredAccent, saveStoredAccent, REGIONAL_ACCENT_PROFILES, type RegionalAccent } from './utils/accentProfiles';
import { StoryShareService, type MoyunStoryPackage } from './utils/storyShare';
import { 
  BookOpen, Mic, FolderArchive, Layers, GraduationCap, 
  Settings as SettingsIcon, Search, Award, Download, Upload, 
  Sparkles, Check, Volume2
} from 'lucide-react';

const HSK_GRAMMAR_CONSTRAINTS: Record<string, string> = {
  "1": "Strictly limit grammar to HSK 1 patterns. Use extremely simple sentence structures like '主语 + 动词 + 宾语' (e.g. 我去商店). Use basic particles like '的' or '吗'. Do NOT use any compound sentences, advanced conjunctions, or grammar structures from HSK 2 or above.",
  "2": "Strictly limit grammar to HSK 1 and 2 patterns. Use simple conjunctions like '虽然...但是...' or '因为...所以...' and comparison structures like '比'. Do NOT use advanced grammar like '把' sentences, passive '被' sentences, or HSK 3+ structures.",
  "3": "Strictly limit grammar to HSK 1-3 patterns. You can use grammar like '把' sentences, simple passive '被' sentences, result complements, and structures like '除了...以外'. Do NOT use advanced structures like '才' vs '就' in complex clauses, conditional '无论', or HSK 4+ structures.",
  "4": "Limit grammar to HSK 1-4 patterns. You may use passive clauses, complex complements, double negatives, and conjunctions like '只要...就...' or '不管...都...'. Keep vocabulary and grammar natural but within standard upper-intermediate levels.",
  "5": "Limit grammar to HSK 1-5 patterns. You may use abstract grammatical structures, formal written conventions, and idiomatic expressions (成语) appropriate for HSK 5. Do not use extremely complex literary structures.",
  "6": "Use full vocabulary and grammar proficiency of HSK 6. You can use advanced syntax, idioms, abstract concepts, literary styles, and complex sentence chains."
};

export type WorkspaceType = 'reading' | 'speaking' | 'import' | 'review' | 'lessons';

function App() {
  // Navigation: 5 Modular Workspaces (Sleek v7.0.0 Naming)
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>('reading');

  // Theme: Editorial Dark (Default)
  const [currentThemeId, setCurrentThemeId] = useState<string>(() => {
    return getStoredTheme().themeId || 'dark';
  });

  // Settings & Credentials
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [azureKey, setAzureKey] = useState(() => localStorage.getItem('azure_speech_key') || '');
  const [azureRegion, setAzureRegion] = useState(() => localStorage.getItem('azure_speech_region') || 'eastus');
  const [showSettings, setShowSettings] = useState(false);

  // High Fidelity Voice Settings
  const [selectedTtsEngine, setSelectedTtsEngine] = useState<TtsEngine>(() => 
    (localStorage.getItem('selected_tts_engine') as TtsEngine) || 
    (localStorage.getItem('azure_speech_key') ? 'azure-neural' : 'cloud-natural')
  );
  const [selectedAzureVoice, setSelectedAzureVoice] = useState<NeuralVoice>(() => 
    (localStorage.getItem('selected_azure_voice') as NeuralVoice) || 'zh-CN-XiaoxiaoNeural'
  );
  const [selectedSystemVoice, setSelectedSystemVoice] = useState<string>(() => 
    localStorage.getItem('selected_system_voice') || ''
  );
  const [appSystemVoices, setAppSystemVoices] = useState<VoiceOption[]>([]);
  const [appRegionalAccent, setAppRegionalAccent] = useState<RegionalAccent>(() => getStoredAccent());
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  useEffect(() => {
    const updateVoices = () => {
      const v = AzureSpeechService.getAvailableSystemVoices();
      setAppSystemVoices(v);
      if (!selectedSystemVoice && v.length > 0) {
        setSelectedSystemVoice(v[0].name);
      }
    };
    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const handleTestVoice = () => {
    if (isTestingVoice) return;
    setIsTestingVoice(true);
    AzureSpeechService.speak(
      '你好，欢迎使用墨韵华文阅读器。这是一段高保真自然中文语音测试。',
      {
        engine: selectedTtsEngine,
        voice: selectedAzureVoice,
        systemVoiceName: selectedSystemVoice,
        azureKey: azureKey,
        azureRegion: azureRegion
      },
      () => setIsTestingVoice(false),
      () => setIsTestingVoice(false)
    );
  };

  // Diagnostic Test Modal
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);

  // Database States
  const [hanziData, setHanziData] = useState<HanziItem[]>([]);
  const [vocabData, setVocabData] = useState<HanziItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Story & Reader States
  const [storyIdea, setStoryIdea] = useState('');
  const [hskLevel, setHskLevel] = useState('1');
  const [loading, setLoading] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<HanziItem[]>([]);
  const [storyTitle, setStoryTitle] = useState('墨韵 Moyun — Graded Reader');

  // Writing Practice & Modal States
  const [selectedPracticeItem, setSelectedPracticeItem] = useState<HanziItem | null>(null);
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);

  // Dictionary Overrides Map
  const [overridesMap, setOverridesMap] = useState<Record<string, { pinyin: string; definition: string }>>({});
  const [editingChar, setEditingChar] = useState('');
  const [overridePinyin, setOverridePinyin] = useState('');
  const [overrideDefinition, setOverrideDefinition] = useState('');
  const [isEditingOverride, setIsEditingOverride] = useState(false);

  // Dictionary Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HanziItem[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Character Inspection Tooltip
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    content: TooltipContent | null;
    character: string;
    item?: HanziItem;
    contextSentence?: string;
    x: number;
    y: number;
  }>({
    visible: false,
    content: null,
    character: '',
    x: 0,
    y: 0
  });
  const hideTimeoutRef = useRef<number | null>(null);

  // SRS-005: Look-Alike Hanzi Modal State
  const [confusableModalOpen, setConfusableModalOpen] = useState(false);
  const [selectedConfusableChar, setSelectedConfusableChar] = useState<string | undefined>(undefined);

  // SRS-006: Etymology and Radical Mnemonics Modal State
  const [isEtymologyModalOpen, setIsEtymologyModalOpen] = useState(false);
  const [selectedEtymologyChar, setSelectedEtymologyChar] = useState<string | undefined>(undefined);

  // SRS States
  const [activeDeckId, setActiveDeckId] = useState<string>('all');
  const [dueCardsCount, setDueCardsCount] = useState(0);
  const [totalCardsCount, setTotalCardsCount] = useState(0);
  const [currentReviewCard, setCurrentReviewCard] = useState<Flashcard | null>(null);

  // Adventure continuation State
  const [continuing, setContinuing] = useState(false);

  // Saved Library stories State
  const [savedStories, setSavedStories] = useState<SavedStory[]>([]);
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');

  // Heatmap Stats State
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>(() => {
    try {
      const data = localStorage.getItem('characters_read_heatmap');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  });

  // Reading velocity records
  const [readingStats, setReadingStats] = useState<ReadingSpeedRecord[]>(() =>
    ReadingAnalytics.getHistory()
  );

  // Interactive Lesson States
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [lessonTopic, setLessonTopic] = useState('');
  const [lessonHskLevel, setLessonHskLevel] = useState('1');
  const [loadingLesson, setLoadingLesson] = useState(false);

  // Initialize theme
  useEffect(() => {
    applyTheme(currentThemeId);
  }, [currentThemeId]);

  // Load Hanzi, Vocab, and Overrides on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [hRes, vRes] = await Promise.all([
          fetch('/hanziDB.csv'),
          fetch('/vocabDB.csv')
        ]);

        const hText = await hRes.text();
        const vText = await vRes.text();

        Papa.parse<HanziItem>(hText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setHanziData(results.data);
          }
        });

        Papa.parse<HanziItem>(vText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setVocabData(results.data);
          }
        });

        const overrides = await getOverridesMap();
        setOverridesMap(overrides);

        loadSRSStats('all');
        loadLibrary();
      } catch (err) {
        console.error('Failed to load CSV dictionary databases:', err);
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, []);

  // Initial welcome story setup
  useEffect(() => {
    if (!isLoadingData && hanziData.length > 0 && generatedStory.length === 0) {
      const sample = '你好！欢迎来到新一代多模态中文学习平台。在这里，你可以体验竖排与横排沉浸阅读、实时声调追踪、句子跟读演练与智能间隔复习。点击任何汉字即可查看拼音、释义与部首分解。';
      const tokens = tokenizeStory(sample, hanziData, vocabData, overridesMap);
      setGeneratedStory(tokens);
      setStoryTitle('墨韵 Moyun — Graded Reader');
    }
  }, [isLoadingData, hanziData, vocabData, overridesMap]);

  // SRS Helpers
  const loadSRSStats = async (deckId: string = activeDeckId) => {
    try {
      const due = await getDueCards(deckId);
      const all = await getAllCards(deckId);
      setDueCardsCount(due.length);
      setTotalCardsCount(all.length);
      if (due.length > 0) {
        setCurrentReviewCard(due[0]);
      } else {
        setCurrentReviewCard(null);
      }
    } catch (err) {
      console.error('Failed to load SRS cards:', err);
    }
  };

  const handleSelectDeck = (deckId: string) => {
    setActiveDeckId(deckId);
    loadSRSStats(deckId);
  };

  const loadLibrary = async () => {
    try {
      const stories = await getSavedStories();
      setSavedStories(stories);
    } catch (err) {
      console.error('Failed to load saved stories:', err);
    }
  };

  // GTU-005: Peer-to-Peer Story Package Import Handler
  const handleImportStoryPackage = async (pkg: MoyunStoryPackage) => {
    try {
      await dbSaveStory({
        id: pkg.story.id,
        title: pkg.story.title,
        text: pkg.story.text,
        hskLevel: pkg.story.hskLevel
      });
      await loadLibrary();
      const tokens = pkg.story.tokens && pkg.story.tokens.length > 0
        ? pkg.story.tokens
        : tokenizeStory(pkg.story.text, hanziData, vocabData, overridesMap);
      setGeneratedStory(tokens);
      setStoryTitle(pkg.story.title);
      setHskLevel(pkg.story.hskLevel);
      setActiveWorkspace('reading');
      recordCharactersRead(pkg.story.text.length);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error('Failed to import story:', e);
    }
  };

  const recordCharactersRead = (count: number) => {
    const todayKey = new Date().toISOString().split('T')[0];
    setHeatmapData(prev => {
      const updated = {
        ...prev,
        [todayKey]: (prev[todayKey] || 0) + count
      };
      localStorage.setItem('characters_read_heatmap', JSON.stringify(updated));
      return updated;
    });
    setReadingStats(ReadingAnalytics.getHistory());
  };

  // Search Logic with Pinyin Diacritics Normalization & Tiered Ranking
  const stripDiacritics = (str: string) =>
    (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const cleanQuery = query.toLowerCase().trim();
    const tonelessQuery = stripDiacritics(cleanQuery);

    interface ScoredItem {
      item: HanziItem;
      score: number;
    }

    const scored: ScoredItem[] = [];

    const evaluateItem = (item: HanziItem) => {
      const char = item.character || '';
      const pinyin = (overridesMap[char]?.pinyin || item.pinyin || '').toLowerCase();
      const tonelessPinyin = stripDiacritics(pinyin);
      const def = (overridesMap[char]?.definition || item.definition || '').toLowerCase();

      // 1. Exact Hanzi match
      if (char === cleanQuery) {
        scored.push({ item, score: 1 });
        return;
      }
      // 2. Exact toneless Pinyin match (e.g. "gou" matches "gǒu")
      if (tonelessPinyin === tonelessQuery) {
        scored.push({ item, score: 2 });
        return;
      }
      // 3. Hanzi starts with query
      if (char.startsWith(cleanQuery)) {
        scored.push({ item, score: 3 });
        return;
      }
      // 4. Toneless Pinyin starts with query (e.g. "ni" matches "nǐhǎo")
      if (tonelessPinyin.startsWith(tonelessQuery)) {
        scored.push({ item, score: 4 });
        return;
      }
      // 5. Hanzi contains query
      if (char.includes(cleanQuery)) {
        scored.push({ item, score: 5 });
        return;
      }
      // 6. Toneless Pinyin contains query
      if (tonelessPinyin.includes(tonelessQuery)) {
        scored.push({ item, score: 6 });
        return;
      }
      // 7. Definition exact word match
      const wordRegex = new RegExp(`\\b${cleanQuery}\\b`, 'i');
      if (wordRegex.test(def)) {
        scored.push({ item, score: 7 });
        return;
      }
      // 8. Definition contains query substring
      if (def.includes(cleanQuery)) {
        scored.push({ item, score: 8 });
        return;
      }
    };

    // Check vocab items first
    for (const item of vocabData) {
      evaluateItem(item);
    }
    // Check single hanzi
    for (const item of hanziData) {
      evaluateItem(item);
    }

    // Sort by score ascending, deduplicate by character
    const seenChars = new Set<string>();
    const sortedMatches: HanziItem[] = [];

    scored.sort((a, b) => a.score - b.score);

    for (const s of scored) {
      if (!seenChars.has(s.item.character)) {
        seenChars.add(s.item.character);
        sortedMatches.push(s.item);
        if (sortedMatches.length >= 25) break;
      }
    }

    setSearchResults(sortedMatches);
    setShowSearchResults(true);
  };

  // Dictionary Override Handlers
  const handleSaveOverride = async () => {
    if (!editingChar || !overridePinyin.trim() || !overrideDefinition.trim()) return;
    try {
      await saveOverride({
        character: editingChar,
        pinyin: overridePinyin.trim(),
        definition: overrideDefinition.trim()
      });
      setIsEditingOverride(false);
      const map = await getOverridesMap();
      setOverridesMap(map);
      if (generatedStory.length > 0) {
        const rawText = generatedStory.map(t => t.character).join('');
        setGeneratedStory(tokenizeStory(rawText, hanziData, vocabData, map));
      }
      alert(`Custom definition saved for "${editingChar}"!`);
    } catch (err) {
      console.error(err);
      alert('Failed to save dictionary override.');
    }
  };

  const handleDeleteOverride = async () => {
    if (!editingChar) return;
    if (!confirm(`Reset "${editingChar}" to standard dictionary definitions?`)) return;
    try {
      await deleteOverride(editingChar);
      setIsEditingOverride(false);
      const map = await getOverridesMap();
      setOverridesMap(map);
      if (generatedStory.length > 0) {
        const rawText = generatedStory.map(t => t.character).join('');
        setGeneratedStory(tokenizeStory(rawText, hanziData, vocabData, map));
      }
      alert(`Reset "${editingChar}" to standard definitions!`);
    } catch (err) {
      console.error(err);
      alert('Failed to reset override.');
    }
  };

  // Story Actions
  const handleGenerateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyIdea.trim() || !hskLevel || !apiKey) {
      alert('Please provide a story theme/prompt and configure your Gemini API Key in Settings.');
      return;
    }

    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const grammarConstraint = HSK_GRAMMAR_CONSTRAINTS[hskLevel] || "";
      const prompt = `Write a high-quality Chinese graded story strictly at HSK ${hskLevel} level based on: "${storyIdea}".
Provide a concise Chinese title on the first line. Do NOT output Pinyin or English in the text.
Grammar constraint: ${grammarConstraint}`;

      const request = await model.generateContent(prompt);
      const text = request.response.text();

      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      let title = `Graded Story - HSK ${hskLevel}`;
      let content = text;
      if (lines.length > 1) {
        title = lines[0].replace(/[#*]/g, '');
        content = lines.slice(1).join('\n');
      }
      setStoryTitle(title);

      const tokens = tokenizeStory(content, hanziData, vocabData, overridesMap);
      setGeneratedStory(tokens);
      recordCharactersRead(content.length);
    } catch (err) {
      console.error('Error generating story:', err);
      alert('Failed to generate story. Check API key or quota.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueStory = async (promptDirection: string) => {
    if (!promptDirection.trim() || !apiKey) return;

    setContinuing(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const currentText = generatedStory.map(t => t.character).join('');
      const prompt = `Here is the current Chinese story:
"${currentText}"

Continue the story based on this branch: "${promptDirection}".
Write strictly in simplified Mandarin at HSK ${hskLevel || '3'} level without Pinyin or English.`;

      const request = await model.generateContent(prompt);
      const nextParagraph = request.response.text();

      const newTokens = tokenizeStory("\n" + nextParagraph, hanziData, vocabData, overridesMap);
      setGeneratedStory(prev => [...prev, ...newTokens]);
      recordCharactersRead(nextParagraph.length);
    } catch (err) {
      console.error(err);
      alert('Failed to generate continuation. Please check API settings.');
    } finally {
      setContinuing(false);
    }
  };

  const handleScaleDifficulty = async (direction: 'simplify' | 'harder') => {
    if (!apiKey || !hskLevel) return;

    let targetLevel = parseInt(hskLevel, 10);
    if (direction === 'simplify') {
      targetLevel = Math.max(1, targetLevel - 1);
    } else {
      targetLevel = Math.min(6, targetLevel + 1);
    }

    if (String(targetLevel) === hskLevel) return;

    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const storyText = generatedStory.map(t => t.character).join('');
      const prompt = `Rewrite this story to strictly adhere to HSK ${targetLevel} vocabulary and grammar:
"${storyText}"`;

      const request = await model.generateContent(prompt);
      const responseText = request.response.text();

      const tokens = tokenizeStory(responseText, hanziData, vocabData, overridesMap);
      setGeneratedStory(tokens);
      setHskLevel(String(targetLevel));
    } catch (err) {
      console.error('Error scaling difficulty:', err);
      alert('Failed to scale story difficulty.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStory = async () => {
    const rawText = generatedStory.map(t => t.character).join('');
    if (!rawText) return;
    try {
      const defaultTitle = storyTitle || `Graded Story - HSK ${hskLevel}`;
      const titleInput = prompt("Enter a title for this story in your library:", defaultTitle);
      if (titleInput === null) return;

      const title = titleInput.trim() || defaultTitle;
      setStoryTitle(title);
      await dbSaveStory({
        title,
        text: rawText,
        hskLevel: hskLevel || '1'
      });
      alert('Story saved to your local offline library!');
      loadLibrary();
    } catch (err) {
      console.error(err);
      alert('Failed to save story.');
    }
  };

  // Add character to flashcards (SRS-001)
  const handleAddToFlashcards = async (char: string, content: TooltipContent, sentenceContext?: string) => {
    try {
      await addCard({
        character: char,
        pinyin: content.pinyin || '',
        definition: content.definition || '',
        hsk_level: content.hskLevel,
        exampleSentence: sentenceContext
      });
      alert(`Added "${char}" to your review deck!${sentenceContext ? ' (with context sentence)' : ''}`);
      loadSRSStats();
      setTooltip(prev => ({ ...prev, visible: false }));
    } catch (err) {
      console.error(err);
      alert('Failed to add flashcard.');
    }
  };

  // Grade SRS Flashcard
  const handleGradeCard = async (quality: number) => {
    if (!currentReviewCard) return;

    let { interval, easeFactor } = currentReviewCard;
    if (quality < 2) {
      interval = 1;
    } else {
      if (interval === 0) interval = 1;
      else if (interval === 1) interval = 6;
      else interval = Math.round(interval * easeFactor);

      easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      if (easeFactor < 1.3) easeFactor = 1.3;
    }

    const nextDate = Date.now() + interval * 24 * 60 * 60 * 1000;

    await updateCard({
      ...currentReviewCard,
      interval,
      easeFactor,
      nextReviewDate: nextDate
    });

    loadSRSStats();
  };

  // Interactive Lesson Generation
  const handleGenerateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTopic.trim() || !lessonHskLevel || !apiKey) {
      alert('Please enter a lesson topic and configure your Gemini API Key in Settings.');
      return;
    }

    setLoadingLesson(true);
    try {
      const lesson = await generateLesson(lessonTopic.trim(), lessonHskLevel, apiKey);
      setActiveLesson(lesson);
    } catch (err) {
      console.error('Error generating structured lesson:', err);
      alert('Failed to generate structured lesson. Check your topic and API key.');
    } finally {
      setLoadingLesson(false);
    }
  };

  // State Hydration File Import
  const handleImportStateFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await importStateBundle(file);
    alert(res.message);
    if (res.success) {
      loadSRSStats();
      loadLibrary();
      const map = await getOverridesMap();
      setOverridesMap(map);
    }
  };

  if (isLoadingData) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--text-main)', padding: '30px' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px', fontWeight: 'bold' }}>文</div>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Loading Dictionary & Lexical Data...</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            Preparing 10,000+ characters and compound vocabulary...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      
      {/* GLOBAL APPLICATION HEADER - CENTERED FLEXBOX */}
      <header className="app-header print-hide">
        
        {/* Brand */}
        <div className="app-brand">
          <div className="brand-badge">墨</div>
          <div>
            <h1 className="brand-title">墨韵 Moyun</h1>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
              Graded Chinese Reader & Spoken Studio
            </p>
          </div>
        </div>

        {/* Center: Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search Hanzi, Pinyin (e.g. gou) or English..."
              className="form-input"
              style={{ paddingLeft: '34px', height: '34px', fontSize: '13px', borderRadius: 'var(--radius-sm)' }}
            />
            {showSearchResults && searchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-float)',
                zIndex: 1000,
                maxHeight: '280px',
                overflowY: 'auto',
                marginTop: '6px'
              }}>
                {searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedPracticeItem(item);
                      setIsPracticeModalOpen(true);
                      setShowSearchResults(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'var(--font-serif-zh)' }}>
                        {item.character}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {overridesMap[item.character]?.pinyin || item.pinyin}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {overridesMap[item.character]?.definition || item.definition}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <OfflineStatusIndicator />

          <button
            onClick={() => setShowSettings(true)}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
            title="Open system and voice settings"
          >
            <SettingsIcon size={14} /> Settings
          </button>
        </div>

      </header>

      {/* 5-MODULAR WORKSPACE SWITCHER NAVIGATION - CENTERED FLEXBOX */}
      <nav className="workspace-nav print-hide">
        <button
          onClick={() => setActiveWorkspace('reading')}
          className={`workspace-nav-item ${activeWorkspace === 'reading' ? 'active' : ''}`}
        >
          <BookOpen size={15} /> Reading
        </button>

        <button
          onClick={() => setActiveWorkspace('speaking')}
          className={`workspace-nav-item ${activeWorkspace === 'speaking' ? 'active' : ''}`}
        >
          <Mic size={15} /> Speaking
        </button>

        <button
          onClick={() => setActiveWorkspace('import')}
          className={`workspace-nav-item ${activeWorkspace === 'import' ? 'active' : ''}`}
        >
          <FolderArchive size={15} /> Import
        </button>

        <button
          onClick={() => {
            setActiveWorkspace('review');
            loadSRSStats();
          }}
          className={`workspace-nav-item ${activeWorkspace === 'review' ? 'active' : ''}`}
        >
          <Layers size={15} /> Review
          {dueCardsCount > 0 && (
            <span style={{
              backgroundColor: 'var(--accent-seal)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              padding: '1px 6px',
              fontWeight: 600,
              marginLeft: '4px'
            }}>
              {dueCardsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveWorkspace('lessons')}
          className={`workspace-nav-item ${activeWorkspace === 'lessons' ? 'active' : ''}`}
        >
          <GraduationCap size={15} /> Lessons
        </button>
      </nav>

      {/* WORKSPACE MAIN BODY CONTAINER */}
      <main style={{ width: '100%' }}>
        
        {/* WORKSPACE 1: READING */}
        {activeWorkspace === 'reading' && (
          <ReadingWorkspace
            storyIdea={storyIdea}
            setStoryIdea={setStoryIdea}
            hskLevel={hskLevel}
            setHskLevel={setHskLevel}
            loading={loading}
            apiKey={apiKey}
            onGenerateStory={handleGenerateStory}
            storyTitle={storyTitle}
            generatedStory={generatedStory}
            onScaleDifficulty={handleScaleDifficulty}
            onContinueStory={handleContinueStory}
            onSaveStory={handleSaveStory}
            onCharClick={(item, e, sentenceText) => {
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              setTooltip({
                visible: true,
                character: item.character,
                item,
                contextSentence: sentenceText,
                content: {
                  pinyin: overridesMap[item.character]?.pinyin || item.pinyin,
                  definition: overridesMap[item.character]?.definition || item.definition,
                  hskLevel: item.hsk_level,
                  frequency: item.frequency_rank,
                  radical: item.radical,
                  strokes: item.stroke_count,
                  isChengyu: item.isChengyu,
                  chengyuLiteral: item.chengyuLiteral,
                  chengyuAllusion: item.chengyuAllusion
                },
                x: rect.left + window.scrollX + rect.width / 2,
                y: rect.top + window.scrollY - 10
              });
            }}
            isContinuing={continuing}
            savedStories={savedStories}
            onSelectSavedStory={(story) => {
              const tokens = tokenizeStory(story.text, hanziData, vocabData, overridesMap);
              setGeneratedStory(tokens);
              setStoryTitle(story.title);
              setHskLevel(story.hskLevel);
              recordCharactersRead(story.text.length);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onDeleteSavedStory={async (id) => {
              if (confirm('Delete this story?')) {
                await dbDeleteStory(id);
                loadLibrary();
              }
            }}
            librarySearchQuery={librarySearchQuery}
            setLibrarySearchQuery={setLibrarySearchQuery}
            onImportStory={handleImportStoryPackage}
          />
        )}

        {/* WORKSPACE 2: SPEAKING PRACTICE */}
        {activeWorkspace === 'speaking' && (
          <SpeakingWorkspace />
        )}

        {/* WORKSPACE 3: IMPORT MEDIA */}
        {activeWorkspace === 'import' && (
          <ImportMediaWorkspace
            hanziData={hanziData}
            vocabData={vocabData}
            overridesMap={overridesMap}
            onLoadIntoReader={(title, tokens, rawText) => {
              setStoryTitle(title);
              setGeneratedStory(tokens);
              setActiveWorkspace('reading');
              recordCharactersRead(rawText.length);
            }}
          />
        )}

        {/* WORKSPACE 4: REVIEW */}
        {activeWorkspace === 'review' && (
          <ReviewWorkspace
            currentReviewCard={currentReviewCard}
            dueCardsCount={dueCardsCount}
            totalCardsCount={totalCardsCount}
            onGradeCard={handleGradeCard}
            onOpenWritingPractice={(card) => {
              setSelectedPracticeItem({
                character: card.character,
                pinyin: card.pinyin,
                definition: card.definition,
                frequency_rank: '',
                radical: '',
                radical_code: '',
                stroke_count: '',
                hsk_level: card.hsk_level || '',
                general_standard_num: ''
              });
              setIsPracticeModalOpen(true);
            }}
            heatmapData={heatmapData}
            readingStats={readingStats}
            activeDeckId={activeDeckId}
            onSelectDeck={handleSelectDeck}
          />
        )}

        {/* WORKSPACE 5: LESSONS */}
        {activeWorkspace === 'lessons' && (
          <LessonWorkspace
            activeLesson={activeLesson}
            setActiveLesson={setActiveLesson}
            lessonTopic={lessonTopic}
            setLessonTopic={setLessonTopic}
            lessonHskLevel={lessonHskLevel}
            setLessonHskLevel={setLessonHskLevel}
            loadingLesson={loadingLesson}
            onGenerateLesson={handleGenerateLesson}
            apiKey={apiKey}
            onOpenDiagnosticTest={() => setIsDiagnosticOpen(true)}
          />
        )}

      </main>

      {/* CHARACTER INSPECTION & RADICAL TOOLTIP POPUP */}
      {tooltip.visible && tooltip.content && tooltip.item && (
        <div
          style={{
            position: 'absolute',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 1000
          }}
          onMouseEnter={() => {
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
          }}
          onMouseLeave={() => {
            hideTimeoutRef.current = window.setTimeout(() => {
              setTooltip(prev => ({ ...prev, visible: false }));
            }, 300);
          }}
        >
          <div className="tooltip-popup">
            <div className="tooltip-header">
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span className="tooltip-char">{tooltip.character}</span>
                {getTraditionalVariant(tooltip.character) && (
                  <span 
                    style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-zh)' }} 
                    title={`Traditional Chinese variant (TRC-001): ${getTraditionalVariant(tooltip.character)}`}
                  >
                    [{getTraditionalVariant(tooltip.character)}]
                  </span>
                )}
                <span className="tooltip-pinyin">{tooltip.content.pinyin}</span>
                {tooltip.content.pinyin && (
                  <span
                    style={{ fontSize: '11px', color: 'var(--accent-gold)', fontFamily: 'var(--font-zh)' }}
                    title="Zhuyin Bopomofo (注音符号) phonetic transcription"
                  >
                    [{pinyinToZhuyin(tooltip.content.pinyin)}]
                  </span>
                )}
                {tooltip.content.hskLevel && (
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    HSK {tooltip.content.hskLevel}
                  </span>
                )}
                {tooltip.content.isChengyu && (
                  <span style={{
                    fontSize: '10px',
                    backgroundColor: 'rgba(217, 119, 6, 0.15)',
                    color: 'var(--accent-gold)',
                    border: '1px solid var(--accent-gold)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    letterSpacing: '0.05em'
                  }}>
                    📜 成语 Chengyu
                  </span>
                )}
              </div>
              <button
                onClick={() => setTooltip(prev => ({ ...prev, visible: false }))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '12px' }}
              >
                ✕
              </button>
            </div>

            <div className="tooltip-divider" />

            <div className="tooltip-definition">
              {tooltip.content.definition}
            </div>

            {/* TRC-005: Chengyu (Chinese Idiom) Deep-Dive Card */}
            {tooltip.content.isChengyu && (
              <div style={{
                marginTop: '8px',
                padding: '10px 12px',
                backgroundColor: 'rgba(217, 119, 6, 0.08)',
                border: '1px solid rgba(217, 119, 6, 0.25)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px'
              }}>
                {tooltip.content.chengyuLiteral && (
                  <div style={{ marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>Literal Translation: </span>
                    <span style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>"{tooltip.content.chengyuLiteral}"</span>
                  </div>
                )}
                {tooltip.content.chengyuAllusion && (
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>Historical Allusion (典故): </span>
                    <span style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>{tooltip.content.chengyuAllusion}</span>
                  </div>
                )}
              </div>
            )}

            {/* SRS-009: Homophone Warning Alert */}
            {(() => {
              const homophoneInfo = checkHomophone(tooltip.character, tooltip.content.pinyin);
              if (!homophoneInfo) return null;
              return (
                <div className="homophone-warning-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                    <span className="homophone-badge-pill">⚠️ Homophone Alert</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{homophoneInfo.pinyin}</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '11px' }}>
                    {homophoneInfo.warning}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {homophoneInfo.confusables.map((c, ci) => (
                      <span key={ci} style={{
                        fontSize: '10px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        padding: '2px 5px',
                        borderRadius: '3px',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        <strong>{c.char}</strong>: <em>{c.example}</em>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Radical breakdown */}
            <div style={{ marginBottom: '8px', marginTop: '8px' }}>
              <RadicalDecomposition item={tooltip.item} />
            </div>

            {/* SRS-006: Character Etymology & Narrative Mnemonic */}
            {(() => {
              const etymology = getEtymology(tooltip.character);
              if (!etymology) return null;
              return (
                <div style={{
                  marginBottom: '8px',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(212, 160, 23, 0.08)',
                  border: '1px solid rgba(212, 160, 23, 0.25)',
                  fontSize: '11px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
                      🧭 {etymology.categoryLabel}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedEtymologyChar(tooltip.character);
                        setIsEtymologyModalOpen(true);
                        setTooltip(prev => ({ ...prev, visible: false }));
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-gold)',
                        fontSize: '10px',
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                    >
                      Explore →
                    </button>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.4' }}>
                    "{etymology.mnemonic}"
                  </div>
                </div>
              );
            })()}

            {/* SRS-005: Look-Alike / Visually Confusable Warning */}
            {(() => {
              const lookalikeCluster = getConfusableCluster(tooltip.character);
              if (!lookalikeCluster) return null;
              const others = lookalikeCluster.characters.filter(c => c.character !== tooltip.character).map(c => c.character).join(', ');
              return (
                <div className="lookalike-warning-box">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      👁️ Look-Alike Hanzi
                    </span>
                    <button
                      onClick={() => {
                        setSelectedConfusableChar(tooltip.character);
                        setConfusableModalOpen(true);
                        setTooltip(prev => ({ ...prev, visible: false }));
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-bamboo)',
                        cursor: 'pointer',
                        fontSize: '10px',
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                    >
                      Practice Quiz →
                    </button>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                    Confusable with: <strong>{others}</strong>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: '2px', fontStyle: 'italic' }}>
                    {lookalikeCluster.pedagogicalTip}
                  </div>
                </div>
              );
            })()}

            {/* Flat Text Link Actions (Section 5.3) */}
            <div className="tooltip-actions">
              <button
                onClick={() => {
                  setSelectedPracticeItem(tooltip.item || null);
                  setIsPracticeModalOpen(true);
                  setTooltip(prev => ({ ...prev, visible: false }));
                }}
                className="tooltip-action-link"
              >
                ✍️ Practice
              </button>
              <button
                onClick={() => handleAddToFlashcards(tooltip.character, tooltip.content!, tooltip.contextSentence)}
                className="tooltip-action-link"
                style={{ color: 'var(--accent-seal)' }}
              >
                ➕ Add to SRS
              </button>
              <button
                onClick={() => {
                  setEditingChar(tooltip.character);
                  setOverridePinyin(tooltip.content?.pinyin || '');
                  setOverrideDefinition(tooltip.content?.definition || '');
                  setIsEditingOverride(true);
                  setTooltip(prev => ({ ...prev, visible: false }));
                }}
                className="tooltip-action-link"
              >
                ✏️ Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HANZI PRACTICE WRITING MODAL */}
      {selectedPracticeItem && (
        <HanziPracticeModal
          character={selectedPracticeItem.character}
          isOpen={isPracticeModalOpen}
          onClose={() => {
            setIsPracticeModalOpen(false);
            setSelectedPracticeItem(null);
          }}
          characterData={{
            pinyin: overridesMap[selectedPracticeItem.character]?.pinyin || selectedPracticeItem.pinyin,
            definition: overridesMap[selectedPracticeItem.character]?.definition || selectedPracticeItem.definition,
            hsk_level: selectedPracticeItem.hsk_level ? `HSK ${selectedPracticeItem.hsk_level}` : undefined
          }}
        />
      )}

      {/* 50-QUESTION DYNAMIC PLACEMENT TEST MODAL */}
      <DiagnosticTestModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        onApplyLevel={(lvl) => {
          setHskLevel(String(lvl));
          alert(`Placement level calibrated! Your target curriculum is now set to HSK ${lvl}.`);
        }}
      />

      {/* DICTIONARY OVERRIDE MODAL */}
      {isEditingOverride && (
        <div className="settings-overlay" onClick={() => setIsEditingOverride(false)}>
          <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>Custom Definition</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'var(--font-zh)' }}>{editingChar}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Define custom pronunciation and definition for this character.</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Pinyin</label>
                <input
                  type="text"
                  value={overridePinyin}
                  onChange={(e) => setOverridePinyin(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>English Definition</label>
                <textarea
                  value={overrideDefinition}
                  onChange={(e) => setOverrideDefinition(e.target.value)}
                  className="form-input"
                  style={{ minHeight: '70px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={handleSaveOverride} className="generate-button" style={{ flex: 2 }}>
                  Save Definition
                </button>
                {overridesMap[editingChar] && (
                  <button onClick={handleDeleteOverride} className="control-button" style={{ flex: 1, color: 'var(--accent-cinnabar)' }}>
                    Reset Standard
                  </button>
                )}
                <button onClick={() => setIsEditingOverride(false)} className="control-button" style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL SETTINGS & HYDRATION MODAL */}
      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Settings</h3>
              <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Gemini API Key */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    localStorage.setItem('gemini_api_key', e.target.value);
                  }}
                  placeholder="Enter Gemini API key"
                  className="form-input"
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Used for generating graded stories, lessons, and voice roleplay.
                </span>
              </div>

              {/* Voice & Speech Fidelity Settings */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    Voice Synthesis Engine
                  </label>
                  <button
                    type="button"
                    onClick={handleTestVoice}
                    disabled={isTestingVoice}
                    className="btn btn-secondary"
                    style={{ fontSize: '11px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <Volume2 size={13} /> {isTestingVoice ? 'Speaking...' : 'Test Voice'}
                  </button>
                </div>

                <select
                  value={selectedTtsEngine}
                  onChange={(e) => {
                    const eng = e.target.value as TtsEngine;
                    setSelectedTtsEngine(eng);
                    localStorage.setItem('selected_tts_engine', eng);
                  }}
                  className="form-select"
                  style={{ width: '100%', marginBottom: '10px' }}
                >
                  <option value="cloud-natural">🌟 Cloud Natural (Fluent & Expressive - Zero Setup)</option>
                  <option value="azure-neural">💎 Microsoft Azure Neural (Xiaoxiao / Yunxi - Studio Grade)</option>
                  <option value="system">💻 System / Browser Web Speech (Local OS Voices)</option>
                </select>

                <div style={{ marginBottom: '12px', padding: '10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                    Regional Dialect & Accent (ALS-004)
                  </label>
                  <select
                    value={appRegionalAccent}
                    onChange={(e) => {
                      const acc = e.target.value as RegionalAccent;
                      setAppRegionalAccent(acc);
                      saveStoredAccent(acc);
                    }}
                    className="form-select"
                    style={{ width: '100%', marginBottom: '6px' }}
                  >
                    <option value="standard">🏛️ Standard Northern Mandarin (标准普通话)</option>
                    <option value="beijing_erhua">🏮 Beijing Dialect (北京儿化音 - Erhua R-coloring)</option>
                    <option value="taiwan">🍵 Taiwanese Mandarin (台湾国语 / 台湾华语)</option>
                  </select>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {REGIONAL_ACCENT_PROFILES[appRegionalAccent]?.description}
                  </p>
                </div>

                {selectedTtsEngine === 'cloud-natural' && (
                  <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                    High-fidelity neural Mandarin audio streamed with natural human cadence. Works out-of-the-box with no configuration.
                  </p>
                )}

                {selectedTtsEngine === 'azure-neural' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Azure Neural Voice Model
                      </label>
                      <select
                        value={selectedAzureVoice}
                        onChange={(e) => {
                          const v = e.target.value as NeuralVoice;
                          setSelectedAzureVoice(v);
                          localStorage.setItem('selected_azure_voice', v);
                        }}
                        className="form-select"
                        style={{ width: '100%' }}
                      >
                        <option value="zh-CN-XiaoxiaoNeural">Xiaoxiao (Female - Warm, Expressive, Standard)</option>
                        <option value="zh-CN-YunxiNeural">Yunxi (Male - Lively, Fluent, Conversational)</option>
                        <option value="zh-CN-YunjianNeural">Yunjian (Male - Narrative, Calm, Documentary)</option>
                        <option value="zh-CN-XiaoyiNeural">Xiaoyi (Female - Gentle, Storyteller)</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                          Azure Speech Key (500k chars/mo free)
                        </label>
                        <input
                          type="password"
                          value={azureKey}
                          onChange={(e) => {
                            setAzureKey(e.target.value);
                            localStorage.setItem('azure_speech_key', e.target.value);
                          }}
                          placeholder="Enter Azure Key"
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                          Region
                        </label>
                        <input
                          type="text"
                          value={azureRegion}
                          onChange={(e) => {
                            setAzureRegion(e.target.value);
                            localStorage.setItem('azure_speech_region', e.target.value);
                          }}
                          placeholder="eastus"
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedTtsEngine === 'system' && (
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Detected Chinese System Voices ({appSystemVoices.length})
                    </label>
                    {appSystemVoices.length === 0 ? (
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--accent-seal)' }}>
                        No Chinese voice packages detected on your system. Please switch to "Cloud Natural" above or install Windows Chinese voices.
                      </p>
                    ) : (
                      <select
                        value={selectedSystemVoice}
                        onChange={(e) => {
                          setSelectedSystemVoice(e.target.value);
                          localStorage.setItem('selected_system_voice', e.target.value);
                        }}
                        className="form-select"
                        style={{ width: '100%' }}
                      >
                        {appSystemVoices.map(v => (
                          <option key={v.id} value={v.name}>
                            {v.isNatural ? '✨ [Natural/Online] ' : '[Offline] '}
                            {v.name}
                          </option>
                        ))}
                      </select>
                    )}
                    <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                      💡 Tip: Opening in Microsoft Edge or installing "Natural Voices" in Windows Settings provides Microsoft Xiaoxiao & Yunxi for free offline!
                    </p>
                  </div>
                )}
              </div>

              {/* Theme Selector */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                  Theme Preference
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['dark', 'light'].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setCurrentThemeId(t);
                        applyTheme(t);
                      }}
                      className="control-button"
                      style={{
                        flex: 1,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        fontSize: '12px',
                        backgroundColor: currentThemeId === t ? 'var(--text-primary)' : 'var(--bg-base)',
                        color: currentThemeId === t ? 'var(--bg-base)' : 'var(--text-primary)',
                        border: '1px solid var(--border-strong)'
                      }}
                    >
                      {t === 'dark' ? 'Editorial Dark' : 'Editorial Paper'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Placement Test */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>Curriculum Placement Test</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Calibrate your target HSK level via dynamic assessment.</div>
                  </div>
                  <button
                    onClick={() => {
                      setShowSettings(false);
                      setIsDiagnosticOpen(true);
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    <Award size={13} /> Take Test
                  </button>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                  Multi-Device State Backup & Restore
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => exportStateBundle()}
                    className="control-button"
                    style={{ flex: 1, fontSize: '12px' }}
                  >
                    <Download size={14} /> Export Backup (.json)
                  </button>
                  <label
                    className="control-button"
                    style={{ flex: 1, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '6px' }}
                  >
                    <Upload size={14} /> Restore Backup
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportStateFile}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  onClick={() => setShowSettings(false)}
                  className="generate-button"
                  style={{ minWidth: '90px', padding: '8px 20px' }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SRS-005: Look-Alike Hanzi Drills Modal */}
      <ConfusableHanziModal
        isOpen={confusableModalOpen}
        onClose={() => setConfusableModalOpen(false)}
        targetChar={selectedConfusableChar}
      />

      {/* SRS-006: Etymology and Radical Mnemonics Modal */}
      <EtymologyModal
        isOpen={isEtymologyModalOpen}
        onClose={() => setIsEtymologyModalOpen(false)}
        initialCharacter={selectedEtymologyChar}
      />

    </div>
  );
}

export default App;