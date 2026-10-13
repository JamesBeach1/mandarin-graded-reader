import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import { SubtitleParser, type SubtitleCue } from '../../src/services/subtitleParser';

export async function runSubtitleParserAcceptanceTests() {
  await feature('FT-SUB', 'Timed Subtitle (.srt / .vtt) Parser', async () => {
    await scenario('Parse standard SRT format subtitles with comma millisecond timestamps', async () => {
      let cues: SubtitleCue[] = [];
      const srtText = `1
00:00:01,500 --> 00:00:04,200
你好，欢迎来到北京！

2
00:00:05,000 --> 00:00:08,800
今天的天气非常<b>好</b>。`;

      await given('raw SRT text with sequential cue blocks', () => {});

      await when('SubtitleParser.parse is executed', () => {
        cues = SubtitleParser.parse(srtText);
      });

      await then('it extracts 2 cue objects', () => {
        expect(cues.length).toBe(2);
      });

      await and('timestamps are converted to decimal seconds', () => {
        expect(cues[0].startTime).toBe(1.5);
        expect(cues[0].endTime).toBe(4.2);
        expect(cues[0].text).toBe('你好，欢迎来到北京！');
      });

      await and('HTML tags are stripped from cue text', () => {
        expect(cues[1].text).toBe('今天的天气非常好。');
      });
    });

    await scenario('Parse WebVTT format subtitles with dot millisecond timestamps and header', async () => {
      let cues: SubtitleCue[] = [];
      const vttText = `WEBVTT

00:01:10.500 --> 00:01:15.000
我想喝一杯茶。

00:01:16.200 --> 00:01:20.000
好的，马上来。`;

      await given('raw WebVTT text starting with WEBVTT header', () => {});

      await when('SubtitleParser.parse is called', () => {
        cues = SubtitleParser.parse(vttText);
      });

      await then('it parses both cues accurately ignoring the header line', () => {
        expect(cues.length).toBe(2);
        expect(cues[0].startTime).toBe(70.5); // 1*60 + 10.5
        expect(cues[0].endTime).toBe(75.0);
        expect(cues[0].text).toBe('我想喝一杯茶。');
      });
    });

    await scenario('Gracefully handles empty strings or malformed cues', async () => {
      await then('empty input returns an empty array without throwing', () => {
        const result = SubtitleParser.parse('');
        expect(result.length).toBe(0);
      });
    });
  });
}
