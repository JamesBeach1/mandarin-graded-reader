/**
 * Audio Chunking Manager
 * Slices long Chinese texts into coherent sentence / clause buffers for sequential TTS playback.
 */

export interface AudioChunk {
  id: number;
  text: string;
  charStart: number;
  charEnd: number;
}

export function chunkChineseText(text: string, maxChunkLength = 60): AudioChunk[] {
  if (!text || text.trim().length === 0) return [];
  
  // Sentence delimiters: period, exclamation, question mark, semicolon, newline
  const delimiterRegex = /([。！？；\n]+)/g;
  const parts = text.split(delimiterRegex);
  
  const chunks: AudioChunk[] = [];
  let currentChunk = '';
  let chunkStart = 0;
  let currentIndex = 0;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    
    if (currentChunk.length + part.length <= maxChunkLength) {
      if (currentChunk.length === 0) {
        chunkStart = currentIndex;
      }
      currentChunk += part;
    } else {
      if (currentChunk.trim().length > 0) {
        chunks.push({
          id: chunks.length,
          text: currentChunk.trim(),
          charStart: chunkStart,
          charEnd: chunkStart + currentChunk.length
        });
      }
      chunkStart = currentIndex;
      currentChunk = part;
    }
    currentIndex += part.length;
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push({
      id: chunks.length,
      text: currentChunk.trim(),
      charStart: chunkStart,
      charEnd: chunkStart + currentChunk.length
    });
  }
  
  return chunks;
}
