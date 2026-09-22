import React from 'react';
import type { HanziItem } from '../types/HanziItem';
import { MediaIngestionWorkspace } from './MediaIngestionWorkspace';

interface ImportMediaWorkspaceProps {
  hanziData: HanziItem[];
  vocabData: HanziItem[];
  overridesMap: Record<string, { pinyin: string; definition: string }>;
  onLoadIntoReader: (title: string, tokens: HanziItem[], rawText: string) => void;
}

export const ImportMediaWorkspace: React.FC<ImportMediaWorkspaceProps> = ({
  hanziData,
  vocabData,
  overridesMap,
  onLoadIntoReader
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <MediaIngestionWorkspace
        hanziData={hanziData}
        vocabData={vocabData}
        overridesMap={overridesMap}
        onLoadIntoReader={onLoadIntoReader}
      />
    </div>
  );
};
