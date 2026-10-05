import React, { useState, useEffect } from 'react';
import type { LanguageIsland, IslandSentence } from '../../types/Island';
import { IslandStore } from '../../services/islandStore';
import { IslandHubView } from './IslandHubView';
import { SentenceCollectorView } from './SentenceCollectorView';
import { AudioFloodingView } from './AudioFloodingView';
import { ShadowingStudioView } from './ShadowingStudioView';
import { ActiveRecallArenaView } from './ActiveRecallArenaView';
import { PreInputAcceleratorView } from './PreInputAcceleratorView';
import { DailyRoutineView } from './DailyRoutineView';
import { 
  Compass, Mic, Headphones, Zap, Rocket, 
  Calendar, Layers, Volume2, Sparkles, Plus
} from 'lucide-react';

export type IslandSubTab = 'hub' | 'collector' | 'flooding' | 'shadowing' | 'recall' | 'accelerator' | 'routine';

interface LanguageIslandsWorkspaceProps {
  hanziData?: any[];
  vocabData?: any[];
  overridesMap?: Record<string, { pinyin: string; definition: string }>;
  onCharClick?: (char: string, e: React.MouseEvent, contextSentence?: string) => void;
  onStrokeOrder?: (char: string) => void;
}

export const LanguageIslandsWorkspace: React.FC<LanguageIslandsWorkspaceProps> = ({
  hanziData = [],
  vocabData = [],
  overridesMap = {},
  onCharClick,
  onStrokeOrder
}) => {
  const [activeSubTab, setActiveSubTab] = useState<IslandSubTab>('hub');
  const [islands, setIslands] = useState<LanguageIsland[]>([]);
  const [sentences, setSentences] = useState<IslandSentence[]>([]);
  const [selectedIslandId, setSelectedIslandId] = useState<string | null>(null);
  const [targetSentenceForShadowing, setTargetSentenceForShadowing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load state on mount
  const refreshData = async () => {
    setIsLoading(true);
    await IslandStore.initialize();
    const loadedIslands = await IslandStore.getAllIslands();
    const loadedSentences = await IslandStore.getAllSentences();
    setIslands(loadedIslands);
    setSentences(loadedSentences);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Creation & deletion handlers
  const handleCreateIsland = async (title: string, description: string, category: any) => {
    const newIsland: LanguageIsland = {
      id: `island-${Date.now()}`,
      title,
      icon: 'Compass',
      category,
      description,
      isCustom: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await IslandStore.saveIsland(newIsland);
    await refreshData();
  };

  const handleUpdateIsland = async (island: LanguageIsland) => {
    await IslandStore.saveIsland(island);
    await refreshData();
  };

  const handleDeleteIsland = async (id: string) => {
    await IslandStore.deleteIsland(id);
    if (selectedIslandId === id) setSelectedIslandId(null);
    await refreshData();
  };

  const handleDeleteSentence = async (id: string) => {
    await IslandStore.deleteSentence(id);
    await refreshData();
  };

  const handleSentencesAdded = async (islandId: string, newSentences: IslandSentence[]) => {
    await IslandStore.batchAddSentences(newSentences);
    await refreshData();
  };

  const handleIslandCreatedFromTranscript = async (island: LanguageIsland, newSentences: IslandSentence[]) => {
    await IslandStore.saveIsland(island);
    await IslandStore.batchAddSentences(newSentences);
    setSelectedIslandId(island.id);
    await refreshData();
  };

  // Cross-tool navigation actions
  const handleStartAudioFlooding = (islandId?: string) => {
    if (islandId) setSelectedIslandId(islandId);
    setActiveSubTab('flooding');
  };

  const handleStartActiveRecall = (islandId?: string) => {
    if (islandId) setSelectedIslandId(islandId);
    setActiveSubTab('recall');
  };

  const handleStartShadowing = (sentence: IslandSentence) => {
    setTargetSentenceForShadowing(sentence.id);
    setActiveSubTab('shadowing');
  };

  const handleOpenCollectorForIsland = (islandId: string) => {
    setSelectedIslandId(islandId);
    setActiveSubTab('collector');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      
      {/* Top Workspace Header & Navigation Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '20px 24px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px' }}>🏝️</span>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Language Islands & Personal Blueprints
            </h2>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              backgroundColor: 'rgba(88,204,2,0.1)',
              color: 'var(--accent-bamboo)',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 600
            }}>
              20-Min Method
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Learn languages through complete, personalized sentences, ear flooding, mouth shadowing, and active recall friction.
          </p>
        </div>

        {/* Modular Tool Sub-Nav Tabs */}
        <div 
          className="speaking-subnav-tabs" 
          style={{ 
            display: 'flex', 
            gap: '6px', 
            backgroundColor: 'var(--bg-base)', 
            padding: '4px', 
            borderRadius: 'var(--radius-sm)',
            overflowX: 'auto',
            maxWidth: '100%'
          }}
        >
          <button
            onClick={() => setActiveSubTab('hub')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeSubTab === 'hub' ? 'var(--bg-surface)' : 'transparent',
              color: activeSubTab === 'hub' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeSubTab === 'hub' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap'
            }}
          >
            <Compass size={13} />
            <span>Islands Hub</span>
          </button>

          <button
            onClick={() => setActiveSubTab('collector')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeSubTab === 'collector' ? 'var(--bg-surface)' : 'transparent',
              color: activeSubTab === 'collector' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeSubTab === 'collector' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap'
            }}
          >
            <Mic size={13} />
            <span>1. Sentence Collector</span>
          </button>

          <button
            onClick={() => setActiveSubTab('flooding')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeSubTab === 'flooding' ? 'var(--bg-surface)' : 'transparent',
              color: activeSubTab === 'flooding' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeSubTab === 'flooding' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap'
            }}
          >
            <Headphones size={13} />
            <span>2. Audio Flooding</span>
          </button>

          <button
            onClick={() => setActiveSubTab('shadowing')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeSubTab === 'shadowing' ? 'var(--bg-surface)' : 'transparent',
              color: activeSubTab === 'shadowing' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeSubTab === 'shadowing' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap'
            }}
          >
            <Volume2 size={13} />
            <span>Shadowing Studio</span>
          </button>

          <button
            onClick={() => setActiveSubTab('recall')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeSubTab === 'recall' ? 'var(--bg-surface)' : 'transparent',
              color: activeSubTab === 'recall' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeSubTab === 'recall' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap'
            }}
          >
            <Zap size={13} />
            <span>3. Active Recall</span>
          </button>

          <button
            onClick={() => setActiveSubTab('accelerator')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeSubTab === 'accelerator' ? 'var(--bg-surface)' : 'transparent',
              color: activeSubTab === 'accelerator' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeSubTab === 'accelerator' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap'
            }}
          >
            <Rocket size={13} />
            <span>Pre-Input Accelerator</span>
          </button>

          <button
            onClick={() => setActiveSubTab('routine')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeSubTab === 'routine' ? 'var(--bg-surface)' : 'transparent',
              color: activeSubTab === 'routine' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeSubTab === 'routine' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap'
            }}
          >
            <Calendar size={13} />
            <span>Daily Protocol</span>
          </button>
        </div>
      </div>

      {/* Main Body View Switching */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading your language islands...
        </div>
      ) : (
        <>
          {activeSubTab === 'hub' && (
            <IslandHubView
              islands={islands}
              sentences={sentences}
              selectedIslandId={selectedIslandId}
              hanziData={hanziData}
              vocabData={vocabData}
              overridesMap={overridesMap}
              onSelectIsland={setSelectedIslandId}
              onCreateIsland={handleCreateIsland}
              onUpdateIsland={handleUpdateIsland}
              onDeleteIsland={handleDeleteIsland}
              onDeleteSentence={handleDeleteSentence}
              onStartAudioFlooding={handleStartAudioFlooding}
              onStartActiveRecall={handleStartActiveRecall}
              onStartShadowing={handleStartShadowing}
              onOpenCollectorForIsland={handleOpenCollectorForIsland}
              onCharClick={onCharClick}
              onStrokeOrder={onStrokeOrder}
              onSentencesAdded={handleSentencesAdded}
            />
          )}

          {activeSubTab === 'collector' && (
            <SentenceCollectorView
              islands={islands}
              preselectedIslandId={selectedIslandId}
              hanziData={hanziData}
              onSentencesAdded={handleSentencesAdded}
              onNavigateToHub={() => setActiveSubTab('hub')}
            />
          )}

          {activeSubTab === 'flooding' && (
            <AudioFloodingView
              islands={islands}
              sentences={sentences}
              initialIslandId={selectedIslandId}
              hanziData={hanziData}
              vocabData={vocabData}
              overridesMap={overridesMap}
              onNavigateToShadowing={handleStartShadowing}
              onCharClick={onCharClick}
              onStrokeOrder={onStrokeOrder}
            />
          )}

          {activeSubTab === 'shadowing' && (
            <ShadowingStudioView
              islands={islands}
              sentences={sentences}
              initialSentenceId={targetSentenceForShadowing}
              hanziData={hanziData}
              vocabData={vocabData}
              overridesMap={overridesMap}
              onSentenceMasteryChange={refreshData}
              onCharClick={onCharClick}
              onStrokeOrder={onStrokeOrder}
            />
          )}

          {activeSubTab === 'recall' && (
            <ActiveRecallArenaView
              islands={islands}
              sentences={sentences}
              initialIslandId={selectedIslandId}
              hanziData={hanziData}
              vocabData={vocabData}
              overridesMap={overridesMap}
              onSentenceUpdated={refreshData}
              onCharClick={onCharClick}
              onStrokeOrder={onStrokeOrder}
            />
          )}

          {activeSubTab === 'accelerator' && (
            <PreInputAcceleratorView
              onIslandCreatedFromTranscript={handleIslandCreatedFromTranscript}
              onNavigateToHub={() => setActiveSubTab('hub')}
            />
          )}

          {activeSubTab === 'routine' && (
            <DailyRoutineView
              onStartFlooding={() => setActiveSubTab('flooding')}
              onStartShadowing={() => setActiveSubTab('shadowing')}
              onStartLunchSprint={() => setActiveSubTab('recall')}
              onStartBedtimeRecall={() => setActiveSubTab('recall')}
            />
          )}
        </>
      )}
    </div>
  );
};
