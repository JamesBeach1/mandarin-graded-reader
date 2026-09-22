export interface HanziWriterCharacter {
  strokes: string[];
}

export interface HanziWriterTarget {
  addEventListener(event: string, callback: () => void): void;
  character: HanziWriterCharacter;
}

export interface HanziWriterInstance {
  animateCharacter(options?: { onComplete?: () => void }): void;
  quiz(options?: {
    showHintAfterMisses?: number | boolean;
    highlightOnComplete?: boolean;
    onComplete?: () => void;
  }): void;
  cancelQuiz(): void;
  hideCharacter(): void;
  updateColor(colorName: string, colorValue: string): void;
  target: HanziWriterTarget;
}

export interface HanziWriterClass {
  create(
    element: string | HTMLElement,
    character: string,
    options?: Record<string, unknown>
  ): HanziWriterInstance;
}

declare global {
  interface Window {
    HanziWriter?: HanziWriterClass;
  }
}
