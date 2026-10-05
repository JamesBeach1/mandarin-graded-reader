import React, { useState, useRef, useEffect } from 'react';
import type { LanguageIsland, IslandSentence } from '../../types/Island';
import { IslandAiService, type TranslatedIslandSentence } from '../../services/islandAiService';
import { 
  Mic, Square, Sparkles, Plus, Check, Volume2, 
  Trash2, Edit3, ArrowRight, RefreshCw, AlertCircle, HelpCircle, ShieldCheck
} from 'lucide-react';
import { AzureSpeechService } from '../../services/azureSpeech';
import { StorageService, STORAGE_KEYS } from '../../services/storage';
import { ToastStore } from '../../services/toastStore';

interface SentenceCollectorViewProps {
  islands: LanguageIsland[];
  preselectedIslandId?: string | null;
  hanziData?: any[];
  onSentencesAdded: (islandId: string, newSentences: IslandSentence[]) => void;
  onNavigateToHub: () => void;
}

const REALISTIC_SCENARIO_PROMPTS = [
  {
    icon: '🦷',
    label: 'Dentist & Clinic',
    scenario: 'Visiting the dentist for a toothache, tooth cleaning, cavities, and X-ray checkup'
  },
  {
    icon: '🏠',
    label: 'Landlord & Maintenance',
    scenario: 'Calling the landlord about a leaking pipe, air conditioner not cooling, paying utilities, and renewing the lease'
  },
  {
    icon: '🐾',
    label: 'Vet & Sick Pet',
    scenario: 'Taking a cat to the vet clinic for vomiting, lack of appetite, medication, and blood checkup'
  },
  {
    icon: '☕',
    label: 'Ordering Bubble Tea',
    scenario: 'Ordering milk tea with custom sweetness (微糖), ice level, oat milk substitute, and adding boba pearls'
  },
  {
    icon: '📦',
    label: 'Express Courier & Locker',
    scenario: 'Talking to the courier about package delivery code, delivery locker, holding packages, and damaged parcels'
  },
  {
    icon: '🚕',
    label: 'Taxi & Didi Ride',
    scenario: 'Directing a taxi driver, asking to turn on the AC, dropping off across the street, and scanning payment code'
  },
  {
    icon: '💼',
    label: 'Workplace & Overtime',
    scenario: 'Declining weekend overtime politely, asking a colleague for a spreadsheet link, and wrapping up Friday tasks'
  },
  {
    icon: '💇',
    label: 'Salon & Haircut',
    scenario: 'Telling the barber to trim just the ends, keep the bangs long, thin out the sides, and wash with warm water'
  }
];

const EXAMPLE_NARRATIONS = [
  {
    title: 'Morning Routine (晨间生活)',
    text: "I need to wake up earlier tomorrow.\nI'm making scrambled eggs and toast for breakfast.\nDid anyone see my water bottle?\nTraffic is probably going to be terrible today."
  },
  {
    title: 'Workplace & Remote (远程与职场)',
    text: "Could someone please send the zoom link?\nI'll share my screen and walk through the slides.\nLet's take this offline and follow up via email.\nI have back-to-back meetings all afternoon."
  },
  {
    title: 'Dinner & Social (聚餐与闲聊)',
    text: "Have you guys tried that new noodle spot down the street?\nI'm craving something really spicy tonight.\nLet's get dessert after we finish here.\nI'm so exhausted, I think I'm going straight to bed."
  }
];

export const SentenceCollectorView: React.FC<SentenceCollectorViewProps> = ({
  islands,
  preselectedIslandId,
  hanziData = [],
  onSentencesAdded,
  onNavigateToHub
}) => {
  const [selectedIslandId, setSelectedIslandId] = useState<string>(
    preselectedIslandId || (islands[0]?.id || '')
  );
  const [inputMode, setInputMode] = useState<'dictate' | 'scenario'>('dictate');
  const [scenarioPrompt, setScenarioPrompt] = useState('');
  const [scenarioCount, setScenarioCount] = useState<number>(8);
  const [scenarioHsk, setScenarioHsk] = useState<string>('HSK 3 Practical Spoken');
  const [rawText, setRawText] = useState('');
  const [translationEngine, setTranslationEngine] = useState<'gemini' | 'google'>('google');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResults, setTranslationResults] = useState<TranslatedIslandSentence[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Audio testing
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  // Speech recognition ref
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (preselectedIslandId) {
      setSelectedIslandId(preselectedIslandId);
    } else if (islands.length > 0 && !selectedIslandId) {
      setSelectedIslandId(islands[0].id);
    }
  }, [preselectedIslandId, islands]);

  // Handle Speech-to-Text Dictation (Narrate your life)
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      ToastStore.warning('Speech recognition is not supported in this browser. Please use Chrome, Edge, or type your sentences directly.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let accumulated = rawText ? rawText + '\n' : '';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript.trim();
            if (transcript) {
              accumulated += (accumulated.endsWith('\n') || !accumulated ? '' : '\n') + transcript;
              setRawText(accumulated);
            }
          }
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsRecording(false);
    }
  };

  // Run AI Translation
  const handleTranslate = async () => {
    const lines = rawText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) {
      setErrorMsg('Please enter or dictate at least one English sentence.');
      return;
    }

    setIsTranslating(true);
    setErrorMsg(null);

    const island = islands.find(i => i.id === selectedIslandId);
    const context = island ? island.title : 'Daily Life';

    try {
      const results = await IslandAiService.translateToSpokenMandarin(lines, context, translationEngine, hanziData);
      setTranslationResults(results);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to generate Mandarin translations. Check your internet connection or Gemini API key.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Generate realistic scenario sentences
  const handleGenerateScenario = async (promptOverride?: string) => {
    const textToUse = (promptOverride ?? scenarioPrompt).trim();
    if (!textToUse) {
      setErrorMsg('Please enter a scenario description or click one of the realistic scenario chips.');
      return;
    }

    setIsTranslating(true);
    setErrorMsg(null);

    const island = islands.find(i => i.id === selectedIslandId);
    const category = (island?.category as any) || 'daily';

    try {
      const res = await IslandAiService.generateRealisticScenarioIsland(textToUse, {
        category,
        count: scenarioCount,
        hskLevel: scenarioHsk
      });
      if (res && res.sentences && res.sentences.length > 0) {
        setTranslationResults(res.sentences);
      } else {
        throw new Error('No sentences could be generated. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to generate realistic scenario sentences.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Audio preview for translated sentence
  const handlePlayPreview = (chinese: string, idx: number) => {
    setPlayingIdx(idx);
    AzureSpeechService.speak(
      chinese,
      {},
      () => setPlayingIdx(null),
      () => setPlayingIdx(null)
    );
  };

  // Remove individual translated sentence from candidate list
  const handleRemoveCandidate = (index: number) => {
    setTranslationResults(prev => prev.filter((_, i) => i !== index));
  };

  // Confirm and save to Island
  const handleSaveToIsland = () => {
    if (!selectedIslandId) {
      setErrorMsg('Please select a target Language Island.');
      return;
    }
    if (translationResults.length === 0) return;

    setIsSaving(true);
    const newItems: IslandSentence[] = translationResults.map((r, i) => ({
      id: `sent-custom-${Date.now()}-${i}`,
      islandId: selectedIslandId,
      english: r.english,
      chinese: r.chinese,
      pinyin: r.pinyin,
      notes: r.notes,
      hskLevel: r.hskLevel || 3,
      masteryLevel: 0,
      timesReviewed: 0,
      struggleCount: 0,
      createdAt: Date.now() + i
    }));

    onSentencesAdded(selectedIslandId, newItems);
    setRawText('');
    setTranslationResults([]);
    setIsSaving(false);
    onNavigateToHub();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Step 1 Blueprint Explanation Banner */}
      <div style={{
        padding: '20px 24px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ maxWidth: '720px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '20px' }}>🎙️</span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Sentence Collector: Dictate Your Life
            </h3>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              backgroundColor: 'rgba(88,204,2,0.1)',
              color: 'var(--accent-bamboo)',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 600
            }}>
              Personal Blueprint
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Talk to yourself out loud. Narrate what you are doing, eating, thinking, or complaining about. The AI converts your real-world phrases into authentic, colloquial Mandarin so you learn sentences you actually need.
          </p>
        </div>

        {/* Target Island Dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Destination Island:
          </label>
          <select
            value={selectedIslandId}
            onChange={(e) => setSelectedIslandId(e.target.value)}
            className="form-select"
            style={{ minWidth: '220px', height: '36px', fontSize: '13px' }}
          >
            {islands.map(i => (
              <option key={i.id} value={i.id}>
                {i.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Input Section with Mode Switcher */}
      <div style={{
        padding: '24px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}>
        {/* Mode Switcher Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '14px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-base)',
            padding: '3px',
            borderRadius: 'var(--radius-sm)'
          }}>
            <button
              type="button"
              onClick={() => setInputMode('dictate')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: inputMode === 'dictate' ? 'var(--bg-surface)' : 'transparent',
                color: inputMode === 'dictate' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: inputMode === 'dictate' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <Mic size={13} />
              <span>Voice & Free Dictation</span>
            </button>

            <button
              type="button"
              onClick={() => setInputMode('scenario')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: inputMode === 'scenario' ? 'var(--bg-surface)' : 'transparent',
                color: inputMode === 'scenario' ? 'var(--accent-gold, #d97706)' : 'var(--text-muted)',
                boxShadow: inputMode === 'scenario' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <Sparkles size={13} />
              <span>AI Scenario Generator (Realistic Batch Fill)</span>
            </button>
          </div>

          {inputMode === 'scenario' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: 'var(--accent-bamboo, #10b981)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-pill)'
            }}>
              <ShieldCheck size={13} />
              <span>Anti-Fantasy Filter Active (Mundane Everyday Chinese)</span>
            </div>
          )}
        </div>

        {/* MODE 1: Voice & Free Dictation */}
        {inputMode === 'dictate' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={toggleRecording}
                  className={`btn ${isRecording ? 'btn-danger' : 'btn-secondary'}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    backgroundColor: isRecording ? '#e74c3c' : undefined,
                    color: isRecording ? '#fff' : undefined,
                    borderColor: isRecording ? '#c0392b' : undefined
                  }}
                  title="Click to dictate out loud using speech-to-text"
                >
                  {isRecording ? <Square size={14} /> : <Mic size={14} />}
                  <span>{isRecording ? 'Listening (Speak your life)...' : 'Dictate Out Loud'}</span>
                </button>

                {isRecording && (
                  <span style={{ fontSize: '12px', color: '#e74c3c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="pulse-dot" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e74c3c' }} />
                    Recording English narration...
                  </span>
                )}
              </div>

              {/* Quick Example Presets */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Examples:</span>
                {EXAMPLE_NARRATIONS.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setRawText(ex.text)}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-pill)',
                      padding: '3px 10px',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {ex.title}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Type or dictate your sentences here (one sentence per line)...&#10;e.g.&#10;I'm making coffee and checking my messages.&#10;This meeting could definitely have been an email.&#10;What do you recommend we order here?"
              className="form-input"
              style={{
                width: '100%',
                height: '140px',
                fontSize: '14px',
                lineHeight: 1.6,
                resize: 'vertical',
                padding: '12px'
              }}
            />

            {/* Action Button & Engine Selector */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Translation Engine:</span>
                <div style={{ display: 'flex', backgroundColor: 'var(--bg-base)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
                  <button
                    type="button"
                    onClick={() => setTranslationEngine('google')}
                    style={{
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      backgroundColor: translationEngine === 'google' ? 'var(--accent-bamboo)' : 'transparent',
                      color: translationEngine === 'google' ? '#fff' : 'var(--text-muted)'
                    }}
                    title="100% Free, zero AI quota usage, instant ~150ms translation"
                  >
                    ⚡ Free Google (Fast & Free)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTranslationEngine('gemini')}
                    style={{
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      backgroundColor: translationEngine === 'gemini' ? 'var(--accent-sky)' : 'transparent',
                      color: translationEngine === 'gemini' ? '#fff' : 'var(--text-muted)'
                    }}
                    title="Uses Gemini for authentic colloquial spoken phrasing and grammar notes"
                  >
                    ✨ Gemini AI (Colloquial & Notes)
                  </button>
                </div>
              </div>

              <button
                onClick={handleTranslate}
                disabled={isTranslating || !rawText.trim()}
                className="btn btn-bamboo"
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 600
                }}
              >
                {isTranslating ? (
                  <>
                    <RefreshCw size={15} className="spin" />
                    <span>Translating to Mandarin...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>{translationEngine === 'google' ? 'Translate (Free & Instant)' : 'Translate with Gemini AI'}</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* MODE 2: AI Scenario Generator (Realistic Batch Fill) */}
        {inputMode === 'scenario' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Quick Inspiration Chips */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Pick a realistic everyday scenario:
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Click to fill and generate realistic phrases
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {REALISTIC_SCENARIO_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setScenarioPrompt(item.scenario);
                      handleGenerateScenario(item.scenario);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 11px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                    className="hover-subtle"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Scenario Prompt Area */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Or describe your realistic everyday situation:
              </label>
              <textarea
                value={scenarioPrompt}
                onChange={(e) => setScenarioPrompt(e.target.value)}
                placeholder="e.g., Calling landlord about leaking sink; asking dentist if a root canal is needed; ordering milk tea with 30% sweetness and no ice..."
                className="form-input"
                rows={3}
                style={{
                  width: '100%',
                  fontSize: '13px',
                  padding: '10px 12px',
                  lineHeight: 1.5,
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Scenario Options & Generate Button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Phrases:</span>
                  <select
                    value={scenarioCount}
                    onChange={(e) => setScenarioCount(Number(e.target.value))}
                    className="form-select"
                    style={{ height: '32px', fontSize: '12px', padding: '2px 8px' }}
                  >
                    <option value={5}>5 sentences</option>
                    <option value={8}>8 sentences</option>
                    <option value={10}>10 sentences</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Difficulty:</span>
                  <select
                    value={scenarioHsk}
                    onChange={(e) => setScenarioHsk(e.target.value)}
                    className="form-select"
                    style={{ height: '32px', fontSize: '12px', padding: '2px 8px' }}
                  >
                    <option value="HSK 2 Spoken Core">HSK 2 Spoken Core</option>
                    <option value="HSK 3 Practical Spoken">HSK 3 Practical Spoken</option>
                    <option value="HSK 4 Nuanced Spoken">HSK 4 Nuanced Spoken</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleGenerateScenario()}
                disabled={isTranslating || !scenarioPrompt.trim()}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: 'var(--accent-gold, #d97706)',
                  borderColor: 'var(--accent-gold, #d97706)'
                }}
              >
                {isTranslating ? (
                  <>
                    <RefreshCw size={14} className="spin-slow" />
                    <span>Generating Realistic Sentences...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Generate Realistic Sentences</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(231,76,60,0.1)',
            border: '1px solid rgba(231,76,60,0.3)',
            borderRadius: 'var(--radius-sm)',
            color: '#e74c3c',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Translation Results Review Stage */}
      {translationResults.length > 0 && (
        <div style={{
          padding: '24px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                Review Generated Phrases ({translationResults.length})
              </h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Listen to the native cadence and check the breakdown before saving to your island.
              </p>
            </div>

            <button
              onClick={handleSaveToIsland}
              disabled={isSaving}
              className="btn btn-bamboo"
              style={{
                padding: '9px 18px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600
              }}
            >
              <Check size={14} />
              <span>Save All to Island</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {translationResults.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-base)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-serif-zh)' }}>
                      {item.chinese}
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      {item.pinyin}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    "{item.english}"
                  </div>

                  {item.notes && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      💡 {item.notes} {item.hskLevel && `• HSK ${item.hskLevel}`}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handlePlayPreview(item.chinese, idx)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Preview native audio"
                  >
                    <Volume2 size={13} className={playingIdx === idx ? 'spin' : ''} />
                    <span>Play</span>
                  </button>

                  <button
                    onClick={() => handleRemoveCandidate(idx)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                    title="Remove this sentence"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              onClick={handleSaveToIsland}
              disabled={isSaving}
              className="btn btn-bamboo"
              style={{
                padding: '10px 22px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600
              }}
            >
              <Check size={15} />
              <span>Confirm & Add to "{islands.find(i => i.id === selectedIslandId)?.title}"</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
