import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import { StoryShareService, type MoyunStoryPackage } from '../../src/utils/storyShare';

export async function runStoryShareAcceptanceTests() {
  await feature('FT-SHARE', 'Peer-to-Peer Story Sharing (.moyun.json & URL Hash)', async () => {
    await scenario('Bundle a story into a compliant MoyunStoryPackage with computed metadata', async () => {
      let pkg: MoyunStoryPackage | null = null;

      await given('a story with title "茶馆", HSK Level 2, and text of 120 characters', () => {
        const text = '这是北京的一家老茶馆。很多人在这里喝茶聊天。今天天气晴朗，茶馆里坐满了客人。大家都很高兴。'.repeat(3);
        pkg = StoryShareService.createPackage('茶馆', text, '2');
      });

      await then('format is moyun-story-v1', () => {
        expect(pkg?.format).toBe('moyun-story-v1');
      });

      await and('metadata includes character count and estimated reading time', () => {
        expect(pkg?.metadata.characterCount).toBeGreaterThan(50);
        expect(pkg?.metadata.estimatedReadTimeMinutes).toBeGreaterThanOrEqual(1);
        expect(pkg?.story.title).toBe('茶馆');
        expect(pkg?.story.hskLevel).toBe('2');
      });
    });

    await scenario('Parse and validate imported .moyun.json file content', async () => {
      let parsed: MoyunStoryPackage | null = null;

      await given('a valid JSON string representing a Moyun story package', () => {
        const rawJson = JSON.stringify({
          format: 'moyun-story-v1',
          exportedAt: new Date().toISOString(),
          story: {
            id: 'story-123',
            title: '测试故事',
            hskLevel: '1',
            text: '你好世界。'
          },
          metadata: {
            characterCount: 5,
            estimatedReadTimeMinutes: 1,
            appVersion: '2.0.0'
          }
        });

        parsed = StoryShareService.parseStoryPackage(rawJson);
      });

      await then('the package is parsed with full fidelity', () => {
        expect(parsed?.story.title).toBe('测试故事');
        expect(parsed?.story.text).toBe('你好世界。');
      });
    });

    await scenario('Reject invalid JSON or packages missing mandatory title and text', async () => {
      await then('invalid JSON throws a descriptive error', () => {
        expect(() => StoryShareService.parseStoryPackage('invalid json {')).toThrow();
      });

      await and('missing mandatory fields throws', () => {
        const incomplete = JSON.stringify({ format: 'moyun-story-v1', story: {} });
        expect(() => StoryShareService.parseStoryPackage(incomplete)).toThrow();
      });
    });
  });
}
