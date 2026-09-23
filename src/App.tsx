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
import { generateLesson, generateGeminiText, DEFAULT_GEMINI_MODEL } from './services/gemini';
import type { Lesson } from './types/Lesson';

// 5 Sleek Modular Workspaces
import { ReadingWorkspace } from './components/ReadingWorkspace';
import { SpeakingWorkspace } from './components/SpeakingWorkspace';
import { ImportMediaWorkspace } from './components/ImportMediaWorkspace';
import { ReviewWorkspace } from './components/ReviewWorkspace';
import { LessonWorkspace } from './components/LessonWorkspace';

// Aux Modals & Standardized Components
import { DiagnosticTestModal } from './components/DiagnosticTestModal';
import { OfflineStatusIndicator } from './components/OfflineStatusIndicator';
import { ConfusableHanziModal } from './components/ConfusableHanziModal';
import { EtymologyModal } from './components/EtymologyModal';
import { WritingGraderModal } from './components/WritingGraderModal';
import { CommunityLeaderboardModal } from './components/CommunityLeaderboardModal';
import { StrokeOrderModal } from './components/StrokeOrderModal';
import { SettingsModal } from './components/SettingsModal';
import { CharacterTooltip, type TooltipState } from './components/CharacterTooltip';
import { DictionaryOverrideModal } from './components/DictionaryOverrideModal';

// Utilities & Services
import { applyTheme, getStoredTheme } from './services/themeEngine';
import { ReadingAnalytics, type ReadingSpeedRecord } from './services/readingAnalytics';
import { AzureSpeechService, type TtsEngine, type NeuralVoice, type VoiceOption } from './services/azureSpeech';
import { getStoredAccent, type RegionalAccent } from './utils/accentProfiles';
import type { MoyunStoryPackage } from './utils/storyShare';
import { StorageService, STORAGE_KEYS } from './services/storage';
import { searchDictionary } from './utils/dictionarySearch';

import { 
  BookOpen, Mic, FolderArchive, Layers, GraduationCap, 
  Settings as SettingsIcon, Search, Trophy, Edit3
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
  // Navigation: 5 Modular Workspaces
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>('reading');

  // Theme: Editorial Dark (Default)
  const [currentThemeId, setCurrentThemeId] = useState<string>(() => {
    return getStoredTheme().themeId || 'dark';
  });

  // Settings & Credentials
  const [apiKey, setApiKey] = useState(() => StorageService.getItem(STORAGE_KEYS.GEMINI_API_KEY));
  const [azureKey, setAzureKey] = useState(() => StorageService.getItem(STORAGE_KEYS.AZURE_SPEECH_KEY));
  const [azureRegion, setAzureRegion] = useState(() => StorageService.getItem(STORAGE_KEYS.AZURE_SPEECH_REGION, 'eastus'));
  const [showSettings, setShowSettings] = useState(false);

  // High Fidelity Voice Settings
  const [selectedTtsEngine, setSelectedTtsEngine] = useState<TtsEngine>(() => 
    (StorageService.getItem(STORAGE_KEYS.SELECTED_TTS_ENGINE) as TtsEngine) || 
    (StorageService.getItem(STORAGE_KEYS.AZURE_SPEECH_KEY) ? 'azure-neural' : 'cloud-natural')
  );
  const [selectedAzureVoice, setSelectedAzureVoice] = useState<NeuralVoice>(() => 
    (StorageService.getItem(STORAGE_KEYS.SELECTED_AZURE_VOICE) as NeuralVoice) || 'zh-CN-XiaoxiaoNeural'
  );
  const [selectedSystemVoice, setSelectedSystemVoice] = useState<string>(() => 
    StorageService.getItem(STORAGE_KEYS.SELECTED_SYSTEM_VOICE)
  );
  const [appSystemVoices, setAppSystemVoices] = useState<VoiceOption[]>([]);
  const [appRegionalAccent, setAppRegionalAccent] = useState<RegionalAccent>(() => getStoredAccent());
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  // Modals & Popups
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [showWritingGrader, setShowWritingGrader] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [strokeOrderModalOpen, setStrokeOrderModalOpen] = useState(false);
  const [selectedStrokeChar, setSelectedStrokeChar] = useState({ char: '好', pinyin: '', definition: '' });
  const [selectedPracticeItem, setSelectedPracticeItem] = useState<HanziItem | null>(null);
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [confusableModalOpen, setConfusableModalOpen] = useState(false);
  const [selectedConfusableChar, setSelectedConfusableChar] = useState<string | undefined>(undefined);
  const [isEtymologyModalOpen, setIsEtymologyModalOpen] = useState(false);
  const [selectedEtymologyChar, setSelectedEtymologyChar] = useState<string | undefined>(undefined);

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
  const [continuing, setContinuing] = useState(false);

  // Dictionary Overrides Map & Editing
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
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    content: null,
    character: '',
    x: 0,
    y: 0
  });
  const hideTimeoutRef = useRef<number | null>(null);

  // SRS States
  const [activeDeckId, setActiveDeckId] = useState<string>('all');
  const [dueCardsCount, setDueCardsCount] = useState(0);
  const [totalCardsCount, setTotalCardsCount] = useState(0);
  const [currentReviewCard, setCurrentReviewCard] = useState<Flashcard | null>(null);

  // Saved Library stories State
  const [savedStories, setSavedStories] = useState<SavedStory[]>([]);
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');

  // Heatmap Stats State
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>(() => 
    StorageService.getJson<Record<string, number>>(STORAGE_KEYS.CHARACTERS_HEATMAP, {})
  );

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

  // Load Chinese System Voices
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

  // Audio Test Handler
  const handleTestVoice = () => {
    if (isTestingVoice) return;
    setIsTestingVoice(true);
    AzureSpeechService.speak(
      '你好，欢迎使用墨韵华文阅读器。这是一段高保真自然中文语音测试。',
      {
        engine: selectedTtsEngine,
        voice: selectedAzureVoice,
        systemVoiceName: selectedSystemVoice,
        azureKey,
        azureRegion
      },
      () => setIsTestingVoice(false),
      () => setIsTestingVoice(false)
    );
  };

  // SRS Helpers
  const loadSRSStats = async (deckId: string = activeDeckId) => {
    try {
      const due = await getDueCards(deckId);
      const all = await getAllCards(deckId);
      setDueCardsCount(due.length);
      setTotalCardsCount(all.length);
      setCurrentReviewCard(due.length > 0 ? due[0] : null);
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

  // Peer-to-Peer Story Package Import Handler
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
      StorageService.setJson(STORAGE_KEYS.CHARACTERS_HEATMAP, updated);
      return updated;
    });
    setReadingStats(ReadingAnalytics.getHistory());
  };

  // Standardized Search Logic
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    const results = searchDictionary(query, hanziData, vocabData, overridesMap, 25);
    setSearchResults(results);
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
      const preferredModel = StorageService.getItem(STORAGE_KEYS.GEMINI_MODEL, DEFAULT_GEMINI_MODEL);
      const grammarConstraint = HSK_GRAMMAR_CONSTRAINTS[hskLevel] || "";
      const prompt = `Write a high-quality Chinese graded story strictly at HSK ${hskLevel} level based on: "${storyIdea}".
Provide a concise Chinese title on the first line. Do NOT output Pinyin or English in the text.
Grammar constraint: ${grammarConstraint}`;

      const text = await generateGeminiText(apiKey, prompt, preferredModel);

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
    } catch (err: any) {
      console.error('Error generating story:', err);
      const detail = err?.message || 'Check API key or quota.';
      alert(`Failed to generate story: ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueStory = async (promptDirection: string) => {
    if (!promptDirection.trim() || !apiKey) return;

    setContinuing(true);
    try {
      const preferredModel = StorageService.getItem(STORAGE_KEYS.GEMINI_MODEL, DEFAULT_GEMINI_MODEL);
      const currentText = generatedStory.map(t => t.character).join('');
      const prompt = `Here is the current Chinese story:
"${currentText}"

Continue the story based on this branch: "${promptDirection}".
Write strictly in simplified Mandarin at HSK ${hskLevel || '3'} level without Pinyin or English.`;

      const nextParagraph = await generateGeminiText(apiKey, prompt, preferredModel);

      const newTokens = tokenizeStory("\n" + nextParagraph, hanziData, vocabData, overridesMap);
      setGeneratedStory(prev => [...prev, ...newTokens]);
      recordCharactersRead(nextParagraph.length);
    } catch (err: any) {
      console.error('Error continuing story:', err);
      const detail = err?.message || 'Check API key or quota.';
      alert(`Failed to generate continuation: ${detail}`);
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
      const preferredModel = StorageService.getItem(STORAGE_KEYS.GEMINI_MODEL, DEFAULT_GEMINI_MODEL);
      const storyText = generatedStory.map(t => t.character).join('');
      const prompt = `Rewrite this story to strictly adhere to HSK ${targetLevel} vocabulary and grammar:
"${storyText}"`;

      const responseText = await generateGeminiText(apiKey, prompt, preferredModel);

      const tokens = tokenizeStory(responseText, hanziData, vocabData, overridesMap);
      setGeneratedStory(tokens);
      setHskLevel(String(targetLevel));
    } catch (err: any) {
      console.error('Error scaling difficulty:', err);
      const detail = err?.message || 'Check API key or quota.';
      alert(`Failed to scale story difficulty: ${detail}`);
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

  // Add character to flashcards
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
      {/* GLOBAL APPLICATION HEADER */}
      <header className="app-header print-hide">
        {/* Brand */}
        <div className="app-brand">
          <div className="brand-badge">墨</div>
          <div>
            <h1 className="brand-title">墨韵 Moyun</h1>
            <p className="brand-subtitle">
              Graded Chinese Reader & Spoken Studio
            </p>
          </div>
        </div>

        {/* Center: Search */}
        <div className="app-header-search">
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search Hanzi, Pinyin or English..."
              className="form-input"
              style={{ paddingLeft: '34px', height: '34px', fontSize: '13px', borderRadius: 'var(--radius-sm)', width: '100%' }}
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

        {/* Right Controls: Unified 34px buttons */}
        <div className="app-header-actions">
          <OfflineStatusIndicator />

          <button
            onClick={() => setShowWritingGrader(true)}
            className="header-btn"
            title="AI Writing & Grammar Grader (AIM-001)"
          >
            <Edit3 size={14} color="var(--accent-seal)" />
            <span className="header-btn-text">Writing</span>
          </button>

          <button
            onClick={() => setShowLeaderboard(true)}
            className="header-btn"
            title="Weekly Community Reading Leaderboard (GTU-003)"
          >
            <Trophy size={14} color="var(--accent-gold)" />
            <span className="header-btn-text">Leaderboard</span>
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="header-btn"
            title="Open system and voice settings"
          >
            <SettingsIcon size={14} />
            <span className="header-btn-text">Settings</span>
          </button>
        </div>
      </header>


      {/* 5-MODULAR WORKSPACE SWITCHER NAVIGATION */}
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
      <CharacterTooltip
        tooltip={tooltip}
        onClose={() => setTooltip(prev => ({ ...prev, visible: false }))}
        onMouseEnter={() => {
          if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        }}
        onMouseLeave={() => {
          hideTimeoutRef.current = window.setTimeout(() => {
            setTooltip(prev => ({ ...prev, visible: false }));
          }, 300);
        }}
        onPractice={(item) => {
          setSelectedPracticeItem(item);
          setIsPracticeModalOpen(true);
          setTooltip(prev => ({ ...prev, visible: false }));
        }}
        onAddToFlashcards={handleAddToFlashcards}
        onOverride={(char, pinyin, def) => {
          setEditingChar(char);
          setOverridePinyin(pinyin);
          setOverrideDefinition(def);
          setIsEditingOverride(true);
          setTooltip(prev => ({ ...prev, visible: false }));
        }}
        onStrokeOrder={(char, pinyin, def) => {
          setSelectedStrokeChar({ char, pinyin, definition: def });
          setStrokeOrderModalOpen(true);
          setTooltip(prev => ({ ...prev, visible: false }));
        }}
        onExploreEtymology={(char) => {
          setSelectedEtymologyChar(char);
          setIsEtymologyModalOpen(true);
          setTooltip(prev => ({ ...prev, visible: false }));
        }}
        onPracticeConfusable={(char) => {
          setSelectedConfusableChar(char);
          setConfusableModalOpen(true);
          setTooltip(prev => ({ ...prev, visible: false }));
        }}
      />

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
      <DictionaryOverrideModal
        isOpen={isEditingOverride}
        onClose={() => setIsEditingOverride(false)}
        character={editingChar}
        pinyin={overridePinyin}
        definition={overrideDefinition}
        hasExistingOverride={Boolean(overridesMap[editingChar])}
        onPinyinChange={setOverridePinyin}
        onDefinitionChange={setOverrideDefinition}
        onSave={handleSaveOverride}
        onReset={handleDeleteOverride}
      />

      {/* GLOBAL SETTINGS MODAL */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        azureKey={azureKey}
        setAzureKey={setAzureKey}
        azureRegion={azureRegion}
        setAzureRegion={setAzureRegion}
        selectedTtsEngine={selectedTtsEngine}
        setSelectedTtsEngine={setSelectedTtsEngine}
        selectedAzureVoice={selectedAzureVoice}
        setSelectedAzureVoice={setSelectedAzureVoice}
        selectedSystemVoice={selectedSystemVoice}
        setSelectedSystemVoice={setSelectedSystemVoice}
        appSystemVoices={appSystemVoices}
        appRegionalAccent={appRegionalAccent}
        setAppRegionalAccent={setAppRegionalAccent}
        isTestingVoice={isTestingVoice}
        onTestVoice={handleTestVoice}
        currentThemeId={currentThemeId}
        setCurrentThemeId={setCurrentThemeId}
        onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
        onStateRestored={() => {
          loadSRSStats();
          loadLibrary();
          getOverridesMap().then(setOverridesMap);
        }}
      />

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

      {/* AIM-001: AI Writing & Grammar Grader Modal */}
      <WritingGraderModal
        isOpen={showWritingGrader}
        onClose={() => setShowWritingGrader(false)}
        apiKey={apiKey}
        onLoadIntoReader={(title, rawText) => {
          const tokens = tokenizeStory(rawText, hanziData, vocabData, overridesMap);
          setStoryTitle(title);
          setGeneratedStory(tokens);
          setActiveWorkspace('reading');
          recordCharactersRead(rawText.length);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* GTU-003: Opt-in Community Leaderboards Modal */}
      <CommunityLeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />

      {/* AIM-010: Integrated Stroke Order Numbered Typography Modal */}
      <StrokeOrderModal
        isOpen={strokeOrderModalOpen}
        onClose={() => setStrokeOrderModalOpen(false)}
        character={selectedStrokeChar.char}
        pinyin={selectedStrokeChar.pinyin}
        definition={selectedStrokeChar.definition}
      />
    </div>
  );
}

export default App;