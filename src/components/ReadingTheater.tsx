import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { HanziItem } from '../types/HanziItem';
import { 
  Volume2, Pause, Play, Square, BookOpen, Eye, EyeOff, Save, Printer, 
  TrendingDown, TrendingUp, Maximize2, Minimize2, Languages, Sparkles,
  ChevronDown, MoreHorizontal, Palette, Zap, Subtitles, BarChart3, HelpCircle, RotateCcw, Share2
} from 'lucide-react';
import { AzureSpeechService, type TtsEngine, type VoiceOption, type AudioPlaybackHandle } from '../services/azureSpeech';
import { findGrammarPatterns, type GrammarPatternMatch } from '../utils/grammarHighlighter';
import { checkPolyphone } from '../utils/homophoneDetector';
import { ReadingAnalytics } from '../services/readingAnalytics';
import { getToneColor, type ToneColorMode } from '../utils/toneColorizer';
import { convertScript, type ChineseScript } from '../utils/scriptConverter';
import { getAllCards, getDueCards, updateCard, type Flashcard } from '../services/srsStore';
import { ReadingVelocityModal } from './ReadingVelocityModal';
import { SubtitleExportModal } from './SubtitleExportModal';
import { FrequencyCoverageModal } from './FrequencyCoverageModal';
import { SynonymLadderEngine, type SubstitutionRecord } from '../utils/synonymLadder';
import { generateAdventureBranches, type AdventureBranchChoice } from '../utils/adventureEngine';
import { GrammarDirectoryModal } from './GrammarDirectoryModal';
import { pinyinToZhuyin } from '../utils/zhuyinConverter';
import { getStoredAccent, saveStoredAccent, type RegionalAccent } from '../utils/accentProfiles';
import { StoryShareModal } from './StoryShareModal';
import type { MoyunStoryPackage } from '../utils/storyShare';
import { CulturalContextEngine, type CulturalContextNote } from '../utils/culturalContextEngine';
import { CulturalNotesModal } from './CulturalNotesModal';

interface ReadingTheaterProps {
  storyTitle: string;
  tokens: HanziItem[];
  hskLevel: string;
  onScaleDifficulty: (direction: 'simplify' | 'harder') => void;
  onContinueStory: (continuationPrompt: string) => void;
  onSaveStory: () => void;
  onCharClick: (item: HanziItem, e: React.MouseEvent, sentenceText?: string) => void;
  onSentenceClick: (sentenceText: string) => void;
  isContinuing: boolean;
  isLoading: boolean;
  onImportStory?: (imported: MoyunStoryPackage) => void;
}

export const ReadingTheater: React.FC<ReadingTheaterProps> = ({
  storyTitle,
  tokens,
  hskLevel,
  onScaleDifficulty,
  onContinueStory,
  onSaveStory,
  onCharClick,
  onSentenceClick,
  isContinuing,
  isLoading,
  onImportStory
}) => {
  // Reading mode: horizontal or traditional vertical-rl
  const [isVertical, setIsVertical] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);
  const [hidePinyinLevel, setHidePinyinLevel] = useState<number>(0);
  const [ttsSpeed, setTtsSpeed] = useState<number>(1.0);
  const [playbackStatus, setPlaybackStatus] = useState<'idle' | 'playing' | 'paused'>('idle');

  // Voice Engine State
  const [selectedEngine, setSelectedEngine] = useState<TtsEngine>(() => 
    (localStorage.getItem('selected_tts_engine') as TtsEngine) || 
    (localStorage.getItem('azure_speech_key') ? 'azure-neural' : 'cloud-natural')
  );
  const [selectedSystemVoice, setSelectedSystemVoice] = useState<string>(() =>
    localStorage.getItem('selected_system_voice') || ''
  );
  const [systemVoices, setSystemVoices] = useState<VoiceOption[]>([]);
  // ALS-004: Regional Dialect & Accent Toggles
  const [regionalAccent, setRegionalAccent] = useState<RegionalAccent>(() => getStoredAccent());

  // Active sentence highlighting & translation
  const [activePacingSentence, setActivePacingSentence] = useState<number | null>(null);
  const [revealedTranslations, setRevealedTranslations] = useState<Record<number, boolean>>({});
  const [continuationInput, setContinuationInput] = useState('');

  // Grammar highlighting toggle
  const [highlightGrammar, setHighlightGrammar] = useState(true);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);

  // TRC-003: Tone Color Coding Mode ('off' | 'pinyin' | 'both')
  const [toneColorMode, setToneColorMode] = useState<ToneColorMode>(() => 
    (localStorage.getItem('moyun_tone_color_mode') as ToneColorMode) || 'off'
  );

  // ALS-001: Hover-to-Play Audio Narration
  const [hoverAudioEnabled, setHoverAudioEnabled] = useState<boolean>(() => 
    localStorage.getItem('moyun_hover_audio') === 'true'
  );
  const hoverAudioTimerRef = useRef<any>(null);

  // GTU-009: Focus Mode typography scale
  const [focusFontSize, setFocusFontSize] = useState<number>(22);

  // TRC-010: Contextual Paragraph Translation
  const [revealedParagraphs, setRevealedParagraphs] = useState<Record<number, boolean>>({});

  // TRC-001: Script Preference (Simplified vs Traditional)
  const [scriptPreference, setScriptPreference] = useState<ChineseScript>(() => 
    (localStorage.getItem('moyun_script_preference') as ChineseScript) || 'simplified'
  );

  // TRC-004: Adaptive Pinyin Display Mode & Mastered Characters Set
  const [pinyinDisplayMode, setPinyinDisplayMode] = useState<'all' | 'adaptive' | 'level'>(() => 
    (localStorage.getItem('moyun_pinyin_display_mode') as any) || 'all'
  );
  // TRC-002: Phonetic Script (Pinyin vs Zhuyin Bopomofo)
  const [phoneticNotation, setPhoneticNotation] = useState<'pinyin' | 'zhuyin'>(() => 
    (localStorage.getItem('moyun_phonetic_notation') as any) || 'pinyin'
  );
  const [masteredChars, setMasteredChars] = useState<Set<string>>(new Set());

  // GTU-002: Reading Velocity & CPM Analytics Modal
  const [showVelocityModal, setShowVelocityModal] = useState(false);
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState(0);

  // AIM-008: Subtitle Export Modal
  const [showSubtitleModal, setShowSubtitleModal] = useState(false);

  // SRS-007: Automated Cloze Mode State
  const [clozeModeEnabled, setClozeModeEnabled] = useState(false);
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [activeClozeCard, setActiveClozeCard] = useState<Flashcard | null>(null);
  const [clozeFeedback, setClozeFeedback] = useState<Record<string, 'correct' | 'incorrect'>>({});

  // TRC-007: Top 500 Hanzi Frequency Overlay & Modal State
  const [showFrequencyOverlay, setShowFrequencyOverlay] = useState(false);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);

  // AIM-006: Grammar Pattern Directory Modal State
  const [showGrammarDirectoryModal, setShowGrammarDirectoryModal] = useState(false);

  // GTU-005: Peer-to-Peer Story Sharing Modal State
  const [showShareModal, setShowShareModal] = useState(false);

  // TRC-009: Cultural Context AI Notes Modal State
  const [showCulturalNotesModal, setShowCulturalNotesModal] = useState(false);

  // AIM-004: Real-time Vocabulary Difficulty Scaler State
  const [realTimeHsk, setRealTimeHsk] = useState<number>(() => parseInt(hskLevel, 10) || 1);
  const [substitutions, setSubstitutions] = useState<SubstitutionRecord[]>([]);
  const [scaledTokens, setScaledTokens] = useState<HanziItem[] | null>(null);

  const detectedCulturalNotes = useMemo(() => {
    const fullText = (scaledTokens || tokens).map(t => t.character).join('');
    return CulturalContextEngine.analyzeText(fullText);
  }, [tokens, scaledTokens]);

  const loadDueCards = async () => {
    try {
      const due = await getDueCards();
      setDueCards(due);
    } catch (e) {
      console.warn('Failed to load due cards:', e);
    }
  };

  useEffect(() => {
    loadDueCards();
  }, [tokens]);

  const handleClozeAnswer = (selectedChar: string) => {
    if (!activeClozeCard) return;
    const isRight = selectedChar === activeClozeCard.character;
    if (isRight) {
      AzureSpeechService.speak(activeClozeCard.character, 0.9);
      updateCard(activeClozeCard.character, 3);
      setClozeFeedback(prev => ({ ...prev, [activeClozeCard.character]: 'correct' }));
    } else {
      updateCard(activeClozeCard.character, 1);
      setClozeFeedback(prev => ({ ...prev, [activeClozeCard.character]: 'incorrect' }));
    }
    setTimeout(() => {
      setActiveClozeCard(null);
      loadDueCards();
    }, 1200);
  };

  const handleInstantScale = (targetHsk: number) => {
    setRealTimeHsk(targetHsk);
    const originalText = tokens.map(t => t.character).join('');
    const { scaledText, substitutions: subs } = SynonymLadderEngine.scaleDifficulty(originalText, targetHsk);
    setSubstitutions(subs);

    if (subs.length > 0) {
      const updated = tokens.map(t => {
        const sub = subs.find(s => s.fromWord === t.character);
        if (sub) {
          return {
            ...t,
            character: sub.toWord,
            definition: `[Scaled to HSK ${sub.toHsk}] ${t.definition} (originally: ${sub.fromWord})`
          };
        }
        return t;
      });
      setScaledTokens(updated);
    } else {
      setScaledTokens(null);
    }
  };

  const handleRevertScaling = () => {
    setRealTimeHsk(parseInt(hskLevel, 10) || 1);
    setSubstitutions([]);
    setScaledTokens(null);
  };

  // Escape key handler for Focus Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  // Hover Audio Handlers
  const handleTokenHover = (char: string) => {
    if (!hoverAudioEnabled || !char || !char.trim()) return;
    if (hoverAudioTimerRef.current) clearTimeout(hoverAudioTimerRef.current);
    hoverAudioTimerRef.current = setTimeout(() => {
      AzureSpeechService.speak(char, 1.0, selectedEngine, selectedSystemVoice);
    }, 300);
  };

  const handleTokenLeave = () => {
    if (hoverAudioTimerRef.current) {
      clearTimeout(hoverAudioTimerRef.current);
      hoverAudioTimerRef.current = null;
    }
  };

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target as Node)) {
        setShowActionsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reading speed timer
  const sessionStartRef = useRef<number>(Date.now());
  const [currentCPM, setCurrentCPM] = useState<number>(0);

  // Playback refs to guarantee deterministic cancellation
  const currentIdxRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);
  const isStoppedRef = useRef<boolean>(true);
  const pendingTimeoutRef = useRef<any>(null);
  const activeHandleRef = useRef<AudioPlaybackHandle | null>(null);

  // Load available system voices & setup unmount cleanup
  useEffect(() => {
    const updateVoices = () => {
      const v = AzureSpeechService.getAvailableSystemVoices();
      setSystemVoices(v);
      if (!selectedSystemVoice && v.length > 0) {
        setSelectedSystemVoice(v[0].name);
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
      stopAudio();
    };
  }, []);

  useEffect(() => {
    // Load mastered cards from SRS store for Adaptive Pinyin Fading (TRC-004)
    getAllCards().then(cards => {
      const mastered = new Set<string>();
      cards.forEach(c => {
        if (c.interval >= 14) {
          mastered.add(c.character);
        }
      });
      setMasteredChars(mastered);
    }).catch(err => console.warn('Failed to load mastered cards for adaptive pinyin:', err));

    sessionStartRef.current = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.round((Date.now() - sessionStartRef.current) / 1000);
      setSessionElapsedSeconds(elapsed);
      const totalChars = tokens.filter(t => !t.isNonChinese).reduce((acc, t) => acc + t.character.length, 0);
      const cpm = ReadingAnalytics.calculateCPM(totalChars, elapsed);
      setCurrentCPM(cpm);
    }, 2000);

    return () => {
      clearInterval(interval);
      // Persist session reading velocity if read for > 15s (GTU-002)
      const elapsed = Math.round((Date.now() - sessionStartRef.current) / 1000);
      const totalChars = tokens.filter(t => !t.isNonChinese).reduce((acc, t) => acc + t.character.length, 0);
      if (elapsed >= 15 && totalChars > 10) {
        ReadingAnalytics.recordSession(totalChars, elapsed, storyTitle, hskLevel);
      }
    };
  }, [tokens, storyTitle, hskLevel]);

  // Active tokens reflecting any in-memory real-time difficulty scaling (AIM-004)
  const activeTokens = scaledTokens || tokens;

  // SRS-007: Due SRS Flashcard Map
  const dueCardMap = React.useMemo(() => new Map(dueCards.map(c => [c.character, c])), [dueCards]);
  const dueInStoryTokens = React.useMemo(() => {
    return activeTokens.filter(t => !t.isNonChinese && dueCardMap.has(t.character));
  }, [activeTokens, dueCardMap]);
  const uniqueDueCount = React.useMemo(() => {
    return new Set(dueInStoryTokens.map(t => t.character)).size;
  }, [dueInStoryTokens]);

  // TRC-007: Hanzi Frequency Statistics (Top 500 Analytics)
  const frequencyStats = React.useMemo(() => {
    let totalChinese = 0;
    let top100Count = 0;
    let top250Count = 0;
    let top500Count = 0;
    let rareCount = 0;
    const topWords: Array<{ character: string; rank: number; pinyin: string; definition: string }> = [];
    const seen = new Set<string>();

    activeTokens.forEach(t => {
      if (t.isNonChinese || !t.character) return;
      totalChinese += t.character.length;
      const rank = t.frequency_rank ? parseInt(t.frequency_rank, 10) : NaN;
      if (!isNaN(rank)) {
        if (rank <= 100) top100Count++;
        if (rank <= 250) top250Count++;
        if (rank <= 500) {
          top500Count++;
          if (!seen.has(t.character)) {
            seen.add(t.character);
            topWords.push({ character: t.character, rank, pinyin: t.pinyin, definition: t.definition });
          }
        } else {
          rareCount++;
        }
      } else {
        rareCount++;
      }
    });

    topWords.sort((a, b) => a.rank - b.rank);
    const coveragePercent = totalChinese > 0 ? Math.round((top500Count / totalChinese) * 100) : 0;

    return { totalChinese, top100Count, top250Count, top500Count, rareCount, topWords, coveragePercent };
  }, [activeTokens]);

  // SRS-007: 4 Options for Cloze Recall Modal
  const clozeOptions = React.useMemo(() => {
    if (!activeClozeCard) return [];
    const correct = activeClozeCard.character;
    const pool = activeTokens
      .filter(t => !t.isNonChinese && t.character && t.character !== correct)
      .map(t => t.character);
    const uniquePool = Array.from(new Set(pool));
    const shuffled = uniquePool.sort(() => 0.5 - Math.random());
    const distractors = shuffled.slice(0, 3);
    const fallback = ['的', '了', '在', '是', '我', '有', '和', '人', '这', '中'].filter(c => c !== correct && !distractors.includes(c));
    while (distractors.length < 3 && fallback.length > 0) {
      distractors.push(fallback.pop()!);
    }
    const combined = [correct, ...distractors];
    return combined.sort(() => 0.5 - Math.random());
  }, [activeClozeCard, activeTokens]);

  // Detect grammar patterns across full text
  const fullText = activeTokens.map(t => t.character).join('');
  const grammarMatches = highlightGrammar ? findGrammarPatterns(fullText) : [];

  // Map each token's character range in fullText to any overlapping grammar matches
  let charCursor = 0;
  const tokenGrammarMap = new Map<number, GrammarPatternMatch>();
  activeTokens.forEach((t, idx) => {
    const start = charCursor;
    const end = charCursor + t.character.length;
    charCursor = end;

    if (highlightGrammar && grammarMatches.length > 0) {
      const match = grammarMatches.find(m => Math.max(m.startIndex, start) < Math.min(m.endIndex, end));
      if (match) {
        tokenGrammarMap.set(idx, match);
      }
    }
  });

  // Group tokens into sentences based on punctuation (。, ！, ？, \n)
  interface EnrichedSentenceToken {
    item: HanziItem;
    globalIdx: number;
    grammarMatch?: GrammarPatternMatch;
  }

  const sentences: { id: number; tokens: EnrichedSentenceToken[]; text: string }[] = [];
  let currentSentenceTokens: EnrichedSentenceToken[] = [];
  let currentSentenceText = '';

  activeTokens.forEach((token, globalIdx) => {
    currentSentenceTokens.push({
      item: token,
      globalIdx,
      grammarMatch: tokenGrammarMap.get(globalIdx)
    });
    currentSentenceText += token.character;

    if (token.character.match(/[。！？\n]/)) {
      sentences.push({
        id: sentences.length,
        tokens: [...currentSentenceTokens],
        text: currentSentenceText.trim()
      });
      currentSentenceTokens = [];
      currentSentenceText = '';
    }
  });

  if (currentSentenceTokens.length > 0) {
    sentences.push({
      id: sentences.length,
      tokens: [...currentSentenceTokens],
      text: currentSentenceText.trim()
    });
  }

  // TRC-010: Group sentences into paragraphs (split by newline or every 3 sentences)
  interface EnrichedParagraph {
    id: number;
    sentences: typeof sentences;
    text: string;
  }

  const paragraphs: EnrichedParagraph[] = [];
  let curParaSentences: typeof sentences = [];

  sentences.forEach((sent, sIdx) => {
    curParaSentences.push(sent);
    const endsWithBreak = sent.tokens.some(t => t.item.character.includes('\n'));
    if (endsWithBreak || curParaSentences.length >= 3 || sIdx === sentences.length - 1) {
      paragraphs.push({
        id: paragraphs.length,
        sentences: [...curParaSentences],
        text: curParaSentences.map(s => s.text).join(' ')
      });
      curParaSentences = [];
    }
  });

  // GTU-008: Unique vocabulary items for printable glossary
  const glossaryItems = React.useMemo(() => {
    const seen = new Set<string>();
    const items: HanziItem[] = [];
    tokens.forEach(t => {
      if (!t.isNonChinese && t.character && t.character.trim() && !seen.has(t.character) && t.definition) {
        seen.add(t.character);
        items.push(t);
      }
    });
    return items.slice(0, 45);
  }, [tokens]);

  // AIM-008: Subtitle sentences for export
  const subtitleSentences = React.useMemo(() => {
    return sentences.map(s => {
      const pinyin = s.tokens.map(t => t.item.pinyin).filter(Boolean).join(' ');
      return {
        id: s.id,
        text: convertScript(s.text, scriptPreference),
        pinyin,
        translation: undefined
      };
    });
  }, [sentences, scriptPreference]);

  const handleToggleTranslation = (sentenceId: number, sentenceText: string) => {
    setRevealedTranslations(prev => ({
      ...prev,
      [sentenceId]: !prev[sentenceId]
    }));
    onSentenceClick(sentenceText);
  };

  const stopAudio = () => {
    isStoppedRef.current = true;
    isPausedRef.current = false;
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current);
      pendingTimeoutRef.current = null;
    }
    if (activeHandleRef.current) {
      activeHandleRef.current.stop();
      activeHandleRef.current = null;
    }
    setPlaybackStatus('idle');
    setActivePacingSentence(null);
    currentIdxRef.current = 0;
  };

  const pauseAudio = () => {
    isPausedRef.current = true;
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current);
      pendingTimeoutRef.current = null;
    }
    if (activeHandleRef.current) {
      activeHandleRef.current.stop();
      activeHandleRef.current = null;
    }
    setPlaybackStatus('paused');
  };

  const resumeAudio = () => {
    isStoppedRef.current = false;
    isPausedRef.current = false;
    setPlaybackStatus('playing');
    playSentenceAtIndex(currentIdxRef.current);
  };

  const startAudio = () => {
    stopAudio();
    isStoppedRef.current = false;
    isPausedRef.current = false;
    setPlaybackStatus('playing');
    currentIdxRef.current = 0;
    playSentenceAtIndex(0);
  };

  const playSentenceAtIndex = (idx: number) => {
    if (isStoppedRef.current || isPausedRef.current) return;
    if (idx >= sentences.length) {
      stopAudio();
      return;
    }

    currentIdxRef.current = idx;
    const sentence = sentences[idx];
    setActivePacingSentence(sentence.id);

    const handle = AzureSpeechService.speak(
      sentence.text,
      {
        engine: selectedEngine,
        systemVoiceName: selectedSystemVoice || undefined,
        rate: ttsSpeed,
      },
      () => {
        // onEnd: advance if still actively playing
        if (isStoppedRef.current || isPausedRef.current) return;
        currentIdxRef.current = idx + 1;
        pendingTimeoutRef.current = setTimeout(() => {
          if (isStoppedRef.current || isPausedRef.current) return;
          playSentenceAtIndex(idx + 1);
        }, 220);
      },
      (err) => {
        console.warn('Audio playback error', err);
        if (isStoppedRef.current || isPausedRef.current) return;
        stopAudio();
      }
    );

    activeHandleRef.current = handle;
  };

  return (
    <div className={`reading-theater ${isFocusMode ? 'focus-mode-active' : ''}`}>
      {/* Top Reading Toolbar */}
      {!isFocusMode && (
        <div className="reading-toolbar">
          {/* Cluster 1: Curriculum & Pacing */}
          <div className="reading-toolbar-group">
            <span style={{
              backgroundColor: 'var(--border-strong)',
              color: 'var(--text-primary)',
              fontSize: '11px',
              fontWeight: 500,
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              HSK {hskLevel || '1'}
            </span>
            <button
              onClick={() => setShowVelocityModal(true)}
              style={{
                fontSize: '11px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '3px 7px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
              title="Reading Velocity & Fluency Analytics (GTU-002): View CPM progression & HSK benchmarks"
            >
              <Zap size={11} color="#f59e0b" /> {currentCPM} CPM
            </button>
          </div>

          {/* Cluster 2: Streamlined Audio Player Bar */}
          <div className="reading-player-bar">
            <button
              onClick={() => {
                if (playbackStatus === 'playing') {
                  pauseAudio();
                } else if (playbackStatus === 'paused') {
                  resumeAudio();
                } else {
                  startAudio();
                }
              }}
              className={`btn ${playbackStatus === 'playing' ? 'btn-bamboo' : playbackStatus === 'paused' ? 'btn-primary' : 'btn-secondary'}`}
              title={playbackStatus === 'playing' ? 'Pause Narration' : playbackStatus === 'paused' ? 'Resume Narration' : 'Read Aloud'}
              style={{ padding: '5px 10px', fontSize: '12px' }}
            >
              {playbackStatus === 'playing' ? <Pause size={13} /> : <Play size={13} />} 
              <span>{playbackStatus === 'playing' ? 'Pause' : playbackStatus === 'paused' ? 'Resume' : 'Read Aloud'}</span>
            </button>

            {playbackStatus !== 'idle' && (
              <button
                onClick={stopAudio}
                className="btn btn-secondary"
                title="Stop Narration"
                style={{ padding: '5px 7px' }}
              >
                <Square size={12} />
              </button>
            )}

            <select
              value={ttsSpeed}
              onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
              className="form-select"
              style={{ padding: '4px 6px', fontSize: '11px', height: '28px', border: 'none', background: 'transparent' }}
              title="Narration Speed"
            >
              <option value={0.75}>0.75×</option>
              <option value={1.0}>1.0×</option>
              <option value={1.25}>1.25×</option>
            </select>

            <select
              value={selectedEngine}
              onChange={(e) => {
                const eng = e.target.value as TtsEngine;
                setSelectedEngine(eng);
                localStorage.setItem('selected_tts_engine', eng);
              }}
              className="form-select"
              style={{ padding: '4px 6px', fontSize: '11px', height: '28px', border: 'none', background: 'transparent', maxWidth: '130px' }}
              title="Voice Engine"
            >
              <option value="cloud-natural">Cloud Natural</option>
              <option value="azure-neural">Azure Neural</option>
              <option value="system">System Voice</option>
            </select>

            {selectedEngine === 'system' && systemVoices.length > 0 && (
              <select
                value={selectedSystemVoice}
                onChange={(e) => {
                  setSelectedSystemVoice(e.target.value);
                  localStorage.setItem('selected_system_voice', e.target.value);
                }}
                className="form-select"
                style={{ padding: '4px 6px', fontSize: '11px', height: '28px', border: 'none', background: 'transparent', maxWidth: '120px' }}
                title="Select System Voice"
              >
                {systemVoices.map(v => (
                  <option key={v.id} value={v.name}>
                    {v.name.replace(/Microsoft |Google |Apple /g, '').slice(0, 16)}
                  </option>
                ))}
              </select>
            )}

            {/* ALS-004: Regional Dialect & Accent Toggle */}
            <select
              value={regionalAccent}
              onChange={(e) => {
                const next = e.target.value as RegionalAccent;
                setRegionalAccent(next);
                saveStoredAccent(next);
              }}
              className="form-select"
              style={{ padding: '4px 6px', fontSize: '11px', height: '28px', border: 'none', background: 'transparent' }}
              title="Regional Dialect & Accent (ALS-004): Standard Northern Mandarin, Beijing Erhua, or Taiwanese Mandarin"
            >
              <option value="standard">🏛️ 普通话</option>
              <option value="beijing_erhua">🏮 北京儿化</option>
              <option value="taiwan">🍵 台湾华语</option>
            </select>

            {/* ALS-001: Hover-to-Play Audio Narration */}
            <button
              onClick={() => {
                const next = !hoverAudioEnabled;
                setHoverAudioEnabled(next);
                localStorage.setItem('moyun_hover_audio', String(next));
              }}
              className={`btn ${hoverAudioEnabled ? 'btn-bamboo' : 'btn-secondary'}`}
              style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
              title={hoverAudioEnabled ? 'Hover Audio Enabled: Hover over any word to speak it' : 'Enable Hover-to-Play Audio (ALS-001)'}
            >
              <Volume2 size={12} /> {hoverAudioEnabled ? 'Hover: On' : 'Hover: Off'}
            </button>
          </div>

          {/* Cluster 3: View & Document Tools */}
          <div className="reading-toolbar-group">
            {/* Layout Orientation */}
            <button
              onClick={() => setIsVertical(v => !v)}
              className="btn btn-secondary"
              style={{ padding: '5px 10px', fontSize: '12px' }}
              title={isVertical ? 'Switch to Horizontal Reading' : 'Switch to Traditional Vertical Columns'}
            >
              <BookOpen size={13} /> {isVertical ? 'Horizontal' : 'Vertical'}
            </button>

            {/* TRC-001: Script Preference Toggle (简 / 繁) */}
            <button
              onClick={() => {
                const next: ChineseScript = scriptPreference === 'simplified' ? 'traditional' : 'simplified';
                setScriptPreference(next);
                localStorage.setItem('moyun_script_preference', next);
              }}
              className={`btn ${scriptPreference === 'traditional' ? 'btn-bamboo' : 'btn-secondary'}`}
              style={{ padding: '5px 9px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Traditional Character Toggle (TRC-001): Switch between 简体字 and 繁體字"
            >
              <Languages size={13} /> {scriptPreference === 'traditional' ? '繁體' : '简体'}
            </button>

            {/* TRC-003: Tone Color Coding */}
            <button
              onClick={() => {
                const nextMode: ToneColorMode = toneColorMode === 'off' ? 'pinyin' : toneColorMode === 'pinyin' ? 'both' : 'off';
                setToneColorMode(nextMode);
                localStorage.setItem('moyun_tone_color_mode', nextMode);
              }}
              className={`btn ${toneColorMode !== 'off' ? 'btn-bamboo' : 'btn-secondary'}`}
              style={{ padding: '5px 9px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
              title="Tone Color Coding (TRC-003): Off | Pinyin Only | Hanzi & Pinyin"
            >
              <Palette size={13} /> Tones: {toneColorMode === 'off' ? 'Off' : toneColorMode === 'pinyin' ? 'Pinyin' : 'Both'}
            </button>

            {/* TRC-004: Pinyin Visibility & Adaptive Mode */}
            <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)' }}>
              <button
                onClick={() => setShowPinyin(p => !p)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  padding: '5px 8px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer'
                }}
                title="Toggle Pinyin visibility"
              >
                {showPinyin ? <EyeOff size={13} /> : <Eye size={13} />} Pinyin
              </button>
              {showPinyin && (
                <select
                  value={pinyinDisplayMode}
                  onChange={(e) => {
                    const mode = e.target.value as any;
                    setPinyinDisplayMode(mode);
                    localStorage.setItem('moyun_pinyin_display_mode', mode);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderLeft: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    padding: '4px 6px',
                    fontSize: '11px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  title="Pinyin Display Mode (TRC-004)"
                >
                  <option value="all">All</option>
                  <option value="adaptive">Smart (Fade SRS)</option>
                  <option value="level">By HSK Level</option>
                </select>
              )}
              {showPinyin && (
                <select
                  value={phoneticNotation}
                  onChange={(e) => {
                    const notation = e.target.value as 'pinyin' | 'zhuyin';
                    setPhoneticNotation(notation);
                    localStorage.setItem('moyun_phonetic_notation', notation);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderLeft: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    padding: '4px 6px',
                    fontSize: '11px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  title="Phonetic Script: Latin Pinyin vs Zhuyin Bopomofo (TRC-002)"
                >
                  <option value="pinyin">拼 Pinyin</option>
                  <option value="zhuyin">注 Zhuyin (注音)</option>
                </select>
              )}
              {showPinyin && pinyinDisplayMode === 'level' && (
                <select
                  value={hidePinyinLevel}
                  onChange={(e) => setHidePinyinLevel(parseInt(e.target.value, 10))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderLeft: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    padding: '4px 6px',
                    fontSize: '11px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  title="Hide Pinyin for specified HSK levels"
                >
                  <option value={1}>Hide HSK 1</option>
                  <option value={2}>Hide HSK 1-2</option>
                  <option value={3}>Hide HSK 1-3</option>
                  <option value={4}>Hide HSK 1-4</option>
                </select>
              )}
            </div>

            {/* Grammar Highlighting */}
            <button
              onClick={() => setHighlightGrammar(h => !h)}
              className={`btn ${highlightGrammar ? 'btn-bamboo' : 'btn-secondary'}`}
              style={{ padding: '5px 10px', fontSize: '12px' }}
              title="Highlight HSK Grammar Patterns"
            >
              <Sparkles size={13} /> Grammar
            </button>

            {/* TRC-009: Cultural Context AI Notes */}
            <button
              onClick={() => setShowCulturalNotesModal(true)}
              className={`btn ${detectedCulturalNotes.length > 0 ? 'btn-bamboo' : 'btn-secondary'}`}
              style={{ padding: '5px 9px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              title={`Cultural Context AI Notes (TRC-009): ${detectedCulturalNotes.length} cultural nuances detected`}
            >
              <span>🏮</span> Culture {detectedCulturalNotes.length > 0 && `(${detectedCulturalNotes.length})`}
            </button>

            {/* SRS-007: Automated Cloze Mode Button */}
            <button
              onClick={() => setClozeModeEnabled(prev => !prev)}
              className={`btn ${clozeModeEnabled ? 'btn-bamboo' : 'btn-secondary'}`}
              style={{ padding: '5px 9px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              title={clozeModeEnabled ? 'Cloze Mode Active: Click blanks to practice due SRS words' : `Enable Cloze Mode (SRS-007): ${uniqueDueCount} due cards in this story`}
            >
              <HelpCircle size={13} /> Cloze ({uniqueDueCount})
            </button>

            {/* TRC-007: Top 500 Frequency Toggle & Analytics */}
            <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)' }}>
              <button
                onClick={() => setShowFrequencyOverlay(prev => !prev)}
                className={`btn ${showFrequencyOverlay ? 'btn-bamboo' : 'btn-secondary'}`}
                style={{ padding: '5px 8px', fontSize: '12px', border: 'none', borderRadius: '0' }}
                title="Toggle Top 500 Hanzi Highlighting (TRC-007)"
              >
                <BarChart3 size={13} /> Top 500: {showFrequencyOverlay ? 'On' : 'Off'}
              </button>
              <button
                onClick={() => setShowFrequencyModal(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderLeft: '1px solid var(--border-subtle)',
                  color: 'var(--accent-bamboo)',
                  padding: '5px 7px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="Click to view full frequency coverage analytics"
              >
                {frequencyStats.coveragePercent}%
              </button>
            </div>

            {/* GTU-008: Direct Print Story / Export PDF */}
            <button
              onClick={() => window.print()}
              className="btn btn-secondary"
              style={{ padding: '5px 9px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Print Story / Export PDF (GTU-008)"
            >
              <Printer size={13} /> Print / PDF
            </button>

            {/* Action Tools Dropdown Menu */}
            <div className="toolbar-menu-container" ref={actionsMenuRef}>
              <button
                onClick={() => setShowActionsMenu(prev => !prev)}
                className="btn btn-secondary"
                style={{ padding: '5px 10px', fontSize: '12px' }}
                title="Story actions and adjustments"
              >
                <MoreHorizontal size={14} /> Actions <ChevronDown size={12} />
              </button>

              {showActionsMenu && (
                <div className="toolbar-menu-popover">
                  {/* AIM-004: Real-time Difficulty Scaler (0ms In-Memory Simplifier) */}
                  <div style={{ padding: '4px 0 8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Instant HSK Scaler (0ms)
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                        HSK {realTimeHsk} {substitutions.length > 0 && `(${substitutions.length} swapped)`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={6}
                      value={realTimeHsk}
                      onChange={(e) => handleInstantScale(parseInt(e.target.value, 10))}
                      style={{ width: '100%', cursor: 'pointer' }}
                      title="Instant Vocabulary Difficulty Slider (AIM-004)"
                    />
                    {substitutions.length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <button
                          onClick={handleRevertScaling}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-seal)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                        >
                          <RotateCcw size={10} /> Revert to Original
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '6px 0 2px 0' }}>
                    AI Model Adjustments
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => {
                        onScaleDifficulty('simplify');
                        setShowActionsMenu(false);
                      }}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '5px 8px', fontSize: '12px' }}
                      title="Rewrite story via AI (HSK - 1)"
                    >
                      <TrendingDown size={13} /> AI Simplify
                    </button>
                    <button
                      onClick={() => {
                        onScaleDifficulty('harder');
                        setShowActionsMenu(false);
                      }}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '5px 8px', fontSize: '12px' }}
                      title="Rewrite story via AI (HSK + 1)"
                    >
                      <TrendingUp size={13} /> AI Harder
                    </button>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

                  <button
                    onClick={() => {
                      onSaveStory();
                      setShowActionsMenu(false);
                    }}
                    className="btn btn-secondary"
                    style={{ justifyContent: 'flex-start', padding: '6px 10px', fontSize: '12px' }}
                  >
                    <Save size={13} /> Save to Story Library
                  </button>
                  <button
                    onClick={() => {
                      setShowSubtitleModal(true);
                      setShowActionsMenu(false);
                    }}
                    className="btn btn-secondary"
                    style={{ justifyContent: 'flex-start', padding: '6px 10px', fontSize: '12px' }}
                  >
                    <Subtitles size={13} /> Export Subtitles (.srt / .vtt)
                  </button>
                  <button
                    onClick={() => {
                      setShowShareModal(true);
                      setShowActionsMenu(false);
                    }}
                    className="btn btn-secondary"
                    style={{ justifyContent: 'flex-start', padding: '6px 10px', fontSize: '12px' }}
                    title="Peer-to-Peer Story Sharing (GTU-005): Export .moyun.json or QR Code"
                  >
                    <Share2 size={13} /> Share Story (.moyun.json / QR)
                  </button>
                  <button
                    onClick={() => {
                      window.print();
                      setShowActionsMenu(false);
                    }}
                    className="btn btn-secondary"
                    style={{ justifyContent: 'flex-start', padding: '6px 10px', fontSize: '12px' }}
                  >
                    <Printer size={13} /> Print Story / Export PDF
                  </button>
                </div>
              )}
            </div>

            {/* Focus Immersion Mode */}
            <button
              onClick={() => setIsFocusMode(true)}
              className="btn btn-secondary"
              style={{ padding: '5px 8px' }}
              title="Full Screen Focus Immersion"
            >
              <Maximize2 size={13} />
            </button>
          </div>
        </div>
      )}

      {/* GTU-009: Focus Mode Ambient HUD */}
      {isFocusMode && (
        <div className="focus-mode-hud">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>{storyTitle || 'Mandarin Reader'}</span>
            <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
              HSK {hskLevel}
            </span>
            {currentCPM > 0 && (
              <span style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>
                {currentCPM} CPM
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setFocusFontSize(s => Math.max(16, s - 2))}
              className="btn btn-secondary"
              style={{ padding: '4px 8px', fontSize: '11px' }}
              title="Decrease Font Size"
            >
              A-
            </button>
            <button
              onClick={() => setFocusFontSize(s => Math.min(36, s + 2))}
              className="btn btn-secondary"
              style={{ padding: '4px 8px', fontSize: '11px' }}
              title="Increase Font Size"
            >
              A+
            </button>
            <button
              onClick={() => setIsFocusMode(false)}
              className="btn btn-secondary"
              style={{ padding: '5px 12px', fontSize: '12px', gap: '6px' }}
              title="Exit Focus Mode (Esc)"
            >
              <Minimize2 size={13} /> Exit (Esc)
            </button>
          </div>
        </div>
      )}

      {/* GTU-008: Publication Print Header (Appears only when printed / PDF exported) */}
      <div className="print-only print-story-header">
        <div className="print-branding">墨韵 Moyun · Mandarin Graded Reader</div>
        <h1 className="print-story-title">{convertScript(storyTitle || 'Mandarin Graded Story', scriptPreference)}</h1>
        <div className="print-metadata-row">
          <span>Target Level: HSK {hskLevel || '1'}</span>
          <span>Length: {tokens.filter(t => !t.isNonChinese).length} Characters</span>
          <span>Script: {scriptPreference === 'traditional' ? 'Traditional (繁體)' : 'Simplified (简体)'}</span>
          <span>Date: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Story Title (Web Screen View) */}
      <div className="print-hide">
        <h2 className="story-header-title">{convertScript(storyTitle || 'Mandarin Graded Story', scriptPreference)}</h2>
      </div>

      {/* Main Reading Flow: Paragraph-by-Paragraph with TRC-010 Translation, TRC-003 Tone Colors & ALS-001 Hover Audio */}
      <div 
        className={`${isVertical ? 'story-content-vertical' : 'story-content-horizontal'} ${isFocusMode ? 'focus-mode-body' : ''}`}
        style={{ fontSize: isFocusMode ? `${focusFontSize}px` : undefined }}
      >
        {paragraphs.map(para => {
          const isParaRevealed = revealedParagraphs[para.id];

          return (
            <div key={para.id} className="story-paragraph">
              {para.sentences.map(sentence => {
                const isPacing = activePacingSentence === sentence.id;
                const isRevealed = revealedTranslations[sentence.id];

                return (
                  <React.Fragment key={sentence.id}>
                    <span
                      className={`sentence-span ${isPacing ? 'pacing-highlight' : ''}`}
                      onClick={() => handleToggleTranslation(sentence.id, sentence.text)}
                      title="Click to toggle English translation & grammar analysis"
                    >
                      {sentence.tokens.map((tokenObj, idx) => {
                        const token = tokenObj.item;
                        const grammarMatch = tokenObj.grammarMatch;
                        const hideForLevel = pinyinDisplayMode === 'level' && token.hsk_level && !isNaN(parseInt(token.hsk_level, 10)) && parseInt(token.hsk_level, 10) <= hidePinyinLevel;

                        // SRS-007: Automated Cloze Mode Check
                        const isDueInSrs = clozeModeEnabled && dueCardMap.has(token.character);
                        const clozeStatus = clozeFeedback[token.character];

                        // TRC-007: Top 500 Frequency check
                        const isTop500 = token.frequency_rank && parseInt(token.frequency_rank, 10) <= 500;

                        // AIM-004: Real-time difficulty substitution check
                        const isSubstituted = substitutions.some(s => s.toWord === token.character);

                        if (isDueInSrs && !clozeStatus) {
                          return (
                            <span
                              key={idx}
                              className="srs-cloze-target-blank"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveClozeCard(dueCardMap.get(token.character)!);
                              }}
                              title={`SRS Cloze Drill: Click to recall "${token.definition || 'Definition'}"`}
                            >
                              [ ❓ 填空 ]
                            </span>
                          );
                        }

                        // TRC-004: Adaptive Pinyin Fading
                        const isMasteredInSRS = masteredChars.has(token.character);
                        const isAdaptiveFaded = pinyinDisplayMode === 'adaptive' && isMasteredInSRS;
                        const displayPinyin = showPinyin && !hideForLevel && token.pinyin && !token.isNonChinese;

                        const polyphone = checkPolyphone(token.character);

                        // TRC-001: Script conversion (Simplified vs Traditional)
                        const displayChar = convertScript(token.character, scriptPreference);

                        // TRC-003: Tone Color Coding
                        const toneColor = token.pinyin ? getToneColor(token.pinyin) : undefined;
                        const applyPinyinTone = (toneColorMode === 'pinyin' || toneColorMode === 'both') && toneColor;
                        const applyHanziTone = toneColorMode === 'both' && toneColor;

                        const clozeClass = clozeStatus === 'correct' ? 'srs-cloze-correct' : clozeStatus === 'incorrect' ? 'srs-cloze-incorrect' : '';
                        const freqClass = (isTop500 && showFrequencyOverlay) ? 'frequency-top-500' : '';
                        const subClass = isSubstituted ? 'token-substituted' : '';
                        const chengyuClass = token.isChengyu ? 'token-chengyu' : '';

                        return (
                          <span
                            key={idx}
                            className={`hanzi-chip ${polyphone ? 'polyphone-flag' : ''} ${grammarMatch ? 'grammar-highlight' : ''} ${isAdaptiveFaded ? 'mastered-token' : ''} ${clozeClass} ${freqClass} ${subClass} ${chengyuClass}`}
                            data-freq-rank={isTop500 ? `#${token.frequency_rank}` : undefined}
                            title={
                              token.isChengyu
                                ? `[成语 Chengyu: ${token.character}]\nLiteral: ${token.chengyuLiteral}\nFigurative: ${token.definition}`
                                : grammarMatch 
                                  ? `[${grammarMatch.patternName}]\nFormula: ${grammarMatch.formula}\n${grammarMatch.explanation}` 
                                  : isAdaptiveFaded 
                                    ? `Mastered in SRS (interval >= 14d) — Hover to reveal Pinyin` 
                                    : isSubstituted
                                      ? `Scaled Vocabulary: ${token.definition}`
                                      : undefined
                            }
                            onMouseEnter={() => handleTokenHover(token.character)}
                            onMouseLeave={handleTokenLeave}
                            onClick={(e) => {
                              e.stopPropagation();
                              onCharClick(token, e, sentence.text);
                            }}
                          >
                            {displayPinyin && (
                              <span
                                className={`pinyin-above ${isAdaptiveFaded ? 'pinyin-adaptive-hidden' : ''}`}
                                style={{
                                  color: applyPinyinTone ? toneColor : undefined,
                                  fontFamily: phoneticNotation === 'zhuyin' ? 'var(--font-zh)' : undefined,
                                  letterSpacing: phoneticNotation === 'zhuyin' ? '0.05em' : undefined
                                }}
                              >
                                {phoneticNotation === 'zhuyin' ? pinyinToZhuyin(token.pinyin) : token.pinyin}
                              </span>
                            )}
                            <span
                              className={token.character.match(/^\d+$/) ? 'tcy' : ''}
                              style={{ color: applyHanziTone ? toneColor : undefined }}
                            >
                              {displayChar}
                            </span>
                          </span>
                        );
                      })}
                    </span>

                    {/* Inline sentence translation reveal */}
                    {isRevealed && (
                      <div className="sentence-translation-box print-hide">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, fontSize: '12px', color: 'var(--accent-gold)' }}>
                          <Languages size={14} /> Sentence Translation & Analysis:
                        </div>
                        <div style={{ marginTop: '6px', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                          "{sentence.text}" — Click right-pane grammar explainer for complete structural breakdown.
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

              {/* TRC-010: Contextual Paragraph Translation Toggle */}
              {!isVertical && (
                <div className="paragraph-actions print-hide">
                  <button
                    onClick={() => setRevealedParagraphs(prev => ({ ...prev, [para.id]: !prev[para.id] }))}
                    className="paragraph-translate-btn"
                    title="Toggle paragraph translation"
                  >
                    <Languages size={11} /> {isParaRevealed ? 'Hide Paragraph Translation' : 'Paragraph Translation'}
                  </button>
                </div>
              )}

              {isParaRevealed && (
                <div className="paragraph-translation-card print-hide">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '11px', color: 'var(--accent-gold)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    <Languages size={13} /> Paragraph Context
                  </div>
                  <div>
                    {para.text}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* GTU-008: Printable Vocabulary Glossary Appendix (Only visible in Print / PDF Export) */}
        <div className="print-only print-glossary-section">
          <div className="print-glossary-title">Vocabulary Glossary (生词表)</div>
          <table className="print-glossary-table">
            <thead>
              <tr>
                <th style={{ width: '18%' }}>Character</th>
                <th style={{ width: '22%' }}>Pinyin</th>
                <th style={{ width: '15%' }}>Level</th>
                <th style={{ width: '45%' }}>Definition</th>
              </tr>
            </thead>
            <tbody>
              {glossaryItems.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 'bold', fontFamily: 'Songti SC, SimSun, serif', fontSize: '12pt' }}>
                    {convertScript(item.character, scriptPreference)}
                  </td>
                  <td>{item.pinyin}</td>
                  <td>HSK {item.hsk_level || '1'}</td>
                  <td>{item.definition}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="print-footer">
            Generated via Moyun 墨韵 — Offline-First Mandarin Graded Reader & Spoken Studio
          </div>
        </div>
      </div>

      {/* HSK Grammar Pattern Breakdown Panel (when grammar toggle is active) */}
      {!isFocusMode && highlightGrammar && (
        <div className="grammar-panel print-hide">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="var(--accent-gold)" />
              <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
                HSK Grammar Patterns ({grammarMatches.length})
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {grammarMatches.length > 0 ? 'Syntactic structures underlined in gold in the text' : 'No target patterns detected in this story'}
              </span>
              <button
                onClick={() => setShowGrammarDirectoryModal(true)}
                className="btn btn-secondary"
                style={{ padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-gold)' }}
                title="Open HSK Grammar Pattern Directory & Personal Corpus (AIM-006)"
              >
                <BookOpen size={12} /> Grammar Directory
              </button>
            </div>
          </div>

          {grammarMatches.length === 0 ? (
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No complex HSK grammar patterns detected in this passage. Try clicking "Harder" in Actions or generating an HSK 2+ story!
            </p>
          ) : (
            <div className="grammar-cards-grid">
              {grammarMatches.map((match, idx) => (
                <div key={idx} className="grammar-pattern-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-gold)' }}>
                      {match.patternName}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      fontWeight: 600
                    }}>
                      HSK {match.hskLevel}
                    </span>
                  </div>

                  <div style={{
                    fontFamily: 'var(--font-serif-zh)',
                    fontSize: '15px',
                    padding: '6px 8px',
                    backgroundColor: 'var(--bg-surface)',
                    borderLeft: '2px solid var(--accent-gold)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)'
                  }}>
                    "{match.matchedText}"
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {match.formula}
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {match.explanation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Choose Your Own Adventure Branching Continuation */}
      {!isFocusMode && (
        <div style={{
          marginTop: '36px',
          padding: '24px',
          backgroundColor: 'var(--bg-panel)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }} className="print-hide">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--accent-gold)" />
            <span style={{ fontSize: '13px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
              Choose Your Own Adventure (Story Branching)
            </span>
          </div>

          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
            Choose a narrative path below or type a custom direction. The engine will synthesize the next chapter continuing this branch at HSK {hskLevel}.
          </p>

          {/* GTU-007: Dynamic Grammatically Constrained Story Branch Choices */}
          {(() => {
            const rawStory = tokens.map(t => t.character).join('');
            const branches = generateAdventureBranches(rawStory, parseInt(hskLevel, 10) || 1);
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', margin: '4px 0' }}>
                {branches.map((branch, bi) => (
                  <button
                    key={branch.id}
                    onClick={() => onContinueStory(branch.chinese)}
                    disabled={isContinuing}
                    style={{
                      textAlign: 'left',
                      padding: '12px 14px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: isContinuing ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isContinuing) {
                        e.currentTarget.style.borderColor = 'var(--accent-gold)';
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isContinuing) {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--accent-gold)' }}>
                        Branch {String.fromCharCode(65 + bi)} • {branch.tone}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>HSK {branch.hskLevel}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-serif-zh)', fontSize: '15px', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {convertScript(branch.chinese, scriptPreference)}
                    </div>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>
                      {branch.pinyin}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      "{branch.english}"
                    </div>
                  </button>
                ))}
              </div>
            );
          })()}

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <input
              type="text"
              value={continuationInput}
              onChange={(e) => setContinuationInput(e.target.value)}
              placeholder="Or enter a custom story direction in Chinese or English..."
              className="form-input"
              disabled={isContinuing}
            />
            <button
              onClick={() => {
                if (continuationInput.trim()) {
                  onContinueStory(continuationInput.trim());
                  setContinuationInput('');
                }
              }}
              disabled={isContinuing || !continuationInput.trim()}
              className="btn btn-primary"
              style={{ whiteSpace: 'nowrap' }}
            >
              {isContinuing ? 'Generating...' : 'Continue Custom'}
            </button>
          </div>
        </div>
      )}

      {/* GTU-002: Reading Velocity & Fluency Analytics Modal */}
      <ReadingVelocityModal
        isOpen={showVelocityModal}
        onClose={() => setShowVelocityModal(false)}
        currentCPM={currentCPM}
        sessionElapsedSeconds={sessionElapsedSeconds}
        sessionCharsRead={tokens.filter(t => !t.isNonChinese).length}
        storyTitle={storyTitle}
        hskLevel={hskLevel}
      />

      {/* AIM-008: Subtitles Export Modal */}
      <SubtitleExportModal
        isOpen={showSubtitleModal}
        onClose={() => setShowSubtitleModal(false)}
        storyTitle={storyTitle}
        sentences={subtitleSentences}
        currentSpeed={ttsSpeed}
      />

      {/* TRC-007: Top 500 Frequency Coverage Modal */}
      <FrequencyCoverageModal
        isOpen={showFrequencyModal}
        onClose={() => setShowFrequencyModal(false)}
        totalChinese={frequencyStats.totalChinese}
        top100Count={frequencyStats.top100Count}
        top250Count={frequencyStats.top250Count}
        top500Count={frequencyStats.top500Count}
        rareCount={frequencyStats.rareCount}
        topWords={frequencyStats.topWords}
      />

      {/* SRS-007: Story Cloze Test Recall Modal */}
      {activeClozeCard && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '24px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-gold)' }}>
                📝 Active Recall Cloze (SRS-007)
              </span>
              <button
                onClick={() => setActiveClozeCard(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                title="Close"
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              "{activeClozeCard.definition}"
            </div>
            <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)', marginBottom: '20px' }}>
              Pinyin: {activeClozeCard.pinyin}
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Which character completes the sentence?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
              {clozeOptions.map(option => {
                const isSelected = clozeFeedback[activeClozeCard.character] !== undefined;
                let btnBg = 'var(--bg-panel)';
                let btnBorder = 'var(--border-subtle)';
                let textColor = 'var(--text-primary)';

                if (isSelected) {
                  if (option === activeClozeCard.character) {
                    btnBg = 'rgba(74, 222, 128, 0.2)';
                    btnBorder = 'var(--accent-bamboo)';
                    textColor = 'var(--accent-bamboo)';
                  } else {
                    btnBg = 'rgba(239, 68, 68, 0.1)';
                    textColor = 'var(--text-muted)';
                  }
                }

                return (
                  <button
                    key={option}
                    onClick={() => handleClozeAnswer(option)}
                    disabled={isSelected}
                    style={{
                      padding: '16px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: btnBg,
                      border: `2px solid ${btnBorder}`,
                      fontSize: '28px',
                      fontFamily: 'var(--font-serif-zh)',
                      color: textColor,
                      cursor: isSelected ? 'default' : 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {convertScript(option, scriptPreference)}
                  </button>
                );
              })}
            </div>

            {clozeFeedback[activeClozeCard.character] && (
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: clozeFeedback[activeClozeCard.character] === 'correct' ? 'var(--accent-bamboo)' : 'var(--accent-seal)'
              }}>
                {clozeFeedback[activeClozeCard.character] === 'correct' ? '✨ Correct! SRS interval updated.' : `❌ Incorrect! Character is ${activeClozeCard.character}`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AIM-006: Grammar Pattern Directory Modal */}
      <GrammarDirectoryModal
        isOpen={showGrammarDirectoryModal}
        onClose={() => setShowGrammarDirectoryModal(false)}
      />

      {/* GTU-005: Peer-to-Peer Story Sharing Modal */}
      <StoryShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        storyTitle={storyTitle}
        storyText={tokens.map(t => t.character).join('')}
        hskLevel={hskLevel}
        tokens={tokens}
        onImportStory={(pkg) => {
          if (onImportStory) {
            onImportStory(pkg);
          }
        }}
      />

      {/* TRC-009: Cultural Context AI Notes Modal */}
      <CulturalNotesModal
        isOpen={showCulturalNotesModal}
        onClose={() => setShowCulturalNotesModal(false)}
        detectedNotes={detectedCulturalNotes}
      />
    </div>
  );
};
