/**
 * Subtitle Parser (.srt / .vtt) for Interactive Video & Audio Learning
 * Converts timed subtitle files into interactive cue segments.
 */

export interface SubtitleCue {
  id: number;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  startFormatted: string;
  endFormatted: string;
  text: string;
}

export class SubtitleParser {
  public static parse(content: string): SubtitleCue[] {
    const cleanContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const cues: SubtitleCue[] = [];

    // Split by double newline separating subtitle blocks
    const blocks = cleanContent.split(/\n\s*\n/);

    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length < 2) continue;

      let timeLineIdx = 0;
      // If line 0 is numeric index or WEBVTT header
      if (/^\d+$/.test(lines[0].trim()) || lines[0].includes('WEBVTT')) {
        timeLineIdx = 1;
      }

      const timeLine = lines[timeLineIdx];
      if (!timeLine || !timeLine.includes('-->')) continue;

      const [startStr, endStr] = timeLine.split('-->').map(s => s.trim());
      const startTime = this.timeToSeconds(startStr);
      const endTime = this.timeToSeconds(endStr);

      const text = lines.slice(timeLineIdx + 1).join(' ').replace(/<[^>]+>/g, '').trim();

      if (text) {
        cues.push({
          id: cues.length + 1,
          startTime,
          endTime,
          startFormatted: startStr,
          endFormatted: endStr,
          text
        });
      }
    }

    return cues;
  }

  private static timeToSeconds(timeStr: string): number {
    const parts = timeStr.replace(',', '.').split(':');
    if (parts.length === 3) {
      const hours = parseFloat(parts[0]);
      const minutes = parseFloat(parts[1]);
      const seconds = parseFloat(parts[2]);
      return hours * 3600 + minutes * 60 + seconds;
    } else if (parts.length === 2) {
      const minutes = parseFloat(parts[0]);
      const seconds = parseFloat(parts[1]);
      return minutes * 60 + seconds;
    }
    return 0;
  }
}
