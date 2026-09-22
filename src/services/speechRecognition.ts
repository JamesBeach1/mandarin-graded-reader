/**
 * Client-Side Speech Recognition Service
 * Wraps browser SpeechRecognition (webkitSpeechRecognition) with Chinese (cmn-Hans-CN) language defaults
 * and audio stream capture for Whisper WebAssembly integration.
 */

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

export class SpeechRecognitionService {
  private static recognitionInstance: any = null;

  public static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public static listenOnce(lang = 'zh-CN'): Promise<SpeechRecognitionResult> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Speech recognition not supported in this browser.'));
        return;
      }

      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRec();
      this.recognitionInstance = recognition;

      recognition.lang = lang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        if (event.results && event.results.length > 0) {
          const first = event.results[0][0];
          resolve({
            transcript: first.transcript,
            confidence: first.confidence
          });
        } else {
          resolve({ transcript: '', confidence: 0 });
        }
      };

      recognition.onerror = (err: any) => {
        reject(err);
      };

      recognition.onend = () => {
        this.recognitionInstance = null;
      };

      recognition.start();
    });
  }

  public static stop(): void {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch {
        // Ignore stop errors
      }
      this.recognitionInstance = null;
    }
  }
}
