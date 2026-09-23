import React, { useState } from 'react';
import { Volume2, Award, Download, Upload, Zap, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from './common/Modal';
import { applyTheme } from '../services/themeEngine';
import { exportStateBundle, importStateBundle } from '../services/stateHydration';
import { REGIONAL_ACCENT_PROFILES, saveStoredAccent, type RegionalAccent } from '../utils/accentProfiles';
import type { TtsEngine, NeuralVoice, VoiceOption } from '../services/azureSpeech';
import { StorageService, STORAGE_KEYS } from '../services/storage';
import { AVAILABLE_GEMINI_MODELS, DEFAULT_GEMINI_MODEL, fetchAvailableGeminiModels } from '../services/gemini';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  azureKey: string;
  setAzureKey: (key: string) => void;
  azureRegion: string;
  setAzureRegion: (region: string) => void;
  selectedTtsEngine: TtsEngine;
  setSelectedTtsEngine: (engine: TtsEngine) => void;
  selectedAzureVoice: NeuralVoice;
  setSelectedAzureVoice: (voice: NeuralVoice) => void;
  selectedSystemVoice: string;
  setSelectedSystemVoice: (voice: string) => void;
  appSystemVoices: VoiceOption[];
  appRegionalAccent: RegionalAccent;
  setAppRegionalAccent: (accent: RegionalAccent) => void;
  isTestingVoice: boolean;
  onTestVoice: () => void;
  currentThemeId: string;
  setCurrentThemeId: (theme: string) => void;
  onOpenDiagnostic: () => void;
  onStateRestored: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  setApiKey,
  azureKey,
  setAzureKey,
  azureRegion,
  setAzureRegion,
  selectedTtsEngine,
  setSelectedTtsEngine,
  selectedAzureVoice,
  setSelectedAzureVoice,
  selectedSystemVoice,
  setSelectedSystemVoice,
  appSystemVoices,
  appRegionalAccent,
  setAppRegionalAccent,
  isTestingVoice,
  onTestVoice,
  currentThemeId,
  setCurrentThemeId,
  onOpenDiagnostic,
  onStateRestored
}) => {
  const [selectedGeminiModel, setSelectedGeminiModel] = useState<string>(() => 
    StorageService.getItem(STORAGE_KEYS.GEMINI_MODEL, DEFAULT_GEMINI_MODEL)
  );
  const [isDetectingModels, setIsDetectingModels] = useState(false);
  const [detectedModels, setDetectedModels] = useState<string[]>([]);
  const [detectionStatus, setDetectionStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleAutoDetectModels = async () => {
    if (!apiKey.trim()) {
      setDetectionStatus({ type: 'error', message: 'Please enter your Google Gemini API Key above first.' });
      return;
    }
    setIsDetectingModels(true);
    setDetectionStatus(null);
    try {
      const models = await fetchAvailableGeminiModels(apiKey);
      if (models.length === 0) {
        setDetectionStatus({
          type: 'error',
          message: 'No models with content generation support were returned for this API key.'
        });
      } else {
        setDetectedModels(models);
        // Find best candidate from detected models
        const candidatePriority = [
          'gemini-2.5-flash',
          'gemini-2.5-flash-lite',
          'gemini-3.8-flash',
          'gemini-3.5-flash',
          'gemini-3.1-flash-lite',
          'gemini-2.5-pro',
          'gemini-2.0-flash',
          'gemini-1.5-flash'
        ];
        const bestModel = candidatePriority.find(c => models.includes(c)) || models[0];
        setSelectedGeminiModel(bestModel);
        StorageService.setItem(STORAGE_KEYS.GEMINI_MODEL, bestModel);
        setDetectionStatus({
          type: 'success',
          message: `Active models found (${models.length}): Auto-selected "${bestModel}"`
        });
      }
    } catch (err: any) {
      setDetectionStatus({
        type: 'error',
        message: err?.message || 'Failed to connect to Google API. Check API key or quota.'
      });
    } finally {
      setIsDetectingModels(false);
    }
  };

  const handleImportStateFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await importStateBundle(file);
    alert(res.message);
    if (res.success) {
      onStateRestored();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" maxWidth="540px">
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
              StorageService.setItem(STORAGE_KEYS.GEMINI_API_KEY, e.target.value);
            }}
            placeholder="Enter Gemini API key"
            className="form-input"
          />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Used for generating graded stories, lessons, and voice roleplay.
          </span>
        </div>

        {/* Gemini AI Model Selector */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
              Gemini AI Model
            </label>
            <button
              type="button"
              onClick={handleAutoDetectModels}
              disabled={isDetectingModels}
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: 'var(--radius-pill)' }}
              title="Query Google API to find all active models enabled for your key"
            >
              <RefreshCw size={11} className={isDetectingModels ? 'spin' : ''} />
              {isDetectingModels ? 'Checking Google...' : 'Auto-Detect Models'}
            </button>
          </div>

          <select
            value={selectedGeminiModel}
            onChange={(e) => {
              setSelectedGeminiModel(e.target.value);
              StorageService.setItem(STORAGE_KEYS.GEMINI_MODEL, e.target.value);
              setDetectionStatus(null);
            }}
            className="form-select"
            style={{ width: '100%', marginBottom: '4px' }}
          >
            {/* Standard Curated Models */}
            <optgroup label="Recommended Production Models">
              {AVAILABLE_GEMINI_MODELS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.badge}
                </option>
              ))}
            </optgroup>

            {/* Any dynamically discovered models for this specific key */}
            {detectedModels.length > 0 && (
              <optgroup label="Live Models Detected on Your Key">
                {detectedModels
                  .filter(id => !AVAILABLE_GEMINI_MODELS.some(m => m.id === id))
                  .map(id => (
                    <option key={id} value={id}>
                      {id} (Active)
                    </option>
                  ))}
              </optgroup>
            )}
          </select>

          {detectionStatus ? (
            <div
              style={{
                marginTop: '6px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: detectionStatus.type === 'success' ? 'rgba(88, 204, 2, 0.1)' : 'rgba(235, 87, 87, 0.1)',
                color: detectionStatus.type === 'success' ? 'var(--accent-bamboo)' : 'var(--accent-seal)',
                border: `1px solid ${detectionStatus.type === 'success' ? 'rgba(88, 204, 2, 0.3)' : 'rgba(235, 87, 87, 0.3)'}`
              }}
            >
              {detectionStatus.type === 'success' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
              <span>{detectionStatus.message}</span>
            </div>
          ) : (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Gemini 2.5 Flash is Google's active workhorse (~0.8s). Click "Auto-Detect Models" to test your API key against Google.
            </span>
          )}
        </div>

        {/* Voice & Speech Fidelity Settings */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
              Voice Synthesis Engine
            </label>
            <button
              type="button"
              onClick={onTestVoice}
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
              StorageService.setItem(STORAGE_KEYS.SELECTED_TTS_ENGINE, eng);
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
                    StorageService.setItem(STORAGE_KEYS.SELECTED_AZURE_VOICE, v);
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
                      StorageService.setItem(STORAGE_KEYS.AZURE_SPEECH_KEY, e.target.value);
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
                      StorageService.setItem(STORAGE_KEYS.AZURE_SPEECH_REGION, e.target.value);
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
                    StorageService.setItem(STORAGE_KEYS.SELECTED_SYSTEM_VOICE, e.target.value);
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
                onClose();
                onOpenDiagnostic();
              }}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              <Award size={13} /> Take Test
            </button>
          </div>
        </div>

        {/* Multi-Device State Backup & Restore */}
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
            onClick={onClose}
            className="generate-button"
            style={{ minWidth: '90px', padding: '8px 20px' }}
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
