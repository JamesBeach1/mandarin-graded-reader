/**
 * Moyun Subtitles Export Engine (AIM-008)
 * Generates synchronized .srt and .vtt subtitle files from graded reader stories.
 */

export interface SubtitleSentence {
  id: number;
  text: string;
  pinyin?: string;
  translation?: string;
}

export type SubtitleFormat = 'srt' | 'vtt';
export type SubtitleContentMode = 'hanzi' | 'pinyin' | 'bilingual';

/**
 * Format milliseconds into SRT timecode: 00:00:01,250
 */
function formatSrtTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const milliseconds = Math.floor(ms % 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(milliseconds, 3)}`;
}

/**
 * Format milliseconds into WebVTT timecode: 00:00:01.250
 */
function formatVttTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const milliseconds = Math.floor(ms % 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds, 3)}`;
}

/**
 * Generates SubRip (.srt) subtitle string.
 */
export function generateSRT(
  sentences: SubtitleSentence[],
  mode: SubtitleContentMode = 'bilingual',
  speedMultiplier: number = 1.0
): string {
  let currentTimeMs = 500; // 500ms initial buffer
  let output = '';

  sentences.forEach((s, idx) => {
    // Estimated duration: ~250ms per character + 300ms base pause, adjusted by speed
    const charCount = s.text.replace(/[，。！？、\s]/g, '').length || 1;
    const durationMs = Math.max(1600, Math.round((charCount * 260 + 350) / speedMultiplier));
    const startTimeStr = formatSrtTime(currentTimeMs);
    const endTimeStr = formatSrtTime(currentTimeMs + durationMs);

    let textLine = s.text;
    if (mode === 'pinyin' && s.pinyin) {
      textLine = `${s.text}\n${s.pinyin}`;
    } else if (mode === 'bilingual' && s.translation) {
      textLine = `${s.text}\n${s.translation}`;
    }

    output += `${idx + 1}\n`;
    output += `${startTimeStr} --> ${endTimeStr}\n`;
    output += `${textLine}\n\n`;

    // 400ms pause between sentences
    currentTimeMs += durationMs + 400;
  });

  return output.trim() + '\n';
}

/**
 * Generates WebVTT (.vtt) subtitle string.
 */
export function generateVTT(
  sentences: SubtitleSentence[],
  mode: SubtitleContentMode = 'bilingual',
  speedMultiplier: number = 1.0
): string {
  let currentTimeMs = 500;
  let output = 'WEBVTT - Moyun Graded Chinese Reader\n\n';

  sentences.forEach((s, idx) => {
    const charCount = s.text.replace(/[，。！？、\s]/g, '').length || 1;
    const durationMs = Math.max(1600, Math.round((charCount * 260 + 350) / speedMultiplier));
    const startTimeStr = formatVttTime(currentTimeMs);
    const endTimeStr = formatVttTime(currentTimeMs + durationMs);

    let textLine = s.text;
    if (mode === 'pinyin' && s.pinyin) {
      textLine = `${s.text}\n${s.pinyin}`;
    } else if (mode === 'bilingual' && s.translation) {
      textLine = `${s.text}\n${s.translation}`;
    }

    output += `${idx + 1}\n`;
    output += `${startTimeStr} --> ${endTimeStr}\n`;
    output += `${textLine}\n\n`;

    currentTimeMs += durationMs + 400;
  });

  return output.trim() + '\n';
}

/**
 * Initiates browser download of generated subtitle file.
 */
export function downloadSubtitles(
  storyTitle: string,
  content: string,
  format: SubtitleFormat
): void {
  const sanitizedTitle = (storyTitle || 'mandarin_story')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 40);

  const filename = `${sanitizedTitle}.${format}`;
  const mimeType = format === 'srt' ? 'application/x-subrip' : 'text/vtt';
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
